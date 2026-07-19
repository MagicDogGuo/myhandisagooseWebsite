import { beforeEach, describe, expect, it } from 'vitest';

import {
  DEFAULT_VIEWER_MODEL_ID,
  useViewerStore,
} from '@/stores/viewer-store';

describe('useViewerStore', () => {
  beforeEach(() => {
    useViewerStore.setState({ selectedModelId: DEFAULT_VIEWER_MODEL_ID });
  });

  it('defaults to little-duck', () => {
    expect(useViewerStore.getState().selectedModelId).toBe('little-duck');
  });

  it('updates the selected model', () => {
    useViewerStore.getState().setSelectedModelId('nest');
    expect(useViewerStore.getState().selectedModelId).toBe('nest');

    useViewerStore.getState().setSelectedModelId('head');
    expect(useViewerStore.getState().selectedModelId).toBe('head');
  });
});
