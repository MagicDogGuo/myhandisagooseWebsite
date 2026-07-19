import { VIEWER_MODELS } from '@/components/viewer-3d/viewer-models';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  useViewerStore,
  type ViewerModelId,
} from '@/stores/viewer-store';

export function ModelPicker() {
  const selectedModelId = useViewerStore((s) => s.selectedModelId);
  const setSelectedModelId = useViewerStore((s) => s.setSelectedModelId);

  return (
    <div
      role="radiogroup"
      aria-label="3D model"
      className="flex flex-wrap gap-2"
    >
      {VIEWER_MODELS.map((model) => {
        const selected = model.id === selectedModelId;
        return (
          <Button
            key={model.id}
            type="button"
            role="radio"
            aria-checked={selected}
            variant={selected ? 'default' : 'secondary'}
            size="sm"
            className={cn(selected && 'ring-2 ring-signal ring-offset-2 ring-offset-canvas')}
            onClick={() => {
              setSelectedModelId(model.id as ViewerModelId);
            }}
          >
            {model.label}
          </Button>
        );
      })}
    </div>
  );
}
