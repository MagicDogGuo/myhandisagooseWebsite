import { Link } from 'react-router-dom';

import { META_STORE_URL } from '@/lib/store-links';

export function SiteFooter() {
  return (
    <footer className="border-border/60 mt-auto border-t">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-display text-foreground">My Hand Is A Goose</span>
          {' — '}a VR goose comedy on Meta Quest.
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href={META_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground underline-offset-4 hover:underline"
          >
            Meta Store
          </a>
          <Link
            to="/press"
            className="hover:text-foreground underline-offset-4 hover:underline"
          >
            Press Kit
          </Link>
          <a
            href="mailto:hello@myhandisagoose.example"
            className="hover:text-foreground underline-offset-4 hover:underline"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
