<script>
// Imports
import Module from "$lib/components/Module.svelte";
import Serie from "$lib/components/Serie.svelte";
import { onMount } from "svelte";
import { quadOut } from 'svelte/easing';
import { blur } from "svelte/transition";
import { flip } from "svelte/animate";
import { gsapTransform } from "$lib/utils/gsapTransform.js";
import { gsapScale } from "$lib/utils/gsapScale.js";

// Zoom
import { getZoom } from '$lib/stores/zoom.svelte.js';
let zoomer = getZoom()
let oldScale = zoomer.scale;

// Coordinates
import { getCoordinates } from '$lib/stores/coordinates.svelte.js';
let coordinater = getCoordinates()

// Header
import { getHeader } from '$lib/stores/header.svelte.js';
let header = getHeader()

// Tags
import { getTags } from '$lib/stores/tag.svelte.js';
let tagger = getTags()

// Variables
let { data } = $props()
let domLoaded = $state(false)
let innerWidth = $state(0)
let innerHeight = $state(0)
let enableAnimation = $state(false)
let mouse = $state({ x: 0, y: 0 });
let index = -1
let modulesHeight = $state()
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
let preloadFactor = $derived(innerWidth > 700 ? 10 : 12)
const sizerX = $derived(innerWidth > 700 ? 1 : 1.2)
const sizerY = $derived(innerWidth > 700 ? 1.1 : .6)
const randomFactor = $derived(innerWidth > 700 ? .2 : .1)
let bufferX = $derived(innerWidth / zoomer.zoom * preloadFactor * sizerX)
let bufferY = $derived(innerHeight / zoomer.zoom * preloadFactor * sizerY)

