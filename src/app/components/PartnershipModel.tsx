'use client';

import { useCallback, useState } from 'react';

interface Partner {
  name: string;
  bg: string;        // Tailwind background color class
  shadow: string;    // Tailwind shadow color class
}

const partners: Partner[] = [
  { name: 'Partner 1', bg: 'bg-blue-500',    shadow: 'shadow-blue-500/40'    },
  { name: 'Partner 2', bg: 'bg-cyan-500',    shadow: 'shadow-cyan-500/40'    },
  { name: 'Partner 3', bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/40' },
  { name: 'Partner 4', bg: 'bg-amber-500',   shadow: 'shadow-amber-500/40'   },
  { name: 'Partner 5', bg: 'bg-purple-500',  shadow: 'shadow-purple-500/40'  },
];

// Distance from center to each partner circle's center, in pixels.
const RADIUS = 200;
// Stagger between each partner appearing, in ms.
const STAGGER_MS = 180;

export function PartnershipModel() {
  const [visibleCount, setVisibleCount] = useState(0);

  const handleCenterClick = useCallback(() => {
    setVisibleCount(0);
    // Schedule each partner to appear with a stagger.
    for (let i = 1; i <= partners.length; i++) {
      setTimeout(() => setVisibleCount(i), i * STAGGER_MS);
    }
  }, []);

  // 5 evenly distributed angles, starting at 12 o'clock and going clockwise.
  const positions = partners.map((_, i) => {
    const angle = ((-90 + i * 72) * Math.PI) / 180;
    return {
      x: Math.cos(angle) * RADIUS,
      y: Math.sin(angle) * RADIUS,
    };
  });

  const hintText =
    visibleCount === 0
      ? 'Click the center to reveal partners'
      : visibleCount < partners.length
      ? 'Revealing…'
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

      {/* Stage — fills the remaining vertical space; pentagon is centered inside it. */}
      <div className="flex-1 flex items-center justify-center">
      <div className="relative mt-30" style={{ width: 0, height: 0 }}>       
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

          {/* Center circle — clickable. */}
          <button
            type="button"
            onClick={handleCenterClick}
            aria-label="Reveal partners"
            className="absolute flex items-center justify-center rounded-full bg-slate-900 text-white font-semibold text-xl md:text-2xl shadow-2xl shadow-slate-900/30 cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
            style={{
              width: 170,
              height: 170,
              left: 0,
              top: 0,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <span className="text-center leading-tight">
              Your
              <br />
              Platform
            </span>
          </button>
        </div>
      </div>

      {/* Hint — its own row at the bottom. */}
      <footer className="pb-8 text-center">
        <p className="text-sm text-slate-400">{hintText}</p>
      </footer>
    </section>
  );
}
