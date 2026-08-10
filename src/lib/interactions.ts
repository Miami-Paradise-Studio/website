import gsap from 'gsap';

const finePointer = () => window.matchMedia('(pointer: fine)').matches;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Primary buttons lean toward the cursor as it approaches and snap back on exit.
 *  Transform only, so nothing touches layout. quickTo keeps a single tween alive
 *  per axis instead of allocating one per pointermove event. */
function magneticButtons() {
	document.querySelectorAll<HTMLElement>('.btn-primary').forEach((btn) => {
		const xTo = gsap.quickTo(btn, 'x', { duration: 0.35, ease: 'power3' });
		const yTo = gsap.quickTo(btn, 'y', { duration: 0.35, ease: 'power3' });

		btn.addEventListener('pointermove', (event) => {
			const rect = btn.getBoundingClientRect();
			xTo((event.clientX - rect.left - rect.width / 2) * 0.28);
			yTo((event.clientY - rect.top - rect.height / 2) * 0.4);
		});

		btn.addEventListener('pointerleave', () => {
			xTo(0);
			yTo(0);
		});
	});
}

/** Cards tint toward the pointer. One custom property per card, read by a
 *  radial gradient in the stylesheet, so the work stays on the compositor. */
function pointerGlow() {
	document.querySelectorAll<HTMLElement>('[data-glow]').forEach((card) => {
		card.addEventListener('pointermove', (event) => {
			const rect = card.getBoundingClientRect();
			card.style.setProperty('--glow-x', `${event.clientX - rect.left}px`);
			card.style.setProperty('--glow-y', `${event.clientY - rect.top}px`);
		});
	});
}

export function initInteractions() {
	if (reducedMotion() || !finePointer()) return;

	magneticButtons();
	pointerGlow();
}
