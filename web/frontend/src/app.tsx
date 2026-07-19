import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { ErrorBoundary, ErrorFallback } from '@/components/error-boundary';
import { SiteLayout } from '@/components/layout/site-layout';
import { PageSkeleton } from '@/components/page-skeleton';

const HomePage = lazy(() =>
  import('@/pages/home-page').then((m) => ({ default: m.HomePage })),
);
const LevelsPage = lazy(() =>
  import('@/pages/levels-page').then((m) => ({ default: m.LevelsPage })),
);
const LevelDetailPage = lazy(() =>
  import('@/pages/level-detail-page').then((m) => ({
    default: m.LevelDetailPage,
  })),
);
const FeedbackPage = lazy(() =>
  import('@/pages/feedback-page').then((m) => ({ default: m.FeedbackPage })),
);
const PollsPage = lazy(() =>
  import('@/pages/polls-page').then((m) => ({ default: m.PollsPage })),
);
const PressKitPage = lazy(() =>
  import('@/pages/press-kit-page').then((m) => ({ default: m.PressKitPage })),
);
const Viewer3dPage = lazy(() =>
  import('@/pages/viewer-3d-page').then((m) => ({ default: m.Viewer3dPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/not-found-page').then((m) => ({ default: m.NotFoundPage })),
);

export function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary fallback={<ErrorFallback />}>
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              <Route element={<SiteLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/levels" element={<LevelsPage />} />
                <Route path="/levels/:levelId" element={<LevelDetailPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/polls" element={<PollsPage />} />
                <Route path="/press" element={<PressKitPage />} />
                <Route path="/viewer" element={<Viewer3dPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
