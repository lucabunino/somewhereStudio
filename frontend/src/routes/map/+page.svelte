<script>
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { PUBLIC_MAPBOX_TOKEN } from '$env/static/public';
import { onMount, onDestroy, tick } from "svelte";
import Module from '$lib/components/Module.svelte';
import Serie from '$lib/components/Serie.svelte';
import { clickOutside } from '$lib/utils/clickOutside.js';
import { canScrollText } from '$lib/utils/scrollText.js';

import { getCoordinates } from '$lib/stores/coordinates.svelte.js';
let coordinater = getCoordinates()

import { getZoom } from '$lib/stores/zoom.svelte.js';
let zoomer = getZoom()

import { getTags } from '$lib/stores/tag.svelte.js';
let tagger = getTags()

import { getHeader } from '$lib/stores/header.svelte.js';
let header = getHeader()

let { data } = $props()
let initialModules = $derived(data.modules ?? [])
// modules sharing exact coordinates become one stacked spot (true location, browsed with arrows)
let spots = $derived(groupSpots(initialModules))

// one marker carries the open module card, instead of one (empty) marker per module repositioned every frame
let activeEl = $state(undefined);
let activeMarker;
let oldsearchTags;
let map = $state(undefined);
let mapContainer = $state(undefined);
let activeModule = $state(undefined);
// spiderfy: the stacked spot currently fanned out (its pins sit at fixed pixel offsets around the true location)
let spider = null;
let showMap = $derived(localStorage.getItem('cookieConsent') === 'accepted' ? true : false);
// markers by key ("c<cluster_id>" / "s<spotIndex>"), updated by diff so they don't flicker while moving
const markers = new Map();
let markersZoom = null;
let moveEndTimeout;
const moveEndDelay = 200;

onMount (() => {
	tagger.setTags(data.tags, { keepHierarchy: false })
	tagger.setMaxTags(tagger.firstMaxTags)
	if (data.searchTags.length > tagger.firstMaxTags) {
		tagger.setMaxTags(data.searchTags.length)
	};
	header.setBlurred(true);
});

$effect(() => {
	if (showMap) {
		if (data.searchTags !== oldsearchTags) {
			if (map) {
				// filtering: keep the map (style, tiles, position), only swap the clustered points
				refreshModules();
			} else {
				createMap();
				updateMarkers();
			}
		}
		if (map) {
			const lat = coordinater.coordinates.latitude;
			const lng = coordinater.coordinates.longitude;
			const zoom = zoomer.mapZoom;
			// the map reports its own position after drag/zoom (updateData): don't fly to where it already is,
			// that interrupted inertia and repeated pinch/wheel zooms
			const c = map.getCenter();
			const there = Math.abs(c.lat - lat) < 1e-6 && Math.abs(c.lng - lng) < 1e-6 && Math.abs(map.getZoom() - zoom) < 0.01;
			if (!there) {
				map.flyTo({ center: [lng, lat], zoom, essential: true, duration: 500 });
			}
		}
	}
});

// move the single card marker to the active module
$effect(() => {
	if (!map || !activeEl) return;
	const active = activeModule !== undefined ? initialModules[activeModule] : null;
	if (!active) {
		activeMarker?.remove();
		return;
	}
	activeMarker ??= new mapboxgl.Marker(activeEl);
	activeMarker.setLngLat([active.longitude, active.latitude]).addTo(map);
});

onDestroy(() => {
	if (map) {
		map.remove();	
	}
});

