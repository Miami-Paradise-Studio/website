import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import {
	AdaptiveDpr,
	Float,
	Grid,
	MeshReflectorMaterial,
	PerformanceMonitor,
	Sparkles,
	useCursor,
} from '@react-three/drei';
import {
	Bloom,
	ChromaticAberration,
	EffectComposer,
	GodRays,
	Noise,
	Scanline,
	Vignette,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { scrollState } from '../lib/scroll-state';

const ROSE = '#ff4d9d';
const AMBER = '#ffc46b';
const AQUA = '#7fe6ff';

/** Three's clock keeps counting while the loop is parked, so the first frame
 *  after the scene resumes reports the whole pause as a single delta and every
 *  delta-scaled rotation lurches. Every step here is clamped to one slow frame,
 *  and anything that needs a wall clock integrates its own from those steps. */
const MAX_STEP = 1 / 30;
const step = (delta: number) => Math.min(delta, MAX_STEP);

/** The centrepiece. Faceted and emissive, inside a counter-rotating wire cage
 *  so the silhouette never reads as a plain spinning rock. Draggable, because
 *  the cursor already says it is grabbable. */
function Shard({ onSun }: { onSun: (mesh: THREE.Mesh | null) => void }) {
	const core = useRef<THREE.Mesh>(null);
	const cage = useRef<THREE.LineSegments>(null);
	const group = useRef<THREE.Group>(null);
	const [hovered, setHovered] = useState(false);
	const [dragging, setDragging] = useState(false);
	// On a phone the copy owns the full width, so the shard has nowhere to sit
	// beside it. Centre it, push it back and shrink it: distant enough to read as
	// atmosphere behind the headline rather than as competition with it.
	const narrow = useThree((state) => state.size.width) < 760;
	// Sitting low matters: the mirror only returns what hangs close over it, so a
	// shard parked high above the floor reflects as a smear nobody reads.
	const base = narrow
		? { position: [0, 0.75, -6.4] as const, scale: 0.6 }
		: { position: [2.9, 0.05, -1.2] as const, scale: 0.82 };

	const spin = useRef({ x: 0, y: 0 });
	const clock = useRef(0);

	useCursor(hovered, dragging ? 'grabbing' : 'grab');

	useFrame((_, delta) => {
		const dt = step(delta);
		clock.current += dt;

		// Framerate independent friction, so a 120Hz display decays at the same rate.
		const damping = Math.pow(0.94, dt * 60);
		spin.current.x *= damping;
		spin.current.y *= damping;

		if (core.current) {
			core.current.rotation.y += dt * 0.18 + spin.current.y;
			core.current.rotation.x += spin.current.x;
			if (!dragging) {
				core.current.rotation.x +=
					(Math.sin(clock.current * 0.24) * 0.12 - core.current.rotation.x) * dt * 0.6;
			}
		}

		if (cage.current) {
			cage.current.rotation.y -= dt * 0.1 - spin.current.y * 0.5;
			cage.current.rotation.z += dt * 0.04;
		}

		// Recedes as the page scrolls, so the scene hands the stage to the copy.
		if (group.current) {
			const p = scrollState.progress;
			group.current.position.y = base.position[1] + p * 2.4;
			group.current.scale.setScalar(base.scale * (1 - p * 0.35));
		}
	});

	const onDrag = (event: ThreeEvent<PointerEvent>) => {
		if (!dragging) return;
		spin.current.y += event.movementX * 0.0009;
		spin.current.x += event.movementY * 0.0009;
	};

	return (
		<group ref={group} position={base.position} scale={base.scale}>
			<Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.7} floatingRange={[-0.12, 0.12]}>
				<mesh
					ref={core}
					onPointerOver={() => setHovered(true)}
					onPointerOut={() => setHovered(false)}
					onPointerDown={(event) => {
						setDragging(true);
						(event.target as Element).setPointerCapture(event.pointerId);
					}}
					onPointerUp={() => setDragging(false)}
					onPointerMove={onDrag}
				>
					<icosahedronGeometry args={[1, 0]} />
					<meshStandardMaterial
						color="#2a0f2a"
						emissive={ROSE}
						emissiveIntensity={hovered ? 1.6 : 0.9}
						metalness={0.9}
						roughness={0.22}
						flatShading
					/>
				</mesh>

				{/* The light the rays come from: small and set behind the shard, so the
				    silhouette cuts the beams into blades. Any larger and it stops being
				    a light behind an object and becomes a blob in front of one. */}
				<mesh ref={onSun} position={[0, 0, -1.5]} scale={0.42}>
					<sphereGeometry args={[1, 20, 20]} />
					<meshBasicMaterial color={ROSE} />
				</mesh>

				<lineSegments ref={cage} scale={1.75}>
					<edgesGeometry args={[new THREE.IcosahedronGeometry(1, 0)]} />
					<lineBasicMaterial color={AQUA} transparent opacity={0.22} />
				</lineSegments>
			</Float>
		</group>
	);
}

