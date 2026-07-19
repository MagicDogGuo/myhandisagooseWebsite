import { describe, expect, it, vi } from 'vitest';

import { AppError } from '../../errors/app-error.js';
import { PressService } from './press-service.js';
import type { PressRepository } from './press-repository.js';

describe('PressService', () => {
  it('lists catalog assets with download counts', async () => {
    const getCountsByAssetIds = vi.fn(async () => {
      const map = new Map<string, number>();
      map.set('press-kit', 3);
      return map;
    });
    const repository = {
      getCountsByAssetIds,
      incrementDownloadCount: vi.fn(),
    } as unknown as PressRepository;

    const service = new PressService(repository, {
      publicAssetBaseUrl: 'http://localhost:5173',
    });

    const assets = await service.listAssets();

    expect(assets.length).toBeGreaterThanOrEqual(1);
    expect(assets.find((a) => a.id === 'press-kit')?.downloadCount).toBe(3);
    expect(assets.find((a) => a.id === 'logo-pack')?.downloadCount).toBe(0);
    expect(getCountsByAssetIds).toHaveBeenCalledOnce();
  });

  it('increments count and returns redirect URL', async () => {
    const incrementDownloadCount = vi.fn(async (assetId: string) => ({
      assetId,
      downloadCount: 1,
    }));
    const repository = {
      getCountsByAssetIds: vi.fn(),
      incrementDownloadCount,
    } as unknown as PressRepository;

    const service = new PressService(repository, {
      publicAssetBaseUrl: 'http://localhost:5173/',
    });

    const result = await service.recordDownload('press-kit');

    expect(incrementDownloadCount).toHaveBeenCalledWith('press-kit');
    expect(result.redirectUrl).toBe(
      'http://localhost:5173/press-kit/press-kit.zip',
    );
  });

  it('throws NOT_FOUND for unknown asset', async () => {
    const repository = {
      getCountsByAssetIds: vi.fn(),
      incrementDownloadCount: vi.fn(),
    } as unknown as PressRepository;

    const service = new PressService(repository, {
      publicAssetBaseUrl: 'http://localhost:5173',
    });

    await expect(service.recordDownload('missing')).rejects.toBeInstanceOf(
      AppError,
    );
    await expect(service.recordDownload('missing')).rejects.toMatchObject({
      code: 'NOT_FOUND',
      httpStatus: 404,
    });
  });
});