async function createMap() {
	await tick();
	map = new mapboxgl.Map({
		container: mapContainer,
		style: 'mapbox://styles/lucabunino-com/cm6qt0ddx00rj01sd8lek6ucf',
		accessToken: PUBLIC_MAPBOX_TOKEN,
		center: [coordinater.coordinates.longitude, coordinater.coordinates.latitude],
		zoom: zoomer.mapZoom,
		minZoom: zoomer.mapMinZoom,
		maxZoom: zoomer.mapMaxZoom,
		projection: 'mercator',
		// wheel = pan, ctrl/pinch + wheel = zoom: both handled in panHandler (Mapbox's scroll-zoom also zoomed on pans)
		scrollZoom: false,
		telemetryDisabled: true,
	});

	activeMarker = undefined;

	map.on('load', () => {
		// Add clustered source
		map.addSource('modules', {
			type: 'geojson',
			data: spotsToGeoJSON(spots),
			cluster: true,
			clusterMaxZoom: 14,
			clusterRadius: 50,
			// clusters count modules, not spots
			clusterProperties: { modules: ['+', ['get', 'count']] },
		});

		// Add a layer for unclustered points (optional, but we won't use its default circles)
		map.addLayer({
			id: 'unclustered-point',
			type: 'circle',
			source: 'modules',
			filter: ['!', ['has', 'point_count']],
			paint: {
				'circle-color': '#000',
				'circle-radius': 0,
			},
		});

		// Update markers on move and zoom end
		map.on('moveend', scheduleMarkers);
		map.on('zoomend', () => {
			// zooming out folds the spider (tap on its center also does)
			if (spider && map.getZoom() < spider.zoom - 0.05) closeSpider();
			scheduleMarkers();
			updateData();
		});
		map.on('dragend', updateData);
	});

	// draw markers as soon as the clustered source has rendered features, not when every tile has loaded ('idle')
	function onFirstFeatures() {
		if (!map.getSource('modules') || !map.isSourceLoaded('modules')) return;
		if (map.querySourceFeatures('modules').length === 0) return;
		map.off('render', onFirstFeatures);
		updateMarkers();
	}
	map.on('render', onFirstFeatures);

	// Cluster click: zoom into cluster
	map.on('click', (e) => {
		const features = map.queryRenderedFeatures(e.point, {
			layers: ['unclustered-point'], // single points only here
		});
		if (!features.length) {
			// try clusters by querying source features directly
			const clusterFeatures = map.querySourceFeatures('modules', {
				filter: ['has', 'point_count'],
			});
			// find cluster near clicked point
			for (const f of clusterFeatures) {
				const pixel = map.project(f.geometry.coordinates);
				const dist = Math.hypot(pixel.x - e.point.x, pixel.y - e.point.y);
				if (dist < 24) {
					zoomIntoCluster(f.properties.cluster_id, f.geometry.coordinates);
					return;
				}
			}
			return;
		}

		// Single marker clicked: find module index and activate
		const clickedFeature = features[0];
		if (clickedFeature.properties && clickedFeature.properties.spotIndex !== undefined) {
			const spot = spots[clickedFeature.properties.spotIndex];
			if (spot?.items.length > 1) openSpider(clickedFeature.properties.spotIndex);
			else if (spot) openModule(spot.items[0]);
		}

		updateMarkers();
	});
	oldsearchTags = data.searchTags;
}

function refreshModules() {
	oldsearchTags = data.searchTags;
	activeModule = undefined;
	closeSpider();
	const source = map.getSource('modules');
	if (!source) return; // map still loading: its 'load' handler uses the current modules
	clearMarkers();
	source.setData(spotsToGeoJSON(spots));
	map.once('idle', updateMarkers);
}

function groupSpots(modules) {
	const byKey = new Map();
	modules.forEach((m, i) => {
		if (m.latitude == null || m.longitude == null) return;
		const key = `${m.latitude.toFixed(6)},${m.longitude.toFixed(6)}`;
		if (!byKey.has(key)) byKey.set(key, { latitude: m.latitude, longitude: m.longitude, items: [] });
		byKey.get(key).items.push(i);
	});
	return [...byKey.values()];
}

// one feature per spot, `count` = modules on it (summed by clusterProperties)
function spotsToGeoJSON(spots) {
	return {
		type: 'FeatureCollection',
		features: spots.map((spot, s) => ({
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [spot.longitude, spot.latitude] },
			properties: { spotIndex: s, count: spot.items.length },
		})),
	};
}

