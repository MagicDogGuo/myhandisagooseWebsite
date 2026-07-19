import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { PressAssetList } from './press-asset-list';
import type { PressAsset } from '@/types/api';

vi.mock('@/api/press', () => ({
  pressAssetDownloadUrl: (assetId: string) =>
    `http://api.test/api/v1/press/assets/${assetId}/download`,
}));

const assets: PressAsset[] = [
  {
    id: 'press-kit',
    title: 'Press Kit (placeholder)',
    description: 'Logo and promo pack',
    relativePath: '/press-kit/press-kit.zip',
    downloadCount: 4,
  },
];

function renderList() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <PressAssetList assets={assets} />
    </QueryClientProvider>,
  );
}

describe('PressAssetList', () => {
  it('shows download count and opens download URL', async () => {
    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    renderList();

    expect(screen.getByText('Downloads: 4')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Download' }));

    expect(openSpy).toHaveBeenCalledWith(
      'http://api.test/api/v1/press/assets/press-kit/download',
      '_blank',
      'noopener,noreferrer',
    );

    openSpy.mockRestore();
  });
});
