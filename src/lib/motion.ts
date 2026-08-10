import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { setScrollProgress } from './scroll-state';

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

let lenis: Lenis | null = null;
let rafId = 0;

export const prefersReducedMotion = () =>
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Lenis is the single scroll authority; ScrollTrigger reads from it rather
 *  than from the native scroll position, otherwise the two drift apart. */
function startSmoothScroll() {
	if (lenis || prefersReducedMotion()) return;

	lenis = new Lenis({
		duration: 1.05,
		easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
		smoothWheel: true,
	});

	lenis.on('scroll', () => {
		ScrollTrigger.update();
		setScrollProgress(window.scrollY);
	});

	const raf = (time: number) => {
		lenis?.raf(time);
		rafId = requestAnimationFrame(raf);
	};
	rafId = requestAnimationFrame(raf);
}

function stopSmoothScroll() {
	cancelAnimationFrame(rafId);
	lenis?.destroy();
	lenis = null;
}

/** Splits a heading for a per-line reveal.
 *
 *  Accessibility: splitting shreds the text into per-line boxes that screen
 *  readers announce one fragment at a time. The fix is to name the heading
 *  itself and hide the fragments. This works here because a heading's role
 *  accepts an accessible name; the same trick on a plain <div> would not, which
 *  is the documented hole in SplitText's own remediation. Duplicating the
 *  heading into a visually hidden twin is worse: two <h1>s in the document. */
function revealHeading(el: HTMLElement) {
	if (el.dataset.split === 'done') return;
	el.dataset.split = 'done';
	el.setAttribute('aria-label', el.textContent?.trim().replace(/\s+/g, ' ') ?? '');

	// A heading already on screen plays at once. Hanging it off a ScrollTrigger
	// that is already satisfied is how a hero headline ends up masked and invisible.
	const inView = el.getBoundingClientRect().top < window.innerHeight * 0.9;

	// autoSplit re-splits when the variable font finishes loading; without it the
	// line boxes are measured against the fallback and collapse.
	SplitText.create(el, {
		type: 'lines',
		mask: 'lines',
		autoSplit: true,
		onSplit: (self) => {
			self.lines.forEach((line) => (line as HTMLElement).setAttribute('aria-hidden', 'true'));

			return gsap.from(self.lines, {
				yPercent: 110,
				duration: 0.9,
				ease: 'expo.out',
				stagger: 0.08,
				...(inView ? {} : { scrollTrigger: { trigger: el, start: 'top 88%', once: true } }),
			});
		},
	});
}

function revealBlocks(scope: HTMLElement | Document) {
	scope.querySelectorAll<HTMLElement>('.js-reveal').forEach((el, index) => {
		const inView = el.getBoundingClientRect().top < window.innerHeight * 0.9;

		gsap.to(el, {
			opacity: 1,
			y: 0,
			duration: 0.7,
			ease: 'expo.out',
			delay: inView ? 0.12 + index * 0.06 : 0,
			...(inView ? {} : { scrollTrigger: { trigger: el, start: 'top 90%', once: true } }),
		});
	});
}

/** Instrument labels resolve out of noise as they enter view. The final text is
 *  already in the DOM and mirrored into aria-label, so assistive tech never reads
 *  a scrambled frame.
 *
 *  ScrambleText is part of the free GSAP core since 3.13; it costs no new bytes. */
function scrambleLabel(el: HTMLElement, index: number) {
	const text = el.textContent?.trim() ?? '';
	if (!text || text.length > 40) return;

	el.setAttribute('aria-label', text);

	gsap.to(el, {
		duration: 1.4,
		delay: 0.25 + (index % 6) * 0.12,
		ease: 'none',
		scrambleText: { text, chars: '0123456789#$%&/<>', speed: 0.28, revealDelay: 0.45 },
		scrollTrigger: { trigger: el, start: 'top 94%', once: true },
	});
}

/** Counts a number up when it enters view. Cheap, and it makes the spec line
 *  read as an instrument rather than as static text. */
function countUp(el: HTMLElement) {
	const target = Number(el.dataset.count);
	if (!Number.isFinite(target)) return;

	const state = { value: 0 };
	gsap.to(state, {
		value: target,
		duration: 1.2,
		ease: 'expo.out',
		scrollTrigger: { trigger: el, start: 'top 92%', once: true },
		onUpdate: () => {
			el.textContent = String(Math.round(state.value));
		},
	});
}

export function initMotion() {
	ScrollTrigger.getAll().forEach((t) => t.kill());

	if (prefersReducedMotion()) {
		stopSmoothScroll();
		document.documentElement.classList.remove('motion-ready');
		return;
	}

	document.documentElement.classList.add('motion-ready');
	startSmoothScroll();
	setScrollProgress(window.scrollY);

	// Reduced motion keeps native scrolling, so the shared value still needs a writer.
	window.addEventListener('scroll', () => setScrollProgress(window.scrollY), { passive: true });

	// Splitting before the fonts resolve measures the fallback and collapses the
	// line boxes, so headings wait; everything else can start immediately.
	document.fonts.ready.then(() => {
		document.querySelectorAll<HTMLElement>('[data-reveal-heading]').forEach(revealHeading);
		ScrollTrigger.refresh();
	});

	revealBlocks(document);
	document.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
	document.querySelectorAll<HTMLElement>('.label').forEach(scrambleLabel);

	// Header state, driven by the same scroll authority as everything else.
	const header = document.querySelector('[data-header]');
	if (header) {
		ScrollTrigger.create({
			start: 'top -80',
			end: 99999,
			onToggle: (self) => header.classList.toggle('is-scrolled', self.isActive),
		});
	}

	ScrollTrigger.refresh();
}

if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker
			.register('/sw.js')
			.catch((error) => console.error('Service worker registration failed:', error));
	});
}
