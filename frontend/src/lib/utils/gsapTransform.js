import { gsap } from "gsap";

// Places a node from getTransform() on every gsap tick. The easing happens once, upstream, in the
// shared camera the getter reads, so all nodes move in lockstep (no per-node tweens, no parallax).
export function gsapTransform(node, getTransform) {
	let prev = {};

	function tick() {
		const { x, y, scale } = getTransform();
		// Only write if something changed
		if (x === prev.x && y === prev.y && scale === prev.scale) return;
		node.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
		prev = { x, y, scale };
	}

	// shared gsap ticker for all modules instead of a requestAnimationFrame loop each
	tick();
	gsap.ticker.add(tick);

	return {
		update(newGetter) {
			getTransform = newGetter;
		},
		destroy() {
			gsap.ticker.remove(tick);
		}
	};
}
