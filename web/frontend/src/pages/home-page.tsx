import { DemoLeaderboard } from '@/components/home/demo-leaderboard';
import { HomeFeatures } from '@/components/home/home-features';
import { HomeHero } from '@/components/home/home-hero';
import { HomeLevelSummaries } from '@/components/home/home-level-summaries';

export function HomePage() {
  return (
    <main>
      <HomeHero />
      <HomeFeatures />
      <DemoLeaderboard />
      <HomeLevelSummaries />
    </main>
  );
}
