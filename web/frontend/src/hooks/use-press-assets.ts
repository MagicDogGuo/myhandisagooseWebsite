import { useQuery } from '@tanstack/react-query';

import { fetchPressAssets } from '@/api/press';

export function usePressAssets() {
  return useQuery({
    queryKey: ['press', 'assets'],
    queryFn: fetchPressAssets,
  });
}
