'use client';

import Reveal from './motion/Reveal';

const DIFFERENTIATORS = [
  { title: 'Non-Toxic To Marine Ecosystems',      desc: 'Minimises harmful impacts on marine biodiversity and aquatic environments.' },
  { title: 'Carbon-Negative Additive Technology', desc: 'Innovative material systems creating environmental value while delivering industrial performance.' },
  { title: 'Dual-Action Coating Technology',      desc: 'Protects vessel surfaces while simultaneously improving operational efficiency.' },
  { title: 'Reduced Biofouling',                  desc: 'Maintains cleaner hull surfaces for longer periods.' },
  { title: 'Enhanced Corrosion Resistance',       desc: 'Long-term protection of marine assets in harsh environments.' },
  { title: 'Improved Fuel Efficiency',            desc: 'Cleaner surfaces reduce drag and improve vessel performance.' },
];
 
const STAKEHOLDERS = [
  { group: 'Ship Owners', items: ['Reduced Costs', 'Improved Asset Utilization', 'Enhanced Efficiency'] },
  { group: 'Shipyards',   items: ['Faster Turnaround', 'Reduced Maintenance Time', 'Better Customer Value'] },
  { group: 'Environment', items: ['Reduced Emissions', 'Marine Ecosystem Protection', 'Sustainable Operations'] },
];
 
// Three focused, relevant photos — no people, no houses
const PHOTOS = [
  {
    src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1000&q=80',
    alt: 'Large cargo vessel at sea — maritime operations',
    caption: 'Maritime Operations',
  },
  {
    src: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=700&q=80',
    alt: 'Container ship on open ocean',
    caption: 'Vessel Performance',
  },
  {
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=80',
    alt: 'Sunlit forest — environmental sustainability',
    caption: 'Sustainability',
  },
];
 
export default function InnovationSpotlight() {
  return (
    <section
      id="innovations"
      className="site-section"
      style={{ background: 'var(--n-surface-low)' }}
    >
      <div className="site-container">

        {/* ── Header ─────────────────────────────────────── */}
        <Reveal style={{ marginBottom: '3rem' }}>
          <p className="text-label" style={{ marginBottom: '0.75rem' }}>
            Innovation Spotlight
          </p>
          <h2 style={{
            fontFamily: '"Hanken Grotesk", system-ui, sans-serif',
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
            fontWeight: 500, lineHeight: 1.2,
            letterSpacing: '-0.01em', color: 'var(--n-on-surface)',
            marginBottom: '0.5rem',
          }}>
            NEIOX Advanced Marine<br />Coating Technology
          </h2>
          <p style={{
            fontFamily: '"Hanken Grotesk", system-ui, sans-serif',
            fontSize: '15px', color: 'var(--n-primary)', lineHeight: 1.5,
          }}>
            Reimagining Marine Protection For A Sustainable Maritime Future.
          </p>
        </Reveal>

        {/* ── Photo strip — stacked on mobile, 2fr/1fr/1fr from sm up ── */}
        <Reveal
          className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr]"
          style={{ gap: '0.875rem', marginBottom: '3rem' }}
          delay={0.1}
        >
          {PHOTOS.map(({ src, alt, caption }, i) => (
            <div key={i} className="hover-lift" style={{
              position: 'relative',
              borderRadius: '10px',
              overflow: 'hidden',
              aspectRatio: i === 0 ? '16/9' : '4/3',
              boxShadow: '0 6px 28px rgba(11,28,48,0.11)',
            }}>
              <img
                src={src}
                alt={alt}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {/* subtle dark gradient + caption */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(11,28,48,0.55) 0%, transparent 55%)',
              }} />
              <span style={{
                position: 'absolute', bottom: '0.625rem', left: '0.75rem',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '9px', fontWeight: 500,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.82)',
              }}>
                {caption}
              </span>
            </div>
          ))}
        </Reveal>

        {/* ── Two-column: copy + differentiators — stacked on mobile/tablet, side-by-side from lg ── */}
        <Reveal
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14"
          style={{ alignItems: 'start' }}
          delay={0.18}
        >
 
          {/* Left — body copy + challenge tags */}
          <div>
            <p style={{
              fontFamily: '"Inter", system-ui, sans-serif',
              fontSize: '15px', lineHeight: 1.75,
              color: 'var(--n-on-surface-variant)',
              marginBottom: '2rem',
            }}>
              The maritime industry faces increasing pressure to improve
              performance, reduce emissions, lower operating costs, and protect
              marine ecosystems. NEIOX is developing an advanced marine coating
              platform designed to address these challenges simultaneously through
              material science, carbon-negative innovation, and environmentally
              responsible engineering.
            </p>
 
            <p className="text-label" style={{ marginBottom: '0.75rem' }}>
              The Challenge
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2.5rem' }}>
              {['Biofouling','Corrosion','Fuel Inefficiencies','Higher Emissions',
                'Expensive Dry Docking Cycles','Environmental Compliance Challenges'].map(c => (
                <span key={c} style={{
                  padding: '0.3rem 0.85rem', borderRadius: '99px',
                  fontSize: '13px',
                  fontFamily: '"Inter", system-ui, sans-serif',
                  color: 'var(--n-on-surface)',
                  background: 'var(--n-surface-mid)',
                  border: '1px solid var(--n-outline-variant)',
                }}>
                  {c}
                </span>
              ))}
            </div>
 
            {/* Stakeholder cards */}
            <p className="text-label" style={{ marginBottom: '1rem' }}>
              Why It Matters
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {STAKEHOLDERS.map(s => (
                <div key={s.group} className="site-card" style={{ padding: '1rem' }}>
                  <p style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '9px', fontWeight: 500,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: 'var(--n-primary)', marginBottom: '0.625rem',
                  }}>
                    {s.group}
                  </p>
                  {s.items.map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.375rem', marginBottom: '0.25rem' }}>
                      <div style={{
                        width: '4px', height: '4px', borderRadius: '50%',
                        background: 'var(--n-primary-container)',
                        flexShrink: 0, marginTop: '5px',
                      }} />
                      <p style={{
                        fontFamily: '"Inter", system-ui, sans-serif',
                        fontSize: '12.5px', lineHeight: 1.45,
                        color: 'var(--n-on-surface)',
                      }}>
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
 
          {/* Right — key differentiators */}
          <div>
            <p className="text-label" style={{ marginBottom: '1rem' }}>
              Key Differentiators
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {DIFFERENTIATORS.map((d, i) => (
                <div key={d.title} style={{
                  display: 'flex', gap: '0.875rem', alignItems: 'flex-start',
                  padding: '0.875rem 1rem',
                  borderRadius: '8px',
                  background: 'var(--n-surface-lowest)',
                  border: '1px solid var(--n-outline-variant)',
                }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '6px',
                    background: 'var(--n-primary-fixed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '10px', fontWeight: 700,
                    color: 'var(--n-primary)',
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <p style={{
                      fontFamily: '"Hanken Grotesk", system-ui, sans-serif',
                      fontSize: '14.5px', fontWeight: 500,
                      color: 'var(--n-on-surface)', lineHeight: 1.3, marginBottom: '3px',
                    }}>
                      {d.title}
                    </p>
                    <p style={{
                      fontFamily: '"Inter", system-ui, sans-serif',
                      fontSize: '13px', color: 'var(--n-outline)', lineHeight: 1.55,
                    }}>
                      {d.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </Reveal>
      </div>
    </section>
  );
}
 