import { create } from 'zustand';

export type ViewerModelId = 'little-goose' | 'head' | 'nest';

type ViewerState = {
  selectedModelId: ViewerModelId;
  setSelectedModelId: (id: ViewerModelId) => void;
};

/** Middle slot — frames the full lineup on first load. */
export const DEFAULT_VIEWER_MODEL_ID: ViewerModelId = 'head';

export const useViewerStore = create<ViewerState>((set) => ({
  selectedModelId: DEFAULT_VIEWER_MODEL_ID,
  setSelectedModelId: (selectedModelId) => set({ selectedModelId }),
}));
