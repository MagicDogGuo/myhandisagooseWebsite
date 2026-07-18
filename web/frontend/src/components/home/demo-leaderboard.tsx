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
      <table className="w-full min-w-[28rem] text-left text-sm">
        <thead>
          <tr className="text-muted-foreground border-b">
            <th className="px-2 py-2 font-medium">#</th>
            <th className="px-2 py-2 font-medium">Player</th>
            <th className="px-2 py-2 font-medium">Level</th>
            <th className="px-2 py-2 font-medium">
              {metric === 'time' ? 'Clear time' : 'Drops'}
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr
              key={`${entry.playerAlias}-${entry.levelId}-${metric}`}
              className="animate-row border-border/60 border-b last:border-0"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <td className="px-2 py-3 font-medium">{index + 1}</td>
              <td className="px-2 py-3">{entry.playerAlias}</td>
              <td className="text-muted-foreground px-2 py-3">
                Lv.{entry.levelId}
              </td>
              <td className="px-2 py-3 tabular-nums">
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
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20"
    >
      <Card className="border-border/70 bg-card/90 shadow-none">
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="font-display text-2xl sm:text-3xl">
              Leaderboard
            </CardTitle>
            <Badge className="border-brand-gold/40 bg-brand-gold/20 text-brand-ink">
              Demo data
            </Badge>
          </div>
          <CardDescription>
            Clear times and drop counts use placeholder scores. Phase 2 will
            connect the live upload API without changing this layout.
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
