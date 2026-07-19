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
 */
export const VIEWER_MODELS: readonly ViewerModelDef[] = [
  {
    id: 'little-goose',
    label: 'Little goose',
    description: 'Gosling prop',
    glbPath: '/3D/littleGoose.glb',
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
