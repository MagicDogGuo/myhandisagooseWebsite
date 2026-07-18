import { DemoLeaderboard } from '@/components/home/demo-leaderboard';
import { HomeFeatures } from '@/components/home/home-features';
import { HomeHero } from '@/components/home/home-hero';
import { HomeLevelSummaries } from '@/components/home/home-level-summaries';
import { ChromeShell } from '@/components/layout/chrome-shell';

export function HomePage() {
  return (
    <main>
      <ChromeShell>
        <HomeHero />
        <HomeFeatures />
        <DemoLeaderboard />
        <HomeLevelSummaries />
      </ChromeShell>
    </main>
  );
}
