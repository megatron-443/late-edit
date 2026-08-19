import { useEffect } from "react";

/**
 * Single shared scroll-lock owner.
 *
 * Every overlay calls this hook; the module keeps one reference count and one
 * saved snapshot of the body styles + scroll position. Nested overlays,
 * open-close races and unmount-during-navigation can therefore never
 * double-lock the body or skip restoration: the styles are applied when the
 * count goes 0 → 1 and restored (with the exact original scroll offset) only
 * when it returns to 0.
 */

let locks = 0;
let saved: {
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
  overflow: string;
  paddingRight: string;
  scrollY: number;
} | null = null;

function applyLock() {
  const { body, documentElement } = document;
  const scrollY = window.scrollY || documentElement.scrollTop || 0;
  const scrollbar = window.innerWidth - documentElement.clientWidth;

  saved = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
    overflow: body.style.overflow,
    paddingRight: body.style.paddingRight,
    scrollY,
  };

  body.style.position = "fixed";
  body.style.top = `-${scrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
}

function releaseLock() {
  if (!saved) return;
  const { body } = document;
  const { scrollY, ...styles } = saved;
  body.style.position = styles.position;
  body.style.top = styles.top;
  body.style.left = styles.left;
  body.style.right = styles.right;
  body.style.width = styles.width;
  body.style.overflow = styles.overflow;
  body.style.paddingRight = styles.paddingRight;
  saved = null;
  // Restore the exact pre-lock offset without smooth-scroll interference.
  const html = document.documentElement;
  const prevBehavior = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo(0, scrollY);
  html.style.scrollBehavior = prevBehavior;
}

export function lockBodyScroll(): () => void {
  if (typeof document === "undefined") return () => {};
  locks += 1;
  if (locks === 1) applyLock();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks = Math.max(0, locks - 1);
    if (locks === 0) releaseLock();
  };
}

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    return lockBodyScroll();
  }, [locked]);
}
