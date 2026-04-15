"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

export interface Trainer {
  name: string;
  role: string;
  image?: string | null;
  alt: string;
  pos?: string;
}

interface TeamCircularGalleryProps {
  trainers: Trainer[];
  autoRotateSpeed?: number;
}

const MOMENTUM_FRICTION = 0.94;
const MOMENTUM_EPSILON = 0.02;
const COOLDOWN_MS = 800;
const HINT_DURATION_MS = 3000;
const DRAG_SENSITIVITY = 0.4;
const STILL_THRESHOLD_MS = 150;

export default function TeamCircularGallery({
  trainers,
  autoRotateSpeed = -0.05,
}: TeamCircularGalleryProps) {
  const [rotation, setRotation] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);

  const sectionRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const inViewRef = useRef(false);
  const isDraggingRef = useRef(false);
  const momentumRef = useRef(0);
  const cooldownUntilRef = useRef(0);
  const lastPointerXRef = useRef(0);
  const lastPointerTimeRef = useRef(0);
  const arrowStep = 360 / Math.max(trainers.length, 1);

  useEffect(() => {
    const mm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mbl = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      setReducedMotion(mm.matches);
      setIsMobile(mbl.matches);
    };
    apply();
    mm.addEventListener("change", apply);
    mbl.addEventListener("change", apply);
    return () => {
      mm.removeEventListener("change", apply);
      mbl.removeEventListener("change", apply);
    };
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setHintVisible(false), HINT_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const tick = () => {
      setRotation((prev) => {
        if (isDraggingRef.current) return prev;
        const now = performance.now();
        if (Math.abs(momentumRef.current) > MOMENTUM_EPSILON) {
          const next = prev + momentumRef.current;
          momentumRef.current *= MOMENTUM_FRICTION;
          if (Math.abs(momentumRef.current) <= MOMENTUM_EPSILON) {
            momentumRef.current = 0;
            cooldownUntilRef.current = now + COOLDOWN_MS;
          }
          return next;
        }
        if (now < cooldownUntilRef.current) return prev;
        if (inViewRef.current) {
          return prev + autoRotateSpeed;
        }
        return prev;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [autoRotateSpeed, reducedMotion]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (reducedMotion) return;
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      isDraggingRef.current = true;
      momentumRef.current = 0;
      lastPointerXRef.current = e.clientX;
      lastPointerTimeRef.current = performance.now();
      setHintVisible(false);
    },
    [reducedMotion]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const now = performance.now();
    const deltaX = e.clientX - lastPointerXRef.current;
    const deltaT = Math.max(1, now - lastPointerTimeRef.current);
    const deg = deltaX * DRAG_SENSITIVITY;
    setRotation((r) => r + deg);
    momentumRef.current = (deg / deltaT) * 16;
    lastPointerXRef.current = e.clientX;
    lastPointerTimeRef.current = now;
  }, []);

  const endDrag = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
    isDraggingRef.current = false;
    const timeSinceLastMove = performance.now() - lastPointerTimeRef.current;
    if (timeSinceLastMove > STILL_THRESHOLD_MS) {
      momentumRef.current = 0;
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setRotation((r) => r - arrowStep);
        setHintVisible(false);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setRotation((r) => r + arrowStep);
        setHintVisible(false);
      }
    },
    [arrowStep]
  );

  if (trainers.length === 0) return null;

  if (reducedMotion) {
    return (
      <div
        ref={sectionRef}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-6"
      >
        {trainers.map((t) => (
          <TrainerCard key={t.name} trainer={t} />
        ))}
      </div>
    );
  }

  const radius = isMobile ? 380 : 600;
  const cardW = isMobile ? 170 : 300;
  const cardH = isMobile ? 240 : 400;
  const sectionH = isMobile ? 420 : 680;
  const anglePerItem = 360 / trainers.length;

  return (
    <div
      ref={sectionRef}
      className="relative w-full select-none cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-primary overflow-hidden"
      style={{
        height: sectionH,
        perspective: "2000px",
        touchAction: "pan-y",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={handleKeyDown}
      role="region"
      aria-roledescription="carousel"
      aria-label="Ratchawat trainers gallery. Use arrow keys, drag or swipe to rotate."
      tabIndex={0}
    >
      <div
        className="relative w-full h-full"
        style={{
          transform: `rotateY(${rotation}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {trainers.map((trainer, i) => {
          const itemAngle = i * anglePerItem;
          const relative = (itemAngle + (rotation % 360) + 360) % 360;
          const normalized = Math.abs(
            relative > 180 ? 360 - relative : relative
          );
          const opacity = Math.max(0.3, 1 - normalized / 180);

          return (
            <div
              key={trainer.name + i}
              className="absolute"
              style={{
                width: cardW,
                height: cardH,
                left: "50%",
                top: "50%",
                marginLeft: -cardW / 2,
                marginTop: -cardH / 2,
                transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                opacity,
                transition: "opacity 0.3s linear",
              }}
            >
              <TrainerCard trainer={trainer} />
            </div>
          );
        })}
      </div>

      <div
        className={`pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-white/70 transition-opacity duration-700 ${
          hintVisible ? "opacity-80" : "opacity-0"
        }`}
      >
        <span aria-hidden="true">&larr;</span>
        <span>Drag or swipe</span>
        <span aria-hidden="true">&rarr;</span>
      </div>
    </div>
  );
}

function TrainerCard({ trainer }: { trainer: Trainer }) {
  return (
    <div className="relative w-full h-full rounded-lg shadow-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md">
      {trainer.image ? (
        <Image
          src={trainer.image}
          alt={trainer.alt}
          fill
          sizes="(max-width: 768px) 170px, 300px"
          className="object-cover pointer-events-none"
          style={{ objectPosition: trainer.pos ?? "center" }}
          draggable={false}
        />
      ) : (
        <div
          aria-label={trainer.alt}
          role="img"
          className="absolute inset-0 bg-gradient-to-br from-slate-800 via-gray-900 to-zinc-800"
        />
      )}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
        <h3 className="font-serif text-xl font-bold uppercase leading-tight">
          {trainer.name}
        </h3>
        <p className="text-sm mt-1 opacity-80">{trainer.role}</p>
      </div>
    </div>
  );
}
