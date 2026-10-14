import { useState, useEffect, useRef } from 'react';

export type ScrollDirection = 'up' | 'down' | 'idle';

export interface ScrollState {
  scrollY: number;
  previousScrollY: number;
  scrollDirection: ScrollDirection;
  isNearTop: boolean;
  isNearBottom: boolean;
  isScrolling: boolean;
  activeSection: string;
}

/**
 * High-performance, requestAnimationFrame-synchronized scroll state observer.
 * Utilizes a 12px dead-zone threshold to prevent micro-jitter, tracks directional
 * velocity and boundaries, and employs IntersectionObserver for zero-cost section awareness.
 */
export function useScrollDirection(threshold: number = 12): ScrollState {
  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollY: 0,
    previousScrollY: 0,
    scrollDirection: 'idle',
    isNearTop: true,
    isNearBottom: false,
    isScrolling: false,
    activeSection: 'hero',
  });

  const lastScrollY = useRef(0);
  const rafId = useRef<number | null>(null);
  const scrollStopTimer = useRef<number | null>(null);

  useEffect(() => {
    // Initial position capture
    if (typeof window !== 'undefined') {
      lastScrollY.current = window.scrollY;
      setScrollState((prev) => ({
        ...prev,
        scrollY: window.scrollY,
        previousScrollY: window.scrollY,
        isNearTop: window.scrollY < 100,
      }));
    }

    const handleScroll = () => {
      if (rafId.current !== null) return;

      rafId.current = requestAnimationFrame(() => {
        const currentY = Math.max(0, window.scrollY);
        const prevY = lastScrollY.current;
        const diff = currentY - prevY;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const isNearTop = currentY < 100;
        const isNearBottom = totalHeight > 0 && currentY >= totalHeight - 100;

        let direction: ScrollDirection = 'idle';
        if (Math.abs(diff) >= threshold) {
          direction = diff > 0 ? 'down' : 'up';
          lastScrollY.current = currentY;
        }

        setScrollState((prev) => {
          const finalDirection = direction !== 'idle' ? direction : prev.scrollDirection;
          return {
            scrollY: currentY,
            previousScrollY: prevY,
            scrollDirection: finalDirection,
            isNearTop,
            isNearBottom,
            isScrolling: true,
            activeSection: prev.activeSection,
          };
        });

        // Debounce idle state detection after scroll settles
        if (scrollStopTimer.current) {
          clearTimeout(scrollStopTimer.current);
        }
        scrollStopTimer.current = window.setTimeout(() => {
          setScrollState((prev) => ({
            ...prev,
            isScrolling: false,
          }));
        }, 160);

        rafId.current = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (scrollStopTimer.current) clearTimeout(scrollStopTimer.current);
    };
  }, [threshold]);

  // Zero-cost IntersectionObserver for tracking active section landmarks
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-section]');
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const secName = entry.target.getAttribute('data-section');
            if (secName) {
              setScrollState((prev) => ({
                ...prev,
                activeSection: secName,
              }));
            }
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '-70px 0px -40% 0px',
      }
    );

    sections.forEach((sec) => observer.observe(sec));

    return () => {
      observer.disconnect();
    };
  }, []);

  return scrollState;
}
