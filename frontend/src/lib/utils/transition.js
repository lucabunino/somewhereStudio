// Easing
import { quadInOut } from 'svelte/easing'
import { slide as svelteSlide } from 'svelte/transition'

// Transitions
export function pageIn(node, { delay, duration, marginTop }) {
	return {
		delay,
		duration,
		css: (t) => {
			const eased = quadInOut(t);
			return `
				opacity: ${(eased)};
			`;
		}
	};
}

export function pageOut(node, { delay, duration, marginTop }) {
	// pin the outgoing page where it is: SvelteKit scrolls to top on navigation
	// while this fades out, which otherwise flashes the top of the old page
	const { top, left, width } = node.getBoundingClientRect();
	Object.assign(node.style, {
		position: 'fixed',
		top: `${top}px`,
		left: `${left}px`,
		width: `${width}px`,
		pointerEvents: 'none',
	});
	return {
		delay,
		duration,
		css: (t) => {
			const eased = quadInOut(t);
			return `
				opacity: ${eased};
			`;
		}
	};
}
// svelte's slide measures the element; inside a hidden container (e.g. the mobile "..." button on desktop)
// that measure is NaN and the browser warns "Invalid keyframe value". Hidden elements just skip it.
export function slide(node, params) {
	if (node.getClientRects().length === 0) return { duration: 0 };
	return svelteSlide(node, params);
}
