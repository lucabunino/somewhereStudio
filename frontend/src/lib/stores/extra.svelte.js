let extra = $state(false)
let extraOpen = $state(false)

export function getExtra() {
	function setExtra(e) {
		if (e) {
			extra = true
		} else {
			extra = false
		}
	}
	function setExtraOpen(e) {
		if (e) {
			extraOpen = true
		} else {
			extraOpen = false
		}
	}
	return {
		get extra() {
			return extra;
		},
		setExtra,
		get extraOpen() {
			return extraOpen;
		},
		setExtraOpen,
	};
}