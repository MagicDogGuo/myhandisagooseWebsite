import type { PressAssetDefinition } from './types/index.js';

/** Static press-kit catalog. Files live on the SPA/S3 origin (publicAssetBaseUrl). */
export const PRESS_ASSETS: readonly PressAssetDefinition[] = [
  {
    id: 'press-kit',
    title: 'Press Kit (placeholder)',
    description:
      'Logo, screenshots, and promo art placeholder zip. Replace with final media before launch.',
    relativePath: '/press-kit/press-kit.zip',
  },
  {
    id: 'logo-pack',
    title: 'Logo pack (placeholder)',
    description: 'Wordmark and icon placeholders for press use.',
    relativePath: '/press-kit/logo-pack.zip',
  },
] as const;

export function findPressAsset(
  assetId: string,
): PressAssetDefinition | undefined {
  return PRESS_ASSETS.find((asset) => asset.id === assetId);
}
