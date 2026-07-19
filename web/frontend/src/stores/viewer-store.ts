import { create } from 'zustand';

export type ViewerModelId = 'little-duck' | 'head' | 'nest';

type ViewerState = {
  selectedModelId: ViewerModelId;
  setSelectedModelId: (id: ViewerModelId) => void;
};

export const DEFAULT_VIEWER_MODEL_ID: ViewerModelId = 'little-duck';

export const useViewerStore = create<ViewerState>((set) => ({
  selectedModelId: DEFAULT_VIEWER_MODEL_ID,
  setSelectedModelId: (selectedModelId) => set({ selectedModelId }),
}));
