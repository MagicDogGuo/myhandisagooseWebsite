import { AppError } from '../../errors/app-error.js';
import { findPressAsset, PRESS_ASSETS } from './press-catalog.js';
import type { PressRepository } from './press-repository.js';
import type { PressAsset } from './types/index.js';

export type PressServiceConfig = {
  publicAssetBaseUrl: string;
};

function joinAssetUrl(baseUrl: string, relativePath: string): string {
  const base = baseUrl.replace(/\/$/, '');
  const path = relativePath.startsWith('/')
    ? relativePath
    : `/${relativePath}`;
  return `${base}${path}`;
}

export class PressService {
  constructor(
    private readonly repository: PressRepository,
    private readonly config: PressServiceConfig,
  ) {}

  async listAssets(): Promise<PressAsset[]> {
    const ids = PRESS_ASSETS.map((asset) => asset.id);
    const counts = await this.repository.getCountsByAssetIds(ids);

    return PRESS_ASSETS.map((asset) => ({
      ...asset,
      downloadCount: counts.get(asset.id) ?? 0,
    }));
  }

  async recordDownload(assetId: string): Promise<{ redirectUrl: string }> {
    const asset = findPressAsset(assetId);
    if (!asset) {
      throw new AppError('NOT_FOUND', 'Press asset not found', 404);
    }

    await this.repository.incrementDownloadCount(asset.id);

    return {
      redirectUrl: joinAssetUrl(
        this.config.publicAssetBaseUrl,
        asset.relativePath,
      ),
    };
  }
}
