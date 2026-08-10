import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
	AdaptiveDpr,
	Float,
	Grid,
	MeshReflectorMaterial,
	Lightformer,
	PerformanceMonitor,
	Sparkles,
	useCursor,
} from '@react-three/drei';
import {
	Bloom,
	ChromaticAberration,
	EffectComposer,
	N8AO,
	Noise,
	Scanline,
	Vignette,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const ROSE = '#ff4d9d';
const AMBER = '#ffc46b';
const AQUA = '#7fe6ff';
const VIOLET = '#9b6bff';

/** The centrepiece: a shard. Faceted, emissive, with a wire cage that counter
 *  rotates so the silhouette never reads as a plain spinning rock. */
function Shard() {
	const core = useRef<THREE.Mesh>(null);
	const cage = useRef<THREE.LineSegments>(null);
	const [hovered, setHovered] = useState(false);

	useCursor(hovered);

	useFrame((state, delta) => {
		if (core.current) {
			core.current.rotation.y += delta * 0.18;
			core.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.24) * 0.12;
		}
		if (cage.current) {
			cage.current.rotation.y -= delta * 0.1;
			cage.current.rotation.z += delta * 0.04;
		}
	});

	// Sits right of centre so the headline column keeps a clean, dark backdrop.
	return (
		<group position={[2.9, 0.75, -1.2]} scale={0.82}>
			<Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.7} floatingRange={[-0.12, 0.12]}>
				<mesh
					ref={core}
					onPointerOver={() => setHovered(true)}
					onPointerOut={() => setHovered(false)}
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

				<lineSegments ref={cage} scale={1.75}>
					<edgesGeometry args={[new THREE.IcosahedronGeometry(1, 0)]} />
					<lineBasicMaterial color={AQUA} transparent opacity={0.22} />
				</lineSegments>
			</Float>
		</group>
	);
}

/** Wet asphalt under a sodium lamp. The reflector is what sells the humidity. */
function Floor() {
	return (
		<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]}>
			<planeGeometry args={[48, 48]} />
			<MeshReflectorMaterial
				resolution={512}
				mixBlur={1}
				mixStrength={22}
				blur={[320, 90]}
				mirror={0.55}
				depthScale={1.1}
				minDepthThreshold={0.4}
				maxDepthThreshold={1.35}
				color="#0d0718"
				metalness={0.72}
				roughness={0.86}
			/>
		</mesh>
	);
}

/** Camera parallax from the pointer. Damped, never 1:1, or it feels twitchy. */
function PointerParallax() {
	const { camera } = useThree();
	const target = useRef({ x: 0, y: 0 });

	useEffect(() => {
		const onMove = (e: PointerEvent) => {
			target.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
			target.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
		};
		window.addEventListener('pointermove', onMove, { passive: true });
		return () => window.removeEventListener('pointermove', onMove);
	}, []);

	useFrame((_, delta) => {
		const k = 1 - Math.pow(0.001, delta);
		camera.position.x += (target.current.x * 0.9 - camera.position.x) * k;
		camera.position.y += (0.35 - target.current.y * 0.5 - camera.position.y) * k;
		camera.lookAt(0, -0.1, 0);
	});

	return null;
}

function Scene({ quality }: { quality: number }) {
	return (
		<>
			<color attach="background" args={['#0b0714']} />
			<fog attach="fog" args={['#0b0714', 9, 26]} />

			<ambientLight intensity={0.35} />
			<pointLight position={[4, 3, 4]} intensity={22} color={ROSE} distance={22} decay={2} />
			<pointLight position={[-5, 2, -3]} intensity={16} color={AQUA} distance={22} decay={2} />
			<pointLight position={[0, -1.2, 3]} intensity={10} color={AMBER} distance={14} decay={2} />

			<Lightformer
				form="rect"
				intensity={2}
				color={ROSE}
				scale={[10, 1.2, 1]}
				position={[0, 3.2, -6]}
				rotation={[0, 0, 0]}
			/>

			<Shard />
			<Floor />

			{/* One hue only. Two bright grid colours plus chromatic aberration on
			    hairline geometry reads as rainbow fringing, not as neon. */}
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

			<PointerParallax />
		</>
	);
}

export default function HeroScene() {
	const [booted, setBooted] = useState(false);
	const [quality, setQuality] = useState(1);
	const [dpr, setDpr] = useState(1.5);

	// client:visible fires immediately for an above-the-fold island, so the
	// three.js boot is gated separately: paint the page first, then start WebGL.
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

	if (!booted) return null;

	return (
		<Canvas
			className="motion-safe:animate-[fade-in_900ms_ease-out_both]"
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
				<Scene quality={quality} />
			</Suspense>

			<EffectComposer enableNormalPass={false} multisampling={0}>
				<N8AO aoRadius={0.6} intensity={1.4} distanceFalloff={0.8} />
				<Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.35} luminanceSmoothing={0.6} />
				<ChromaticAberration offset={[0.0003, 0.0004]} />
				<Scanline blendFunction={BlendFunction.OVERLAY} density={1.25} opacity={0.1} />
				<Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.24} />
				<Vignette eskil={false} offset={0.16} darkness={0.95} />
			</EffectComposer>
		</Canvas>
	);
}
