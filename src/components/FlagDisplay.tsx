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
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        className="flex items-center justify-center min-h-[32dvh] sm:min-h-[36dvh] lg:min-h-[38dvh] max-h-[42dvh] py-3 w-full"
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
          className="w-full flex justify-center"
          imgClassName="w-[240px] sm:w-[280px] lg:w-[300px] max-w-full h-auto rounded-2xl shadow-2xl object-contain"
          skeletonClassName="w-[240px] sm:w-[280px] lg:w-[300px] max-w-full min-h-[140px] sm:min-h-[160px] lg:min-h-[170px] mx-auto rounded-2xl"
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
