// Text blocks that scroll inside their module when overflowing.
// - action: marks the element and toggles `fade-bottom` while there is more content below
// - canScrollText: lets the homepage canvas hand wheel/touch to the text instead of panning

export function scrollText(node) {
	node.dataset.scrollText = '';

	function update() {
		const more = node.scrollHeight - node.scrollTop - node.clientHeight > 1;
		node.classList.toggle('fade-bottom', more);
	}

	const resize = new ResizeObserver(update);
	resize.observe(node);
	node.addEventListener('scroll', update, { passive: true });
	update();

	return {
		destroy() {
			resize.disconnect();
			node.removeEventListener('scroll', update);
		}
	};
}

// true when the event target sits in a text block that can still scroll in that direction
export function canScrollText(target, deltaY) {
	const el = target?.closest?.('[data-scroll-text]');
	if (!el || el.scrollHeight <= el.clientHeight + 1) return false;
	if (deltaY > 0) return el.scrollTop + el.clientHeight < el.scrollHeight - 1;
	if (deltaY < 0) return el.scrollTop > 0;
	return true;
}
