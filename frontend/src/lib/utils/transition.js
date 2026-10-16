// Easing
import { quadInOut } from 'svelte/easing'

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