// Lifecycle
onMount(() => {
	if (data.searchTags.length > 0) {
		zoomer.setZoom(zoomer.initialZoom)
	} else {
		zoomer.setZoom(zoomer.initialZoom - 2)
	}
	tagger.setTags(data.tags, { keepHierarchy: false })
	tagger.setMaxTags(tagger.firstMaxTags)
	if (data.searchTags.length > tagger.firstMaxTags) {
		tagger.setMaxTags(data.searchTags.length)
	}
})
$effect(() => {
	domLoaded = true;
	if (innerWidth < 700) {
		zoomer.setZoom(zoomer.initialZoom)
	}
	if (data.searchTags.length !== lastLength) {
		lastLength = data.searchTags.length;
	}
	if (data.searchTags.length == 0) {
		if (checkCellTimer) return;
		checkCellTimer = requestAnimationFrame(() => {
			checkCellTimer = null;
			const gridX = Math.floor(-positionX / (innerWidth * sizerX));
			const gridY = Math.floor(-positionY / (innerHeight * sizerY));
			const key = `${gridX},${gridY}`;
			// const spiralCoords = getSpiralCoords(data.modules.length);
			const spiralCoords = getSpiralCoords(3);
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
		offsetX: (Math.random() - 0.5) * innerWidth * randomFactor,
		offsetY: (Math.random() - 0.5) * innerHeight * randomFactor,
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
	positionX += deltaX * baseSpeed / (zoomer.scale * sizerX);
	positionY += deltaY * baseSpeed / (zoomer.scale * sizerY);
}

function handleScroll(e) {
	if (data.searchTags.length === 0) {
		e.preventDefault()
		updatePosition(-e.deltaX, -e.deltaY, 1);
		header.setBlurred(true)
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
function isInView(gridX, gridY) {
	const scaledInnerWidth = innerWidth / zoomer.zoom;
	const scaledInnerHeight = innerHeight / zoomer.zoom;

	const x = gridX * innerWidth * sizerX + positionX;
	const y = gridY * innerHeight * sizerY + positionY;

	return (
		x + scaledInnerWidth * preloadFactor > 0 &&
		x - scaledInnerWidth * preloadFactor < innerWidth &&
		y + scaledInnerHeight * preloadFactor > 0 &&
		y - scaledInnerHeight * preloadFactor < innerHeight
	);
}

function getTransformFn(module, index = 0) {
	return () => {
		const baseX = module.gridX * innerWidth * sizerX + innerWidth/2;
		const baseY = module.gridY * innerHeight * sizerY + innerHeight/2;
		const x = (baseX + positionX + module.offsetX) * zoomer.scale;
		const y = (baseY + positionY + module.offsetY) * zoomer.scale;
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

	oldScale = zoomer.scale;
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
	if (latitude && longitude) {
		coordinater.setCoordinates(latitude, longitude)
	} else {
		coordinater.setCoordinates(null, null)
	}
}

let velocityX = 0;
let velocityY = 0;
let momentumFrame;

function handleTouchStart(e) {
  isDragging = true;
  cancelMomentum();
  enableAnimation = false;

  const touch = e.touches[0];
  lastX = touch.clientX;
  lastY = touch.clientY;
  velocityX = 0;
  velocityY = 0;
}

function handleTouchMove(e) {
  if (!isDragging || e.touches.length !== 1) return;

  const touch = e.touches[0];
  const deltaX = touch.clientX - lastX;
  const deltaY = touch.clientY - lastY;

  velocityX = deltaX;
  velocityY = deltaY;

  lastX = touch.clientX;
  lastY = touch.clientY;

  updatePosition(deltaX, deltaY, 2);
}

function handleTouchEnd(e) {
  isDragging = false;
  enableAnimation = true;
  startMomentum(velocityX, velocityY);
}

function startMomentum(vx, vy) {
  const friction = 0.95;
  const threshold = 0.5;

  function step() {
    vx *= friction;
    vy *= friction;

    if (Math.abs(vx) > threshold || Math.abs(vy) > threshold) {
      updatePosition(vx, vy, 2);
      momentumFrame = requestAnimationFrame(step);
    } else {
      cancelMomentum();
    }
  }

  momentumFrame = requestAnimationFrame(step);
}

function cancelMomentum() {
  if (momentumFrame) {
    cancelAnimationFrame(momentumFrame);
    momentumFrame = null;
  }
}


</script>

<svelte:window bind:innerWidth bind:innerHeight></svelte:window>

<!-- svelte-ignore a11y_no_static_element_interactions -->
{#key data.searchTags}
	<section id="modules"
	bind:clientHeight={modulesHeight}
	onwheel={(e) => {handleScroll(e)}}
	onmousedown={(e) => {handleMouseDown(e)}}
	onmousemove={(e) => {handleMouseMove(e)}}
	onmouseup={(e) => {handleMouseUp(e)}}
	ontouchstart={handleTouchStart}
  	ontouchmove={handleTouchMove}
  	ontouchend={handleTouchEnd}
	style={(data.searchTags.length === 0 && !data.searchString)
		? `height: 100vh; position:fixed;`
		: `height: auto; margin-bottom:  ${(modulesHeight - modulesHeight*zoomer.scale)*-1}px; -webkit-transform: scale(${zoomer.scale}); -ms-transform: scale(${zoomer.scale}); transform: scale(${zoomer.scale}); -webkit-transform-origin: top; -ms-transform-origin: top; transform-origin: top;`}
	class:scattered={data.searchTags.length === 0 && !data.searchString}
	>
		{#if data.searchTags.length > 0 || data.searchString}
			{#if innerWidth > 700}
				<div class="module intro gaisyr-34"
				in:blur|global={{ duration: 200, delay: 500 }}
				out:blur|global={{ duration: 200}}
				>{data.modules.length} Risultati {zoomer.zoom} per:
					{#if data.searchString != undefined}
						'{data.searchString}'{#if data.searchTags.length > 0}{@html ' in '}{/if}
					{/if}
					{#each data.searchTags as searchParam, i}
						{#each data.tags.filter(tag => tag.slug.current === searchParam) as tag, j}{tag.title}{/each}{#if data.searchTags.length - 1 > i}{@html ', '}{/if}
					{/each}
				</div>
			{:else}
				<div class="module intro gaisyr-34"
				>{data.modules.length} Risultati per:
					{#if data.searchString != undefined}
						'{data.searchString}'{#if data.searchTags.length > 0}{@html ' in '}{/if}
					{/if}
					{#each data.searchTags as searchParam, i}
						{#each data.tags.filter(tag => tag.slug.current === searchParam) as tag, j}{tag.title}{/each}{#if data.searchTags.length - 1 > i}{@html ', '}{/if}
					{/each}
				</div>
			{/if}
			{#each data.modules as module, i}
				<div class="module-container">
					<div onmouseenter={() => {handleMouseEnter(module.latitude || module.reference?.latitude || null, module.longitude || module.reference?.longitude || null)}}>
						{#if module.modules}
								<Serie slides={module.modules} project={module.project} size={module.size} hiddenProject={false} link={module.link} delayed={false}/>
						{:else}
								<Module module={module} i={i} delayed={false}/>
						{/if}
					</div>
				</div>
			{/each}
		{:else}
			{#each activeModules as module, i (module.gridX + '-' + module.gridY)}
				<div class="module-container"
				onmouseenter={() => {handleMouseEnter(module.latitude, module.longitude)}}
				class:scattered={data.searchTags.length === 0 || !data.searchString}
				use:gsapTransform={getTransformFn(module)}
				>
					{#if module.modules}
							<Serie slides={module.modules} project={module.project} size={module.size} hiddenProject={true} link={false} delayed={false}/>
					{:else}
							<Module module={module} i={i} delayed={false}/>
					{/if}
				</div>
			{/each}
		{/if}
	</section>
{/key}

<style>
#modules {
	display: -webkit-box;
	display: -ms-flexbox;
	display: flex;
	-webkit-box-orient: vertical;
	-webkit-box-direction: normal;
	    -ms-flex-direction: column;
	        flex-direction: column;
	-webkit-box-align: center;
	    -ms-flex-align: center;
	        align-items: center;
	width: 100vw;
	-ms-grid-column-align: center;
	    justify-self: center;
	-webkit-transition: var(--transition);
	-o-transition: var(--transition);
	transition: var(--transition);
	-webkit-transition-property: margin, -webkit-transform;
	transition-property: margin, -webkit-transform;
	-o-transition-property: margin, transform;
	transition-property: margin, transform;
	transition-property: margin, transform, -webkit-transform;
}
#modules.scattered {
	overscroll-behavior-x: contain;
  	-ms-touch-action: pan-y;
  	    touch-action: pan-y;
	cursor: -webkit-grab;
	cursor: grab;
	overflow: hidden;
}
#modules.scattered:active {
	cursor: -webkit-grabbing;
	cursor: grabbing;
}
.module {
	display: block;
	height: 100%;
	background-color: var(--white);
}
.intro {
	padding: 6rem 3rem 5rem;
	text-align: center;
	max-width: 80vw;
	height: auto;
}
.module-container {
	position: relative;
	-webkit-transform-origin: center;
	    -ms-transform-origin: center;
	        transform-origin: center;
	will-change: transform;
}
.scattered .module-container {
	position: absolute;
	width: 80vw;
	height: 80vh;
	display: -webkit-box;
	display: -ms-flexbox;
	display: flex;
	-webkit-box-align: center;
	    -ms-flex-align: center;
	        align-items: center;
	-webkit-box-pack: center;
	    -ms-flex-pack: center;
	        justify-content: center;
}

@media screen and (max-width: 700px) {
	.intro {
		width: 100%;
		max-width: unset;
		padding-top: 18rem;
	}
	.scattered .module-container {
		width: 100vw;
		height: 70vh;
	}
}
</style>