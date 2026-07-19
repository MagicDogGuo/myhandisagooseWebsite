import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

import { GlbModel } from '@/components/viewer-3d/glb-model';
import type { ViewerModelDef } from '@/components/viewer-3d/viewer-models';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useViewerStore } from '@/stores/viewer-store';

type ModelEntryProps = {
  model: ViewerModelDef;
  index: number;
};

function ModelScene({ glbPath }: { glbPath: string }) {
  return (
    <>
      <color attach="background" args={['#b8c6e0']} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3.5, 5, 2.5]} intensity={1.2} />
      <hemisphereLight args={['#e8eef8', '#6a5a48', 0.35]} />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.75, 0]}
        receiveShadow
      >
        <circleGeometry args={[1.15, 40]} />
        <meshStandardMaterial color="#9aa8c4" roughness={0.9} metalness={0.05} />
      </mesh>
      <Suspense fallback={null}>
        <GlbModel glbPath={glbPath} targetSize={1.25} />
      </Suspense>
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={1.4}
        maxDistance={6}
        maxPolarAngle={Math.PI * 0.49}
      />
    </>
  );
}

export function ModelEntry({ model, index }: ModelEntryProps) {
  const selectedModelId = useViewerStore((s) => s.selectedModelId);
  const setSelectedModelId = useViewerStore((s) => s.setSelectedModelId);
  const selected = model.id === selectedModelId;
  const entryNo = String(index + 1).padStart(2, '0');

  return (
    <article
      className={cn(
        'bevel-plate-raised overflow-hidden rounded-sm transition-[box-shadow,filter]',
        selected && 'ring-2 ring-signal ring-offset-2 ring-offset-canvas',
      )}
    >
      <button
        type="button"
        className="section-label-bar w-full rounded-none border-0 text-left"
        onClick={() => {
          setSelectedModelId(model.id);
        }}
        aria-pressed={selected}
      >
        <span className="text-ink-soft mr-1 font-mono">No.{entryNo}</span>
        {model.label}
      </button>

      <div className="bevel-inset relative aspect-square w-full overflow-hidden border-x-0 border-t-0 rounded-none">
        <Suspense fallback={<Skeleton className="absolute inset-0 rounded-none" />}>
          <Canvas
            className="touch-none"
            dpr={[1, 1.75]}
            camera={{ position: [0, 1, 2.8], fov: 42, near: 0.1, far: 40 }}
            gl={{ antialias: true, powerPreference: 'low-power' }}
            onPointerDown={() => {
              setSelectedModelId(model.id);
            }}
          >
            <ModelScene glbPath={model.glbPath} />
          </Canvas>
        </Suspense>
        <p className="label-chrome text-ink-soft pointer-events-none absolute bottom-1.5 left-1.5 rounded-sm bg-canvas/80 px-1.5 py-0.5 text-[0.6rem]">
          Drag · Zoom
        </p>
      </div>

      <div className="px-3 py-2.5">
        <p className="text-ink-soft text-xs leading-relaxed sm:text-sm">
          {model.description}
        </p>
      </div>
    </article>
  );
}
