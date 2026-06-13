'use client';
/**
 * PollutionHero.tsx
 * 
 * Scroll-driven pollution → clean transformation hero.
 * 
 * HOW THE WIPE WORKS:
 * - Two full-screen layers are stacked. The "clean" layer sits on top.
 * - A CSS clip-path: inset(0 X% 0 0) masks the clean layer, where X starts
 *   at 100% (fully hidden) and scrolls to 0% (fully revealed), driven by
 *   a GSAP ScrollTrigger scrub. This gives a perfect left→right reveal
 *   at exactly 60fps with no layout reflow — just GPU-composited clip-path.
 * - A 3px divider line tracks the wipe edge for the "transformation line" effect.
 * - The section pins for 150vh of scroll, then releases naturally.
 * 
 * INSTALL:
 *   npm install gsap
 * 
 * USAGE:
 *   Replace your existing HeroSection with <PollutionHero />
 *   in app/page.tsx. It self-contains all scroll logic.
 */

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Image URLs ────────────────────────────────────────────────────────
   Copy both uploaded images into your /public/images/ folder:
     /public/images/ship-polluted.png  ← ChatGPT_Image_Jun_7__2026__08_22_28_AM.png
     /public/images/ship-clean.png     ← ChatGPT_Image_Jun_7__2026__08_22_53_AM.png
─────────────────────────────────────────────────────────────────────── */
// ─── TEMPORARY: using direct URLs until local images are confirmed working ───
// Once you verify the animation works, swap back to:
//  
 const IMG_POLLUTED = '/images/ship-polluted.png';
 const IMG_CLEAN  = '/images/ship-clean.png';

