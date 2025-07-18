<script>
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { PUBLIC_MAPBOX_TOKEN } from '$env/static/public';
import { onMount, onDestroy, tick } from "svelte";
import Module from '$lib/components/Module.svelte';
import Serie from '$lib/components/Serie.svelte';
import { clickOutside } from '$lib/utils/clickOutside.js';

import { getCoordinates } from '$lib/stores/coordinates.svelte.js';
let coordinater = getCoordinates()
$inspect(coordinater.coordinates)

import { getZoom } from '$lib/stores/zoom.svelte.js';
let zoomer = getZoom()

import { getTags } from '$lib/stores/tag.svelte.js';
let tagger = getTags()

import { getHeader } from '$lib/stores/header.svelte.js';
let header = getHeader()

let { data } = $props()
let initialModules = $derived(applyInitialSpiderfy(data.modules))

let modules = $state([data.modules])
let oldsearchTags;
let map;
let mapContainer;
let activeModule = $state(undefined);
let showMap = $derived(localStorage.getItem('cookieConsent') === 'accepted' ? true : false);
$inspect(showMap)
let clusterMarkers = [];
let singleMarkers = [];
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
	console.log(showMap, zoomer.mapZoom, coordinater.coordinates.longitude, coordinater.coordinates.latitude);
	if (showMap) {
		if (data.searchTags !== oldsearchTags) {
			if (map) {
				map.remove();	
			}
			createMap(map);
			updateMarkers();
		}
		if (map) {
			map.flyTo({
				center: [coordinater.coordinates.longitude, coordinater.coordinates.latitude],
				zoom: zoomer.mapZoom,
				essential: true,
				duration: 500,
			});
		}
	}
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
		telemetryDisabled: true,
	});

	initialModules.forEach((module, i) => {
		if (module.latitude != null && module.longitude != null) {
			new mapboxgl.Marker(modules[i])
				.setLngLat([module.longitude, module.latitude])
				.addTo(map);
		}
	});

	map.on('load', () => {
		// Add clustered source
		map.addSource('modules', {
			type: 'geojson',
			data: modulesToGeoJSON(initialModules),
			cluster: true,
			clusterMaxZoom: 14,
			clusterRadius: 50,
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
		map.on('moveend', updateMarkers);
		map.on('zoomend', () => {
			updateMarkers();
			updateData();
		});
		map.on('dragend', updateData);
	});

	map.once('idle', () => {
		updateMarkers();
	});

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
				if (dist < 10) {
					const clusterId = f.properties.cluster_id;
					map.getSource('modules').getClusterExpansionZoom(clusterId, (err, zoom) => {
						zoom += 2;
						if (err) return;
						coordinater.setCoordinates(f.geometry.coordinates[1], f.geometry.coordinates[0]);
						zoomer.setMapZoom(zoom);
					});
					return;
				}
			}
			return;
		}

		// Single marker clicked: find module index and activate
		const clickedFeature = features[0];
		if (clickedFeature.properties && clickedFeature.properties.moduleIndex !== undefined) {
			activeModule = clickedFeature.properties.moduleIndex;
			const coords = clickedFeature.geometry.coordinates;
			if (
				coordinater.coordinates.latitude !== coords[1] ||
				coordinater.coordinates.longitude !== coords[0]
			) {
				coordinater.setCoordinates(coords[1], coords[0]);
			}
		}

		updateMarkers();
	});
	oldsearchTags = data.searchTags;
	console.log("map loaded");
	
}


// Converts your modules array to GeoJSON FeatureCollection with properties for clustering
function modulesToGeoJSON(modules) {
	return {
		type: 'FeatureCollection',
		features: modules
			.filter(m => m.latitude != null && m.longitude != null)
			.map((m, i) => ({
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [m.longitude, m.latitude],
				},
				properties: {
					moduleIndex: i,
				}
			}))
	};
}

