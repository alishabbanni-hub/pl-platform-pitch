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

// Satellites around p2 (Structured Discovery Framework)
const satellites: Partner[] = [
  { name: 'Engaging Stakeholders',          bg: 'bg-blue-500',    shadow: 'shadow-blue-500/40'    },
  { name: 'Analyzing the Learning Context', bg: 'bg-cyan-500',    shadow: 'shadow-cyan-500/40'    },
  { name: 'L',                              bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/40' },
  { name: 'Evidence Synthesis',             bg: 'bg-amber-500',   shadow: 'shadow-amber-500/40'   },
  { name: 'Defining Success',               bg: 'bg-purple-500',  shadow: 'shadow-purple-500/40'  },
];

// Satellites around Insights — empty labels for now, unique keys so React is happy.
const satellitesInsights: Partner[] = [
  { name: 'Understanding Challenges', bg: 'bg-blue-500',    shadow: 'shadow-blue-500/40'    },
  { name: 'Building Trust', bg: 'bg-cyan-500',    shadow: 'shadow-cyan-500/40'    },
  { name: 'Learning Priorities', bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/40' },
  { name: 'Opportunity Areas', bg: 'bg-amber-500',   shadow: 'shadow-amber-500/40'   },
  { name: 'insight-slot-5', bg: 'bg-purple-500',  shadow: 'shadow-purple-500/40'  },
];

// Satellites around p3 (Participatory Learning Design)
const satellites2: Partner[] = [
  { name: 'School Leadership',      bg: 'bg-blue-500',    shadow: 'shadow-blue-500/40'    },
  { name: 'Teachers, Students, Staff', bg: 'bg-cyan-500', shadow: 'shadow-cyan-500/40'    },
  { name: 'Education Specialists',  bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/40' },
  { name: 'Learning Designers',     bg: 'bg-amber-500',   shadow: 'shadow-amber-500/40'   },
  { name: 'Multimedia Directors',   bg: 'bg-purple-500',  shadow: 'shadow-purple-500/40'  },
];

// Satellites around p4 (Learning Solution)
const satellites3: Partner[] = [
  { name: 'Multimodal',                    bg: 'bg-blue-500',    shadow: 'shadow-blue-500/40'    },
  { name: 'Evidence-Driven',               bg: 'bg-cyan-500',    shadow: 'shadow-cyan-500/40'    },
  { name: 'Human-Centered',                bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/40' },
  { name: 'Policy-Aligned',                bg: 'bg-amber-500',   shadow: 'shadow-amber-500/40'   },
  { name: 'Accessible, Scalable, Reusable', bg: 'bg-purple-500', shadow: 'shadow-purple-500/40'  },
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

// Horizontal positions along the stage for each pentagon (% of stage width).
// Each pentagon sits CAMERA_PAN_SHIFT_PCT = 28% further right than the previous.
const INSIGHTS_LEFT_PCT = 106;   // new, was P3's old value
const P3_LEFT_PCT = 134;         // shifted right by 28
const P4_LEFT_PCT = 162;         // shifted right by 28
// Horizontal positions for the connecting arrows.
const ARROW_2_LEFT_PCT = 84;     // p2 → Insights
const ARROW_3_LEFT_PCT = 112;    // Insights → p3
const ARROW_4_LEFT_PCT = 140;    // p3 → p4 (new)

// === Phase 10 (cycle finale) knobs ===
const CYCLE_RADIUS = 180;
const CYCLE_CIRCLE_VISUAL_RADIUS = 78;
const CYCLE_ARROW_GAP_PX = 18;
const CYCLE_ARROW_SAGITTA = 14;
const CYCLE_ARROW_COLOR = '#0f172a';
const CYCLE_ARROW_STROKE_WIDTH = 2;
const PHASE_10_TRANSITION_MS = PHASE_2_TRANSITION_MS;
const CYCLE_SVG_SIZE = 700;

const CYCLE_ARROW_START_R = CYCLE_CIRCLE_VISUAL_RADIUS + CYCLE_ARROW_GAP_PX;

// Five circles arranged at 72° intervals starting at 12 o'clock (top).
// [top, upper-right, lower-right, lower-left, upper-left]
const CYCLE_ANGLES_DEG = [-90, -18, 54, 126, 198];
const CYCLE_TARGET_POSITIONS = CYCLE_ANGLES_DEG.map((deg) => {
  const rad = (deg * Math.PI) / 180;
  return {
    x: Math.round(CYCLE_RADIUS * Math.cos(rad)),
    y: Math.round(CYCLE_RADIUS * Math.sin(rad)),
  };
});

function curvedArrowPath(
  startAngleDeg: number,
  endAngleDeg: number,
  R: number,
  r: number,
  sagitta: number,
  offsetX: number = 0,
  offsetY: number = 0,
): string {
  const startA = (startAngleDeg * Math.PI) / 180;
  const endA = (endAngleDeg * Math.PI) / 180;
  const sc = { x: R * Math.cos(startA), y: R * Math.sin(startA) };
  const ec = { x: R * Math.cos(endA), y: R * Math.sin(endA) };
  const startTangent = { x: -Math.sin(startA), y: Math.cos(startA) };
  const endTangent   = { x: -Math.sin(endA),   y: Math.cos(endA)   };
  const sp = { x: sc.x + r * startTangent.x + offsetX, y: sc.y + r * startTangent.y + offsetY };
  const ep = { x: ec.x - r * endTangent.x   + offsetX, y: ec.y - r * endTangent.y   + offsetY };
  const chord = Math.sqrt((ep.x - sp.x) ** 2 + (ep.y - sp.y) ** 2);
  const arcR = (chord * chord) / (8 * sagitta) + sagitta / 2;
  return `M ${sp.x.toFixed(1)} ${sp.y.toFixed(1)} A ${arcR.toFixed(1)} ${arcR.toFixed(1)} 0 0 1 ${ep.x.toFixed(1)} ${ep.y.toFixed(1)}`;
}

// Five cycle arrows connecting the five circles clockwise. Each nudged ~27 px
// outward in its own midangle direction so the cycle looks symmetric.
const cycleArrowPaths = [
  // Educational Partnership (top, -90°) → p2 (upper-right, -18°)  : outward ≈ NE
  curvedArrowPath(-90, -18, CYCLE_RADIUS, CYCLE_ARROW_START_R, CYCLE_ARROW_SAGITTA,  16, -22),
  // p2 (upper-right, -18°) → Insights (lower-right, 54°)          : outward ≈ E
  curvedArrowPath(-18,  54, CYCLE_RADIUS, CYCLE_ARROW_START_R, CYCLE_ARROW_SAGITTA,  26,   8),
  // Insights (lower-right, 54°) → p3 (lower-left, 126°)           : outward ≈ S
  curvedArrowPath( 54, 126, CYCLE_RADIUS, CYCLE_ARROW_START_R, CYCLE_ARROW_SAGITTA,   0,  27),
  // p3 (lower-left, 126°) → p4 (upper-left, 198°)                 : outward ≈ W
  curvedArrowPath(126, 198, CYCLE_RADIUS, CYCLE_ARROW_START_R, CYCLE_ARROW_SAGITTA, -26,   8),
  // p4 (upper-left, 198°) → Educational Partnership (top, 270°)   : outward ≈ NW
  curvedArrowPath(198, 270, CYCLE_RADIUS, CYCLE_ARROW_START_R, CYCLE_ARROW_SAGITTA, -16, -22),
];

export function PartnershipModel() {
  // Phases 0 → 10 (was 0 → 8; inserted phases 4 & 5 for Insights).
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10>(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [visibleSatelliteCount, setVisibleSatelliteCount] = useState(0);
  const [visibleSatelliteCountInsights, setVisibleSatelliteCountInsights] = useState(0);
  const [visibleSatelliteCount2, setVisibleSatelliteCount2] = useState(0);
  const [visibleSatelliteCount3, setVisibleSatelliteCount3] = useState(0);
  // Camera stages 0–4 (was 0–3; added stage 4 to center p4).
  const [cameraStage, setCameraStage] = useState<0 | 1 | 2 | 3 | 4>(0);

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
      const id = setTimeout(() => setCameraStage(4), CAMERA_PAN_DELAY_MS);
      return () => clearTimeout(id);
    }
    if (phase === 10) {
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
      setVisibleSatelliteCountInsights(0);
      for (let i = 1; i <= satellitesInsights.length; i++) {
        setTimeout(() => setVisibleSatelliteCountInsights(i), i * STAGGER_MS);
      }
    } else if (phase === 5 && visibleSatelliteCountInsights === satellitesInsights.length) {
      setPhase(6);
    } else if (phase === 6 && cameraStage === 3) {
      setPhase(7);
      setVisibleSatelliteCount2(0);
      for (let i = 1; i <= satellites2.length; i++) {
        setTimeout(() => setVisibleSatelliteCount2(i), i * STAGGER_MS);
      }
    } else if (phase === 7 && visibleSatelliteCount2 === satellites2.length) {
      setPhase(8);
    } else if (phase === 8 && cameraStage === 4) {
      setPhase(9);
      setVisibleSatelliteCount3(0);
      for (let i = 1; i <= satellites3.length; i++) {
        setTimeout(() => setVisibleSatelliteCount3(i), i * STAGGER_MS);
      }
    } else if (phase === 9 && visibleSatelliteCount3 === satellites3.length) {
      setPhase(10);
    } else if (phase === 10) {
      setPhase(0);
      setVisibleCount(0);
      setVisibleSatelliteCount(0);
      setVisibleSatelliteCountInsights(0);
      setVisibleSatelliteCount2(0);
      setVisibleSatelliteCount3(0);
    }
  }, [phase, visibleCount, visibleSatelliteCount, visibleSatelliteCountInsights, visibleSatelliteCount2, visibleSatelliteCount3, cameraStage]);

  const positions = partners.map((_, i) => {
    const angle = ((-90 + i * 72) * Math.PI) / 180;
    return { x: Math.cos(angle) * RADIUS, y: Math.sin(angle) * RADIUS };
  });
  const satellitePositions = satellites.map((_, i) => {
    const angle = ((-90 + i * 72) * Math.PI) / 180;
    return { x: Math.cos(angle) * SATELLITE_RADIUS, y: Math.sin(angle) * SATELLITE_RADIUS };
  });
  const satelliteInsightsPositions = satellitesInsights.map((_, i) => {
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

  const isCyclePhase = phase === 10;
  const isCenterShrunk    = phase >= 2 && !isCyclePhase;
  const isP2Shrunk        = phase >= 4 && !isCyclePhase;
  const isInsightsShrunk  = phase >= 6 && !isCyclePhase;
  const isP3Shrunk        = phase >= 8 && !isCyclePhase;

  const isArrow1Drawn = phase >= 2;
  const isArrow1Small = phase >= 3;
  const isArrow2Drawn = phase >= 4;   // p2 → Insights
  const isArrow2Small = phase >= 5;
  const isArrow3Drawn = phase >= 6;   // Insights → p3
  const isArrow3Small = phase >= 7;
  const isArrow4Drawn = phase >= 8;   // p3 → p4
  const isArrow4Small = phase >= 9;

  const isP2Visible       = phase >= 2;
  const isInsightsVisible = phase >= 4;
  const isP3Visible       = phase >= 6;
  const isP4Visible       = phase >= 8;

  // Transforms in phase 10 (cycle finale) — 5 nodes on a regular pentagon.
  // Position [0] = center pentagon (top). [1] = p2 (upper-right).
  // [2] = Insights (lower-right). [3] = p3 (lower-left). [4] = p4 (upper-left).
  const centerTransform = isCyclePhase
    ? `translate3d(${CYCLE_TARGET_POSITIONS[0].x}px, ${CYCLE_TARGET_POSITIONS[0].y}px, 0) scale(1)`
    : isCenterShrunk
      ? `translate3d(${-PHASE_2_SHIFT_PX}px, 0, 0) scale(${PHASE_2_SCALE})`
      : `translate3d(0, 0, 0) scale(1)`;

  const p2Transform = isCyclePhase
    ? `translate3d(calc(-28vw + ${CYCLE_TARGET_POSITIONS[1].x}px), ${CYCLE_TARGET_POSITIONS[1].y}px, 0) scale(1)`
    : isP2Shrunk
      ? `translate3d(${-PHASE_2_SHIFT_PX}px, 0, 0) scale(${PHASE_2_SCALE})`
      : `translate3d(0, 0, 0) scale(1)`;

  const insightsTransform = isCyclePhase
    ? `translate3d(calc(-56vw + ${CYCLE_TARGET_POSITIONS[2].x}px), ${CYCLE_TARGET_POSITIONS[2].y}px, 0) scale(1)`
    : isInsightsShrunk
      ? `translate3d(${-PHASE_2_SHIFT_PX}px, 0, 0) scale(${PHASE_2_SCALE})`
      : `translate3d(0, 0, 0) scale(1)`;

  const p3Transform = isCyclePhase
    ? `translate3d(calc(-84vw + ${CYCLE_TARGET_POSITIONS[3].x}px), ${CYCLE_TARGET_POSITIONS[3].y}px, 0) scale(1)`
    : isP3Shrunk
      ? `translate3d(${-PHASE_2_SHIFT_PX}px, 0, 0) scale(${PHASE_2_SCALE})`
      : `translate3d(0, 0, 0) scale(1)`;

  const p4Transform = isCyclePhase
    ? `translate3d(calc(-112vw + ${CYCLE_TARGET_POSITIONS[4].x}px), ${CYCLE_TARGET_POSITIONS[4].y}px, 0) scale(1)`
    : `translate3d(0, 0, 0) scale(1)`;

  const centerTransition = `transform ${PHASE_2_TRANSITION_MS}ms ease-in-out`;

  const satelliteTransition = isCyclePhase
    ? `opacity ${PHASE_10_TRANSITION_MS}ms ease-in-out, transform ${PHASE_10_TRANSITION_MS}ms ease-in-out`
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
      ? 'Click Insights to reveal its circles →'
      : phase === 5 && visibleSatelliteCountInsights < satellitesInsights.length
      ? 'Revealing…'
      : phase === 5
      ? 'Click Insights to see what emerges next →'
      : phase === 6 && cameraStage !== 3
      ? 'Revealing…'
      : phase === 6
      ? 'Click p3 to reveal its collaborators →'
      : phase === 7 && visibleSatelliteCount2 < satellites2.length
      ? 'Revealing…'
      : phase === 7
      ? 'Click p3 to see what emerges next →'
      : phase === 8 && cameraStage !== 4
      ? 'Revealing…'
      : phase === 8
      ? 'Click p4 to reveal the solution attributes →'
      : phase === 9 && visibleSatelliteCount3 < satellites3.length
      ? 'Revealing…'
      : phase === 9
      ? 'Click p4 to see the full cycle →'
      : 'Click p4 again to replay';

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-white flex flex-col">
      <header className="px-12 pt-8 pb-4">
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
          Partnership &amp; Collaboration Model
        </h1>
        <p className="mt-2 text-base md:text-lg text-slate-500">
          School Capability Development &amp; Transformation
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

          {/* Center pentagon (Educational Partnership) */}
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
                      opacity: isCyclePhase ? 0 : isVisible ? 1 : 0,
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
                Educational Partnership
              </button>
            </div>
          </div>

          {/* Arrow 1 (center → p2) */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '50%',
              left: '56%',
              transform: isArrow1Small
                ? `translate(-50%, -50%) translateX(-${ARROW_PHASE_3_SHIFT_PX}px) scale(${ARROW_PHASE_3_SCALE})`
                : `translate(-50%, -50%)`,
              opacity: isCyclePhase ? 0 : 1,
              transition: `transform ${ARROW_PHASE_3_TRANSITION_MS}ms ease-in-out, opacity ${PHASE_10_TRANSITION_MS}ms ease-in-out`,
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

          {/* p2 (Structured Discovery Framework) + its elements */}
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
                      opacity: isCyclePhase ? 0 : isVisible ? 1 : 0,
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
                Structured Discovery Framework
              </button>
            </div>
          </div>

          {/* Arrow 2 (p2 → Insights) */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '50%',
              left: `${ARROW_2_LEFT_PCT}%`,
              transform: isArrow2Small
                ? `translate(-50%, -50%) translateX(-${ARROW_PHASE_3_SHIFT_PX}px) scale(${ARROW_PHASE_3_SCALE})`
                : `translate(-50%, -50%)`,
              opacity: isCyclePhase ? 0 : 1,
              transition: `transform ${ARROW_PHASE_3_TRANSITION_MS}ms ease-in-out, opacity ${PHASE_10_TRANSITION_MS}ms ease-in-out`,
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

          {/* Insights + its (currently empty) satellites */}
          <div
            className="absolute"
            style={{
              top: '50%',
              left: `${INSIGHTS_LEFT_PCT}%`,
              transform: insightsTransform,
              transition: centerTransition,
              willChange: 'transform',
            }}
          >
            <div className="relative" style={{ width: 0, height: 0 }}>
              {satellitesInsights.map((s, i) => {
                const isVisible = i < visibleSatelliteCountInsights;
                return (
                  <div
                    key={s.name}
                    className={`absolute flex items-center justify-center rounded-full text-white font-semibold text-sm md:text-base text-center shadow-xl transition-all duration-500 ease-out ${s.bg} ${s.shadow}`}
                    style={{
                      width: 110,
                      height: 110,
                      left: satelliteInsightsPositions[i].x,
                      top: satelliteInsightsPositions[i].y,
                      transform: `translate(-50%, -50%) scale(${isVisible ? 1 : 0.3})`,
                      opacity: isCyclePhase ? 0 : isVisible ? 1 : 0,
                      transition: satelliteTransition,
                    }}
                  >
                    {/* label intentionally empty */}
                  </div>
                );
              })}
              <button
                type="button"
                onClick={handleCenterClick}
                aria-label="Advance to next phase"
                className="absolute flex items-center justify-center rounded-full bg-teal-600 text-white font-semibold text-center shadow-2xl shadow-teal-600/40 cursor-pointer"
                style={{
                  width: 155, height: 155, padding: 18, fontSize: 14, lineHeight: 1.3,
                  left: 0, top: 0, border: 'none',
                  transform: `translate(-50%, -50%) scale(${isInsightsVisible ? 1 : 0.3})`,
                  opacity: isInsightsVisible ? 1 : 0,
                  pointerEvents: isInsightsVisible ? 'auto' : 'none',
                  transition:
                    `opacity 500ms ease-out ${ARROW_DRAW_MS + CIRCLE_DELAY_AFTER_ARROW_MS}ms, ` +
                    `transform 500ms ease-out ${ARROW_DRAW_MS + CIRCLE_DELAY_AFTER_ARROW_MS}ms`,
                }}
              >
                Insights
              </button>
            </div>
          </div>

          {/* Arrow 3 (Insights → p3) */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '50%',
              left: `${ARROW_3_LEFT_PCT}%`,
              transform: isArrow3Small
                ? `translate(-50%, -50%) translateX(-${ARROW_PHASE_3_SHIFT_PX}px) scale(${ARROW_PHASE_3_SCALE})`
                : `translate(-50%, -50%)`,
              opacity: isCyclePhase ? 0 : 1,
              transition: `transform ${ARROW_PHASE_3_TRANSITION_MS}ms ease-in-out, opacity ${PHASE_10_TRANSITION_MS}ms ease-in-out`,
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

          {/* p3 (Participatory Learning Design) + its collaborators */}
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
                      opacity: isCyclePhase ? 0 : isVisible ? 1 : 0,
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
                Participatory Learning Design
              </button>
            </div>
          </div>

          {/* Arrow 4 (p3 → p4) */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '50%',
              left: `${ARROW_4_LEFT_PCT}%`,
              transform: isArrow4Small
                ? `translate(-50%, -50%) translateX(-${ARROW_PHASE_3_SHIFT_PX}px) scale(${ARROW_PHASE_3_SCALE})`
                : `translate(-50%, -50%)`,
              opacity: isCyclePhase ? 0 : 1,
              transition: `transform ${ARROW_PHASE_3_TRANSITION_MS}ms ease-in-out, opacity ${PHASE_10_TRANSITION_MS}ms ease-in-out`,
            }}
          >
            <svg width={ARROW_LENGTH} height={24} style={{ display: 'block', overflow: 'visible' }}>
              <line
                x1={0} y1={12} x2={ARROW_LENGTH - 14} y2={12}
                stroke="#64748b" strokeWidth={3} strokeLinecap="round"
                strokeDasharray={ARROW_LENGTH}
                style={{
                  strokeDashoffset: isArrow4Drawn ? 0 : ARROW_LENGTH,
                  transition: `stroke-dashoffset ${ARROW_DRAW_MS}ms ease-out`,
                }}
              />
              <polygon
                points={`${ARROW_LENGTH},12 ${ARROW_LENGTH - 14},5 ${ARROW_LENGTH - 14},19`}
                fill="#64748b"
                style={{
                  opacity: isArrow4Drawn ? 1 : 0,
                  transition: `opacity 200ms ease-out ${ARROW_DRAW_MS - 200}ms`,
                }}
              />
            </svg>
          </div>

          {/* p4 (Learning Solution) + its solution attributes */}
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
                      opacity: isCyclePhase ? 0 : isVisible ? 1 : 0,
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
                aria-label="Reveal Learning Solution attributes / replay"
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
                Learning Solution
              </button>
            </div>
          </div>

          {/* Cycle arrows (5 curved paths forming a pentagon-shaped loop) */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: isCyclePhase ? 1 : 0,
              transition: `opacity ${PHASE_10_TRANSITION_MS}ms ease-in-out`,
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
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={CYCLE_ARROW_COLOR} />
                </marker>
              </defs>
              {cycleArrowPaths.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  stroke={CYCLE_ARROW_COLOR}
                  strokeWidth={CYCLE_ARROW_STROKE_WIDTH}
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
