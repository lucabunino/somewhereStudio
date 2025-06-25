let extra = $state(false)

export function getExtra() {
	function setExtra(e) {
		if (e) {
			extra = true
		} else {
			extra = false
		}
	}
	return {
		get extra() {
			return extra;
		},
		setExtra,
	};
}