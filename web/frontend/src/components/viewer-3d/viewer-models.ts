import type { ViewerModelId } from '@/stores/viewer-store';

export type ViewerModelDef = {
  id: ViewerModelId;
  label: string;
  description: string;
  /** Static asset under public/ (served as /3D/*.glb). */
  glbPath: string;
};

/**
 * Models currently shipped under `public/3D/`.
 * More props (toast, baguette, hook, brush…) can be added when Unity exports land.
 */
export const VIEWER_MODELS: readonly ViewerModelDef[] = [
  {
    id: 'little-duck',
    label: 'Little duck',
    description: 'Gosling / duck prop',
    glbPath: '/3D/littelDuck.glb',
  },
  {
    id: 'head',
    label: 'Goose head',
    description: 'Goose head mesh',
    glbPath: '/3D/head.glb',
  },
  {
    id: 'nest',
    label: 'Nest',
    description: 'Goose nest',
    glbPath: '/3D/nest.glb',
  },
] as const;

export function getViewerModel(id: ViewerModelId): ViewerModelDef {
  const model = VIEWER_MODELS.find((entry) => entry.id === id);
  if (!model) {
    throw new Error(`Unknown viewer model: ${id}`);
  }
  return model;
}
