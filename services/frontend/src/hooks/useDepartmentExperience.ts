/**
 * useDepartmentExperience Hook
 * ============================
 * Manages the prototype-matched department animation lifecycle.
 *
 * The CSS in index.css relies on a specific sequencing:
 *   1. body[data-a="X"] selects the department's style rules
 *   2. .sl (hero slide) starts in its department's hidden state
 *   3. .sl.on triggers the entrance animation (clip-path, blur, skew, etc.)
 *   4. .ly / .ly.on controls lookbook reveals
 *   5. .rv / .rv.in controls scroll-reveal sections
 *
 * When switching departments, we must:
 *   1. Remove .on from all animated sections (triggering exit)
 *   2. Wait a frame for CSS to register the "hidden" state
 *   3. Swap the body data-a attribute
 *   4. After entranceDelay, re-add .on to trigger entrance animations
 *
 * This hook reads activeDepartment from the body dataset and provides
 * the current department config plus the .on state for the hero.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DEPARTMENT_CONFIGS,
  BASELINE_HERO,
  type DepartmentConfig,
  type DepartmentSlug,
} from '../data/departmentConfig';

interface DepartmentExperience {
  /** Current active department slug, or null for baseline */
  activeDept: string | null;
  /** Whether the hero entrance animation .on class should be applied */
  heroRevealed: boolean;
  /** Whether lookbook .on class should be applied */
  lookbookRevealed: boolean;
  /** Current department config (or null for baseline) */
  config: DepartmentConfig | null;
  /** Current hero content — either department-specific or baseline */
  hero: {
    title: string;
    titleItalic: string;
    subtitle: string;
    tag: string;
    chipLabel: string;
    cardTitle: string;
    cardSubtitle: string;
    image: string;
    glowGradient: string;
    trustBarStat: string;
  };
  /** CSS class name for department-specific hero image animation */
  heroAnimationClass: string;
  /** Whether we're in transition between departments */
  isTransitioning: boolean;
}

export function useDepartmentExperience(): DepartmentExperience {
  const [activeDept, setActiveDept] = useState<string | null>(null);
  const [heroRevealed, setHeroRevealed] = useState(true); // baseline starts revealed
  const [lookbookRevealed, setLookbookRevealed] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevDeptRef = useRef<string | null>(null);
  const entranceTimerRef = useRef<number | null>(null);
  const lookbookTimerRef = useRef<number | null>(null);

  // Observe body[data-a] changes from MainLayout
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const current = document.body.dataset.a || null;
      setActiveDept(current);
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-a'],
    });

    // Initial read
    setActiveDept(document.body.dataset.a || null);

    return () => observer.disconnect();
  }, []);

  // Handle department transitions with animation sequencing
  useEffect(() => {
    const prev = prevDeptRef.current;
    const next = activeDept;

    // Clean up any pending timers
    if (entranceTimerRef.current) {
      clearTimeout(entranceTimerRef.current);
      entranceTimerRef.current = null;
    }
    if (lookbookTimerRef.current) {
      clearTimeout(lookbookTimerRef.current);
      lookbookTimerRef.current = null;
    }

    if (prev === next) return;

    if (next === null) {
      // Deselecting department: remove .on, then after transition restore baseline
      setIsTransitioning(true);
      setHeroRevealed(false);
      setLookbookRevealed(false);

      entranceTimerRef.current = window.setTimeout(() => {
        setHeroRevealed(true);
        setIsTransitioning(false);
        entranceTimerRef.current = null;
      }, 200);

      lookbookTimerRef.current = window.setTimeout(() => {
        setLookbookRevealed(true);
        lookbookTimerRef.current = null;
      }, 350);
    } else if (prev === null) {
      // Activating department from baseline
      const config = DEPARTMENT_CONFIGS[next];
      const delay = config?.entranceDelay ?? 80;

      setIsTransitioning(true);
      setHeroRevealed(false);
      setLookbookRevealed(false);

      // Allow one frame for CSS to register the hidden state with new data-a
      entranceTimerRef.current = window.setTimeout(() => {
        setHeroRevealed(true);
        setIsTransitioning(false);
        entranceTimerRef.current = null;
      }, delay);

      lookbookTimerRef.current = window.setTimeout(() => {
        setLookbookRevealed(true);
        lookbookTimerRef.current = null;
      }, delay + 200);
    } else {
      // Switching between departments
      const config = DEPARTMENT_CONFIGS[next];
      const delay = config?.entranceDelay ?? 80;

      setIsTransitioning(true);
      setHeroRevealed(false);
      setLookbookRevealed(false);

      // Two-phase: exit old → enter new
      entranceTimerRef.current = window.setTimeout(() => {
        setHeroRevealed(true);
        setIsTransitioning(false);
        entranceTimerRef.current = null;
      }, delay + 60); // slightly longer to allow exit

      lookbookTimerRef.current = window.setTimeout(() => {
        setLookbookRevealed(true);
        lookbookTimerRef.current = null;
      }, delay + 300);
    }

    prevDeptRef.current = next;

    return () => {
      if (entranceTimerRef.current) clearTimeout(entranceTimerRef.current);
      if (lookbookTimerRef.current) clearTimeout(lookbookTimerRef.current);
    };
  }, [activeDept]);

  const config = activeDept ? DEPARTMENT_CONFIGS[activeDept] ?? null : null;

  const hero = config
    ? {
        title: config.heroTitle,
        titleItalic: config.heroTitleItalic,
        subtitle: config.heroSubtitle,
        tag: config.heroTag,
        chipLabel: config.heroChipLabel,
        cardTitle: config.heroCardTitle,
        cardSubtitle: config.heroCardSubtitle,
        image: config.heroImage,
        glowGradient: config.glowGradient,
        trustBarStat: config.trustBarStat,
      }
    : {
        title: BASELINE_HERO.heroTitle,
        titleItalic: BASELINE_HERO.heroTitleItalic,
        subtitle: BASELINE_HERO.heroSubtitle,
        tag: BASELINE_HERO.heroTag,
        chipLabel: BASELINE_HERO.heroChipLabel,
        cardTitle: BASELINE_HERO.heroCardTitle,
        cardSubtitle: BASELINE_HERO.heroCardSubtitle,
        image: BASELINE_HERO.heroImage,
        glowGradient: BASELINE_HERO.glowGradient,
        trustBarStat: BASELINE_HERO.trustBarStat,
      };

  const heroAnimationClass = config?.heroAnimationClass ?? '';

  return {
    activeDept,
    heroRevealed,
    lookbookRevealed,
    config,
    hero,
    heroAnimationClass,
    isTransitioning,
  };
}
