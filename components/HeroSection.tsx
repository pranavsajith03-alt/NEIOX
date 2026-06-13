'use client';

import { useEffect, useState } from 'react';

const STATS = [
  { value: '1.2M+', label: 'Tonnes CO₂e\nReduced'  },
  { value: '850+',  label: 'Projects\nDelivered'    },
  { value: '48+',   label: 'Countries\nImpacted'    },
  { value: '320K+', label: 'Tonnes Waste\nUpcycled' },
  { value: '650K+', label: 'Carbon Credits\nIssued' },
];

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const enter = (delay = 0) => ({
    opacity:    mounted ? 1 : 0,
    transform:  mounted ? 'translateY(0)' : 'translateY(28px)',
    filter:     mounted ? 'blur(0px)' : 'blur(3px)',
    transition: `opacity 0.85s cubic-bezier(0.22,1,0.36,1) ${delay}ms,
                 transform 0.85s cubic-bezier(0.22,1,0.36,1) ${delay}ms,
                 filter 0.85s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
  });

  return (
    <section
      id="home"
      className="relative overflow-hidden"
      style={{ minHeight: '100svh', display: 'flex',
               flexDirection: 'column', background: '#060a07' }}
    >
      {/* ── Background ──────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1605745341112-85968b19335b?w=1920&q=85"
          alt="Large container ship at sea"
          className="w-full h-full object-cover"
          style={{
            objectPosition: 'center 40%',
            opacity:        0.85,
            animation:      mounted
              ? 'hero-scale 22s ease-in-out infinite' : 'none',
          }}
        />
        <div className="absolute inset-0" style={{
          background:
            'linear-gradient(105deg,' +
            ' rgba(4,8,5,0.90) 0%,' +
            ' rgba(4,8,5,0.68) 42%,' +
            ' rgba(4,8,5,0.25) 68%,' +
            ' rgba(4,8,5,0.08) 100%)',
        }}/>
        <div className="absolute inset-x-0 top-0" style={{
          height:     '200px',
          background: 'linear-gradient(to bottom, rgba(4,8,5,0.65) 0%, transparent 100%)',
        }}/>
        <div className="absolute inset-x-0 bottom-0" style={{
          height:     '140px',
          background: 'linear-gradient(to top, rgba(4,8,5,0.80) 0%, transparent 100%)',
        }}/>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div
        className="site-container relative z-10 flex flex-col justify-center flex-1"
        style={{ paddingTop: '7.5rem', paddingBottom: '3rem' }}
      >
        <div style={{ maxWidth: '620px' }}>

          {/* Eyebrow */}
          <div style={enter(0)}>
            <span style={{
              display:       'inline-flex',
              alignItems:    'center',
              gap:           '0.5rem',
              fontFamily:    '"JetBrains Mono", monospace',
              fontSize:      '10.5px',
              fontWeight:    500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color:         'rgba(164,212,138,0.9)',
              marginBottom:  '1.5rem',
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#a4d48a', flexShrink: 0,
                animation: 'pulse-dot 2.5s ease-in-out infinite',
              }}/>
              Climate-Industrial Technology
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily:    '"Hanken Grotesk", system-ui, sans-serif',
            fontSize:      'clamp(2.4rem, 5.5vw, 4.25rem)',
            fontWeight:    600,
            lineHeight:    1.08,
            letterSpacing: '-0.02em',
            color:         '#ffffff',
            marginBottom:  '0.5rem',
            ...enter(80),
          }}>
            Building Value From
          </h1>
          <h1 style={{
            fontFamily:    '"Hanken Grotesk", system-ui, sans-serif',
            fontSize:      'clamp(2.4rem, 5.5vw, 4.25rem)',
            fontWeight:    600,
            lineHeight:    1.08,
            letterSpacing: '-0.02em',
            color:         '#a4d48a',
            marginBottom:  '1.25rem',
            ...enter(120),
          }}>
            The World's Biggest<br />Environmental Challenges.
          </h1>

          {/* Sub-headline */}
          <p style={{
            fontFamily:    '"Hanken Grotesk", system-ui, sans-serif',
            fontSize:      'clamp(1rem, 1.8vw, 1.15rem)',
            fontWeight:    400,
            lineHeight:    1.5,
            letterSpacing: '-0.005em',
            color:         'rgba(255,255,255,0.65)',
            marginBottom:  '0.75rem',
            ...enter(160),
          }}>
            Transforming Climate Liabilities Into Industrial Assets.
          </p>

          {/* Body */}
          <p style={{
            fontFamily:   '"Inter", system-ui, sans-serif',
            fontSize:     '15px',
            lineHeight:   1.7,
            color:        'rgba(255,255,255,0.52)',
            maxWidth:     '34rem',
            marginBottom: '2.25rem',
            ...enter(200),
          }}>
            NEIOX develops advanced technologies, materials, and industrial
            solutions that transform pollution, waste, emissions, and resource
            inefficiencies into economic value and measurable climate impact.
          </p>

          {/* Single CTA */}
          <div style={enter(270)}>
            <a 
              href="#solutions"
              className="btn-site-primary sheen"
              style={{ padding: '0.8rem 1.75rem', fontSize: '14px' }}
            >
              Explore Solutions
              <svg viewBox="0 0 24 24" fill="none"
                   style={{ width: '15px', height: '15px', flexShrink: 0 }}
                   stroke="currentColor" strokeWidth={2.5}
                   strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>

        {/* AQI widget — hidden on small phones to avoid overlapping the headline/CTA */}
        <div
          className="absolute glass-widget float hidden sm:block"
          style={{
            bottom:       'calc(96px + 2.5rem)',
            right:        'clamp(1rem, 4vw, 2.5rem)',
            width:        '172px',
            borderRadius: '14px',
            padding:      '1.125rem 1.25rem',
            ...enter(500),
          }}
        >
          <div style={{
            position: 'absolute', top: 0, left: '10%', right: '10%',
            height: '1px',
            background:
              'linear-gradient(to right, transparent, rgba(255,255,255,0.9), transparent)',
          }}/>
          <p style={{
            fontFamily:    '"JetBrains Mono", monospace',
            fontSize:      '9px', fontWeight: 500,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color:         'var(--n-outline)', marginBottom: '6px',
          }}>
            AQI Live
          </p>
          <p style={{
            fontFamily:         '"Hanken Grotesk", system-ui, sans-serif',
            fontSize:           '3.25rem', fontWeight: 300,
            lineHeight:         1, color: 'var(--n-primary)',
            marginBottom:       '2px', fontVariantNumeric: 'tabular-nums',
          }}>
            42
          </p>
          <div className="flex items-center gap-1.5" style={{ marginBottom: '2px' }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--n-primary)', flexShrink: 0,
              animation: 'pulse-dot 3s ease-in-out infinite',
            }}/>
            <p style={{
              fontFamily: '"Hanken Grotesk", system-ui, sans-serif',
              fontSize: '13px', fontWeight: 500, color: 'var(--n-primary)',
            }}>
              Good
            </p>
          </div>
          <p style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: '10px', color: 'var(--n-outline)', marginBottom: '10px',
          }}>
            Air Quality Index
          </p>
          <svg viewBox="0 0 80 24" className="w-full" fill="none"
               stroke="var(--n-primary)" strokeWidth="1.75"
               strokeLinecap="round" strokeLinejoin="round">
            <polyline points="0,20 10,16 20,18 30,11 40,13 50,8 60,10 70,5 80,7"/>
          </svg>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute hidden lg:flex flex-col items-center gap-2"
          style={{
            left: '-0.5rem', top: '50%', transform: 'translateY(-50%)',
            opacity:    mounted ? 1 : 0,
            transition: 'opacity 1.1s ease 0.9s',
          }}
          aria-hidden="true"
        >
          <span style={{
            fontFamily:    '"JetBrains Mono", monospace',
            fontSize:      '8px', fontWeight: 500,
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color:         'rgba(255,255,255,0.32)',
            writingMode:   'vertical-rl', transform: 'rotate(180deg)',
          }}>
            Scroll
          </span>
          <div style={{
            width: '1px', height: '52px',
            background: 'rgba(255,255,255,0.12)',
            position: 'relative', overflow: 'hidden', borderRadius: '99px',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '38%',
              background: 'rgba(164,212,138,0.75)', borderRadius: '99px',
              animation: 'scroll-travel 2.2s ease-in-out infinite',
            }}/>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div
        className="relative z-10"
        style={{
          background:           'rgba(6,10,7,0.72)',
          backdropFilter:       'blur(16px) saturate(140%)',
          WebkitBackdropFilter:'blur(16px) saturate(140%)',
          borderTop:           '1px solid rgba(255,255,255,0.06)',
          boxShadow:           'inset 0 1px 0 rgba(255,255,255,0.04)',
          opacity:              mounted ? 1 : 0,
          transition:          'opacity 0.9s ease 0.65s',
        }}
      >
        <div className="site-container">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-6 lg:gap-0">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className={[
                  'flex flex-col py-5',
                  i > 0 ? 'lg:pl-6' : '',
                  i < 4 ? 'lg:pr-6 lg:border-r lg:border-white/[0.07]' : '',
                ].filter(Boolean).join(' ')}
              >
                <p style={{
                  fontFamily:         '"Hanken Grotesk", system-ui, sans-serif',
                  fontSize:           'clamp(1.3rem, 2vw, 1.65rem)',
                  fontWeight:         300,
                  lineHeight:         1,
                  color:              '#a4d48a',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing:      '-0.01em',
                  marginBottom:       '5px',
                }}>
                  {stat.value}
                </p>
                <p style={{
                  fontFamily:    '"JetBrains Mono", monospace',
                  fontSize:      '9.5px', fontWeight: 500,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  color:         'rgba(255,255,255,0.38)',
                  lineHeight:    1.4, whiteSpace: 'pre-line',
                }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hero-scale {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.03); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes scroll-travel {
          0%   { top: -38%; opacity: 0; }
          18%  { opacity: 1; }
          82%  { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
      `}</style>
    </section>
  );
}