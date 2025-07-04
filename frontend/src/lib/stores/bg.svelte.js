let bg = $state(null)

export function getBg() {
	function setBg(b) {
		bg = b
	}
	return {
		get bg() {
			return bg;
		},
		setBg,
	};
}