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
        className="flex items-center justify-center w-full"
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
          className="relative w-[80%] max-w-[280px] aspect-[3/2] mx-auto bg-transparent"
          imgClassName="w-full h-full object-contain object-center bg-transparent rounded-lg"
          skeletonClassName="w-full h-full rounded-lg"
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
