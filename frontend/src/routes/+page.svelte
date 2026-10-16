<script>
// Imports
import Module from "$lib/components/Module.svelte";
import Serie from "$lib/components/Serie.svelte";
import { onMount } from "svelte";
import { quadOut } from 'svelte/easing';
import { blur } from "svelte/transition";
import { flip } from "svelte/animate";
import { gsap } from "gsap";
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
// raw: module data is big, only the array itself needs to be reactive
let activeModules = $state.raw([])
let positionX = $state(0)
let positionY = $state(0)
let lastLength = -1;
let lastGridX = 0;
let lastGridY = 0;
let visitedCells = new Set();
let lastX = 0;
let lastY = 0;
let animationFrame;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let positionStart = { x: 0, y: 0 };
let lastViewKey = '';
// smoothed view all modules are placed from: position and scale ease together, once per frame
const camera = { x: 0, y: 0, scale: 1, ready: false };
const CAMERA_EASE_MS = 90;
const spiralCache = new Map();
// const sizerX = $derived(innerWidth > 700 ? 1 : 1.2)
let sizerX = $derived.by(() => {
	if (innerWidth > 1280 && innerWidth / innerHeight > 1.6) {
		return 0.9;
	} else if (innerWidth <= 700) {
		return 1.2;
	} else {
		return 1;
	}
});
const sizerY = $derived(innerWidth > 700 ? 1.2 : .6)
const randomFactor = $derived(innerWidth > 700 ? .2 : .1)

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
	if (data.searchTags.length !== lastLength) {
		lastLength = data.searchTags.length;
	}
})
// one shared tick: ease the camera towards the target view, then refresh which cells need modules
// (only when the view moved). Modules read the camera in the same frame, so they move in lockstep
onMount(() => {
	function tick(time, deltaTime) {
		if (data.searchTags.length == 0) {
			if (innerWidth < 700 && zoomer.zoom !== zoomer.initialZoom) {
				zoomer.setZoom(zoomer.initialZoom)
			}
			if (!camera.ready) {
				Object.assign(camera, { x: positionX, y: positionY, scale: zoomer.scale, ready: true });
			} else {
				const k = 1 - Math.exp(-deltaTime / CAMERA_EASE_MS);
				camera.x = approach(camera.x, positionX, k, 0.05);
				camera.y = approach(camera.y, positionY, k, 0.05);
				camera.scale = approach(camera.scale, zoomer.scale, k, 0.0005);
			}
			const key = `${camera.x}|${camera.y}|${camera.scale}|${innerWidth}|${innerHeight}`;
			if (key !== lastViewKey) {
				lastViewKey = key;
				checkCells();
			}
		} else {
			lastViewKey = '';
		}
	}
	gsap.ticker.add(tick);
	return () => gsap.ticker.remove(tick);
})
function approach(value, target, k, epsilon) {
	const next = value + (target - value) * k;
	return Math.abs(target - next) < epsilon ? target : next;
}
function checkCells() {
	// Calculate the grid cell that is at the center of the current viewport
	const centerX = innerWidth / (2 * camera.scale) - innerWidth / 2 - camera.x;
	const centerY = innerHeight / (2 * camera.scale) - innerHeight / 2 - camera.y;
	const gridX = Math.round(centerX / (innerWidth * sizerX));
	const gridY = Math.round(centerY / (innerHeight * sizerY));

	// Calculate range based on zoom level with an extra safety margin
	const rangeX = Math.ceil(1 / (camera.scale * sizerX)) + 2;
	const rangeY = Math.ceil(1 / (camera.scale * sizerY)) + 2;
	const range = Math.max(rangeX, rangeY, 5);

	// For new potential modules, we don't have an offset yet, isInView uses a safe margin
	const added = [];
	for (const [dx, dy] of getSpiralCoords(range)) {
		const x = gridX + dx;
		const y = gridY + dy;
		if (!visitedCells.has(`${x},${y}`) && isInView(x, y)) {
			added.push(createModule(x, y));
		}
	}

	// Clean up modules that are no longer in view, using each module's own offset
	const next = [];
	for (const m of [...activeModules, ...added]) {
		if (isInView(m.gridX, m.gridY, m.offsetX, m.offsetY)) next.push(m);
		else visitedCells.delete(`${m.gridX},${m.gridY}`);
	}
	if (next.length !== activeModules.length || next.some((m, i) => m !== activeModules[i])) {
		activeModules = next;
	}
}
function createModule(gridX, gridY) {
	index++;
	visitedCells.add(`${gridX},${gridY}`);
	return {
		...data.modules[index % data.modules.length],
		gridX,
		gridY,
		index,
		offsetX: (Math.random() - 0.5) * innerWidth * randomFactor,
		offsetY: (Math.random() - 0.5) * innerHeight * randomFactor,
	};
}
function updatePosition(deltaX, deltaY, baseSpeed = 1) {
	positionX += deltaX * baseSpeed / (zoomer.scale * sizerX);
	positionY += deltaY * baseSpeed / (zoomer.scale * sizerY);
}

function handleScroll(e) {
	if (data.searchTags.length === 0 && !data.searchString) {
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
function isInView(gridX, gridY, offsetX = 0, offsetY = 0) {
	// Calculate the center position of the module in screen coordinates, including its random offset.
	// The translate moves the container from its resting place: horizontally centered in #modules,
	// top at 0, so its on-screen center is translate + (innerWidth/2, containerHeight/2)
	const containerHeight = innerHeight * (innerWidth <= 700 ? .7 : .8);
	const centerX = (gridX * innerWidth * sizerX + innerWidth/2 + camera.x + offsetX) * camera.scale + innerWidth/2;
	const centerY = (gridY * innerHeight * sizerY + innerHeight/2 + camera.y + offsetY) * camera.scale + containerHeight/2;

	// Use a very large buffer for the X axis to prevent early disappearance,
	// but never more than one grid cell: a fixed buffer keeps ~150 modules alive when zoomed out
	const bufferX = Math.min(1200, innerWidth * sizerX * camera.scale);
	const bufferY = Math.min(600, innerHeight * sizerY * camera.scale);
	
	// Use full innerWidth/innerHeight for the margin to be safe (since modules are at most 100vw/vh)
	const marginX = (innerWidth * camera.scale) / 2 + bufferX;
	const marginY = (innerHeight * camera.scale) / 2 + bufferY;

	return (
		centerX + marginX > 0 &&
		centerX - marginX < innerWidth &&
		centerY + marginY > 0 &&
		centerY - marginY < innerHeight
	);
}

function getTransformFn(module, index = 0) {
	return () => {
		const baseX = module.gridX * innerWidth * sizerX + innerWidth/2;
		const baseY = module.gridY * innerHeight * sizerY + innerHeight/2;
		const x = (baseX + camera.x + module.offsetX) * camera.scale;
		const y = (baseY + camera.y + module.offsetY) * camera.scale;
		return { x, y, scale: camera.scale };
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
	if (spiralCache.has(range)) return spiralCache.get(range);
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
	spiralCache.set(range, coords);
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
				>{data.modules.length} Risultati per:
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