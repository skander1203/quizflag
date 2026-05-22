import { motion } from 'framer-motion';
import { FlagImage } from './FlagImage';

interface FlagDisplayProps {
  isoCode: string;
  flagEmoji: string;
  countryName?: string;
  variant?: 'quiz' | 'compact';
}

export function FlagDisplay({
  isoCode,
  flagEmoji,
  countryName,
  variant = 'quiz',
}: FlagDisplayProps) {
  if (variant === 'quiz') {
    return (
      <motion.div
        key={isoCode}
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-center overflow-hidden w-full h-[32dvh] sm:h-[36dvh] lg:h-[38dvh]"
        role="img"
        aria-label={
          countryName ? `Drapeau de ${countryName}` : 'Drapeau à identifier'
        }
      >
        <FlagImage
          isoCode={isoCode}
          flagEmoji={flagEmoji}
          alt={countryName ? `Drapeau ${countryName}` : 'Drapeau'}
          cdnWidth={320}
          loading="eager"
          className="w-[240px] sm:w-[280px] lg:w-[300px] h-[140px] sm:h-[160px] lg:h-[170px] flex items-center justify-center"
          imgClassName="w-full h-full rounded-2xl shadow-2xl object-contain object-center"
          skeletonClassName="w-full h-full rounded-2xl"
        />
      </motion.div>
    );
  }

  return (
    <div className="shrink-0 w-14 h-10 rounded-lg overflow-hidden bg-white/90 shadow-md">
      <FlagImage
        isoCode={isoCode}
        flagEmoji={flagEmoji}
        alt=""
        cdnWidth={160}
        loading="eager"
        className="w-full h-full"
        imgClassName="w-full h-full object-cover"
        skeletonClassName="w-full h-full min-h-[40px]"
      />
    </div>
  );
}