function openModule(i) {
	const m = initialModules[i];
	if (!m) return;
	activeModule = i;
	if (coordinater.coordinates.latitude !== m.latitude || coordinater.coordinates.longitude !== m.longitude) {
		coordinater.setCoordinates(m.latitude, m.longitude);
	}
	spider?.el.querySelectorAll('.spider-dot').forEach((d) => d.classList.toggle('active', Number(d.dataset.module) === i));
}

// pixel offsets around the spot: a circle for few pins, a spiral for many (Leaflet.markercluster's layout)
function spiderPositions(n, sep) {
	if (n <= 9) {
		const r = Math.max(sep * 1.4, (sep * n) / (2 * Math.PI));
		return Array.from({ length: n }, (_, k) => {
			const a = -Math.PI / 2 + (k * 2 * Math.PI) / n;
			return [r * Math.cos(a), r * Math.sin(a)];
		});
	}
	// tight spiral: consecutive pins one `sep` apart along the curve (11 pins stay within ~3 seps)
	const positions = [];
	let leg = sep * 0.67;
	let angle = 0;
	for (let k = 0; k < n; k++) {
		angle += sep / leg + k * 0.0005;
		positions.push([leg * Math.cos(angle), leg * Math.sin(angle)]);
		leg += (2 * Math.PI * (sep / 8)) / angle;
	}
	return positions;
}

function openSpider(s) {
	const spot = spots[s];
	if (!spot) return;
	if (spider?.spotIndex === s) return closeSpider();
	closeSpider();
	const mobile = window.innerWidth < 700;
	const dot = mobile ? 32 : 24;
	const positions = spiderPositions(spot.items.length, dot + (mobile ? 16 : 12));

	const el = document.createElement('div');
	el.className = 'spider';
	el.style.setProperty('--dot', `${dot}px`);
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('class', 'spider-legs');
	// a zero-size svg isn't painted at all: 1x1 box, legs drawn outside it (overflow: visible)
	svg.setAttribute('width', '1');
	svg.setAttribute('height', '1');
	positions.forEach(([x, y], k) => {
		const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		line.setAttribute('x1', 0);
		line.setAttribute('y1', 0);
		line.setAttribute('x2', x);
		line.setAttribute('y2', y);
		svg.appendChild(line);

		const i = spot.items[k];
		const d = document.createElement('button');
		d.type = 'button';
		d.className = 'spider-dot';
		d.dataset.module = i;
		d.title = initialModules[i]?.title || 'Module';
		d.setAttribute('aria-label', d.title);
		d.style.setProperty('--x', `${x}px`);
		d.style.setProperty('--y', `${y}px`);
		d.addEventListener('click', (e) => {
			e.stopPropagation();
			openModule(i);
		});
		el.appendChild(d);
	});
	el.prepend(svg);

	const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
		.setLngLat([spot.longitude, spot.latitude])
		.addTo(map);
	spider = { spotIndex: s, el, marker, zoom: map.getZoom() };
	requestAnimationFrame(() => el.classList.add('open'));
	updateStackState();
}

function closeSpider() {
	if (!spider) return;
	spider.marker.remove();
	spider = null;
	updateStackState();
}

// the fanned-out spot's own pin turns into a small hub
function updateStackState() {
	markers.forEach((m) => {
		const el = m.getElement();
		if (!el.dataset.spot) return;
		el.classList.toggle('spider-hub', spider !== null && Number(el.dataset.spot) === spider.spotIndex);
	});
}

function handleKeydown(e) {
	if (e.key !== 'Escape') return;
	if (activeModule !== undefined) handleClickOutside();
	else closeSpider();
}

function zoomIntoCluster(clusterId, coords) {
	map.getSource('modules')?.getClusterExpansionZoom(clusterId, (err, zoom) => {
		if (err) return;
		coordinater.setCoordinates(coords[1], coords[0]);
		zoomer.setMapZoom(zoom + 2);
	});
}