export default function PollutionHero({ aqiWidget }: { aqiWidget?: ReactNode }) {
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const cleanRef    = useRef<HTMLDivElement>(null);
  const lineRef     = useRef<HTMLDivElement>(null);
  const problemRef  = useRef<HTMLDivElement>(null);
  const solutionRef = useRef<HTMLDivElement>(null);
  const statRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      /* ── Master timeline, pinned for 150vh of scroll ── */
      /* Force clean layer hidden immediately — before any scroll */
      gsap.set(cleanRef.current, {
        clipPath: 'inset(0 100% 0 0)',
        WebkitClipPath: 'inset(0 100% 0 0)',
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger:    wrapperRef.current,
          start:      'top top',
          end:        '+=150%',
          scrub:      0.9,           // slight lag = cinematic feel
          pin:        true,
          pinSpacing: true,
          anticipatePin: 1,
        },
      });

      /* ── 1. Wipe the clean layer in from left ── */
      tl.fromTo(
        cleanRef.current,
        { clipPath: 'inset(0 100% 0 0)', WebkitClipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)',   WebkitClipPath: 'inset(0 0% 0 0)',   ease: 'none' },
        0
      );

      /* ── 2. Divider line tracks wipe ── */
      tl.fromTo(
        lineRef.current,
        { left: '0%' },
        { left: '100%', ease: 'none' },
        0
      );

      /* ── 3. Problem text: visible → fade out as wipe reaches 40% ── */
      tl.fromTo(
        problemRef.current,
        { opacity: 1, y: 0 },
        { opacity: 0, y: -28, ease: 'power2.in' },
        0        // starts immediately, completes at ~40% of scrub
      );

      /* ── 4. Solution text: fade in after wipe hits 35% ── */
      tl.fromTo(
        solutionRef.current,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, ease: 'power3.out' },
        0.35     // starts at 35% of the scrub range
      );

      /* ── 5. Stat card pops in near end ── */
      tl.fromTo(
        statRef.current,
        { opacity: 0, scale: 0.88, y: 20 },
        { opacity: 1, scale: 1,    y: 0, ease: 'back.out(1.6)' },
        0.72
      );

    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* ── Sticky wrapper — GSAP pins this ─────────────────────── */}
      <div ref={wrapperRef} id="hero"
           style={{ position: 'relative', height: '100svh', overflow: 'hidden' }}>

        {/* ═══════════════════════════════════════════════
            POLLUTED LAYER (bottom — always visible)
        ═══════════════════════════════════════════════ */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: '#1a1510',
        }}>
          {/* Ship photo — dark, desaturated */}
          <img src={IMG_POLLUTED} alt="Industrial polluted ocean"
               style={{
                 position:    'absolute', inset: 0,
                 width:       '100%', height: '100%',
                 objectFit:   'cover', objectPosition: 'center 55%',
                 filter:      'brightness(0.82) saturate(0.92) contrast(1.05)',
                 zIndex:      1,
                 display:     'block',
               }}
               onError={(e) => {
                 // Fallback: show a dark gradient if image fails to load
                 (e.currentTarget as HTMLImageElement).style.display = 'none';
                 console.error('Polluted ship image failed to load. Check /public/images/ship-polluted.png exists.');
               }}
             />

          {/* Darken edges only — light touch so the photo shows clearly */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            background: `
              radial-gradient(ellipse 100% 35% at 50% 0%,   rgba(0,0,0,0.45) 0%, transparent 100%),
              radial-gradient(ellipse 100% 20% at 50% 100%, rgba(0,0,0,0.40) 0%, transparent 100%)
            `,
            pointerEvents: 'none',
          }} />

          {/* Animated smoke wisps */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}><SmokeWisps /></div>

          {/* Dead/dying vegetation silhouettes at bottom */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%', zIndex: 4 }}>
            <svg viewBox="0 0 1440 200" preserveAspectRatio="none"
                 style={{ position: 'absolute', bottom: 0, width: '100%', height: '100%' }}>
              {/* Dead tree silhouettes — bare branches */}
              <g fill="rgba(8,10,5,0.92)">
                {/* Left dead tree */}
                <rect x="60" y="60" width="6" height="140" rx="2"/>
                <line x1="63" y1="100" x2="30" y2="70" stroke="rgba(8,10,5,0.92)" strokeWidth="4"/>
                <line x1="63" y1="90"  x2="15" y2="55" stroke="rgba(8,10,5,0.80)" strokeWidth="3"/>
                <line x1="63" y1="110" x2="90" y2="80" stroke="rgba(8,10,5,0.92)" strokeWidth="4"/>
                <line x1="63" y1="100" x2="105" y2="68" stroke="rgba(8,10,5,0.75)" strokeWidth="2.5"/>
                <line x1="63" y1="80"  x2="48" y2="60" stroke="rgba(8,10,5,0.65)" strokeWidth="2"/>
                {/* Drooping dead shrub */}
                <ellipse cx="180" cy="185" rx="55" ry="22" fill="rgba(10,14,5,0.70)"/>
                <ellipse cx="155" cy="175" rx="30" ry="16" fill="rgba(8,12,4,0.60)"/>
                <ellipse cx="210" cy="178" rx="35" ry="14" fill="rgba(8,12,4,0.55)"/>
                {/* Second dead tree */}
                <rect x="320" y="80" width="5" height="120" rx="2"/>
                <line x1="322" y1="110" x2="295" y2="88" stroke="rgba(8,10,5,0.85)" strokeWidth="3.5"/>
                <line x1="322" y1="120" x2="348" y2="95" stroke="rgba(8,10,5,0.85)" strokeWidth="3.5"/>
                <line x1="322" y1="100" x2="305" y2="78" stroke="rgba(8,10,5,0.65)" strokeWidth="2"/>
                <line x1="322" y1="108" x2="342" y2="84" stroke="rgba(8,10,5,0.65)" strokeWidth="2"/>
                {/* Withered grass blades */}
                <path d="M400,200 Q408,155 412,140 Q415,155 418,200Z" fill="rgba(15,18,6,0.55)"/>
                <path d="M420,200 Q425,160 430,145 Q433,162 436,200Z" fill="rgba(12,16,5,0.50)"/>
                <path d="M440,200 Q446,170 448,150 Q452,168 455,200Z" fill="rgba(10,14,4,0.45)"/>
                {/* Ground dead earth */}
                <path d="M0,185 Q360,170 720,178 Q1080,186 1440,175 L1440,200 L0,200Z"
                      fill="rgba(6,8,3,0.85)"/>
                <path d="M0,192 Q480,182 960,188 Q1200,192 1440,185 L1440,200 L0,200Z"
                      fill="rgba(4,6,2,0.90)"/>
              </g>
              {/* Wilting/dying leaves falling — scattered */}
              {[
                [200, 120], [280, 90], [380, 140], [150, 160], [340, 110],
              ].map(([x, y], i) => (
                <ellipse key={i} cx={x} cy={y} rx="5" ry="3"
                         fill="rgba(25,22,5,0.55)" transform={`rotate(${i * 35} ${x} ${y})`}/>
              ))}
            </svg>
          </div>

          {/* Acid rain / drizzle effect */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            backgroundImage: `repeating-linear-gradient(
              175deg,
              transparent 0px,
              transparent 3px,
              rgba(20,25,10,0.06) 3px,
              rgba(20,25,10,0.06) 4px
            )`,
            pointerEvents: 'none',
          }} />
        </div>

        {/* ═══════════════════════════════════════════════
            CLEAN LAYER (top — clipped, revealed by wipe)
        ═══════════════════════════════════════════════ */}
        <div ref={cleanRef}
             style={{
               position:   'absolute', inset: 0, zIndex: 10,
               clipPath:   'inset(0 100% 0 0)',  /* hidden right — GSAP animates this */
               willChange: 'clip-path',
               WebkitClipPath: 'inset(0 100% 0 0)',  /* Safari fix */
             }}>

          {/* Clean ocean/sky photo */}
          <img src={IMG_CLEAN} alt="Clean ocean future"
               style={{
                 position:   'absolute', inset: 0,
                 width:      '100%', height: '100%',
                 objectFit:  'cover', objectPosition: 'center 50%',
                 filter:     'brightness(0.90) saturate(1.15) contrast(1.02)',
               }} />

          {/* Gentle vignette only — let the photo speak */}
          <div style={{
            position:   'absolute', inset: 0,
            background: `
              radial-gradient(ellipse 100% 35% at 50% 0%,   rgba(8,25,45,0.40) 0%, transparent 100%),
              radial-gradient(ellipse 100% 20% at 50% 100%, rgba(0,20,10,0.30) 0%, transparent 100%)
            `,
          }} />

          {/* Living greenery silhouettes — nature thriving */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%', zIndex: 2 }}>
            <svg viewBox="0 0 1440 200" preserveAspectRatio="none"
                 style={{ position: 'absolute', bottom: 0, width: '100%', height: '100%' }}>
              <g>
                {/* Full lush tree left */}
                <rect x="62" y="110" width="7" height="90" rx="3" fill="rgba(30,65,25,0.85)"/>
                <ellipse cx="65" cy="105" rx="42" ry="38" fill="rgba(35,90,30,0.82)"/>
                <ellipse cx="50" cy="95"  rx="28" ry="24" fill="rgba(45,110,35,0.75)"/>
                <ellipse cx="82" cy="98"  rx="30" ry="22" fill="rgba(50,105,40,0.70)"/>
                <ellipse cx="65" cy="82"  rx="22" ry="18" fill="rgba(60,125,45,0.68)"/>
                {/* Bush cluster */}
                <ellipse cx="175" cy="188" rx="55" ry="28" fill="rgba(40,100,32,0.78)"/>
                <ellipse cx="150" cy="180" rx="35" ry="22" fill="rgba(50,115,38,0.72)"/>
                <ellipse cx="200" cy="183" rx="40" ry="20" fill="rgba(45,108,35,0.68)"/>
                <ellipse cx="175" cy="170" rx="28" ry="18" fill="rgba(60,130,45,0.65)"/>
                {/* Second tree */}
                <rect x="318" y="100" width="6" height="100" rx="3" fill="rgba(28,60,22,0.85)"/>
                <ellipse cx="321" cy="95"  rx="38" ry="34" fill="rgba(38,95,30,0.80)"/>
                <ellipse cx="305" cy="88"  rx="25" ry="20" fill="rgba(48,112,38,0.72)"/>
                <ellipse cx="338" cy="90"  rx="28" ry="22" fill="rgba(52,108,42,0.68)"/>
                {/* Lush grass blades */}
                <path d="M390,200 Q396,148 400,128 Q404,148 408,200Z" fill="rgba(45,110,35,0.70)"/>
                <path d="M408,200 Q414,155 420,138 Q424,156 428,200Z" fill="rgba(50,120,38,0.65)"/>
                <path d="M428,200 Q433,162 437,144 Q441,162 445,200Z" fill="rgba(42,105,33,0.60)"/>
                <path d="M445,200 Q449,168 453,152 Q457,168 461,200Z" fill="rgba(55,125,42,0.58)"/>
                {/* Rich fertile ground */}
                <path d="M0,182 Q360,172 720,178 Q1080,184 1440,174 L1440,200 L0,200Z"
                      fill="rgba(22,55,18,0.80)"/>
                <path d="M0,190 Q480,183 960,188 Q1200,191 1440,184 L1440,200 L0,200Z"
                      fill="rgba(18,45,14,0.88)"/>
              </g>
              {/* Floating petals / seeds */}
              {[
                [220, 130, 6, 3.5], [290, 95, 5, 3], [370, 148, 7, 4],
                [160, 165, 4, 2.5], [340, 115, 5, 3],
              ].map(([x, y, rx, ry], i) => (
                <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry}
                         fill="rgba(90,190,60,0.45)"
                         transform={`rotate(${i * 40} ${x} ${y})`}/>
              ))}
            </svg>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            TRANSFORMATION DIVIDER LINE
        ═══════════════════════════════════════════════ */}
        <div ref={lineRef}
             style={{
               position:   'absolute', top: 0, bottom: 0,
               left:       '0%', zIndex: 20,
               width:      '3px',
               transform:  'translateX(-50%)',
               willChange: 'left',
               background: 'linear-gradient(to bottom, transparent 0%, rgba(164,212,138,0.9) 20%, #a4d48a 50%, rgba(164,212,138,0.9) 80%, transparent 100%)',
               boxShadow:  '0 0 18px 4px rgba(164,212,138,0.5), 0 0 40px 12px rgba(63,105,44,0.25)',
               pointerEvents: 'none',
             }}>
          {/* Diamond pip at center of line */}
          <div style={{
            position:        'absolute', top: '50%', left: '50%',
            transform:       'translate(-50%, -50%) rotate(45deg)',
            width:           '12px', height: '12px',
            background:      '#a4d48a',
            boxShadow:       '0 0 16px 4px rgba(164,212,138,0.7)',
          }} />
        </div>

        {/* ═══════════════════════════════════════════════
            PROBLEM TEXT (fades out as wipe starts)
        ═══════════════════════════════════════════════ */}
        <div ref={problemRef}
             style={{
               position:  'absolute', inset: 0, zIndex: 30,
               display:   'flex', flexDirection: 'column',
               justifyContent: 'center',
               paddingLeft: 'clamp(2rem, 8vw, 7rem)',
               paddingRight: 'clamp(2rem, 8vw, 7rem)',
               paddingTop: 'clamp(3.5rem, 10vh, 5rem)',
               pointerEvents: 'none',
             }}>
          <p style={{
            fontFamily:    '"JetBrains Mono", monospace',
            fontSize:      'clamp(11px, 1.2vw, 14px)',
            fontWeight:    600, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.92)',
            marginBottom:  '1.25rem',
          }}>
            The Challenge
          </p>
          <h1 style={{
            fontFamily:  '"Hanken Grotesk", system-ui, sans-serif',
            fontSize:    'clamp(2.4rem, 5.5vw, 5rem)',
            fontWeight:  700, lineHeight: 1.04,
            letterSpacing: '-0.025em',
            color:       '#ffffff',
            maxWidth:    '680px',
            marginBottom: '1.5rem',
          }}>
            The Weight of{' '}
            <span style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontStyle:  'italic', fontWeight: 700,
              color:      'rgba(200,180,140,0.95)',
            }}>
              Industrial Pollution.
            </span>
          </h1>
          <p style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize:   'clamp(1rem, 1.4vw, 1.2rem)',
            lineHeight: 1.65, fontWeight: 400,
            color:      'rgba(255,255,255,0.72)',
            maxWidth:   '460px',
          }}>
            Every year, billions of tonnes of emissions, waste, and pollutants
            are released by industry — treated as unavoidable costs of progress.
          </p>

          {/* Scroll nudge */}
          <div style={{
            display:        'flex', alignItems: 'center', gap: '0.75rem',
            marginTop:      '3rem',
          }}>
            <div style={{
              width:        '40px', height: '1px',
              background:   'rgba(255,255,255,0.35)',
            }} />
            <p style={{
              fontFamily:    '"JetBrains Mono", monospace',
              fontSize:      '10px', letterSpacing: '0.2em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
            }}>
              Scroll to transform
            </p>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'rgba(164,212,138,0.7)',
              animation: 'pulse-dot 2s ease-in-out infinite',
            }} />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SOLUTION TEXT (fades in mid-wipe)
        ═══════════════════════════════════════════════ */}
        <div ref={solutionRef}
             style={{
               position:  'absolute', inset: 0, zIndex: 31,
               display:   'flex', flexDirection: 'column',
               justifyContent: 'center',
               paddingLeft: 'clamp(2rem, 8vw, 7rem)',
               paddingRight: 'clamp(2rem, 8vw, 7rem)',
               paddingTop: 'clamp(3.5rem, 10vh, 5rem)',
               opacity:   0,
               pointerEvents: 'none',
             }}>
          <p style={{
            fontFamily:    '"JetBrains Mono", monospace',
            fontSize:      'clamp(11px, 1.2vw, 14px)',
            fontWeight:    600, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: '#c3f5a8',
            marginBottom:  '1.25rem',
          }}>
            The NEIOX Solution
          </p>
          <h1 style={{
            fontFamily:   '"Hanken Grotesk", system-ui, sans-serif',
            fontSize:     'clamp(2.4rem, 5.5vw, 5rem)',
            fontWeight:   700, lineHeight: 1.04,
            letterSpacing: '-0.025em',
            color:        '#ffffff',
            maxWidth:     '720px',
            marginBottom: '1.5rem',
          }}>
            Transforming Climate{' '}
            <span style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontStyle:  'italic', fontWeight: 700,
              color:      '#a4d48a',
            }}>
              Liabilities Into Assets.
            </span>
          </h1>
          <p style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize:   'clamp(1rem, 1.4vw, 1.2rem)',
            lineHeight: 1.65, fontWeight: 400,
            color:      'rgba(255,255,255,0.85)',
            maxWidth:   '480px',
          }}>
            NEIOX develops advanced technologies that transform pollution, waste,
            and emissions into economic value, operational advantages, and
            measurable climate impact.
          </p>
        </div>

        {/* ═══════════════════════════════════════════════
            STAT CARD (appears near end of wipe)
        ═══════════════════════════════════════════════ */}
        <div ref={statRef}
             style={{
               position:       'absolute', bottom: '2.5rem', right: '2.5rem',
               zIndex:         32, opacity: 0,
               width:          '200px',
             }}
             className="hidden lg:block">
          {aqiWidget}
        </div>

      </div>

      {/* ── Keyframe for pulse dot ── */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.7; transform: scale(1);    }
          50%       { opacity: 1;   transform: scale(1.45); }
        }
      `}</style>
    </>
  );
}

/* ─── Animated smoke wisps overlay ──────────────────────────────────── */
function SmokeWisps() {
  const wisps = [
    { width: '320px', height: '160px', top: '12%',  left: '18%',  delay: '0s',    dur: '9s'  },
    { width: '260px', height: '120px', top: '25%',  left: '45%',  delay: '2.5s',  dur: '11s' },
    { width: '400px', height: '180px', top: '35%',  left: '30%',  delay: '1.2s',  dur: '13s' },
    { width: '220px', height: '100px', top: '8%',   left: '62%',  delay: '4s',    dur: '8s'  },
    { width: '350px', height: '140px', top: '50%',  left: '10%',  delay: '0.8s',  dur: '12s' },
    { width: '180px', height: '90px',  top: '18%',  left: '75%',  delay: '3.5s',  dur: '10s' },
  ];

  return (
    <>
      <style>{`
        @keyframes smoke-drift {
          0%   { transform: translateX(0)    translateY(0)    scale(1);    opacity: 0;   }
          15%  { opacity: 0.6; }
          70%  { opacity: 0.35; }
          100% { transform: translateX(60px) translateY(-55px) scale(1.4); opacity: 0;   }
        }
      `}</style>
      {wisps.map((w, i) => (
        <div key={i} style={{
          position:      'absolute',
          top:           w.top, left: w.left,
          width:         w.width, height: w.height,
          borderRadius:  '50%',
          background:    'radial-gradient(ellipse, rgba(20,24,16,0.7) 0%, rgba(10,12,8,0.4) 45%, transparent 75%)',
          filter:        'blur(28px)',
          animation:     `smoke-drift ${w.dur} ease-in-out ${w.delay} infinite`,
          pointerEvents: 'none',
        }} />
      ))}
    </>
  );
}