import { ModelEntry } from '@/components/viewer-3d/model-entry';
import { VIEWER_MODELS } from '@/components/viewer-3d/viewer-models';

export function ViewerGallery() {
  return (
    <ul className="grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {VIEWER_MODELS.map((model, index) => (
        <li key={model.id}>
          <ModelEntry model={model} index={index} />
        </li>
      ))}
    </ul>
  );
}
