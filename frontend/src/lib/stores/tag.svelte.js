let tags = $state([]);
let firstMaxTags = 5;
let maxTags = $state(firstMaxTags);
let open = $state(false);

export function getTags() {	

	async function setTags(t) {
		tags = t
	}
	async function setMaxTags(t) {
		maxTags = t
	}
	async function setOpen(o) {
		if (o) {
			open = true
		} else {
			open = false
		}
	}

	return {
		get tags() {
			return tags;
		},
		setTags,
		get firstMaxTags() {
			return firstMaxTags;
		},
		get maxTags() {
			return maxTags;
		},
		setMaxTags,
		get open() {
			return open;
		},
		setOpen,
	};
}