import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { avatarGradientClass } from '../utils/avatarColor';

type PlayerAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isGuest?: boolean;
  className?: string;
};

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-xl',
} as const;

function LetterFallback({
  name,
  sizeClass,
  className,
}: {
  name: string;
  sizeClass: string;
  className: string;
}) {
  const initial = name.charAt(0).toUpperCase() || '?';

  return (
    <span
      className={`${sizeClass} rounded-full bg-gradient-to-br ${avatarGradientClass(name)} flex items-center justify-center font-extrabold text-white shrink-0 ${className}`}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}

export function PlayerAvatar({
  name,
  avatarUrl,
  size = 'sm',
  isGuest = false,
  className = '',
}: PlayerAvatarProps) {
  const sizeClass = SIZE_CLASSES[size];
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt=""
        onError={() => {
          console.log('[avatar] img load failed', { name, avatarUrl });
          setImgError(true);
        }}
        className={`${sizeClass} rounded-full object-cover shrink-0 border border-white/20 ${className}`}
      />
    );
  }

  if (isGuest) {
    return (
      <span
        className={`${sizeClass} rounded-full bg-white/15 border border-white/25 flex items-center justify-center shrink-0 ${className}`}
        aria-hidden="true"
      >
        <User className="w-[55%] h-[55%] text-white/60" strokeWidth={2.5} />
      </span>
    );
  }

  return <LetterFallback name={name} sizeClass={sizeClass} className={className} />;
}