function updateMarkers() {
	if (!map) return;

	// Remove old markers
	clusterMarkers.forEach(m => m.remove());
	clusterMarkers = [];
	singleMarkers.forEach(m => m.remove());
	singleMarkers = [];

	const source = map?.getSource('modules');
	if (!source) return;

	// Query all clusters currently visible
	const clusters = map.querySourceFeatures('modules', {
		filter: ['has', 'point_count'],
	});

	// Query all single points (unclustered)
	const singles = map.querySourceFeatures('modules', {
		filter: ['!', ['has', 'point_count']],
	});

	// Add cluster markers with number
	clusters.forEach(cluster => {
		const coords = cluster.geometry.coordinates;
		const pointCount = cluster.properties.point_count;

		const el = document.createElement('div');
		el.className = 'custom-cluster-marker ronzino-12 uppercase';
		el.textContent = pointCount;

		const marker = new mapboxgl.Marker(el)
			.setLngLat(coords)
			.addTo(map);

		clusterMarkers.push(marker);
	});

	singles.forEach(feature => {
		const coords = feature.geometry.coordinates;
		const i = feature.properties.moduleIndex;

		const el = document.createElement('div');
		el.className = 'custom-single-marker';
		el.title = initialModules[i].title || 'Module';

		el.addEventListener('click', (e) => {
			e.stopPropagation();
			activeModule = i;			
			if ( coordinater.coordinates.latitude !== coords[1] || coordinater.coordinates.longitude !== coords[0]) {
				coordinater.setCoordinates(coords[1], coords[0]);
			}
		});

		const marker = new mapboxgl.Marker(el)
			.setLngLat(coords)
			.addTo(map);

		singleMarkers.push(marker);
	});
}

function applyInitialSpiderfy(modules) {
	const map = new Map();
	if (!modules) {
		return
	}
	modules.forEach((m, i) => {
		if (m.latitude == null || m.longitude == null) return;
		const key = `${m.latitude.toFixed(6)},${m.longitude.toFixed(6)}`;
		if (!map.has(key)) map.set(key, []);
		map.get(key).push({ module: m, index: i });
	});

	map.forEach(group => {
		if (group.length <= 1) return;

		const centerLat = group[0].module.latitude;
		const centerLng = group[0].module.longitude;

		const radius = 0.005;
		const angleStep = (2 * Math.PI) / group.length;

		group.forEach(({ module }, k) => {
			const angle = k * angleStep;
			module.latitude += radius * Math.sin(angle);
			module.longitude += radius * Math.cos(angle);
		});
	});
	return modules;
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
  if (!e.ctrlKey) {
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

<svelte:head>
	{#if data.seo.SEOTitle}<title>{data.seo.SEOTitle} — Map</title>{/if}
	{#if data.seo.SEOTitle}<meta property="og:title" content={`${data.seo.SEOTitle} — Mappa`}>{/if}
	{#if data.seo.SEOTitle}<meta property="og:site_name" content={`${data.seo.SEOTitle} — Mappa`}>{/if}
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


	{#each initialModules as module, i}
		<div class="module-container" bind:this={modules[i]} class:active={activeModule === i}>
			{#if activeModule == i}
				<div style="-webkit-transform: scale({innerWidth < 700 ? .9 : .5}); -ms-transform: scale({innerWidth < 700 ? .9 : .5}); transform: scale({innerWidth < 700 ? .9 : .5}); -webkit-transform-origin: center; -ms-transform-origin: center; transform-origin: center; pointer-events: all;"
				use:clickOutside onclick_outside={() => handleClickOutside()}>
					{#if module.modules}
							<Serie slides={module.modules} project={module.project} size={module.size} link={module.link}/>
					{:else}
							<Module module={module} i={i} delayed={false}/>
					{/if}
				</div>
			{/if}
		</div>
	{/each}
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
#cross {
	position: fixed;
	top: 50%;
	left: 50%;
	-webkit-transform: translateX(-50%) translateY(-50%);
	    -ms-transform: translateX(-50%) translateY(-50%);
	        transform: translateX(-50%) translateY(-50%);
	width: auto;
	height: auto;
	display: -webkit-box;
	display: -ms-flexbox;
	display: flex;
	-webkit-box-align: center;
	    -ms-flex-align: center;
	        align-items: center;
	-webkit-box-pack: center;
	    -ms-flex-pack: center;
	        justify-content: center;
	z-index: 2;
	mix-blend-mode: difference;
}
#cross .line {
	position: absolute;
}
#cross .line:nth-child(2) {
	-webkit-transform: rotate(90deg);
	    -ms-transform: rotate(90deg);
	        transform: rotate(90deg);
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
