'use client';

import { useCallback, useEffect, useState } from 'react';

interface Partner {
  name: string;
  bg: string;
  shadow: string;
}

const partners: Partner[] = [
  { name: 'Schools',              bg: 'bg-blue-500',    shadow: 'shadow-blue-500/40'    },
  { name: 'School Boards',        bg: 'bg-cyan-500',    shadow: 'shadow-cyan-500/40'    },
  { name: 'Edu Organizations ',   bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/40' },
  { name: 'NGOs',                 bg: 'bg-amber-500',   shadow: 'shadow-amber-500/40'   },
  { name: 'Research Institutes',  bg: 'bg-purple-500',  shadow: 'shadow-purple-500/40'  },
];

const satellites: Partner[] = [
  { name: 'Recurring Patterns',   bg: 'bg-blue-500',    shadow: 'shadow-blue-500/40'    },
  { name: 'Urgent Needs',         bg: 'bg-cyan-500',    shadow: 'shadow-cyan-500/40'    },
  { name: 'Intervention Areas',   bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/40' },
  { name: 'Emerging Phenomena',   bg: 'bg-amber-500',   shadow: 'shadow-amber-500/40'   },
  { name: 'Emotional Struggles',  bg: 'bg-purple-500',  shadow: 'shadow-purple-500/40'  },
];

const satellites2: Partner[] = [
  { name: 'University Professors',  bg: 'bg-blue-500',    shadow: 'shadow-blue-500/40'    },
  { name: 'Experienced Teachers',   bg: 'bg-cyan-500',    shadow: 'shadow-cyan-500/40'    },
  { name: 'Learning Designers',     bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/40' },
  { name: 'Multimedia Teams',       bg: 'bg-amber-500',   shadow: 'shadow-amber-500/40'   },
  { name: 'Integrators',            bg: 'bg-purple-500',  shadow: 'shadow-purple-500/40'  },
];

const satellites3: Partner[] = [
  { name: 'Scenario-driven',        bg: 'bg-blue-500',    shadow: 'shadow-blue-500/40'    },
  { name: 'Immersive',              bg: 'bg-cyan-500',    shadow: 'shadow-cyan-500/40'    },
  { name: 'Experience-based',       bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/40' },
  { name: 'Engagement Strategies',  bg: 'bg-amber-500',   shadow: 'shadow-amber-500/40'   },
  { name: 'Teach Toolkits',         bg: 'bg-purple-500',  shadow: 'shadow-purple-500/40'  },
];

const RADIUS = 200;
const STAGGER_MS = 180;
const PHASE_2_SCALE = 0.55;
const PHASE_2_SHIFT_PX = 300;
const PHASE_2_TRANSITION_MS = 1400;
const ARROW_DRAW_MS = 600;
const CIRCLE_DELAY_AFTER_ARROW_MS = 400;
const ARROW_LENGTH = 200;
const CAMERA_PAN_DELAY_MS = 0;
const CAMERA_PAN_DURATION_MS = PHASE_2_TRANSITION_MS;
const CAMERA_PAN_SHIFT_PCT = 28;
const SATELLITE_RADIUS = 200;
const ARROW_PHASE_3_SCALE = 0.7;
const ARROW_PHASE_3_SHIFT_PX = 50;
const ARROW_PHASE_3_TRANSITION_MS = 500;
const P3_LEFT_PCT = 106;
const ARROW_2_LEFT_PCT = 84;
const P4_LEFT_PCT = 134;
const ARROW_3_LEFT_PCT = 112;

// === Phase 8 — cycle finale knobs ===
const CYCLE_RADIUS = 180;
const CYCLE_CIRCLE_VISUAL_RADIUS = 78;
const CYCLE_CURVE_OFFSET = 32;
const PHASE_8_TRANSITION_MS = PHASE_2_TRANSITION_MS;
const CYCLE_SVG_SIZE = 700;

function curvedArrowPath(
  startAngleDeg: number,
  endAngleDeg: number,
  R: number,
  r: number,
  curveOffset: number,
): string {
  const startA = (startAngleDeg * Math.PI) / 180;
  const endA = (endAngleDeg * Math.PI) / 180;
  const sc = { x: R * Math.cos(startA), y: R * Math.sin(startA) };
  const ec = { x: R * Math.cos(endA), y: R * Math.sin(endA) };
  const dx = ec.x - sc.x;
  const dy = ec.y - sc.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / dist;
  const uy = dy / dist;
  const sp = { x: sc.x + r * ux, y: sc.y + r * uy };
  const ep = { x: ec.x - r * ux, y: ec.y - r * uy };
  const mid = { x: (sp.x + ep.x) / 2, y: (sp.y + ep.y) / 2 };
  const midDist = Math.sqrt(mid.x * mid.x + mid.y * mid.y);
  const outX = mid.x / midDist;
  const outY = mid.y / midDist;
  const ctrl = { x: mid.x + curveOffset * outX, y: mid.y + curveOffset * outY };
  return `M ${sp.x.toFixed(1)} ${sp.y.toFixed(1)} Q ${ctrl.x.toFixed(1)} ${ctrl.y.toFixed(1)} ${ep.x.toFixed(1)} ${ep.y.toFixed(1)}`;
}

const cycleArrowPaths = [
  curvedArrowPath(-90,  0,   CYCLE_RADIUS, CYCLE_CIRCLE_VISUAL_RADIUS, CYCLE_CURVE_OFFSET),
  curvedArrowPath(  0, 90,   CYCLE_RADIUS, CYCLE_CIRCLE_VISUAL_RADIUS, CYCLE_CURVE_OFFSET),
  curvedArrowPath( 90, 180,  CYCLE_RADIUS, CYCLE_CIRCLE_VISUAL_RADIUS, CYCLE_CURVE_OFFSET),
  curvedArrowPath(180, 270,  CYCLE_RADIUS, CYCLE_CIRCLE_VISUAL_RADIUS, CYCLE_CURVE_OFFSET),
];

export function PartnershipModel() {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [visibleSatelliteCount, setVisibleSatelliteCount] = useState(0);
  const [visibleSatelliteCount2, setVisibleSatelliteCount2] = useState(0);
  const [visibleSatelliteCount3, setVisibleSatelliteCount3] = useState(0);
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
    if (phase === 8) {
      setCameraStage(0);
    }
    if (phase === 0 || phase === 1) {
      setCameraStage(0);
    }
  }, [phase]);

  const handleCenterClick = useCallback(() => {
    if (phase === 0) {
      setPhase(1);
      setVisibleCount(0);
      for (let i = 1; i <= partners.length; i++) {
        setTimeout(() => setVisibleCount(i), i * STAGGER_MS);
      }
    } else if (phase === 1 && visibleCount === partners.length) {
      setPhase(2);
    } else if (phase === 2 && cameraStage === 1) {
      setPhase(3);
      setVisibleSatelliteCount(0);
      for (let i = 1; i <= satellites.length; i++) {
        setTimeout(() => setVisibleSatelliteCount(i), i * STAGGER_MS);
      }
    } else if (phase === 3 && visibleSatelliteCount === satellites.length) {
      setPhase(4);
    } else if (phase === 4 && cameraStage === 2) {
      setPhase(5);
      setVisibleSatelliteCount2(0);
      for (let i = 1; i <= satellites2.length; i++) {
        setTimeout(() => setVisibleSatelliteCount2(i), i * STAGGER_MS);
      }
    } else if (phase === 5 && visibleSatelliteCount2 === satellites2.length) {
      setPhase(6);
    } else if (phase === 6 && cameraStage === 3) {
      setPhase(7);
      setVisibleSatelliteCount3(0);
      for (let i = 1; i <= satellites3.length; i++) {
        setTimeout(() => setVisibleSatelliteCount3(i), i * STAGGER_MS);
      }
    } else if (phase === 7 && visibleSatelliteCount3 === satellites3.length) {
      setPhase(8);
    } else if (phase === 8) {
      setPhase(0);
      setVisibleCount(0);
      setVisibleSatelliteCount(0);
      setVisibleSatelliteCount2(0);
      setVisibleSatelliteCount3(0);
    }
  }, [phase, visibleCount, visibleSatelliteCount, visibleSatelliteCount2, visibleSatelliteCount3, cameraStage]);

  const positions = partners.map((_, i) => {
    const angle = ((-90 + i * 72) * Math.PI) / 180;
    return { x: Math.cos(angle) * RADIUS, y: Math.sin(angle) * RADIUS };
  });
  const satellitePositions = satellites.map((_, i) => {
    const angle = ((-90 + i * 72) * Math.PI) / 180;
    return { x: Math.cos(angle) * SATELLITE_RADIUS, y: Math.sin(angle) * SATELLITE_RADIUS };
  });
  const satellite2Positions = satellites2.map((_, i) => {
    const angle = ((-90 + i * 72) * Math.PI) / 180;
    return { x: Math.cos(angle) * SATELLITE_RADIUS, y: Math.sin(angle) * SATELLITE_RADIUS };
  });
  const satellite3Positions = satellites3.map((_, i) => {
    const angle = ((-90 + i * 72) * Math.PI) / 180;
    return { x: Math.cos(angle) * SATELLITE_RADIUS, y: Math.sin(angle) * SATELLITE_RADIUS };
  });

  const isPhase8       = phase === 8;
  const isCenterShrunk = phase >= 2 && !isPhase8;
  const isP2Shrunk     = phase >= 4 && !isPhase8;
  const isP3Shrunk     = phase >= 6 && !isPhase8;
  const isArrow1Drawn  = phase >= 2;
  const isArrow1Small  = phase >= 3;
  const isArrow2Drawn  = phase >= 4;
  const isArrow2Small  = phase >= 5;
  const isArrow3Drawn  = phase >= 6;
  const isArrow3Small  = phase >= 7;
  const isP2Visible    = phase >= 2;
  const isP3Visible    = phase >= 4;
  const isP4Visible    = phase >= 6;

  const centerTransform = isPhase8
    ? `translate3d(0, ${-CYCLE_RADIUS}px, 0) scale(1)`
    : isCenterShrunk
      ? `translate3d(${-PHASE_2_SHIFT_PX}px, 0, 0) scale(${PHASE_2_SCALE})`
      : `translate3d(0, 0, 0) scale(1)`;

  const p2Transform = isPhase8
    ? `translate3d(calc(-28vw + ${CYCLE_RADIUS}px), 0, 0) scale(1)`
    : isP2Shrunk
      ? `translate3d(${-PHASE_2_SHIFT_PX}px, 0, 0) scale(${PHASE_2_SCALE})`
      : `translate3d(0, 0, 0) scale(1)`;

  const p3Transform = isPhase8
    ? `translate3d(-56vw, ${CYCLE_RADIUS}px, 0) scale(1)`
    : isP3Shrunk
      ? `translate3d(${-PHASE_2_SHIFT_PX}px, 0, 0) scale(${PHASE_2_SCALE})`
      : `translate3d(0, 0, 0) scale(1)`;

  const p4Transform = isPhase8
    ? `translate3d(calc(-84vw - ${CYCLE_RADIUS}px), 0, 0) scale(1)`
    : `translate3d(0, 0, 0) scale(1)`;

  const centerTransition = `transform ${PHASE_2_TRANSITION_MS}ms ease-in-out`;

  const satelliteTransition = isPhase8
    ? `opacity ${PHASE_8_TRANSITION_MS}ms ease-in-out, transform ${PHASE_8_TRANSITION_MS}ms ease-in-out`
    : undefined;

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
      : phase === 7
      ? 'Click p4 to see the full cycle →'
      : 'Click p4 again to replay';

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-white flex flex-col">
      <header className="px-12 pt-8 pb-4">
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
          Partnership &amp; Collaboration Model
        </h1>
        <p className="mt-2 text-base md:text-lg text-slate-500">
          How our Professional Learning platform connects the ecosystem
        </p>
      </header>

      <div className="flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            transform: `translateX(-${cameraStage * CAMERA_PAN_SHIFT_PCT}%)`,
            transition: `transform ${CAMERA_PAN_DURATION_MS}ms ease-in-out`,
          }}
        >

          {/* Center pentagon */}
          <div
            className="absolute"
            style={{
              top: '50%',
              left: '50%',
              transform: centerTransform,
              transition: centerTransition,
              willChange: 'transform',
            }}
          >
            <div className="relative" style={{ width: 0, height: 0 }}>
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
                      opacity: isPhase8 ? 0 : isVisible ? 1 : 0,
                      transition: satelliteTransition,
                    }}
                  >
                    {p.name}
                  </div>
                );
              })}
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

          {/* Arrow 1 */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '50%',
              left: '56%',
              transform: isArrow1Small
                ? `translate(-50%, -50%) translateX(-${ARROW_PHASE_3_SHIFT_PX}px) scale(${ARROW_PHASE_3_SCALE})`
                : `translate(-50%, -50%)`,
              opacity: isPhase8 ? 0 : 1,
              transition: `transform ${ARROW_PHASE_3_TRANSITION_MS}ms ease-in-out, opacity ${PHASE_8_TRANSITION_MS}ms ease-in-out`,
            }}
          >
            <svg width={ARROW_LENGTH} height={24} style={{ display: 'block', overflow: 'visible' }}>
              <line
                x1={0} y1={12} x2={ARROW_LENGTH - 14} y2={12}
                stroke="#64748b" strokeWidth={3} strokeLinecap="round"
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

          {/* p2 + its elements */}
          <div
            className="absolute"
            style={{
              top: '50%',
              left: '78%',
              transform: p2Transform,
              transition: centerTransition,
              willChange: 'transform',
            }}
          >
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
                      opacity: isPhase8 ? 0 : isVisible ? 1 : 0,
                      transition: satelliteTransition,
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
                  width: 155, height: 155, padding: 18, fontSize: 14, lineHeight: 1.3,
                  left: 0, top: 0, border: 'none',
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

          {/* Arrow 2 */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '50%',
              left: `${ARROW_2_LEFT_PCT}%`,
              transform: isArrow2Small
                ? `translate(-50%, -50%) translateX(-${ARROW_PHASE_3_SHIFT_PX}px) scale(${ARROW_PHASE_3_SCALE})`
                : `translate(-50%, -50%)`,
              opacity: isPhase8 ? 0 : 1,
              transition: `transform ${ARROW_PHASE_3_TRANSITION_MS}ms ease-in-out, opacity ${PHASE_8_TRANSITION_MS}ms ease-in-out`,
            }}
          >
            <svg width={ARROW_LENGTH} height={24} style={{ display: 'block', overflow: 'visible' }}>
              <line
                x1={0} y1={12} x2={ARROW_LENGTH - 14} y2={12}
                stroke="#64748b" strokeWidth={3} strokeLinecap="round"
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

          {/* p3 + its collaborators */}
          <div
            className="absolute"
            style={{
              top: '50%',
              left: `${P3_LEFT_PCT}%`,
              transform: p3Transform,
              transition: centerTransition,
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
                      opacity: isPhase8 ? 0 : isVisible ? 1 : 0,
                      transition: satelliteTransition,
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
                  width: 155, height: 155, padding: 18, fontSize: 14, lineHeight: 1.3,
                  left: 0, top: 0, border: 'none',
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

          {/* Arrow 3 */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '50%',
              left: `${ARROW_3_LEFT_PCT}%`,
              transform: isArrow3Small
                ? `translate(-50%, -50%) translateX(-${ARROW_PHASE_3_SHIFT_PX}px) scale(${ARROW_PHASE_3_SCALE})`
                : `translate(-50%, -50%)`,
              opacity: isPhase8 ? 0 : 1,
              transition: `transform ${ARROW_PHASE_3_TRANSITION_MS}ms ease-in-out, opacity ${PHASE_8_TRANSITION_MS}ms ease-in-out`,
            }}
          >
            <svg width={ARROW_LENGTH} height={24} style={{ display: 'block', overflow: 'visible' }}>
              <line
                x1={0} y1={12} x2={ARROW_LENGTH - 14} y2={12}
                stroke="#64748b" strokeWidth={3} strokeLinecap="round"
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

          {/* p4 + its course attributes */}
          <div
            className="absolute"
            style={{
              top: '50%',
              left: `${P4_LEFT_PCT}%`,
              transform: p4Transform,
              transition: centerTransition,
              willChange: 'transform',
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
                      opacity: isPhase8 ? 0 : isVisible ? 1 : 0,
                      transition: satelliteTransition,
                    }}
                  >
                    {s.name}
                  </div>
                );
              })}
              <button
                type="button"
                onClick={handleCenterClick}
                aria-label="Reveal eLearning Course attributes / replay"
                className="absolute flex items-center justify-center rounded-full bg-rose-600 text-white font-semibold text-center shadow-2xl shadow-rose-600/40 cursor-pointer"
                style={{
                  width: 155, height: 155, padding: 18, fontSize: 14, lineHeight: 1.3,
                  left: 0, top: 0, border: 'none',
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

          {/* Cycle arrows — four curved paths forming a clockwise loop. */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: isPhase8 ? 1 : 0,
              transition: `opacity ${PHASE_8_TRANSITION_MS}ms ease-in-out`,
            }}
          >
            <svg
              width={CYCLE_SVG_SIZE}
              height={CYCLE_SVG_SIZE}
              viewBox={`-${CYCLE_SVG_SIZE / 2} -${CYCLE_SVG_SIZE / 2} ${CYCLE_SVG_SIZE} ${CYCLE_SVG_SIZE}`}
              style={{ display: 'block', overflow: 'visible' }}
            >
              <defs>
                <marker
                  id="cycle-arrowhead"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                </marker>
              </defs>
              {cycleArrowPaths.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  stroke="#64748b"
                  strokeWidth={3}
                  fill="none"
                  strokeLinecap="round"
                  markerEnd="url(#cycle-arrowhead)"
                />
              ))}
            </svg>
          </div>

        </div>
      </div>

      <footer className="pb-8 text-center">
        <p className="text-sm text-slate-400">{hintText}</p>
      </footer>
    </section>
  );
}
