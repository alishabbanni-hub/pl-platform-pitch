'use client';

import { useCallback, useEffect, useState } from 'react';

interface Partner {
  name: string;
  bg: string;        // Tailwind background color class
  shadow: string;    // Tailwind shadow color class
}

const partners: Partner[] = [
  { name: 'Schools',              bg: 'bg-blue-500',    shadow: 'shadow-blue-500/40'    },
  { name: 'School Boards',        bg: 'bg-cyan-500',    shadow: 'shadow-cyan-500/40'    },
  { name: 'Edu Organizations ',   bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/40' },
  { name: 'NGOs',                 bg: 'bg-amber-500',   shadow: 'shadow-amber-500/40'   },
  { name: 'Research Institutes',  bg: 'bg-purple-500',  shadow: 'shadow-purple-500/40'  },
];

// Phase 3 satellites — orbit around p2 (Contextual Intelligence).
const satellites: Partner[] = [
  { name: 'Recurring Patterns',   bg: 'bg-blue-500',    shadow: 'shadow-blue-500/40'    },
  { name: 'Urgent Needs',         bg: 'bg-cyan-500',    shadow: 'shadow-cyan-500/40'    },
  { name: 'Intervention Areas',   bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/40' },
  { name: 'Emerging Phenomena',   bg: 'bg-amber-500',   shadow: 'shadow-amber-500/40'   },
  { name: 'Emotional Struggles',  bg: 'bg-purple-500',  shadow: 'shadow-purple-500/40'  },
];

// Phase 5 satellites — orbit around p3 (Participatory Professional Learning
// Solution Design). The five collaborators contributing to the design.
const satellites2: Partner[] = [
  { name: 'University Professors',  bg: 'bg-blue-500',    shadow: 'shadow-blue-500/40'    },
  { name: 'Experienced Teachers',   bg: 'bg-cyan-500',    shadow: 'shadow-cyan-500/40'    },
  { name: 'Learning Designers',     bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/40' },
  { name: 'Multimedia Teams',       bg: 'bg-amber-500',   shadow: 'shadow-amber-500/40'   },
  { name: 'Integrators',            bg: 'bg-purple-500',  shadow: 'shadow-purple-500/40'  },
];

// Phase 7 satellites — orbit around p4 (eLearning Solution).
const satellites3: Partner[] = [
  { name: 'Scenario-based',        bg: 'bg-blue-500',    shadow: 'shadow-blue-500/40'    },
  { name: 'Immersive',              bg: 'bg-cyan-500',    shadow: 'shadow-cyan-500/40'    },
  { name: 'Experiential',       bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/40' },
  { name: 'Engagement Strategies',  bg: 'bg-amber-500',   shadow: 'shadow-amber-500/40'   },
  { name: 'Teach Toolkits',         bg: 'bg-purple-500',  shadow: 'shadow-purple-500/40'  },
];

// === Phase 1 knobs ===
// Distance from center to each partner circle's center, in pixels.
const RADIUS = 200;
// Stagger between each partner appearing, in ms.
const STAGGER_MS = 180;

// === Phase 2 knobs ===
// Pentagon shrinks to this fraction of its full size.
const PHASE_2_SCALE = 0.55;
// How far the pentagon slides left when entering phase 2, in pixels.
const PHASE_2_SHIFT_PX = 300;
// How long the pentagon takes to shrink + slide left.
// The camera pan derives its duration from this same constant, so the
// pentagon zoom-out and the camera pan always run in perfect lockstep.
const PHASE_2_TRANSITION_MS = 1400;
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
const CAMERA_PAN_SHIFT_PCT = 28;                        // how far the scene slides left PER STAGE (% of stage width)

// === Phase 3 knobs ===
// Distance from p2's center to each Element's center, in pixels.
const SATELLITE_RADIUS = 200;
// When phase 3 starts (click on p2), arrow 1 shrinks and slides slightly
// to the left to make visual room for the Elements appearing around p2.
// The same shrink+shift is reused for arrow 2 in phase 5 and arrow 3 in phase 7.
const ARROW_PHASE_3_SCALE = 0.7;        // arrow shrinks to this fraction
const ARROW_PHASE_3_SHIFT_PX = 50;      // arrow slides this many pixels left
const ARROW_PHASE_3_TRANSITION_MS = 500;// duration of the shrink + shift

// === Phase 4 / 5 layout knobs ===
// p3's horizontal position in the stage (% of stage width). After camera
// pan stage 2 (= 2 * CAMERA_PAN_SHIFT_PCT = 56%), this places p3 dead-centre.
const P3_LEFT_PCT = 106;
// Second arrow's horizontal position in the stage (% of stage width).
// Roughly mid-way between the shrunken p2 and p3.
const ARROW_2_LEFT_PCT = 84;

// === Phase 6 / 7 layout knobs ===
// p4's horizontal position in the stage (% of stage width). After camera
// pan stage 3 (= 3 * CAMERA_PAN_SHIFT_PCT = 84%), this places p4 dead-centre.
const P4_LEFT_PCT = 134;
// Third arrow's horizontal position in the stage (% of stage width).
// Roughly mid-way between the shrunken p3 and p4.
const ARROW_3_LEFT_PCT = 112;

export function PartnershipModel() {
  // Phase 0 = initial (only center visible).
  // Phase 1 = pentagon revealed (partners around center).
  // Phase 2 = pentagon zoomed out + arrow drawn + p2 visible + camera panned.
  // Phase 3 = Elements revealed orbiting around p2.
  // Phase 4 = p2 (+its elements) zoomed out + arrow 2 drawn + p3 visible + camera panned further.
  // Phase 5 = Collaborators revealed orbiting around p3.
  // Phase 6 = p3 (+its collaborators) zoomed out + arrow 3 drawn + p4 visible + camera panned further.
  // Phase 7 = Course attributes revealed orbiting around p4.
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7>(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [visibleSatelliteCount, setVisibleSatelliteCount] = useState(0);
  const [visibleSatelliteCount2, setVisibleSatelliteCount2] = useState(0);
  const [visibleSatelliteCount3, setVisibleSatelliteCount3] = useState(0);
  // 0 = no pan, 1 = p2 centred, 2 = p3 centred, 3 = p4 centred.
  const [cameraStage, setCameraStage] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    if (phase === 2) {
      const id = setTimeout(() => setCameraStage(1), CAMERA_PAN_DELAY_MS);
      return () => clearTimeout(id);
    }
    if (phase === 4) {
      const id = setTimeout(() => setCameraStage(2), CAMERA_PAN_DELAY_MS);
      return () => clearTimeout(id);
    }
    if (phase === 6) {
      const id = setTimeout(() => setCameraStage(3), CAMERA_PAN_DELAY_MS);
      return () => clearTimeout(id);
    }
    // Phase 3 stays at stage 1. Phase 5 stays at stage 2. Phase 7 stays at stage 3.
    if (phase === 0 || phase === 1) {
      setCameraStage(0);
    }
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
      // Advance to phase 2 — pentagon zooms out, arrow + p2 appear.
      setPhase(2);
    } else if (phase === 2 && cameraStage === 1) {
      // Advance to phase 3 — Elements reveal around p2 one by one.
      setPhase(3);
      setVisibleSatelliteCount(0);
      for (let i = 1; i <= satellites.length; i++) {
        setTimeout(() => setVisibleSatelliteCount(i), i * STAGGER_MS);
      }
    } else if (phase === 3 && visibleSatelliteCount === satellites.length) {
      // Advance to phase 4 — p2 + its elements zoom out, arrow 2 + p3 appear.
      setPhase(4);
    } else if (phase === 4 && cameraStage === 2) {
      // Advance to phase 5 — Collaborators reveal around p3 one by one.
      setPhase(5);
      setVisibleSatelliteCount2(0);
      for (let i = 1; i <= satellites2.length; i++) {
        setTimeout(() => setVisibleSatelliteCount2(i), i * STAGGER_MS);
      }
    } else if (phase === 5 && visibleSatelliteCount2 === satellites2.length) {
      // Advance to phase 6 — p3 + its collaborators zoom out, arrow 3 + p4 appear.
      setPhase(6);
    } else if (phase === 6 && cameraStage === 3) {
      // Advance to phase 7 — Course attributes reveal around p4 one by one.
      setPhase(7);
      setVisibleSatelliteCount3(0);
      for (let i = 1; i <= satellites3.length; i++) {
        setTimeout(() => setVisibleSatelliteCount3(i), i * STAGGER_MS);
      }
    } else if (phase === 7 && visibleSatelliteCount3 === satellites3.length) {
      // Loop back to the start for replay.
      setPhase(0);
      setVisibleCount(0);
      setVisibleSatelliteCount(0);
      setVisibleSatelliteCount2(0);
      setVisibleSatelliteCount3(0);
    }
    // Otherwise: ignore clicks during animations in progress.
  }, [phase, visibleCount, visibleSatelliteCount, visibleSatelliteCount2, visibleSatelliteCount3, cameraStage]);

  // 5 evenly distributed angles, starting at 12 o'clock and going clockwise.
  const positions = partners.map((_, i) => {
    const angle = ((-90 + i * 72) * Math.PI) / 180;
    return {
      x: Math.cos(angle) * RADIUS,
      y: Math.sin(angle) * RADIUS,
    };
  });

  // Same angular distribution for the Elements around p2.
  const satellitePositions = satellites.map((_, i) => {
    const angle = ((-90 + i * 72) * Math.PI) / 180;
    return {
      x: Math.cos(angle) * SATELLITE_RADIUS,
      y: Math.sin(angle) * SATELLITE_RADIUS,
    };
  });

  // Same angular distribution for the Collaborators around p3.
  const satellite2Positions = satellites2.map((_, i) => {
    const angle = ((-90 + i * 72) * Math.PI) / 180;
    return {
      x: Math.cos(angle) * SATELLITE_RADIUS,
      y: Math.sin(angle) * SATELLITE_RADIUS,
    };
  });

  // Same angular distribution for the Course attributes around p4.
  const satellite3Positions = satellites3.map((_, i) => {
    const angle = ((-90 + i * 72) * Math.PI) / 180;
    return {
      x: Math.cos(angle) * SATELLITE_RADIUS,
      y: Math.sin(angle) * SATELLITE_RADIUS,
    };
  });

  // Phase-driven visibility / scale flags.
  const isCenterShrunk  = phase >= 2;  // original pentagon zoomed out from phase 2 onwards
  const isP2Shrunk      = phase >= 4;  // p2's pentagon zoomed out from phase 4 onwards
  const isP3Shrunk      = phase >= 6;  // p3's pentagon zoomed out from phase 6 onwards
  const isArrow1Drawn   = phase >= 2;  // first arrow visible from phase 2
  const isArrow1Small   = phase >= 3;  // first arrow shrunk from phase 3
  const isArrow2Drawn   = phase >= 4;  // second arrow visible from phase 4
  const isArrow2Small   = phase >= 5;  // second arrow shrunk from phase 5
  const isArrow3Drawn   = phase >= 6;  // third arrow visible from phase 6
  const isArrow3Small   = phase >= 7;  // third arrow shrunk from phase 7
  const isP2Visible     = phase >= 2;  // p2 button visible / clickable
  const isP3Visible     = phase >= 4;  // p3 button visible / clickable
  const isP4Visible     = phase >= 6;  // p4 button visible / clickable

  const hintText =
    phase === 0
      ? 'Click the center to reveal partners'
      : phase === 1 && visibleCount < partners.length
      ? 'Revealing…'
      : phase === 1
      ? 'Click the center to see what emerges →'
      : phase === 2 && cameraStage !== 1
      ? 'Revealing…'
      : phase === 2
      ? 'Click the center to reveal the elements →'
      : phase === 3 && visibleSatelliteCount < satellites.length
      ? 'Revealing…'
      : phase === 3
      ? 'Click p2 to see what emerges next →'
      : phase === 4 && cameraStage !== 2
      ? 'Revealing…'
      : phase === 4
      ? 'Click p3 to reveal its collaborators →'
      : phase === 5 && visibleSatelliteCount2 < satellites2.length
      ? 'Revealing…'
      : phase === 5
      ? 'Click p3 to see what emerges next →'
      : phase === 6 && cameraStage !== 3
      ? 'Revealing…'
      : phase === 6
      ? 'Click p4 to reveal the course attributes →'
      : phase === 7 && visibleSatelliteCount3 < satellites3.length
      ? 'Revealing…'
      : 'Click p4 again to replay';

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

        {/* Camera — slides the whole scene left in stages. Stage 1 centers p2;
            stage 2 centers p3; stage 3 centers p4. Each stage is the same
            fixed CAMERA_PAN_SHIFT_PCT so motion feels uniform. */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translateX(-${cameraStage * CAMERA_PAN_SHIFT_PCT}%)`,
            transition: `transform ${CAMERA_PAN_DURATION_MS}ms ease-in-out`,
          }}
        >

        {/* Original (center) pentagon — shifts left and scales down in phase 2.
            Uses a single `transform` (GPU-accelerated) so the slide + shrink
            stay perfectly smooth instead of jumping. */}
        <div
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            transform: isCenterShrunk
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
                  className={`absolute flex items-center justify-center rounded-full text-white font-semibold text-sm md:text-base text-center shadow-xl transition-all duration-500 ease-out ${p.bg} ${p.shadow}`}
                  style={{
                    width: 110,
                    height: 110,
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

            {/* Center circle — clickable; drives the early phase transitions. */}
            <button
              type="button"
              onClick={handleCenterClick}
              aria-label="Advance presentation"
              className="absolute flex items-center justify-center rounded-full bg-slate-900 text-white font-semibold text-center shadow-2xl shadow-slate-900/30 cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
              style={{
                width: 170,
                height: 170,
                left: 0,
                top: 0,
                padding: 18,
                fontSize: 14,
                lineHeight: 1.3,
                transform: 'translate(-50%, -50%)',
              }}
            >
              Structured Discovery Framework
            </button>
          </div>
        </div>

        {/* Arrow 1 — draws itself in phase 2, shrinks + slides left in phase 3+. */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '50%',
            left: '56%',
            transform: isArrow1Small
              ? `translate(-50%, -50%) translateX(-${ARROW_PHASE_3_SHIFT_PX}px) scale(${ARROW_PHASE_3_SCALE})`
              : `translate(-50%, -50%)`,
            transition: `transform ${ARROW_PHASE_3_TRANSITION_MS}ms ease-in-out`,
          }}
        >
          <svg
            width={ARROW_LENGTH}
            height={24}
            style={{ display: 'block', overflow: 'visible' }}
          >
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
                strokeDashoffset: isArrow1Drawn ? 0 : ARROW_LENGTH,
                transition: `stroke-dashoffset ${ARROW_DRAW_MS}ms ease-out`,
              }}
            />
            <polygon
              points={`${ARROW_LENGTH},12 ${ARROW_LENGTH - 14},5 ${ARROW_LENGTH - 14},19`}
              fill="#64748b"
              style={{
                opacity: isArrow1Drawn ? 1 : 0,
                transition: `opacity 200ms ease-out ${ARROW_DRAW_MS - 200}ms`,
              }}
            />
          </svg>
        </div>

        {/* p2 + its elements pentagon — shifts left and scales down in phase 4. */}
        <div
          className="absolute"
          style={{
            top: '50%',
            left: '78%',
            transform: isP2Shrunk
              ? `translate3d(${-PHASE_2_SHIFT_PX}px, 0, 0) scale(${PHASE_2_SCALE})`
              : `translate3d(0, 0, 0) scale(1)`,
            transition: `transform ${PHASE_2_TRANSITION_MS}ms ease-in-out`,
            willChange: 'transform',
          }}
        >
          {/* 0×0 pivot at p2's center — Elements orbit this point. */}
          <div className="relative" style={{ width: 0, height: 0 }}>
            {satellites.map((s, i) => {
              const isVisible = i < visibleSatelliteCount;
              return (
                <div
                  key={s.name}
                  className={`absolute flex items-center justify-center rounded-full text-white font-semibold text-sm md:text-base text-center shadow-xl transition-all duration-500 ease-out ${s.bg} ${s.shadow}`}
                  style={{
                    width: 110,
                    height: 110,
                    left: satellitePositions[i].x,
                    top: satellitePositions[i].y,
                    transform: `translate(-50%, -50%) scale(${isVisible ? 1 : 0.3})`,
                    opacity: isVisible ? 1 : 0,
                  }}
                >
                  {s.name}
                </div>
              );
            })}

            <button
              type="button"
              onClick={handleCenterClick}
              aria-label="Reveal Elements / advance to next phase"
              className="absolute flex items-center justify-center rounded-full bg-indigo-600 text-white font-semibold text-center shadow-2xl shadow-indigo-600/40 cursor-pointer"
              style={{
                width: 155,
                height: 155,
                padding: 18,
                fontSize: 14,
                lineHeight: 1.3,
                left: 0,
                top: 0,
                border: 'none',
                transform: `translate(-50%, -50%) scale(${isP2Visible ? 1 : 0.3})`,
                opacity: isP2Visible ? 1 : 0,
                pointerEvents: isP2Visible ? 'auto' : 'none',
                transition:
                  `opacity 500ms ease-out ${ARROW_DRAW_MS + CIRCLE_DELAY_AFTER_ARROW_MS}ms, ` +
                  `transform 500ms ease-out ${ARROW_DRAW_MS + CIRCLE_DELAY_AFTER_ARROW_MS}ms`,
              }}
            >
              Contextual Intelligence
            </button>
          </div>
        </div>

        {/* Arrow 2 — between p2 and p3. Draws in phase 4, shrinks in phase 5. */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '50%',
            left: `${ARROW_2_LEFT_PCT}%`,
            transform: isArrow2Small
              ? `translate(-50%, -50%) translateX(-${ARROW_PHASE_3_SHIFT_PX}px) scale(${ARROW_PHASE_3_SCALE})`
              : `translate(-50%, -50%)`,
            transition: `transform ${ARROW_PHASE_3_TRANSITION_MS}ms ease-in-out`,
          }}
        >
          <svg
            width={ARROW_LENGTH}
            height={24}
            style={{ display: 'block', overflow: 'visible' }}
          >
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
                strokeDashoffset: isArrow2Drawn ? 0 : ARROW_LENGTH,
                transition: `stroke-dashoffset ${ARROW_DRAW_MS}ms ease-out`,
              }}
            />
            <polygon
              points={`${ARROW_LENGTH},12 ${ARROW_LENGTH - 14},5 ${ARROW_LENGTH - 14},19`}
              fill="#64748b"
              style={{
                opacity: isArrow2Drawn ? 1 : 0,
                transition: `opacity 200ms ease-out ${ARROW_DRAW_MS - 200}ms`,
              }}
            />
          </svg>
        </div>

        {/* p3 + its Collaborator satellites — shifts left and scales down in phase 6. */}
        <div
          className="absolute"
          style={{
            top: '50%',
            left: `${P3_LEFT_PCT}%`,
            transform: isP3Shrunk
              ? `translate3d(${-PHASE_2_SHIFT_PX}px, 0, 0) scale(${PHASE_2_SCALE})`
              : `translate3d(0, 0, 0) scale(1)`,
            transition: `transform ${PHASE_2_TRANSITION_MS}ms ease-in-out`,
            willChange: 'transform',
          }}
        >
          <div className="relative" style={{ width: 0, height: 0 }}>
            {satellites2.map((s, i) => {
              const isVisible = i < visibleSatelliteCount2;
              return (
                <div
                  key={s.name}
                  className={`absolute flex items-center justify-center rounded-full text-white font-semibold text-sm md:text-base text-center shadow-xl transition-all duration-500 ease-out ${s.bg} ${s.shadow}`}
                  style={{
                    width: 110,
                    height: 110,
                    left: satellite2Positions[i].x,
                    top: satellite2Positions[i].y,
                    transform: `translate(-50%, -50%) scale(${isVisible ? 1 : 0.3})`,
                    opacity: isVisible ? 1 : 0,
                  }}
                >
                  {s.name}
                </div>
              );
            })}

            <button
              type="button"
              onClick={handleCenterClick}
              aria-label="Reveal Collaborators / advance to next phase"
              className="absolute flex items-center justify-center rounded-full bg-violet-600 text-white font-semibold text-center shadow-2xl shadow-violet-600/40 cursor-pointer"
              style={{
                width: 155,
                height: 155,
                padding: 18,
                fontSize: 14,
                lineHeight: 1.3,
                left: 0,
                top: 0,
                border: 'none',
                transform: `translate(-50%, -50%) scale(${isP3Visible ? 1 : 0.3})`,
                opacity: isP3Visible ? 1 : 0,
                pointerEvents: isP3Visible ? 'auto' : 'none',
                transition:
                  `opacity 500ms ease-out ${ARROW_DRAW_MS + CIRCLE_DELAY_AFTER_ARROW_MS}ms, ` +
                  `transform 500ms ease-out ${ARROW_DRAW_MS + CIRCLE_DELAY_AFTER_ARROW_MS}ms`,
              }}
            >
              Participatory Professional Learning Solution Design
            </button>
          </div>
        </div>

        {/* Arrow 3 — between p3 and p4. Draws in phase 6, shrinks in phase 7. */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '50%',
            left: `${ARROW_3_LEFT_PCT}%`,
            transform: isArrow3Small
              ? `translate(-50%, -50%) translateX(-${ARROW_PHASE_3_SHIFT_PX}px) scale(${ARROW_PHASE_3_SCALE})`
              : `translate(-50%, -50%)`,
            transition: `transform ${ARROW_PHASE_3_TRANSITION_MS}ms ease-in-out`,
          }}
        >
          <svg
            width={ARROW_LENGTH}
            height={24}
            style={{ display: 'block', overflow: 'visible' }}
          >
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
                strokeDashoffset: isArrow3Drawn ? 0 : ARROW_LENGTH,
                transition: `stroke-dashoffset ${ARROW_DRAW_MS}ms ease-out`,
              }}
            />
            <polygon
              points={`${ARROW_LENGTH},12 ${ARROW_LENGTH - 14},5 ${ARROW_LENGTH - 14},19`}
              fill="#64748b"
              style={{
                opacity: isArrow3Drawn ? 1 : 0,
                transition: `opacity 200ms ease-out ${ARROW_DRAW_MS - 200}ms`,
              }}
            />
          </svg>
        </div>

        {/* p4 + its Course-attribute satellites — eLearning Course at the far
            right, revealed in phases 6 and 7. */}
        <div
          className="absolute"
          style={{
            top: '50%',
            left: `${P4_LEFT_PCT}%`,
          }}
        >
          <div className="relative" style={{ width: 0, height: 0 }}>
            {satellites3.map((s, i) => {
              const isVisible = i < visibleSatelliteCount3;
              return (
                <div
                  key={s.name}
                  className={`absolute flex items-center justify-center rounded-full text-white font-semibold text-sm md:text-base text-center shadow-xl transition-all duration-500 ease-out ${s.bg} ${s.shadow}`}
                  style={{
                    width: 110,
                    height: 110,
                    left: satellite3Positions[i].x,
                    top: satellite3Positions[i].y,
                    transform: `translate(-50%, -50%) scale(${isVisible ? 1 : 0.3})`,
                    opacity: isVisible ? 1 : 0,
                  }}
                >
                  {s.name}
                </div>
              );
            })}

            <button
              type="button"
              onClick={handleCenterClick}
              aria-label="Reveal eLearning Course attributes"
              className="absolute flex items-center justify-center rounded-full bg-rose-600 text-white font-semibold text-center shadow-2xl shadow-rose-600/40 cursor-pointer"
              style={{
                width: 155,
                height: 155,
                padding: 18,
                fontSize: 14,
                lineHeight: 1.3,
                left: 0,
                top: 0,
                border: 'none',
                transform: `translate(-50%, -50%) scale(${isP4Visible ? 1 : 0.3})`,
                opacity: isP4Visible ? 1 : 0,
                pointerEvents: isP4Visible ? 'auto' : 'none',
                transition:
                  `opacity 500ms ease-out ${ARROW_DRAW_MS + CIRCLE_DELAY_AFTER_ARROW_MS}ms, ` +
                  `transform 500ms ease-out ${ARROW_DRAW_MS + CIRCLE_DELAY_AFTER_ARROW_MS}ms`,
              }}
            >
              eLearning Course
            </button>
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
