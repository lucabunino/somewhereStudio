// src/lib/utils/gsapScale.js
import { gsap } from "gsap";

export function gsapScale(node, scale) {
	const tl = gsap.timeline({ paused: true });
	let lastScale = scale;

	function apply(newScale) {
		if (newScale !== lastScale) {
			gsap.to(node, {
				scale: newScale,
				transformOrigin: "top center",
				duration: 0.4,
				ease: "power3.out",
			});
			lastScale = newScale;
		}
	}

	apply(scale); // initial

	return {
		update(newScale) {
			apply(newScale);
		},
		destroy() {
			gsap.killTweensOf(node);
		},
	};
}