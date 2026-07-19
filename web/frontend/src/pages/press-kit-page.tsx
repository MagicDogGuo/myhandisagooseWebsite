import { ChromeShell } from '@/components/layout/chrome-shell';
import { PressAssetList } from '@/components/press/press-asset-list';
import {
  PRESS_CONTACT_EMAIL,
  PressQrPanel,
} from '@/components/press/press-qr-panel';
import { Skeleton } from '@/components/ui/skeleton';
import { usePressAssets } from '@/hooks/use-press-assets';

export function PressKitPage() {
  const { data, isPending, isError, refetch, isFetching } = usePressAssets();
  const pressPageUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/press`
      : 'https://myhandisagoose.example/press';

  return (
    <ChromeShell>
      <main className="px-3 py-6 sm:px-5 sm:py-8">
        <div className="section-label-bar rounded-t-sm">Press Kit</div>
        <div className="bevel-inset animate-rise rounded-b-sm px-4 py-5 sm:px-5">
          <h1 className="font-display text-boxart bg-lavender/80 -mx-4 -mt-5 mb-4 px-4 py-6 text-3xl leading-none sm:-mx-5 sm:px-5 sm:text-4xl">
            Media & contact
          </h1>
          <p className="text-ink-soft mb-2 max-w-2xl text-xs leading-relaxed sm:text-sm">
            Download logos and promo packs for coverage. Download counts are
            tracked by the API before redirecting to the static file.
          </p>
          <p className="text-ink-soft mb-6 text-xs sm:text-sm">
            Press contact:{' '}
            <a
              href={`mailto:${PRESS_CONTACT_EMAIL}`}
              className="text-signal hover:underline"
            >
              {PRESS_CONTACT_EMAIL}
            </a>
          </p>

          {isPending ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-sm" />
              <Skeleton className="h-24 w-full rounded-sm" />
            </div>
          ) : null}

          {isError ? (
            <div className="bevel-plate-raised rounded-sm p-4">
              <p className="text-ink text-sm font-bold">
                Could not load press assets
              </p>
              <p className="text-ink-soft mt-1 text-xs sm:text-sm">
                Check that the API is running, then try again.
              </p>
              <button
                type="button"
                className="label-chrome text-signal mt-3 hover:underline"
                onClick={() => void refetch()}
                disabled={isFetching}
              >
                Retry
              </button>
            </div>
          ) : null}

          {data ? <PressAssetList assets={data.assets} /> : null}

          <div className="mt-8">
            <p className="label-chrome text-ink-soft">QR codes</p>
            <p className="text-ink-soft mt-1 text-xs sm:text-sm">
              Scan for the store listing or this kit page.
            </p>
            <PressQrPanel pressPageUrl={pressPageUrl} />
          </div>
        </div>
      </main>
    </ChromeShell>
  );
}
