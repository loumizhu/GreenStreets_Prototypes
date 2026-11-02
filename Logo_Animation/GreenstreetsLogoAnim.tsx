'use client';
/**
 * React / Next.js wrapper for greenstreets-logo-anim.js.
 * npm i gsap@^3.13   (DrawSVGPlugin + MotionPathPlugin ship in the free package since 3.13)
 * Copy greenstreets-logo-anim.js next to this file.
 *
 *   <GreenstreetsLogoAnim size={200} />                 // login screen
 *   <GreenstreetsLogoAnim size={64} background="rounded" speed={2} />
 */
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

type Background = 'none' | 'square' | 'rounded' | 'circle';

export interface GreenstreetsLogoAnimProps {
  /** Rendered width in px (or any CSS length). The logo is square. Default 200. */
  size?: number | string;
  /** Navy brand tile behind the mark. Default 'none' (transparent). */
  background?: Background;
  /** Seconds before the intro starts. Default 0.15. */
  delay?: number;
  /** Playback rate: 1.5 ≈ 2.7 s, 1 ≈ 4 s. Default 1.5. */
  speed?: number;
  loop?: boolean;
  /** Show the final logo instantly when the OS asks for reduced motion. Default true. */
  respectReducedMotion?: boolean;
  onComplete?: () => void;
  className?: string;
}

interface GSLogoAnimInstance { replay(): void; destroy(): void }

export default function GreenstreetsLogoAnim({
  size = 200,
  background = 'none',
  delay = 0.15,
  speed = 1.5,
  loop = false,
  respectReducedMotion = true,
  onComplete,
  className,
}: GreenstreetsLogoAnimProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let inst: GSLogoAnimInstance | undefined;
    let cancelled = false;
    const w = window as any;
    w.gsap = gsap;
    w.DrawSVGPlugin = DrawSVGPlugin;
    w.MotionPathPlugin = MotionPathPlugin;

    import('./greenstreets-logo-anim.js').then(() => {
      if (cancelled || !ref.current) return;
      inst = w.GSLogoAnim.mount(ref.current, { background, delay, speed, loop, respectReducedMotion, onComplete });
    });
    return () => { cancelled = true; inst?.destroy(); };
  }, [background, delay, speed, loop, respectReducedMotion]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={ref} className={className} style={{ width: size, aspectRatio: '1 / 1' }} />;
}
