import { tick } from 'svelte';

let coordinates = $state({ latitude: '0', longitude: '0' });
let formattedCoordinates = $state({ latitude: '00.00000', longitude: '00.00000' });

export function getCoordinates() {
	function formatNumber(num) {
		let [intPart, decPart = ''] = (Math.round(num * 1e5) / 1e5).toFixed(5).split('.');
		intPart = intPart.padStart(2, '0');
		decPart = decPart.padEnd(5, '0');
		return `${intPart}.${decPart}`;
	}

	async function animateCoordinate(key, value) {
		const formatted = formatNumber(value);
		coordinates[key] = value; // Store raw number

		for (let i = 1; i <= formatted.length; i++) {
			formattedCoordinates[key] = formatted.slice(0, i);
			await tick();
			await new Promise(r => setTimeout(r, 30));
		}
	}

	function setCoordinates(newLat, newLng) {
		animateCoordinate('latitude', newLat);
		animateCoordinate('longitude', newLng);
	}

	return {
		get coordinates() {
			return coordinates;
		},
		get formattedCoordinates() {
			return formattedCoordinates;
		},
		setCoordinates,
	};
}