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