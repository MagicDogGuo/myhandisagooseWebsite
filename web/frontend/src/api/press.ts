import { apiFetch } from '@/api/client';
import type { PressAssetsResponse } from '@/types/api';

export function fetchPressAssets() {
  return apiFetch<PressAssetsResponse>('/api/v1/press/assets');
}

export function pressAssetDownloadUrl(assetId: string): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  return `${base}/api/v1/press/assets/${encodeURIComponent(assetId)}/download`;
}
