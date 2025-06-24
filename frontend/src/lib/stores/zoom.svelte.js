const maxZoom = 9
const minZoom = 2
const step = 0.2
let zoom = $state(5)
let scale = $derived(zoom*step)

export function getZoom() {
	function setZoom(z) {
		zoom = z
	}
	function increaseZoom() {
		if (zoom < maxZoom) {
			zoom++
		}
		
	}
	function decreaseZoom() {
		if (zoom > minZoom) {
			zoom--
		}
	}
	return {
		get zoom() {
			return zoom;
		},
		get scale() {
			return scale;
		},
		get maxZoom() {
			return maxZoom;
		},
		get minZoom() {
			return minZoom;
		},
		setZoom,
		increaseZoom,
		decreaseZoom,
	};
}