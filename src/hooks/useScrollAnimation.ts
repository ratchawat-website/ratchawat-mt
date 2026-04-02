"use client";

import { useEffect, useRef } from "react";

interface ScrollAnimationOptions {
  threshold?: number;
  staggerDelay?: number;
  rootMargin?: string;
}

export function useScrollAnimation<T extends HTMLElement>({
  threshold = 0.2,
  staggerDelay = 100,
  rootMargin = "0px",
}: ScrollAnimationOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    el.style.opacity = "0";
    el.style.transform = "translateY(1rem)";
    el.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";

    const children = el.querySelectorAll("[data-stagger]");
    children.forEach((child) => {
      (child as HTMLElement).style.opacity = "0";
      (child as HTMLElement).style.transform = "translateY(1rem)";
      (child as HTMLElement).style.transition =
        "opacity 0.5s ease-out, transform 0.5s ease-out";
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";

          children.forEach((child, i) => {
            setTimeout(() => {
              (child as HTMLElement).style.opacity = "1";
              (child as HTMLElement).style.transform = "translateY(0)";
            }, staggerDelay * (i + 1));
          });

          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, staggerDelay, rootMargin]);

  return ref;
}
