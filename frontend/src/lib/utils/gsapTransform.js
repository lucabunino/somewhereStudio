import { gsap } from "gsap";

export function gsapTransform(node, getTransform) {
	let prev = {};
	let frame;
	let firstRun = true;

	function loop() {
		const { x, y, scale } = getTransform();
		// Only animate if something changed
		const hasChanged = (
			x !== prev.x || y !== prev.y || scale !== prev.scale
		);

		if (hasChanged) {
			if (firstRun) {
				gsap.set(node, {
					x, y, scale,
					transformOrigin: "center center"
				});
				firstRun = false;
			} else {
				gsap.to(node, {
					x, y, scale,
					duration: .4,
					ease: "power5.out",
					transformOrigin: "center center"
				});
			}
			prev = { x, y, scale };
		}

		frame = requestAnimationFrame(loop);
	}

	loop();

	return {
		update(newGetter) {
			getTransform = newGetter;
		},
		destroy() {
			cancelAnimationFrame(frame);
		}
	};
}