let blurred = $state(false)

export function getHeader() {
	function setBlurred(b) {
		blurred = b
	}
	return {
		get blurred() {
			return blurred;
		},
		setBlurred,
	};
}