// wheel-panning fires moveend on every event: rebuild markers at most once per frame
let markersFrame;
function scheduleMarkers() {
	if (markersFrame) return;
	markersFrame = requestAnimationFrame(() => {
		markersFrame = null;
		updateMarkers();
	});
}

function clearMarkers() {
	markers.forEach((m) => m.remove());
	markers.clear();
	markersZoom = null;
}

function clusterMarker(cluster) {
	const coords = cluster.geometry.coordinates;
	const el = document.createElement('div');
	el.className = 'custom-cluster-marker ronzino-12 uppercase';
	el.textContent = cluster.properties.modules ?? cluster.properties.point_count;
	// the whole circle zooms in (the map-level click only caught clicks near its center point)
	el.addEventListener('click', (e) => {
		e.stopPropagation();
		zoomIntoCluster(cluster.properties.cluster_id, coords);
	});
	return new mapboxgl.Marker(el).setLngLat(coords).addTo(map);
}

function spotMarker(s) {
	const spot = spots[s];
	const el = document.createElement('div');
	el.className = 'custom-single-marker';
	el.dataset.spot = s;
	if (spot.items.length > 1) {
		// stacked spot: show how many modules are here
		el.classList.add('stacked', 'ronzino-12');
		el.textContent = spot.items.length;
		el.title = `${spot.items.length} progetti`;
	} else {
		el.title = initialModules[spot.items[0]].title || 'Module';
	}
	el.addEventListener('click', (e) => {
		e.stopPropagation();
		if (spot.items.length > 1) openSpider(s);
		else openModule(spot.items[0]);
	});
	return new mapboxgl.Marker(el).setLngLat([spot.longitude, spot.latitude]).addTo(map);
}

function updateMarkers() {
	if (!map?.getSource('modules')) return;
	// while tiles load the query only returns part of the features: keep the current markers
	if (!map.isSourceLoaded('modules')) return;

	const wanted = new Map();
	for (const f of map.querySourceFeatures('modules')) {
		if (f.properties.cluster) wanted.set(`c${f.properties.cluster_id}`, f);
		else if (spots[f.properties.spotIndex]) wanted.set(`s${f.properties.spotIndex}`, f);
	}
	// clusters only change with zoom: while panning at the same zoom just add markers. The query only covers
	// tiles already rendered, so removing "missing" ones made markers near the edges vanish and reappear
	const zoom = Math.round(map.getZoom() * 100) / 100;
	if (zoom !== markersZoom) {
		for (const [key, marker] of markers) {
			if (!wanted.has(key)) {
				marker.remove();
				markers.delete(key);
			}
		}
		markersZoom = zoom;
	}
	for (const [key, f] of wanted) {
		if (markers.has(key)) continue;
		markers.set(key, f.properties.cluster ? clusterMarker(f) : spotMarker(f.properties.spotIndex));
	}

	// fanned-out spot merged into a cluster (zoomed out): fold it; otherwise re-mark its hub
	if (spider && !markers.has(`s${spider.spotIndex}`)) closeSpider();
	else updateStackState();
}

function handleClickOutside() {
	if (activeModule !== undefined) {
		activeModule = undefined;
	}
	updateMarkers()
}

function panHandler(e) {
  const trackPadSensitivity = 0.6;
  const mouseSensitivity = 0.1;
  if (e.ctrlKey) {
    // trackpad pinch / ctrl + wheel: zoom around the pointer
    e.preventDefault();
    const rect = mapContainer.getBoundingClientRect();
    const around = map.unproject([e.clientX - rect.left, e.clientY - rect.top]);
    map.zoomTo(map.getZoom() - e.deltaY * 0.01, { around, duration: 0 });
    clearTimeout(moveEndTimeout);
    moveEndTimeout = setTimeout(() => {
      updateData();
      updateMarkers();
    }, moveEndDelay);
    return;
  }
  {
    e.preventDefault();
    e.stopPropagation();
    const sensitivity = isTouchpad(e) ? trackPadSensitivity : mouseSensitivity;
    map.panBy([e.deltaX * sensitivity, e.deltaY * sensitivity], {
      duration: 0
    });
	clearTimeout(moveEndTimeout);
	moveEndTimeout = setTimeout(() => {
		updateData();
		updateMarkers()
	}, moveEndDelay);
  }
}

