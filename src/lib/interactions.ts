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

const RETICLE_IDLE = 9;
const RETICLE_PAD = 10;

/** A targeting reticle instead of a cursor ring: four brackets that track the
 *  pointer and lock onto whatever is clickable under it. A studio that makes
 *  shooters can afford to say so in its cursor. Corners move by transform only,
 *  so a lock costs no layout even though the box changes size. */
function targetingReticle() {
	const hud = document.createElement('div');
	hud.className = 'reticle';
	hud.setAttribute('aria-hidden', 'true');

	const ease = { duration: 0.4, ease: 'power3' } as const;
	const corners = Array.from({ length: 4 }, (_, index) => {
		const corner = hud.appendChild(document.createElement('i'));
		return {
			xTo: gsap.quickTo(corner, 'x', ease),
			yTo: gsap.quickTo(corner, 'y', ease),
			signX: index % 2 === 0 ? -1 : 1,
			signY: index < 2 ? -1 : 1,
		};
	});

	document.body.append(hud);
	const xTo = gsap.quickTo(hud, 'x', ease);
	const yTo = gsap.quickTo(hud, 'y', ease);

	window.addEventListener(
		'pointermove',
		(event) => {
			const lock = (event.target as Element | null)?.closest<HTMLElement>(
				'a[href], button, [popovertarget]'
			);
			const box = lock?.getBoundingClientRect();

			xTo(box ? box.left + box.width / 2 : event.clientX);
			yTo(box ? box.top + box.height / 2 : event.clientY);

			const halfX = box ? box.width / 2 + RETICLE_PAD : RETICLE_IDLE;
			const halfY = box ? box.height / 2 + RETICLE_PAD : RETICLE_IDLE;
			corners.forEach((corner) => {
				corner.xTo(corner.signX * halfX);
				corner.yTo(corner.signY * halfY);
			});

			hud.classList.toggle('is-locked', Boolean(box));
			hud.classList.add('is-live');
		},
		{ passive: true }
	);
}

export function initInteractions() {
	if (reducedMotion() || !finePointer()) return;

	magneticButtons();
	pointerGlow();
	targetingReticle();
}
