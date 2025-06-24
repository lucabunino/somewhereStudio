<script>
// Imports
import Module from "$lib/components/Module.svelte";
import Serie from "$lib/components/Serie.svelte";
import { onMount } from "svelte";
import { quadOut } from 'svelte/easing';
import { blur } from "svelte/transition";
import { flip } from "svelte/animate";
import { gsapTransform } from "$lib/utils/gsapTransform.js";

// Zoom
import { getZoom } from '$lib/stores/zoom.svelte.js';
let zoomer = getZoom()
let oldScale = zoomer.scale;

// Coordinates
import { getCoordinates } from '$lib/stores/coordinates.svelte.js';
let coordinater = getCoordinates()

// Variables
let { data } = $props()
let domLoaded = $state(false)
let innerWidth = $state(0)
let innerHeight = $state(0)
let enableAnimation = $state(false)
let mouse = $state({ x: 0, y: 0 });
let index = -1
let activeModules = $state([])
let positionX = $state(0)
let positionY = $state(0)
let lastLength = -1;
let lastGridX = 0;
let lastGridY = 0;
let visitedCells = $state([]);
let lastX = 0;
let lastY = 0;
let animationFrame;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let positionStart = { x: 0, y: 0 };
let checkCellTimer = $state();
let preloadFactor = 4
let bufferX = $derived(innerWidth / zoomer.zoom * preloadFactor * sizer)
let bufferY = $derived(innerHeight / zoomer.zoom * preloadFactor * sizer)
const sizer = 1

// Tags
import { getTags } from '$lib/stores/tag.svelte.js';
let tagger = getTags()
onMount(() => {
	tagger.setTags(data.tags, { keepHierarchy: false })
	tagger.setMaxTags(tagger.firstMaxTags)
	if (data.searchParams.length > tagger.firstMaxTags) {
		tagger.setMaxTags(data.searchParams.length)
	}
})

// Lifecycle
$effect(() => {
	domLoaded = true;

	if (data.searchParams.length !== lastLength) {
		lastLength = data.searchParams.length;
		// setTimeout(() => {
		// 	positionX = 0;
		// 	positionY = 0;
		// }, 500);
	}
	
	if (data.searchParams.length == 0) {
		if (checkCellTimer) return;
		checkCellTimer = requestAnimationFrame(() => {
			checkCellTimer = null;
			const gridX = Math.floor(-positionX / innerWidth);
			const gridY = Math.floor(-positionY / innerHeight);
			const key = `${gridX},${gridY}`;
			const spiralCoords = getSpiralCoords(10);
			for (const [dx, dy] of spiralCoords) {
				const x = gridX + dx;
				const y = gridY + dy;
				const k = `${x},${y}`;
				if (!visitedCells.includes(k) && isInView(x, y)) {
					addModule(x, y);
				}
				if (!isInView(x, y)) {
					removeModule(x, y);
				}
			}
		});
	}
})
function addModule(gridX, gridY) {
	index++;
	activeModules.push({
		...data.modules[index % data.modules.length],
		gridX,
		gridY,
		index,
	});
	visitedCells.push(`${gridX},${gridY}`);
}
function removeModule(gridX, gridY) {
	const key = `${gridX},${gridY}`;
	const index = activeModules.findIndex(m => m.gridX === gridX && m.gridY === gridY);
	if (index !== -1) {
		activeModules.splice(index, 1);
	}
	const visitedIndex = visitedCells.indexOf(key);
	if (visitedIndex !== -1) {
		visitedCells.splice(visitedIndex, 1);
	}
}
function updatePosition(deltaX, deltaY, baseSpeed = 1) {
	const scale = zoomer.scale * sizer;
	positionX += deltaX * baseSpeed / scale;
	positionY += deltaY * baseSpeed / scale;
}

function handleScroll(e) {
	if (data.searchParams.length === 0) {
		updatePosition(-e.deltaX, -e.deltaY, 1);
	}
	enableAnimation = false
}

