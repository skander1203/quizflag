import { FlagImage } from './FlagImage';

/** ISO codes verified on flagcdn.com (w160). */
const PARADE_ISO: { iso: string; emoji: string }[] = [
  { iso: 'fr', emoji: '🇫🇷' },
  { iso: 'jp', emoji: '🇯🇵' },
  { iso: 'br', emoji: '🇧🇷' },
  { iso: 'us', emoji: '🇺🇸' },
  { iso: 'in', emoji: '🇮🇳' },
  { iso: 'de', emoji: '🇩🇪' },
  { iso: 'it', emoji: '🇮🇹' },
  { iso: 'es', emoji: '🇪🇸' },
  { iso: 'ca', emoji: '🇨🇦' },
  { iso: 'au', emoji: '🇦🇺' },
  { iso: 'mx', emoji: '🇲🇽' },
  { iso: 'kr', emoji: '🇰🇷' },
  { iso: 'ar', emoji: '🇦🇷' },
  { iso: 'za', emoji: '🇿🇦' },
  { iso: 'tr', emoji: '🇹🇷' },
  { iso: 'nl', emoji: '🇳🇱' },
  { iso: 'se', emoji: '🇸🇪' },
  { iso: 'no', emoji: '🇳🇴' },
  { iso: 'ng', emoji: '🇳🇬' },
  { iso: 'eg', emoji: '🇪🇬' },
];

interface FlagParadeProps {
  compact?: boolean;
  /**
   * Tailwind class(es) to offset the parade outside the parent's padding,
   * e.g. "-mx-4 sm:-mx-5" when the parent uses px-4 sm:px-5.
   */
  bleedClass?: string;
}

export function FlagParade({ compact = false, bleedClass = '' }: FlagParadeProps) {
  const base = compact ? PARADE_ISO.slice(0, 10) : PARADE_ISO;
  const row = [...base, ...base, ...base];

  return (
    <div
      className={`overflow-hidden py-3 select-none ${bleedClass}`}
      aria-hidden="true"
    >
      <div
        className={compact ? 'flex animate-marquee-fast' : 'flex animate-marquee'}
      >
        {row.map((item, i) => (
          <div
            key={`${item.iso}-${i}`}
            className="flag-parade-slot shrink-0 mr-3 sm:mr-4 w-14 h-10 sm:w-16 sm:h-11 rounded-lg overflow-hidden"
          >
            <FlagImage
              isoCode={item.iso}
              flagEmoji={item.emoji}
              alt=""
              cdnWidth={160}
              loading="eager"
              hideOnError
              className="w-full h-full bg-[#1a0533]"
              imgClassName="w-full h-full object-cover rounded-lg shadow-none outline-none border-0"
              skeletonClassName="w-full h-full min-h-[40px]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
