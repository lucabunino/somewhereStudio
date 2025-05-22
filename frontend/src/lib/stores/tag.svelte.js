let tags = $state([]);
let firstMaxTags = 5;
let maxTags = $state(firstMaxTags);
let open = $state(false);

export function getTags() {	
	// async function setTags(t, keepHierarchy = false) {
	// 	if (keepHierarchy) {
	// 		tags = t.map(newTag => {
	// 			const existing = tags.find(old => old.slug?.current === newTag.slug?.current);
	// 			return existing && 'temp' in existing
	// 				? { ...newTag, temp: existing.temp }
	// 				: newTag;
	// 		})
	// 	} else {
	// 		tags = t
	// 	}
	// }
	// async function setTagHierarchy(t, h) {
	// 	tags = t
	// 	const slugs = t.map(t => t.slug?.current).filter(Boolean);
	// 	tags = tags.map(tag =>
	// 		slugs.includes(tag.slug?.current)
	// 			? { ...tag, temp: h }
	// 			: tag
	// 	);
	// }
	async function setTags(t, { keepHierarchy = false, hierarchy = null } = {}) {
		tags = t.map(newTag => {
			const existing = tags.find(old => old.slug?.current === newTag.slug?.current);

			// Preserve temp if requested
			let temp = 0;
			if (keepHierarchy && existing && 'temp' in existing) {
				temp = existing.temp;
			} else if (hierarchy !== null) {
				temp = hierarchy;
			}

			return { ...newTag, temp };
		});
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