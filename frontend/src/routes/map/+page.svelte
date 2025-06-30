<script>
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { PUBLIC_MAPBOX_TOKEN } from '$env/static/public';
import { onMount } from "svelte";
import Module from '$lib/components/Module.svelte';
import { clickOutside } from '$lib/utils/clickOutside.js';
import { gsapScale } from "$lib/utils/gsapScale.js";
import { onDestroy } from 'svelte';

// Coordinates
import { getCoordinates } from '$lib/stores/coordinates.svelte.js';
let coordinater = getCoordinates()

// Zoom
import { getZoom } from '$lib/stores/zoom.svelte.js';
let zoomer = getZoom()

// Tags
import { getTags } from '$lib/stores/tag.svelte.js';
let tagger = getTags()

let { data } = $props()
let map;
let mapZoom;
let mapContainer;
let activeModule = $state(undefined)
let els = $state([])
let modules = $state([data.modules])
let suppressFlyTo = false;


onMount(() => {
	tagger.setTags(data.tags, { keepHierarchy: false })
	tagger.setMaxTags(tagger.firstMaxTags)
	if (data.searchParams.length > tagger.firstMaxTags) {
		tagger.setMaxTags(data.searchParams.length)
	};
	map = new mapboxgl.Map({
      container: mapContainer,
	  style: 'mapbox://styles/lucabunino-com/cm6qt0ddx00rj01sd8lek6ucf',
      accessToken: PUBLIC_MAPBOX_TOKEN,
      center: [coordinater.coordinates.longitude, coordinater.coordinates.latitude],
      zoom: zoomer.mapZoom,
	  minZoom: zoomer.mapMinZoom,
	  maxZoom: zoomer.mapMaxZoom,
	  localFontFamily: 'Ronzino, Arial, Helvetica, sans-serif',
    });
	map.on('moveend', () => {
		// updateData();
	});
	map.on('dragend', updateData);
	map.on('zoomend', updateData);
	data.modules.forEach((module, i) => {
		if (module.latitude != null && module.longitude != null) {
			new mapboxgl.Marker(els[i])
				.setLngLat([module.longitude, module.latitude])
				.addTo(map);
			new mapboxgl.Marker(modules[i])
				.setLngLat([module.longitude, module.latitude])
				.addTo(map);
		}
	});
});

$effect(() => {
	if (!map) {
		return
	} else {
		map.flyTo({
			center: [coordinater.coordinates.longitude, coordinater.coordinates.latitude],
			zoom: zoomer.mapZoom,
			essential: true,
			duration: 1000,
		});
	}
})

onDestroy(() => {
	map.remove();
});

let moveEndTimeout;
const moveEndDelay = 200
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
	// Debounced move end trigger
	clearTimeout(moveEndTimeout);
	moveEndTimeout = setTimeout(() => {
		updateData();
	}, moveEndDelay);
  }
}

function isTouchpad(e) {
  return e.wheelDeltaY ? e.wheelDeltaY === -3 * e.deltaY : e.deltaMode === 0;
}

function handleClickOutside() {
	if (activeModule) {
		activeModule = undefined
	}
}

// function updateData() {
// 	zoomer.setMapZoom(map.getZoom())
// 	coordinater.setCoordinates(map.getCenter().lat, map.getCenter().lng)
// }
function updateData() {
	// suppressFlyTo = true;
	zoomer.setMapZoom(map.getZoom());
	coordinater.setCoordinates(map.getCenter().lat, map.getCenter().lng);

	// setTimeout(() => {
	// 	suppressFlyTo = false;
	// }, 500);
}

function handleClick(i, lat, lng) {
	activeModule = i;
	setTimeout(() => {
		coordinater.setCoordinates(lat, lng)
	}, 0);
}
</script>

<div id="map" bind:this={mapContainer} onwheel={(e) => {panHandler(e)}}/>

{#each data.modules as module, i}
	<div class="marker" bind:this={els[i]} onclick={() => {handleClick(i, module.latitude, module.longitude)}}></div>
	<div class="module-container" bind:this={modules[i]} class:active={activeModule === i}>
		{#if activeModule === i}
			<div style="transform: scale({.5}); transform-origin: center; pointer-events: all;"
			use:clickOutside onclick_outside={() => handleClickOutside()}>
				<Module module={module} i={i} delayed={false}/>
			</div>
		{/if}
	</div>
{/each}

<div class="sidebar">
Longitude: {coordinater.coordinates.longitude} | Latitude: {coordinater.coordinates.latitude} | Zoom: {zoomer.mapZoom}
</div>




<style>
#map {
	position: absolute;
	width: 100%;
	height: 100%;
}
.module-container {
	position: absolute;
	left: 0;
	bottom: 0;
	width: fit-content;
	height: fit-content;
	pointer-events: none !important;
}
.module-container.active {
	z-index: 3;
}
.sidebar {
	background-color: rgb(35 55 75 / 90%);
	color: #fff;
	padding: 6px 12px;
	font-family: monospace;
	z-index: 2;
	position: absolute;
	top: 100px;
	left: 0;
	margin: 12px;
	border-radius: 4px;
}
:global(.mapboxgl-map) {
	font: unset;
}
:global(.mapboxgl-ctrl) {
	font-family: Ronzino, Arial, Helvetica, sans-serif;
    transform: translate(0);
    font-size: .7rem;
    letter-spacing: .01em;
}
:global(.marker) {
	width: 1.5rem;
	height: 1.5rem;
	background-color: var(--darkGray);
	cursor: pointer;
	z-index: 2;
}
:global(.marker.active) {
	z-index: 0;
}
:global(.marker:hover) {
	background-color: var(--white);
}
</style>