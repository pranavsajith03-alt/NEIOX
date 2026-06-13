'use client';

import { useEffect, useRef, useState } from 'react';

const STATS = [
  { value: 1.2,  suffix: 'M+', label: 'Tonnes CO₂e\nReduced'  },
  { value: 850,  suffix: '+',  label: 'Projects\nDelivered'    },
  { value: 48,   suffix: '+',  label: 'Countries\nImpacted'    },
  { value: 320,  suffix: 'K+', label: 'Tonnes Waste\nUpcycled' },
  { value: 650,  suffix: 'K+', label: 'Carbon Credits\nIssued' },
];

const INDICATORS = [
  'Emission Reduction Potential',
  'Industrial Waste Utilisation',
  'Resource Recovery',
  'Fuel Efficiency Improvements',
  'Asset Protection',
  'Technology Deployment',
  'Industrial Adoption',
  'Research Collaborations',
  'Strategic Partnerships',
];

function Counter({
  end, suffix, active,
}: { end: number; suffix: string; active: boolean }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!active) return;
    let startTs: number | null = null;
    const duration = 2000;
    const raf = requestAnimationFrame(function step(ts) {
      if (!startTs) startTs = ts;
      const p = Math.min((ts - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(parseFloat((eased * end).toFixed(end % 1 === 0 ? 0 : 1)));
      if (p < 1) requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(raf);
  }, [end, active]);

  const display = end % 1 === 0 ? Math.floor(n) : n.toFixed(1);
  return <>{display}{suffix}</>;
}

export default function ImpactSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="impact"
      style={{
        background: 'var(--n-inverse-surface)',
        position:   'relative',
        overflow:   'hidden',
        padding:    '5rem 0',
      }}
    >
      {/* Background image */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <img
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=60"
          alt="Forest"
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', opacity: 0.16,
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background:
            'linear-gradient(100deg,' +
            ' rgba(33,49,69,0.98) 0%,' +
            ' rgba(33,49,69,0.85) 40%,' +
            ' rgba(33,49,69,0.60) 100%)',
        }}/>
      </div>

      <div className="site-container" style={{ position: 'relative', zIndex: 1 }}>

        {/* Label */}
        <p className="text-label" style={{
          color:        'var(--n-primary-fixed-dim)',
          marginBottom: '1.5rem',
          opacity:      visible ? 1 : 0,
          transition:   'opacity 0.7s ease',
        }}>
          Measuring What Matters
        </p>

        {/* Two-column — stacked on mobile/tablet, 1fr/2fr from lg */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 lg:gap-16 items-center">

          {/* Left */}
          <div style={{
            opacity:    visible ? 1 : 0,
            transform:  visible ? 'none' : 'translateY(24px)',
            transition: 'opacity 0.85s ease, transform 0.85s ease',
          }}>
            <h2 style={{
              fontFamily:    '"Hanken Grotesk", system-ui, sans-serif',
              fontSize:      'clamp(1.75rem, 3vw, 2.5rem)',
              fontWeight:    500, lineHeight: 1.2,
              letterSpacing: '-0.01em',
              color:         'var(--n-inverse-on-surface)',
              marginBottom:  '1.5rem',
            }}>
              Measurable Impact.<br />Real Change.
            </h2>

            {/* Key indicators */}
            <div style={{
              display:       'flex',
              flexDirection: 'column',
              gap:           '0.5rem',
              marginBottom:  '2rem',
            }}>
              {INDICATORS.slice(0, 6).map(ind => (
                <div key={ind} style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                }}>
                  <div style={{
                    width: '4px', height: '4px', borderRadius: '50%',
                    background: 'var(--n-primary-fixed-dim)', flexShrink: 0,
                  }}/>
                  <p style={{
                    fontFamily: '"Inter", system-ui, sans-serif',
                    fontSize:   '12.5px', lineHeight: 1.4,
                    color:      'rgba(234,241,255,0.55)',
                  }}>
                    {ind}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — stat counters — 2 cols on mobile, 3 on tablet, 5 from lg */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-8 lg:gap-0">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={[
                  i > 0 ? 'lg:pl-6 lg:border-l lg:border-white/[0.08]' : '',
                  i < 4 ? 'lg:pr-6' : '',
                ].filter(Boolean).join(' ')}
                style={{
                  opacity:    visible ? 1 : 0,
                  transform:  visible ? 'none' : 'translateY(16px)',
                  transition: `opacity 0.8s ease ${i * 80}ms,
                               transform 0.8s ease ${i * 80}ms`,
                }}
              >
                {/* Stat value */}
                <p style={{
                  fontFamily:         '"Hanken Grotesk", system-ui, sans-serif',
                  fontSize:           'clamp(1.9rem, 3vw, 2.75rem)',
                  fontWeight:         300,
                  lineHeight:         1,
                  color:              'var(--n-primary-fixed-dim)',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing:      '-0.01em',
                  marginBottom:       '6px',
                }}>
                  <Counter end={s.value} suffix={s.suffix} active={visible}/>
                </p>
                {/* Rule */}
                <div style={{
                  height: '1px', background: 'rgba(255,255,255,0.10)',
                  marginBottom: '8px', width: '80%',
                }}/>
                {/* Label */}
                <p style={{
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontSize:   '11px', lineHeight: 1.45,
                  color:      'rgba(234,241,255,0.45)',
                  whiteSpace: 'pre-line',
                }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}