const initialZoom = 5
const maxZoom = 9
const minZoom = 1
const step = 0.2
let zoom = $state(initialZoom)
let scale = $derived(zoom*step)

const mapInitialZoom = 6
const mapMaxZoom = 20
const mapMinZoom = 2
let mapZoom = $state(mapInitialZoom)

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
	function setMapZoom(z) {
		mapZoom = z
	}
	function increaseMapZoom() {
		mapZoom = Math.round(mapZoom);
		if (mapZoom < mapMaxZoom) {
			mapZoom++
		}
	}
	function decreaseMapZoom() {
		mapZoom = Math.round(mapZoom);
		if (mapZoom > mapMinZoom) {
			mapZoom--
		}
	}
	function resetMapZoom() {
		mapZoom = mapInitialZoom
	}
	return {
		get initialZoom() {
			return initialZoom;
		},
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
		get mapInitialZoom() {
			return mapInitialZoom;
		},
		get mapZoom() {
			return mapZoom;
		},
		get mapMaxZoom() {
			return mapMaxZoom;
		},
		get mapMinZoom() {
			return mapMinZoom;
		},
		setMapZoom,
		resetMapZoom,
		increaseMapZoom,
		decreaseMapZoom,
	};
}