const DEBRIS_COUNT = 34;

/** Fragments of the same shard, drifting. One instanced draw call, so the depth
 *  it adds costs effectively nothing. */
function Debris() {
	const mesh = useRef<THREE.InstancedMesh>(null);
	const clock = useRef(0);
	const dummy = useMemo(() => new THREE.Object3D(), []);

	const seeds = useMemo(
		() =>
			Array.from({ length: DEBRIS_COUNT }, (_, i) => ({
				radius: 3.4 + (i % 7) * 0.85,
				height: -1.2 + (((i * 37) % 100) / 100) * 4.4,
				phase: (i / DEBRIS_COUNT) * Math.PI * 2,
				speed: 0.06 + ((i * 13) % 10) / 100,
				scale: 0.04 + ((i * 17) % 9) / 100,
			})),
		[]
	);

	useFrame((_, delta) => {
		if (!mesh.current) return;
		clock.current += step(delta);
		const t = clock.current;

		seeds.forEach((seed, i) => {
			const angle = seed.phase + t * seed.speed;
			dummy.position.set(
				Math.cos(angle) * seed.radius,
				seed.height + Math.sin(t * 0.4 + seed.phase) * 0.22,
				Math.sin(angle) * seed.radius - 1.5
			);
			dummy.rotation.set(angle * 1.4, angle, angle * 0.7);
			dummy.scale.setScalar(seed.scale);
			dummy.updateMatrix();
			mesh.current?.setMatrixAt(i, dummy.matrix);
		});

		mesh.current.instanceMatrix.needsUpdate = true;
	});

	return (
		<instancedMesh ref={mesh} args={[undefined, undefined, DEBRIS_COUNT]} frustumCulled={false}>
			<octahedronGeometry args={[1, 0]} />
			<meshStandardMaterial
				color="#1a0f28"
				emissive={AMBER}
				emissiveIntensity={0.5}
				metalness={0.8}
				roughness={0.3}
				flatShading
			/>
		</instancedMesh>
	);
}

const RIPPLE_COUNT = 4;

/** A click anywhere on the page sends a ring across the floor. The studio's
 *  pitch is that a spoken order changes the round, so a click that visibly
 *  travels is the one piece of decoration that says something. */
function Ripples() {
	const group = useRef<THREE.Group>(null);
	const lives = useRef(Array.from({ length: RIPPLE_COUNT }, () => 1));
	const next = useRef(0);

	useEffect(() => {
		const onDown = () => {
			lives.current[next.current] = 0;
			next.current = (next.current + 1) % RIPPLE_COUNT;
		};
		window.addEventListener('pointerdown', onDown, { passive: true });
		return () => window.removeEventListener('pointerdown', onDown);
	}, []);

	useFrame((_, delta) => {
		group.current?.children.forEach((ring, i) => {
			const life = Math.min(1, lives.current[i] + step(delta) * 0.55);
			lives.current[i] = life;
			ring.scale.setScalar(0.4 + life * 13);
			const material = (ring as THREE.Mesh).material as THREE.Material;
			material.opacity = life >= 1 ? 0 : (1 - life) * 0.5;
		});
	});

	return (
		<group ref={group} position={[0, -1.86, 0]} rotation={[-Math.PI / 2, 0, 0]}>
			{Array.from({ length: RIPPLE_COUNT }, (_, i) => (
				<mesh key={i}>
					<ringGeometry args={[0.94, 1, 64]} />
					<meshBasicMaterial color={AQUA} transparent opacity={0} side={THREE.DoubleSide} />
				</mesh>
			))}
		</group>
	);
}

/** The floor is where the scene doubles itself: a shard with a mirror under it
 *  fills twice the frame for one draw. Blur stays low enough that the reflection
 *  reads as a second shard rather than as a coloured smear. */
function Floor({ quality }: { quality: number }) {
	return (
		<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]}>
			<planeGeometry args={[48, 48]} />
			<MeshReflectorMaterial
				resolution={quality > 0.6 ? 1024 : 512}
				mixBlur={0.6}
				mixStrength={52}
				mixContrast={1.35}
				blur={[150, 45]}
				mirror={0.9}
				depthScale={0.5}
				minDepthThreshold={0.2}
				maxDepthThreshold={3.6}
				color="#0d0718"
				metalness={0.85}
				roughness={0.55}
			/>
		</mesh>
	);
}

/** Camera answers the pointer and the scroll. Damped, never one to one, or it
 *  feels twitchy. */
