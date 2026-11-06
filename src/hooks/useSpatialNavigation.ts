import { useEffect, useRef, useState } from 'react';

export interface SpatialNavigationOptions {
  containerRef?: React.RefObject<HTMLElement | null>;
  autoFocusSelector?: string;
  onBack?: () => void;
  enabled?: boolean;
  isModal?: boolean;
}

export function useSpatialNavigation({
  containerRef,
  autoFocusSelector,
  onBack,
  enabled = true,
  isModal = false,
}: SpatialNavigationOptions = {}) {
  const [isRemoteActive, setIsRemoteActive] = useState(false);
  const remoteTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Autofocus initial element
    const timer = setTimeout(() => {
      // If there is an active modal and this hook is not the modal, do not autofocus
      const activeModal = document.querySelector<HTMLElement>('[data-modal-active="true"]');
      if (activeModal && !isModal) return;

      const scope = containerRef?.current || activeModal || document;
      let target: HTMLElement | null = null;

      if (autoFocusSelector) {
        target = scope.querySelector<HTMLElement>(autoFocusSelector);
      }
      if (!target) {
        target = scope.querySelector<HTMLElement>(
          '#onboarding-name-input, #start-workout-main-btn, #advance-level-primary-btn, #close-settings-btn, .tv-focus-target, button:not([disabled]), [tabindex="0"], input:not([disabled])'
        );
      }

      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 80);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent background hooks from intercepting events when a modal is open
      const activeModal = document.querySelector<HTMLElement>('[data-modal-active="true"]');
      if (activeModal && !isModal) {
        return;
      }

      const key = e.key;

      // 1. Back button (Escape / Backspace / Remote back)
      if (key === 'Escape' || key === 'Backspace' || key === 'BrowserBack' || key === 'GoBack') {
        const activeEl = document.activeElement;
        const isTyping =
          activeEl?.tagName === 'INPUT' && (activeEl as HTMLInputElement).type !== 'range' ||
          activeEl?.tagName === 'TEXTAREA';

        if (key === 'Backspace' && isTyping) {
          return; // Allow typing backspace
        }

        if (onBack) {
          e.preventDefault();
          onBack();
          return;
        }
      }

      // 2. Enter key = Click focused button / control (except if aria-disabled)
      if (key === 'Enter') {
        const active = document.activeElement as HTMLElement | null;
        if (active && active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA') {
          if (active.getAttribute('aria-disabled') === 'true' || active.hasAttribute('disabled')) {
            e.preventDefault();
            return;
          }
          e.preventDefault();
          active.click();
          return;
        }
      }

      // 3. Arrow keys
      const isArrow =
        key === 'ArrowUp' ||
        key === 'ArrowDown' ||
        key === 'ArrowLeft' ||
        key === 'ArrowRight';

      if (!isArrow) return;

      // Activate visual remote feedback badge
      setIsRemoteActive(true);
      if (remoteTimerRef.current) clearTimeout(remoteTimerRef.current);
      remoteTimerRef.current = window.setTimeout(() => {
        setIsRemoteActive(false);
      }, 3500);

      const currentActive = document.activeElement as HTMLElement | null;

      // 4. SLIDERS BEHAVIOR:
      // "Les sliders : gauche/droite modifient la valeur, haut/bas sortent du slider."
      if (currentActive instanceof HTMLInputElement && currentActive.type === 'range') {
        if (key === 'ArrowLeft' || key === 'ArrowRight') {
          // Adjust value directly and dispatch events
          e.preventDefault();
          const step = Number(currentActive.step) || 0.05;
          const min = Number(currentActive.min) || 0;
          const max = Number(currentActive.max) || 1;
          const curVal = Number(currentActive.value);
          const newVal =
            key === 'ArrowLeft'
              ? Math.max(min, Math.round((curVal - step) * 100) / 100)
              : Math.min(max, Math.round((curVal + step) * 100) / 100);

          currentActive.value = String(newVal);
          currentActive.dispatchEvent(new Event('input', { bubbles: true }));
          currentActive.dispatchEvent(new Event('change', { bubbles: true }));
          return;
        }
        // If ArrowUp or ArrowDown, proceed below to exit slider and find next control!
      }

      // 5. Active scope: modal if present, else containerRef, else document.body
      const activeScope: HTMLElement =
        activeModal || containerRef?.current || document.body;

      // Candidates: ALL focusable visible elements inside the active scope,
      // including elements below the viewport or hidden by container scroll!
      // Never exclude a button because it is visually disabled: if aria-disabled, keep it focusable.
      const FOCUSABLE_SELECTOR =
        'button, [tabindex]:not([tabindex="-1"]), a[href], input:not([type="hidden"]), select, textarea, .tv-focus-target, [role="button"]';

      const rawElements = Array.from(activeScope.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

      const candidates = rawElements.filter((el) => {
        // Exclude elements inside hidden / closed sub-containers
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          return false;
        }
        // Must have non-zero dimension in layout
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

      if (candidates.length === 0) return;

      // If nothing currently focused inside active scope, focus first candidate
      const isCurrentInScope = currentActive && candidates.includes(currentActive);
      if (!isCurrentInScope) {
        e.preventDefault();
        candidates[0].focus();
        candidates[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }

      // 6. SPATIAL SELECTION BASED ON RECTANGLE EDGES (NOT CENTRES):
      // distance principale = écart entre le bord de départ et le bord opposé du candidat
      // décalage latéral = 0 si les deux rectangles se chevauchent sur l'axe perpendiculaire, sinon écart entre bords
      // score = distance principale + 2 * décalage latéral
      const curRect = currentActive.getBoundingClientRect();

      let bestCandidate: HTMLElement | null = null;
      let minScore = Infinity;

      for (const cand of candidates) {
        if (cand === currentActive) continue;

        const candRect = cand.getBoundingClientRect();

        let inHalfPlane = false;
        let mainDistance = 0;
        let lateralOffset = 0;

        if (key === 'ArrowDown') {
          // Half-plane: candidate is below current active element
          // Candidate top must be at or below current bottom (or top and bottom are lower)
          if (candRect.bottom > curRect.bottom + 2 && candRect.top >= curRect.top + 2) {
            inHalfPlane = true;
            mainDistance = Math.max(0, candRect.top - curRect.bottom);
            // Perpendicular axis: Horizontal (X)
            // Décalage latéral = 0 si chevauchement sur X, sinon écart entre bords
            const overlapX = Math.max(curRect.left, candRect.left) < Math.min(curRect.right, candRect.right);
            lateralOffset = overlapX
              ? 0
              : Math.max(0, candRect.left - curRect.right, curRect.left - candRect.right);
          }
        } else if (key === 'ArrowUp') {
          // Half-plane: candidate is above current active element
          if (candRect.top < curRect.top - 2 && candRect.bottom <= curRect.bottom - 2) {
            inHalfPlane = true;
            mainDistance = Math.max(0, curRect.top - candRect.bottom);
            // Perpendicular axis: Horizontal (X)
            const overlapX = Math.max(curRect.left, candRect.left) < Math.min(curRect.right, candRect.right);
            lateralOffset = overlapX
              ? 0
              : Math.max(0, candRect.left - curRect.right, curRect.left - candRect.right);
          }
        } else if (key === 'ArrowRight') {
          // Half-plane: candidate is to the right
          if (candRect.right > curRect.right + 2 && candRect.left >= curRect.left + 2) {
            inHalfPlane = true;
            mainDistance = Math.max(0, candRect.left - curRect.right);
            // Perpendicular axis: Vertical (Y)
            const overlapY = Math.max(curRect.top, candRect.top) < Math.min(curRect.bottom, candRect.bottom);
            lateralOffset = overlapY
              ? 0
              : Math.max(0, candRect.top - curRect.bottom, curRect.top - candRect.bottom);
          }
        } else if (key === 'ArrowLeft') {
          // Half-plane: candidate is to the left
          if (candRect.left < curRect.left - 2 && candRect.right <= curRect.right - 2) {
            inHalfPlane = true;
            mainDistance = Math.max(0, curRect.left - candRect.right);
            // Perpendicular axis: Vertical (Y)
            const overlapY = Math.max(curRect.top, candRect.top) < Math.min(curRect.bottom, candRect.bottom);
            lateralOffset = overlapY
              ? 0
              : Math.max(0, candRect.top - curRect.bottom, curRect.top - candRect.bottom);
          }
        }

        if (inHalfPlane) {
          const score = mainDistance + 2 * lateralOffset;
          if (score < minScore) {
            minScore = score;
            bestCandidate = cand;
          }
        }
      }

      if (bestCandidate) {
        e.preventDefault();
        bestCandidate.focus();
        bestCandidate.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
      // If no candidate in the direction: stay in place! (do nothing, no cycling)
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      if (remoteTimerRef.current) clearTimeout(remoteTimerRef.current);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, autoFocusSelector, onBack, containerRef, isModal]);

  return { isRemoteActive };
}

// Backward compatibility alias
export const useTVNavigation = useSpatialNavigation;
