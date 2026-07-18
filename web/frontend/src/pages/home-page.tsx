import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export function HomePage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col gap-6 p-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        My Hand Is A Goose
      </h1>
      <p className="text-muted-foreground">
        Frontend scaffold is ready. Landing content comes in a later task.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/levels">Levels</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/feedback">Feedback</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/polls">Polls</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/press">Press</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/viewer">Viewer</Link>
        </Button>
      </div>
    </main>
  );
}
