import { useQueryClient } from '@tanstack/react-query';

import { pressAssetDownloadUrl } from '@/api/press';
import { Button } from '@/components/ui/button';
import type { PressAsset } from '@/types/api';

type PressAssetListProps = {
  assets: PressAsset[];
};

export function PressAssetList({ assets }: PressAssetListProps) {
  const queryClient = useQueryClient();

  function handleDownload(assetId: string) {
    window.open(pressAssetDownloadUrl(assetId), '_blank', 'noopener,noreferrer');
    window.setTimeout(() => {
      void queryClient.invalidateQueries({ queryKey: ['press', 'assets'] });
    }, 800);
  }

  return (
    <ul className="mt-4 space-y-3">
      {assets.map((asset) => (
        <li
          key={asset.id}
          className="bevel-plate-raised flex flex-col gap-3 rounded-sm p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-ink">{asset.title}</h3>
            <p className="text-ink-soft mt-1 text-xs leading-relaxed">
              {asset.description}
            </p>
            <p className="label-chrome text-ink-soft mt-2">
              Downloads: {asset.downloadCount}
            </p>
          </div>
          <Button
            type="button"
            variant="amber"
            className="shrink-0 self-start sm:self-center"
            onClick={() => handleDownload(asset.id)}
          >
            Download
          </Button>
        </li>
      ))}
    </ul>
  );
}
