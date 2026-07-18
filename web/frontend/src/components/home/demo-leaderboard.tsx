import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DEMO_LEADERBOARD } from '@/data/demo-leaderboard';
import { formatClearTime } from '@/lib/format-time';
import type { LeaderboardEntry } from '@/types/api';

function byClearTime(entries: LeaderboardEntry[]) {
  return [...entries].sort((a, b) => a.clearTimeMs - b.clearTimeMs);
}

function byDropCount(entries: LeaderboardEntry[]) {
  return [...entries].sort((a, b) => {
    if (a.dropCount !== b.dropCount) {
      return a.dropCount - b.dropCount;
    }
    return a.clearTimeMs - b.clearTimeMs;
  });
}

function LeaderboardTable({
  entries,
  metric,
}: {
  entries: LeaderboardEntry[];
  metric: 'time' | 'drops';
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[28rem] text-left text-base">
        <thead>
          <tr className="text-on-dark-mute border-hairline-dark border-b">
            <th className="px-2 py-3 font-medium">#</th>
            <th className="px-2 py-3 font-medium">Player</th>
            <th className="px-2 py-3 font-medium">Level</th>
            <th className="px-2 py-3 font-medium">
              {metric === 'time' ? 'Clear time' : 'Drops'}
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr
              key={`${entry.playerAlias}-${entry.levelId}-${metric}`}
              className="animate-row border-hairline-dark border-b last:border-0"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <td className="text-on-dark px-2 py-3 font-medium">{index + 1}</td>
              <td className="text-on-dark px-2 py-3">{entry.playerAlias}</td>
              <td className="text-body-dark px-2 py-3">Lv.{entry.levelId}</td>
              <td className="text-on-dark px-2 py-3 tabular-nums">
                {metric === 'time'
                  ? formatClearTime(entry.clearTimeMs)
                  : entry.dropCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DemoLeaderboard() {
  const byTime = byClearTime(DEMO_LEADERBOARD);
  const byDrops = byDropCount(DEMO_LEADERBOARD);

  return (
    <section id="leaderboard" className="section-band-dark scroll-mt-12 text-on-dark">
      <div className="band-inner band-pad">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-[28px] tracking-[0.1px] sm:text-[35px] lg:text-[44px]">
            Leaderboard
          </h2>
          <Badge>Demo data</Badge>
        </div>
        <p className="text-body-dark mt-4 max-w-xl text-lg leading-normal">
          Clear times and drop counts use placeholder scores. Phase 2 will
          connect the live upload API without changing this layout.
        </p>

        <div className="bg-surface-dark-card mt-10 rounded-md p-6 md:p-8">
          <Tabs defaultValue="time">
            <TabsList>
              <TabsTrigger
                value="time"
                className="bg-white/10 text-on-dark data-[state=active]:bg-canvas-light data-[state=active]:text-ink"
              >
                Clear time
              </TabsTrigger>
              <TabsTrigger
                value="drops"
                className="bg-white/10 text-on-dark data-[state=active]:bg-canvas-light data-[state=active]:text-ink"
              >
                Fewest drops
              </TabsTrigger>
            </TabsList>
            <TabsContent value="time" className="mt-6">
              <LeaderboardTable entries={byTime} metric="time" />
            </TabsContent>
            <TabsContent value="drops" className="mt-6">
              <LeaderboardTable entries={byDrops} metric="drops" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