function handleMouseDown(e) {
	isDragging = true;
	enableAnimation = false;
	lastX = e.clientX;
	lastY = e.clientY;
}
function handleMouseMove(e) {
	if (isDragging) {
		const deltaX = (e.clientX - lastX);
		const deltaY = (e.clientY - lastY);
		lastX = e.clientX;
		lastY = e.clientY;
		updatePosition(deltaX, deltaY, 2);
	}
}
function handleMouseUp() {
	isDragging = false;
}
function calculateStartingPositionX(gridX) {
	return gridX * innerWidth * sizer + innerWidth / 2;
}
function calculateStartingPositionY(gridY) {
	return gridY * innerHeight * sizer + innerHeight / 2;
}
function isInView(gridX, gridY) {
	const x = (gridX * innerWidth * sizer + innerWidth / 2 + positionX);
	const y = (gridY * innerHeight * sizer + innerHeight / 2 + positionY);
	return (
		x + bufferX > 0 &&
		x - bufferX < innerWidth &&
		y + bufferY > 0 &&
		y - bufferY < innerHeight
	);
}
function getTransformFn(module) {
	return () => {
		const x = (calculateStartingPositionX(module.gridX) + positionX) * zoomer.scale;
		const y = (calculateStartingPositionY(module.gridY) + positionY) * zoomer.scale;
		return { x, y, scale: zoomer.scale };
	};
}
function applyZoom() {
	const screenCenterX = innerWidth / 2;
	const screenCenterY = innerHeight / 2;

	const worldCenterX = screenCenterX / oldScale - positionX;
	const worldCenterY = screenCenterY / oldScale - positionY;

	positionX = -(worldCenterX - screenCenterX / zoomer.scale);
	positionY = -(worldCenterY - screenCenterY / zoomer.scale);

	oldScale = zoomer.step * zoomer.zoom;
}
function getSpiralCoords(range) {
	const coords = [];
	for (let r = 1; r <= range; r++) {
		// Top and bottom rows
		for (let dx = -r; dx <= r; dx++) {
			coords.push([dx, -r]);
			if (r !== 0) coords.push([dx, r]);
		}
		// Left and right columns (excluding corners)
		for (let dy = -r + 1; dy <= r - 1; dy++) {
			coords.push([-r, dy]);
			coords.push([r, dy]);
		}
	}
	coords.unshift([0, 0]);
	return coords;
}
function handleMouseEnter(latitude, longitude) {
	console.log(latitude, longitude);
	if (latitude && longitude) {
		coordinater.setCoordinates(latitude, longitude)
	}
}

</script>

<svelte:window bind:innerWidth bind:innerHeight></svelte:window>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- <p style="position: fixed; top:50%; left:50%; background-color:white; z-index:999;">{positionX} / {modules.length}</p> -->
<section id="modules"
onmousewheel={(e) => {handleScroll(e)}}
onmousedown={(e) => {handleMouseDown(e)}}
onmousemove={(e) => {handleMouseMove(e)}}
onmouseup={(e) => {handleMouseUp(e)}}
style={data.searchParams.length === 0 ? `height: 100vh; position:fixed;` : `height: auto;`}
class:scattered={data.searchParams.length === 0}
>
	{#key data.searchParams}
		{#if data.searchParams.length > 0}
			<div class="module intro gaisyr-34"
			in:blur|global={{ duration: 200, delay: 500 }}
			out:blur|global={{ duration: 200}}
			>{data.modules.length} Risultati per:
				{#each data.searchParams as searchParam, i}
					{#each data.tags.filter(tag => tag.slug.current === searchParam) as tag, j}{tag.title}{/each}{#if data.searchParams.length - 1 > i}{@html ', '}{/if}
				{/each}
			</div>
			{#each data.modules as module, i}
				<div class="module-container">
					<div onmouseenter={() => {handleMouseEnter(module.latitude, module.longitude)}}>
						{#if module.modules}
								<Serie slides={module.modules} project={module.project} size={module.size} hiddenProject={true} link={false}/>
						{:else}
								<Module module={module} i={i} delayed={false}/>
						{/if}
					</div>
				</div>
			{/each}
		{:else}
			{#each activeModules as module, i (module.gridX + '-' + module.gridY)}
				{@const startingPositionX = calculateStartingPositionX(module.gridX)}
				{@const startingPositionY = calculateStartingPositionY(module.gridY)}
				<div class="module-container"
				class:scattered={data.searchParams.length === 0}
				use:gsapTransform={getTransformFn(module)}
				>
					<div onmouseenter={() => {handleMouseEnter(module.latitude, module.longitude)}}>
						{#if module.modules}
								<Serie slides={module.modules} project={module.project} size={module.size} hiddenProject={true} link={false} delayed={false}/>
						{:else}
								<Module module={module} i={i} delayed={false}/>
						{/if}
					</div>
				</div>
			{/each}
		{/if}
	{/key}
</section>

<style>
#modules {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100vw;
}
#modules.scattered {
	overscroll-behavior-x: contain;
  	touch-action: pan-y;
	cursor: grab;
	overflow: hidden;
}
#modules.scattered:active {
	cursor: grabbing;
}
.module {
	display: block;
	background-color: var(--white);
}
.intro {
	padding: 3em;
	text-align: center;
	max-width: 80vw;
}
.module-container {
	position: relative;
	transform-origin: center;
	will-change: transform;
}
.scattered .module-container {
	position: absolute;
	width: 100vw;
	height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
}
.slide {
	background-color: var(--white);
}
.project {
	padding: .5em;
	text-align: right;
}
</style>