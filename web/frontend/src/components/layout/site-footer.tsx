import { Link } from 'react-router-dom';

import { META_STORE_URL } from '@/lib/store-links';

export function SiteFooter() {
  return (
    <footer className="mt-auto">
      <div className="halftone-carbon chamfer mx-auto max-w-[85rem] border border-black/30">
        <div className="flex flex-col gap-3 px-4 py-5 text-sky sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="font-pixel text-micro-chrome leading-tight tracking-wide">
            © My Hand Is A Goose — Meta Quest VR comedy.
          </p>
          <div className="label-chrome flex flex-wrap gap-4 text-amber">
            <a
              href={META_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-signal"
            >
              Meta Store
            </a>
            <Link to="/press" className="hover:text-signal">
              Press Kit
            </Link>
            <a
              href="mailto:hello@myhandisagoose.example"
              className="hover:text-signal"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