function CameraRig() {
	const { camera } = useThree();
	const target = useRef({ x: 0, y: 0 });

	useEffect(() => {
		const onMove = (event: PointerEvent) => {
			target.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
			target.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
		};
		window.addEventListener('pointermove', onMove, { passive: true });
		return () => window.removeEventListener('pointermove', onMove);
	}, []);

	useFrame((_, delta) => {
		const k = 1 - Math.pow(0.001, step(delta));
		const p = scrollState.progress;

		camera.position.x += (target.current.x * 0.9 - camera.position.x) * k;
		camera.position.y += (0.55 - target.current.y * 0.5 + p * 1.6 - camera.position.y) * k;
		camera.position.z += (7 + p * 3.5 - camera.position.z) * k;
		camera.lookAt(0, -0.1 - p * 0.6, 0);
	});

	return null;
}

function Scene({ quality, onSun }: { quality: number; onSun: (mesh: THREE.Mesh | null) => void }) {
	return (
		<>
			<color attach="background" args={['#0b0714']} />
			<fog attach="fog" args={['#0b0714', 9, 26]} />

			<ambientLight intensity={0.35} />
			<pointLight position={[4, 3, 4]} intensity={22} color={ROSE} distance={22} decay={2} />
			<pointLight position={[-5, 2, -3]} intensity={16} color={AQUA} distance={22} decay={2} />
			<pointLight position={[0, -1.2, 3]} intensity={10} color={AMBER} distance={14} decay={2} />

			<Shard onSun={onSun} />
			<Debris />
			<Ripples />
			<Floor quality={quality} />

			{/* One dominant hue. Two bright grid colours plus chromatic aberration on
			    hairline geometry reads as rainbow fringing rather than as neon. */}
			<Grid
				position={[0, -1.88, 0]}
				args={[40, 40]}
				cellSize={0.9}
				cellThickness={0.6}
				cellColor={ROSE}
				sectionSize={4.5}
				sectionThickness={1}
				sectionColor={AMBER}
				fadeDistance={28}
				fadeStrength={1.5}
				infiniteGrid
			/>

			<Sparkles
				count={quality > 0.6 ? 70 : 30}
				scale={[16, 8, 10]}
				size={2}
				speed={0.28}
				color={AMBER}
				opacity={0.5}
			/>

			<CameraRig />
		</>
	);
}

export default function HeroScene() {
	const [booted, setBooted] = useState(false);
	const [quality, setQuality] = useState(1);
	const [dpr, setDpr] = useState(1.5);
	const [active, setActive] = useState(true);
	const [sun, setSun] = useState<THREE.Mesh | null>(null);
	const layer = useRef<HTMLDivElement>(null);

	// client:idle hydrates early, but three.js still waits for a quiet moment so
	// the headline, not the canvas, is the largest contentful paint.
	useEffect(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let cancel: () => void;

		if (typeof window.requestIdleCallback === 'function') {
			const handle = window.requestIdleCallback(() => setBooted(true), { timeout: 1800 });
			cancel = () => window.cancelIdleCallback(handle);
		} else {
			const handle = window.setTimeout(() => setBooted(true), 400);
			cancel = () => window.clearTimeout(handle);
		}

		return cancel;
	}, []);

	// The scene fades with scroll and then stops rendering entirely, so the rest
	// of the page costs nothing. Hysteresis keeps it from flapping at the edge.
	useEffect(() => {
		if (!booted) return;

		let frame = 0;
		const tick = () => {
			const p = scrollState.progress;
			if (layer.current) layer.current.style.opacity = String(Math.max(0, 1 - p * 1.15));
			setActive((current) => (current ? p < 0.98 : p < 0.9));
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);

		return () => cancelAnimationFrame(frame);
	}, [booted]);

	if (!booted) return null;

	return (
		<div ref={layer} className="fixed inset-0 -z-10" aria-hidden="true">
			<Canvas
				frameloop={active ? 'always' : 'never'}
				dpr={dpr}
				camera={{ position: [0, 0.55, 7], fov: 45 }}
				gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}
				onCreated={({ gl }) => {
					gl.toneMapping = THREE.ACESFilmicToneMapping;
					gl.toneMappingExposure = 1.05;
				}}
			>
				<PerformanceMonitor
					onDecline={() => {
						setQuality(0.5);
						setDpr(1);
					}}
				/>
				<AdaptiveDpr pixelated />

				<Suspense fallback={null}>
					<Scene quality={quality} onSun={setSun} />
				</Suspense>

				<EffectComposer enableNormalPass={false} multisampling={0}>
					{sun ? (
						<GodRays
							sun={sun}
							samples={quality > 0.6 ? 30 : 18}
							density={0.92}
							decay={0.93}
							weight={0.26}
							exposure={0.3}
							clampMax={0.55}
						/>
					) : (
						<></>
					)}
					<Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.35} luminanceSmoothing={0.6} />
					<ChromaticAberration offset={[0.0003, 0.0004]} />
					<Scanline blendFunction={BlendFunction.OVERLAY} density={1.25} opacity={0.1} />
					<Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.24} />
					<Vignette eskil={false} offset={0.16} darkness={0.95} />
				</EffectComposer>
			</Canvas>
		</div>
	);
}
