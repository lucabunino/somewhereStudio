import { tick } from 'svelte';

let initialCoordinates = $state({ latitude: null, longitude: null });
let coordinates = $state({ latitude: null, longitude: null });
let animatedCoordinates = $state({ latitude: null, longitude: null });
let visible = $state(true)
let reset = $state(false)

function formatNumber(num) {
	let [intPart, decPart = ''] = (Math.round(num * 1e5) / 1e5).toFixed(5).split('.');
	intPart = intPart.padStart(2, '0');
	decPart = decPart.padEnd(5, '0');
	return `${intPart}.${decPart}`;
}

export function getCoordinates() {
	async function animateCoordinate(key, value) {
		const formatted = formatNumber(value);
		coordinates[key] = value;

		for (let i = 1; i <= formatted.length; i++) {
			animatedCoordinates[key] = formatted.slice(0, i);
			await tick();
			await new Promise(r => setTimeout(r, 30));
		}
	}

	function setCoordinates(newLat, newLng) {
		if (newLat !== null && newLng !== null) {
			animateCoordinate('latitude', newLat);
			animateCoordinate('longitude', newLng);
			visible = true
		} else {
			coordinates = initialCoordinates;
			visible = false
		}
	}

	function setInitialCoordinates(newLat, newLng) {
		initialCoordinates = { latitude: newLat, longitude: newLng };
	}

	function setReset(r) {
		reset = r
	}

	return {
		get visible() {
			return visible;
		},
		get coordinates() {
			return coordinates;
		},
		get animatedCoordinates() {
			return animatedCoordinates;
		},
		get formattedCoordinates() {
			return { latitude: formatNumber(coordinates.latitude), longitude: formatNumber(coordinates.longitude) };
		},
		get reset() {
			return reset;
		},
		setCoordinates,
		setInitialCoordinates,
		setReset,
	};
}