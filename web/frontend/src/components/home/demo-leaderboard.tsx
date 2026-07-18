import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
      <table className="w-full min-w-[22rem] text-left text-xs sm:text-sm">
        <thead>
          <tr className="label-chrome text-ink-soft border-b border-chrome-indigo/40">
            <th className="px-2 py-2">#</th>
            <th className="px-2 py-2">Player</th>
            <th className="px-2 py-2">
              {metric === 'time' ? 'Clear time' : 'Drops'}
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr
              key={`${entry.playerAlias}-${metric}`}
              className="animate-row border-b border-chrome-indigo/25 last:border-0"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <td className="px-2 py-2.5 font-bold text-ink">{index + 1}</td>
              <td className="px-2 py-2.5 font-semibold text-ink-soft">
                {entry.playerAlias}
              </td>
              <td className="px-2 py-2.5 font-bold tabular-nums text-ink">
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
    <section
      id="leaderboard"
      className="scroll-mt-24 border-b border-chrome-indigo px-3 py-6 sm:px-5 sm:py-8"
    >
      <Card>
        <CardHeader>
          <div className="section-label-bar flex flex-wrap items-center gap-3">
            <CardTitle>Leaderboard</CardTitle>
            <Badge>Demo data</Badge>
          </div>
          <CardDescription>
            Whole-game clear times and drop totals (all levels). Placeholder
            scores for now — Phase 2 will connect the live upload API without
            changing this layout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="time">
            <TabsList>
              <TabsTrigger value="time">Clear time</TabsTrigger>
              <TabsTrigger value="drops">Fewest drops</TabsTrigger>
            </TabsList>
            <TabsContent value="time" className="mt-4">
              <LeaderboardTable entries={byTime} metric="time" />
            </TabsContent>
            <TabsContent value="drops" className="mt-4">
              <LeaderboardTable entries={byDrops} metric="drops" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
}
