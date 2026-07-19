import { ChromeShell } from '@/components/layout/chrome-shell';
import { ViewerGallery } from '@/components/viewer-3d/viewer-gallery';

export function Viewer3dPage() {
  return (
    <ChromeShell>
      <main className="px-3 py-6 sm:px-5 sm:py-8">
        <div className="section-label-bar rounded-t-sm">3D Viewer</div>
        <div className="bevel-inset animate-rise rounded-b-sm px-4 py-5 sm:px-5">
          <h1 className="font-display text-boxart bg-lavender/80 -mx-4 -mt-5 mb-4 px-4 py-6 text-3xl leading-none sm:-mx-5 sm:px-5 sm:text-4xl">
            Prop catalog
          </h1>
          <p className="text-ink-soft mb-6 max-w-2xl text-xs leading-relaxed sm:text-sm">
            Each entry has its own viewer — orbit and zoom inside a cell like a
            field guide.
          </p>

          <ViewerGallery />
        </div>
      </main>
    </ChromeShell>
  );
}
