import { Outlet } from 'react-router-dom';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';

export function SiteLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-canvas">
      <SiteHeader />
      <div className="flex-1">
        <Outlet />
      </div>
      <div className="px-2 pb-4 sm:px-4">
        <SiteFooter />
      </div>
    </div>
  );
}
