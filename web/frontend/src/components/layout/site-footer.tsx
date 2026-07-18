import { Link } from 'react-router-dom';

import { META_STORE_URL } from '@/lib/store-links';

export function SiteFooter() {
  return (
    <footer className="bg-primary text-on-dark mt-auto">
      <div className="band-inner flex flex-col gap-8 px-6 py-12 md:px-12">
        <p className="font-display text-2xl tracking-[0.1px] sm:text-[28px]">
          My Hand Is A Goose
        </p>
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <p className="max-w-md text-sm leading-normal text-white/80">
            A VR goose comedy on Meta Quest — steal bread, scoop goslings, try
            not to drop anything in the pond.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <a
              href={META_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              Meta Store
            </a>
            <Link to="/press" className="hover:text-white">
              Press Kit
            </Link>
            <Link to="/feedback" className="hover:text-white">
              Feedback
            </Link>
            <a
              href="mailto:hello@myhandisagoose.example"
              className="hover:text-white"
            >
              Contact
            </a>
          </div>
        </div>
        <p className="border-t border-white/20 pt-6 text-xs text-white/70">
          © {new Date().getFullYear()} My Hand Is A Goose. Not affiliated with
          Sony Interactive Entertainment.
        </p>
      </div>
    </footer>
  );
}
