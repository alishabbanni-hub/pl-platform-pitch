'use client';

import { useCallback, useEffect, useState } from 'react';

interface Partner {
  name: string;
  bg: string;        // Tailwind background color class
  shadow: string;    // Tailwind shadow color class
}

const partners: Partner[] = [
  { name: 'Schools', bg: 'bg-blue-500',    shadow: 'shadow-blue-500/40'    },
  { name: 'School Boards', bg: 'bg-cyan-500',    shadow: 'shadow-cyan-500/40'    },
  { name: 'Edu Organizations ', bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/40' },
  { name: 'NGOs', bg: 'bg-amber-500',   shadow: 'shadow-amber-500/40'   },
  { name: 'Research Institutes', bg: 'bg-purple-500',  shadow: 'shadow-purple-500/40'  },
];

// === Phase 1 knobs ===
// Distance from center to each partner circle's center, in pixels.
const RADIUS = 260;
// Stagger between each partner appearing, in ms.
const STAGGER_MS = 180;

// === Phase 2 knobs ===
// Pentagon shrinks to this fraction of its full size.
const PHASE_2_SCALE = 0.55;
// How far the pentagon slides left when entering phase 2, in pixels.
const PHASE_2_SHIFT_PX = 300;
// How long the pentagon takes to shrink + slide left.
const PHASE_2_TRANSITION_MS = 900;
// How long the arrow takes to draw itself, after pentagon settles.
const ARROW_DRAW_MS = 600;
// Pause AFTER arrow has fully drawn, BEFORE the new circle appears.
// This is what guarantees the user reads "arrow first, then circle".
const CIRCLE_DELAY_AFTER_ARROW_MS = 400;
// Arrow line length in pixels.
const ARROW_LENGTH = 200;

// === Phase 2 — cinematic camera pan ===
// Camera pan runs in PERFECT LOCKSTEP with the pentagon's zoom-out:
// same start, same end, same duration. The pentagon shrinks-and-shifts
// while the camera pans, so the whole leftward motion reads as a single
// continuous slide. The arrow and circle then appear afterwards in the
// already-shifted scene.
const CAMERA_PAN_DELAY_MS = 0;                          // start at the same instant as the pentagon
const CAMERA_PAN_DURATION_MS = PHASE_2_TRANSITION_MS;   // end at the same instant as the pentagon
const CAMERA_PAN_SHIFT_PCT = 28;                        // how far the scene slides left (% of stage width)

export function PartnershipModel() {
  // Phase 0 = initial (only center visible).
  // Phase 1 = pentagon revealed (partners around center).
  // Phase 2 = pentagon zoomed out + arrow drawn + new circle visible.
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const [visibleCount, setVisibleCount] = useState(0);
  // Camera pan kicks in automatically a moment after the new circle appears.
  const [isCameraPanned, setIsCameraPanned] = useState(false);

  useEffect(() => {
    if (phase === 2) {
      const id = setTimeout(() => setIsCameraPanned(true), CAMERA_PAN_DELAY_MS);
      return () => clearTimeout(id);
    }
    // On phase reset (0 or 1) make sure the camera is back to neutral.
    setIsCameraPanned(false);
  }, [phase]);

  const handleCenterClick = useCallback(() => {
    if (phase === 0) {
      // Begin phase 1: reveal partners one by one.
      setPhase(1);
      setVisibleCount(0);
      for (let i = 1; i <= partners.length; i++) {
        setTimeout(() => setVisibleCount(i), i * STAGGER_MS);
      }
    } else if (phase === 1 && visibleCount === partners.length) {
      // Advance to phase 2 — pentagon zooms out, arrow + new circle appear.
      setPhase(2);
    } else if (phase === 2) {
      // Loop back to the start for replay.
      setPhase(0);
      setVisibleCount(0);
    }
    // Otherwise: ignore clicks during the partner-reveal animation.
  }, [phase, visibleCount]);

  // 5 evenly distributed angles, starting at 12 o'clock and going clockwise.
  const positions = partners.map((_, i) => {
    const angle = ((-90 + i * 72) * Math.PI) / 180;
    return {
      x: Math.cos(angle) * RADIUS,
      y: Math.sin(angle) * RADIUS,
    };
  });

  const isPhase2 = phase === 2;

  const hintText =
    phase === 0
      ? 'Click the center to reveal partners'
      : phase === 1 && visibleCount < partners.length
      ? 'Revealing…'
      : phase === 1
      ? 'Click the center to see what emerges →'
      : 'Click the center again to replay';

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-white flex flex-col">
      {/* Header — its own row at the top. */}
      <header className="px-12 pt-8 pb-4">
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
          Partnership &amp; Collaboration Model
        </h1>
        <p className="mt-2 text-base md:text-lg text-slate-500">
          How our Professional Learning platform connects the ecosystem
        </p>
      </header>

      {/* Stage — absolute-positioned scene. */}
      <div className="flex-1 relative overflow-hidden">

        {/* Camera — slides the whole scene left in phase 2's final beat,
            so the new circle ends up centered on screen. Triggered
            automatically a moment after the new circle has appeared. */}
        <div
          className="absolute inset-0"
          style={{
            transform: isCameraPanned
              ? `translateX(-${CAMERA_PAN_SHIFT_PCT}%)`
              : 'translateX(0)',
            transition: `transform ${CAMERA_PAN_DURATION_MS}ms ease-in-out`,
          }}
        >

        {/* Pentagon wrapper — shifts left and scales down in phase 2.
            Uses a single `transform` (GPU-accelerated) so the slide + shrink
            stay perfectly smooth instead of jumping. */}
        <div
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            transform: isPhase2
              ? `translate3d(${-PHASE_2_SHIFT_PX}px, 0, 0) scale(${PHASE_2_SCALE})`
              : `translate3d(0, 0, 0) scale(1)`,
            transition: `transform ${PHASE_2_TRANSITION_MS}ms ease-in-out`,
            willChange: 'transform',
          }}
        >
          {/* 0×0 pivot — children positioned relative to (0, 0). */}
          <div className="relative" style={{ width: 0, height: 0 }}>
            {/* Partner circles — rendered before the center so the center sits on top. */}
            {partners.map((p, i) => {
              const isVisible = i < visibleCount;
              return (
                <div
                  key={p.name}
                  className={`absolute flex items-center justify-center rounded-full text-white font-semibold text-sm md:text-base shadow-xl transition-all duration-500 ease-out ${p.bg} ${p.shadow}`}
                  style={{
                    width: 144,
                    height: 144,
                    left: positions[i].x,
                    top: positions[i].y,
                    transform: `translate(-50%, -50%) scale(${isVisible ? 1 : 0.3})`,
                    opacity: isVisible ? 1 : 0,
                  }}
                >
                  {p.name}
                </div>
              );
            })}

            {/* Center circle — clickable; drives every phase transition. */}
            <button
              type="button"
              onClick={handleCenterClick}
              aria-label="Advance presentation"
              className="absolute flex items-center justify-center rounded-full bg-slate-900 text-white font-semibold text-xl md:text-2xl shadow-2xl shadow-slate-900/30 cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
              style={{
                width: 220,
                height: 220,
                left: 0,
                top: 0,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span className="text-center leading-tight">
                Structured
                <br />
                Discovery Framework
              </span>
            </button>
          </div>
        </div>

        {/* Straight arrow — draws itself in phase 2. */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <svg
            width={ARROW_LENGTH}
            height={24}
            style={{ display: 'block', overflow: 'visible' }}
          >
            {/* Line that "draws" via stroke-dashoffset.
                strokeDashoffset is set via inline style (not as a JSX attribute)
                so the CSS transition reliably picks it up across browsers. */}
            <line
              x1={0}
              y1={12}
              x2={ARROW_LENGTH - 14}
              y2={12}
              stroke="#64748b"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={ARROW_LENGTH}
              style={{
                strokeDashoffset: isPhase2 ? 0 : ARROW_LENGTH,
                transition: `stroke-dashoffset ${ARROW_DRAW_MS}ms ease-out`,
              }}
            />
            {/* Arrowhead — lands exactly when the line finishes drawing. */}
            <polygon
              points={`${ARROW_LENGTH},12 ${ARROW_LENGTH - 14},5 ${ARROW_LENGTH - 14},19`}
              fill="#64748b"
              style={{
                opacity: isPhase2 ? 1 : 0,
                transition: `opacity 200ms ease-out ${ARROW_DRAW_MS - 200}ms`,
              }}
            />
          </svg>
        </div>

        {/* "Result" circle on the right — appears at the end of phase 2. */}
        <div
          className="absolute"
          style={{
            top: '50%',
            left: '78%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            className="flex items-center justify-center rounded-full bg-indigo-600 text-white font-semibold text-center shadow-2xl shadow-indigo-600/40"
            style={{
              width: 200,
              height: 200,
              padding: 18,
              fontSize: 14,
              lineHeight: 1.3,
              opacity: isPhase2 ? 1 : 0,
              transform: `scale(${isPhase2 ? 1 : 0.3})`,
              // Circle still waits until the arrow has fully drawn AND a clear
              // pause has passed, so the sequence reads "arrow, then circle".
              // No more upfront PHASE_2_TRANSITION_MS delay — everything starts
              // the moment phase 2 begins.
              transition:
                `opacity 500ms ease-out ${ARROW_DRAW_MS + CIRCLE_DELAY_AFTER_ARROW_MS}ms, ` +
                `transform 500ms ease-out ${ARROW_DRAW_MS + CIRCLE_DELAY_AFTER_ARROW_MS}ms`,
            }}
          >
            Professional Learning Intelligence
          </div>
        </div>
        </div>
      </div>

      {/* Hint — its own row at the bottom. */}
      <footer className="pb-8 text-center">
        <p className="text-sm text-slate-400">{hintText}</p>
      </footer>
    </section>
  );
}