function isTouchpad(e) {
  return e.wheelDeltaY ? e.wheelDeltaY === -3 * e.deltaY : e.deltaMode === 0;
}

function updateData() {
	zoomer.setMapZoom(map.getZoom());
	coordinater.setCoordinates(map.getCenter().lat, map.getCenter().lng);
}
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<!-- start the connection to Mapbox (style, tiles, sprites) while the page loads -->
	<link rel="preconnect" href="https://api.mapbox.com" crossorigin="anonymous">
</svelte:head>

<div id="map-wrapper">
{#if showMap}
	<div id="map" bind:this={mapContainer} onwheel={(e) => panHandler(e)}></div>
	<div id="map-ui">
		<div class="line top"></div>
		<div class="line right"></div>
		<div class="line bottom"></div>
		<div class="line left"></div>
	</div>


	<div class="module-container" bind:this={activeEl} class:active={activeModule !== undefined}>
		{#if activeModule !== undefined}
			{@const module = initialModules[activeModule]}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="card" style:--card-scale={innerWidth < 700 ? .9 : .5} use:clickOutside onclick_outside={() => handleClickOutside()}
			onwheel={(e) => { if (canScrollText(e.target, e.deltaY)) e.stopPropagation() }}
			ontouchstart={(e) => { if (canScrollText(e.target, 0)) e.stopPropagation() }}
			ontouchmove={(e) => { if (canScrollText(e.target, 0)) e.stopPropagation() }}>
				{#key activeModule}
					<div class="card-content">
						{#if module.modules}
								<Serie slides={module.modules} project={module.project} size={module.size} link={module.link}/>
						{:else}
								<Module module={module} i={activeModule} delayed={false}/>
						{/if}
					</div>
				{/key}
			</div>
		{/if}
	</div>
{:else}
	<p id="cookie-message" class:blurred={!header.blurred} class="gaisyr-19">Per poter visualizzare la mappa è necessario acconsentire all'uso dei cookie, {innerWidth > 700 ? 'in basso a sinistra' : 'in alto a destra'}.</p>
{/if}
</div>

<style>
#map-wrapper {
	width: 100vw;
	height: 100dvh;
	background-color: #222;
}
#cookie-message {
	color: var(--white);
	-ms-grid-column-align: center;
	    justify-self: center;
	position: relative;
	top: calc(50% - 1rem);
	-webkit-transform: translateY(-50%);
	    -ms-transform: translateY(-50%);
	        transform: translateY(-50%);
	padding: var(--gutter);
	text-align: center;
	-webkit-transition: var(--transition);
	-o-transition: var(--transition);
	transition: var(--transition);
}
#cookie-message.blurred {
	color: var(--darkGray);
	-webkit-filter: blur(10px);
	        filter: blur(10px);
}
#map {
	position: absolute;
	width: 100%;
	height: 100%;
	background-color: "#1A1A1A";
}
.line {
	position: fixed;
	width: 1.5rem;
	height: 1px;
	background-color: var(--white);
	mix-blend-mode: difference;
}
.line.top {
	top: 0;
	left: 50%;
	-webkit-transform: rotate(90deg);
	    -ms-transform: rotate(90deg);
	        transform: rotate(90deg);
}
.line.bottom {
	bottom: 0;
	left: 50%;
	-webkit-transform: rotate(90deg);
	    -ms-transform: rotate(90deg);
	        transform: rotate(90deg);
}
.line.left {
	top: 50%;
	left: 0;
	-webkit-transform: translateX(-50%);
	    -ms-transform: translateX(-50%);
	        transform: translateX(-50%);
}
.line.right {
	top: 50%;
	right: 0;
	-webkit-transform: translateX(50%);
	    -ms-transform: translateX(50%);
	        transform: translateX(50%);
}
.module-container {
	position: absolute;
	left: 0;
	bottom: 0;
	width: -webkit-fit-content;
	width: -moz-fit-content;
	width: fit-content;
	height: -webkit-fit-content;
	height: -moz-fit-content;
	height: fit-content;
	pointer-events: none !important;
	z-index: 3;
}
.module-container.active {
	pointer-events: all;
	z-index: 3;
}
:global(.custom-cluster-marker) {
	background-color: var(--white);
	color: var(--black);
	border-radius: 50%;
	width: 3rem;
	height: 3rem;
	display: -webkit-box;
	display: -ms-flexbox;
	display: flex;
	-webkit-box-align: center;
	    -ms-flex-align: center;
	        align-items: center;
	-webkit-box-pack: center;
	    -ms-flex-pack: center;
	        justify-content: center;
	cursor: pointer;
	-webkit-user-select: none;
	   -moz-user-select: none;
	    -ms-user-select: none;
	        user-select: none;
	z-index: 1;
}
:global(.custom-cluster-marker:hover, .custom-single-marker:hover) {
	background-color: var(--darkGray);
}
/* open module card (scaled) */
.card {
	position: relative;
}
.card-content {
	-webkit-transform: scale(var(--card-scale));
	    -ms-transform: scale(var(--card-scale));
	        transform: scale(var(--card-scale));
	-webkit-transform-origin: center;
	    -ms-transform-origin: center;
	        transform-origin: center;
	pointer-events: all;
}
/* spiderfy: pins of a stacked spot fanned out around its true location */
:global(.spider) {
	width: 0;
	height: 0;
	z-index: 2;
}
:global(.spider-legs) {
	display: block;
	max-width: none; /* the reset's svg { max-width: 100% } squeezed it to 0 inside the 0-wide .spider */
	position: absolute;
	left: 0;
	top: 0;
	width: 1px;
	height: 1px;
	overflow: visible;
	pointer-events: none;
}
:global(.spider-legs line) {
	stroke: var(--white);
	stroke-width: 1;
	opacity: 0;
	-webkit-transition: opacity .25s ease;
	transition: opacity .25s ease;
}
:global(.spider.open .spider-legs line) {
	opacity: .8;
}
:global(.spider-dot) {
	position: absolute;
	left: 0;
	top: 0;
	width: var(--dot);
	height: var(--dot);
	padding: 0;
	border: 0;
	background-color: var(--white);
	cursor: pointer;
	-webkit-transform: translate(calc(var(--dot) / -2), calc(var(--dot) / -2)) scale(.3);
	        transform: translate(calc(var(--dot) / -2), calc(var(--dot) / -2)) scale(.3);
	-webkit-transition: -webkit-transform .25s cubic-bezier(.2, .8, .2, 1);
	transition: transform .25s cubic-bezier(.2, .8, .2, 1);
}
:global(.spider.open .spider-dot) {
	-webkit-transform: translate(calc(var(--x) - var(--dot) / 2), calc(var(--y) - var(--dot) / 2));
	        transform: translate(calc(var(--x) - var(--dot) / 2), calc(var(--y) - var(--dot) / 2));
}
:global(.spider-dot:hover), :global(.spider-dot.active) {
	background-color: var(--lightGray);
	outline: 1px solid var(--black);
}
:global(.custom-single-marker.spider-hub) {
	width: .5rem;
	height: .5rem;
	font-size: 0;
}
:global(.custom-single-marker.stacked) {
	display: -webkit-box;
	display: -ms-flexbox;
	display: flex;
	-webkit-box-align: center;
	    -ms-flex-align: center;
	        align-items: center;
	-webkit-box-pack: center;
	    -ms-flex-pack: center;
	        justify-content: center;
	color: var(--black);
}
:global(.custom-single-marker) {
	background-color: var(--white);
	width: 1.5rem;
	height: 1.5rem;
	cursor: pointer;
	z-index: 1;
}
:global(.mapboxgl-ctrl-bottom-left) {
  display: none;
}
</style>
