import { Suspense } from 'react';

import { ChromeShell } from '@/components/layout/chrome-shell';
import { ModelPicker } from '@/components/viewer-3d/model-picker';
import { ViewerCanvas } from '@/components/viewer-3d/viewer-canvas';
import { getViewerModel } from '@/components/viewer-3d/viewer-models';
import { Skeleton } from '@/components/ui/skeleton';
import { useViewerStore } from '@/stores/viewer-store';

function ViewerModelMeta() {
  const selectedModelId = useViewerStore((s) => s.selectedModelId);
  const model = getViewerModel(selectedModelId);

  return (
    <div className="mt-3">
      <p className="label-chrome text-ink">{model.label}</p>
      <p className="text-ink-soft mt-1 text-xs sm:text-sm">{model.description}</p>
      <p className="text-ink-soft mt-1 font-mono text-[0.65rem] sm:text-xs">
        {model.glbPath}
      </p>
    </div>
  );
}

export function Viewer3dPage() {
  return (
    <ChromeShell>
      <main className="px-3 py-6 sm:px-5 sm:py-8">
        <div className="section-label-bar rounded-t-sm">3D Viewer</div>
        <div className="bevel-inset animate-rise rounded-b-sm px-4 py-5 sm:px-5">
          <h1 className="font-display text-boxart bg-lavender/80 -mx-4 -mt-5 mb-4 px-4 py-6 text-3xl leading-none sm:-mx-5 sm:px-5 sm:text-4xl">
            Inspect the props
          </h1>
          <p className="text-ink-soft mb-5 max-w-2xl text-xs leading-relaxed sm:text-sm">
            Orbit and zoom in the browser — pure frontend, no API. Models load
            from static files under <code className="text-ink">public/3D/</code>
            . More props can be dropped in as Unity glTF exports arrive.
          </p>

          <div className="mb-4">
            <p className="label-chrome text-ink-soft mb-2">Model</p>
            <ModelPicker />
            <ViewerModelMeta />
          </div>

          <Suspense
            fallback={<Skeleton className="aspect-[4/3] w-full rounded-sm sm:aspect-[16/10]" />}
          >
            <ViewerCanvas />
          </Suspense>
        </div>
      </main>
    </ChromeShell>
  );
}
