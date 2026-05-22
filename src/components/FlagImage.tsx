import { useState, useEffect, useRef } from 'react';
import { flagImageUrl, type FlagCdnWidth } from '../utils/flags';

interface FlagImageProps {
  isoCode: string;
  flagEmoji: string;
  alt?: string;
  cdnWidth?: FlagCdnWidth;
  className?: string;
  imgClassName?: string;
  loading?: 'eager' | 'lazy';
  skeletonClassName?: string;
  /** Carousel slots: hide broken image (opacity 0), no emoji fallback */
  hideOnError?: boolean;
}

export function FlagImage({
  isoCode,
  flagEmoji,
  alt = '',
  cdnWidth = 320,
  className = '',
  imgClassName = '',
  loading = 'eager',
  skeletonClassName = '',
  hideOnError = false,
}: FlagImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const src = flagImageUrl(isoCode, cdnWidth);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [isoCode, cdnWidth]);

  // Handle images already cached before React attaches onLoad (common on refresh).
  useEffect(() => {
    const img = imgRef.current;
    if (!img || failed) return;
    if (img.complete) {
      if (img.naturalWidth > 0) setLoaded(true);
      else setFailed(true);
    }
  }, [src, failed]);

  if (failed && !hideOnError) {
    return (
      <span
        className={`flex items-center justify-center ${className}`}
        role="img"
        aria-label={alt || 'Drapeau'}
      >
        <span className="text-6xl sm:text-7xl leading-none select-none" aria-hidden="true">
          {flagEmoji}
        </span>
      </span>
    );
  }

  if (failed && hideOnError) {
    return <div className={className} aria-hidden="true" />;
  }

  return (
    <div className={`relative ${className}`}>
      {!loaded && (
        <div
          className={`${hideOnError ? 'flag-shimmer-purple' : 'flag-shimmer'} absolute inset-0 rounded-xl ${skeletonClassName}`}
          aria-hidden="true"
        />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`${imgClassName} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        loading={loading}
        decoding="async"
      />
      <span className="sr-only" aria-hidden="true">
        {flagEmoji}
      </span>
    </div>
  );
}
