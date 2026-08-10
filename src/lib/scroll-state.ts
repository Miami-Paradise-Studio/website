/** One scroll value, written by whoever owns scrolling and read by everything
 *  else. The WebGL scene must not add its own scroll listener: Lenis is the
 *  authority, and two readers of the native position drift apart. */
export const scrollState = {
	/** 0 at the top, 1 once the hero and the section after it have passed. */
	progress: 0,
};

export function setScrollProgress(scrollY: number) {
	const span = window.innerHeight * 1.8;
	scrollState.progress = Math.min(1, Math.max(0, scrollY / span));
}
