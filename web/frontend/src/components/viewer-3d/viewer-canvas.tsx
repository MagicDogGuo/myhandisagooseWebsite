import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

import { GlbModel } from '@/components/viewer-3d/glb-model';
import { getViewerModel } from '@/components/viewer-3d/viewer-models';
import { useViewerStore } from '@/stores/viewer-store';

function ViewerScene() {
  const selectedModelId = useViewerStore((s) => s.selectedModelId);
  const model = getViewerModel(selectedModelId);

  return (
    <>
      <color attach="background" args={['#b8c6e0']} />
      <ambientLight intensity={0.55} />
      <directionalLight
        castShadow
        position={[4, 7, 3]}
        intensity={1.25}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <hemisphereLight args={['#e8eef8', '#6a5a48', 0.35]} />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.85, 0]}
        receiveShadow
      >
        <circleGeometry args={[2.4, 48]} />
        <meshStandardMaterial color="#9aa8c4" roughness={0.9} metalness={0.05} />
      </mesh>
      <Suspense fallback={null}>
        <GlbModel key={model.id} glbPath={model.glbPath} />
      </Suspense>
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={1.2}
        maxDistance={8}
        maxPolarAngle={Math.PI * 0.49}
      />
    </>
  );
}

export function ViewerCanvas() {
  return (
    <div className="bevel-inset relative aspect-[4/3] w-full overflow-hidden rounded-sm sm:aspect-[16/10]">
      <Canvas
        className="touch-none"
        dpr={[1, 2]}
        shadows
        camera={{ position: [0, 1.1, 3.2], fov: 42, near: 0.1, far: 50 }}
        gl={{ antialias: true }}
      >
        <ViewerScene />
      </Canvas>
      <p className="label-chrome text-ink-soft pointer-events-none absolute bottom-2 left-2 rounded-sm bg-canvas/80 px-2 py-1 text-[0.65rem]">
        Drag to orbit · Scroll to zoom
      </p>
    </div>
  );
}
