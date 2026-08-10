import { useState, useCallback, useEffect } from 'react';

export type AvatarImageStatus = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Tracks image load state so consumers can fall back to initials/icon
 * cleanly. Native <img onError> alone isn't enough — we need a distinct
 * "loading" state to avoid flashing broken-image icons before the
 * fallback renders, and to reset correctly if `src` changes.
 */
export function useAvatarImage(src?: string) {
  const [status, setStatus] = useState<AvatarImageStatus>(src ? 'loading' : 'idle');

  useEffect(() => {
    if (!src) {
      setStatus('idle');
      return;
    }
    setStatus('loading');
    const img = new Image();
    img.src = src;
    img.onload = () => setStatus('loaded');
    img.onerror = () => setStatus('error');
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return status;
}

export interface UseAvatarOptions {
  src?: string;
  name?: string;
}

export function getInitials(name?: string): string {
  if (!name) return '';

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return '';

  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }

  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

export function useAvatar({ src, name }: UseAvatarOptions) {
  const imageStatus = useAvatarImage(src);
  const initials = getInitials(name);
  const showImage = imageStatus === 'loaded';
  const showInitials = !showImage && initials.length > 0;
  const showIconFallback = !showImage && !showInitials;

  return { imageStatus, initials, showImage, showInitials, showIconFallback };
}

export type UseAvatarReturn = ReturnType<typeof useAvatar>;
