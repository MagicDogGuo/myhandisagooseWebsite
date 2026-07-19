import { Center, useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import { Box3, Vector3 } from 'three';

import { VIEWER_MODELS } from '@/components/viewer-3d/viewer-models';

type GlbModelProps = {
  glbPath: string;
  /** Uniform max axis length after normalize. */
  targetSize?: number;
};

export function GlbModel({ glbPath, targetSize = 1.2 }: GlbModelProps) {
  const { scene } = useGLTF(glbPath);

  const prepared = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((obj) => {
      if ('isMesh' in obj && obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    const box = new Box3().setFromObject(root);
    const size = new Vector3();
    box.getSize(size);
    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    root.scale.setScalar(targetSize / maxAxis);
    return root;
  }, [scene, targetSize]);

  return (
    <Center>
      <primitive object={prepared} />
    </Center>
  );
}

for (const model of VIEWER_MODELS) {
  useGLTF.preload(model.glbPath);
}
