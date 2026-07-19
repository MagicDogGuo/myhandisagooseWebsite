import { QRCodeSVG } from 'qrcode.react';

import { META_STORE_URL } from '@/lib/store-links';

export const PRESS_CONTACT_EMAIL = 'samkuo8310@gmail.com';

type PressQrPanelProps = {
  pressPageUrl: string;
};

export function PressQrPanel({ pressPageUrl }: PressQrPanelProps) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <figure className="bevel-plate-raised flex flex-col items-center gap-3 rounded-sm p-4 text-center">
        <QRCodeSVG
          value={META_STORE_URL}
          size={128}
          bgColor="#E8EEF8"
          fgColor="#1A1A1A"
          level="M"
          title="QR code linking to Meta Store"
        />
        <figcaption>
          <p className="label-chrome text-ink-soft">Meta Store</p>
          <a
            href={META_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-signal mt-1 block text-xs break-all hover:underline"
          >
            {META_STORE_URL}
          </a>
        </figcaption>
      </figure>
      <figure className="bevel-plate-raised flex flex-col items-center gap-3 rounded-sm p-4 text-center">
        <QRCodeSVG
          value={pressPageUrl}
          size={128}
          bgColor="#E8EEF8"
          fgColor="#1A1A1A"
          level="M"
          title="QR code linking to this Press Kit page"
        />
        <figcaption>
          <p className="label-chrome text-ink-soft">This Press Kit</p>
          <p className="text-ink-soft mt-1 text-xs break-all">{pressPageUrl}</p>
        </figcaption>
      </figure>
    </div>
  );
}
