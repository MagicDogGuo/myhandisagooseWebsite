import type { PressAssetDefinition } from './types/index.js';

/** Static press-kit catalog. Files live on the SPA/S3 origin (publicAssetBaseUrl). */
export const PRESS_ASSETS: readonly PressAssetDefinition[] = [
  {
    id: 'press-kit',
    title: 'Press Kit',
    description:
      'Logos, screenshots, and promo art for media coverage.',
    relativePath: '/press-kit/press-kit.zip',
  },
  {
    id: 'logo-pack',
    title: 'Logo pack',
    description: 'Wordmark and icon assets for press use.',
    relativePath: '/press-kit/logo-pack.zip',
  },
] as const;

export function findPressAsset(
  assetId: string,
): PressAssetDefinition | undefined {
  return PRESS_ASSETS.find((asset) => asset.id === assetId);
}
