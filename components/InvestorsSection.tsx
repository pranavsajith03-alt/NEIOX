'use client';

import Reveal from './motion/Reveal';

const WHY = [
  'Large Global Market Opportunity',
  'Scalable Technology Platform',
  'Government Validation',
  'Industrial Relevance',
  'Strong Sustainability Drivers',
  'Multiple Commercial Pathways',
  'Global Expansion Potential',
];

const REVENUE = [
  'Technology Licensing',
  'Product Sales',
  'Industrial Consulting',
  'Pilot Programs',
  'Joint Ventures',
  'Strategic Partnerships',
  'ESG Advisory',
  'Innovation Programs',
];

const ROADMAP = [
  {
    year:  '2026',
    title: 'Technology Validation',
    items: ['Pilot Programs', 'Strategic Partnerships'],
  },
  {
    year:  '2027',
    title: 'Commercial Launch',
    items: ['Revenue Generation', 'Market Expansion'],
  },
  {
    year:  '2028',
    title: 'Regional Expansion',
    items: ['International Partnerships', 'Technology Portfolio Growth'],
  },
  {
    year:  '2030',
    title: 'Global Platform',
    items: ['Multi-Sector Deployment', 'Climate-Industrial Leadership'],
  },
];

export default function InvestorsSection() {
  return (
    <section
      id="investors"
      className="site-section w-full overflow-hidden"
      style={{ background: 'var(--n-surface-lowest)' }}
    >
      <div className="site-container w-full box-border">

        {/* Header */}
        <Reveal
          className="flex flex-col lg:flex-row w-full"
          style={{ gap: '2rem', marginBottom: '3.5rem' }}
        >
          <div className="w-full lg:w-1/2">
            <p className="text-label" style={{ marginBottom: '1rem' }}>
              Investors
            </p>
            <h2 style={{
              fontFamily:    '"Hanken Grotesk", system-ui, sans-serif',
              fontSize:      'clamp(1.6rem, 4vw, 2.35rem)',
              fontWeight:    500, lineHeight: 1.25,
              letterSpacing: '-0.01em', color: 'var(--n-on-surface)',
            }}>
              A Platform Positioned At The Intersection Of Industry And Climate.
            </h2>
          </div>
          <div className="w-full lg:w-1/2 lg:pt-12">
            <p style={{
              fontFamily: '"Inter", system-ui, sans-serif',
              fontSize:   '15px', lineHeight: 1.75,
              color:      'var(--n-on-surface-variant)',
            }}>
              NEIOX is building technologies for industries facing increasing
              pressure to improve sustainability, efficiency, and resilience.
              Our long-term vision is to become one of the world's leading
              climate-industrial technology companies.
            </p>
          </div>
        </Reveal>

        {/* Why + Revenue */}
        <Reveal
          className="flex flex-col md:flex-row w-full"
          style={{ gap: '1.5rem', marginBottom: '2.5rem' }}
          delay={0.1}
        >
          <div className="site-card w-full md:w-1/2 box-border" style={{ padding: '1.875rem' }}>
            <p className="text-label" style={{ marginBottom: '1.25rem' }}>
              Why NEIOX
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {WHY.map(item => (
                <div key={item} style={{
                  display: 'flex', alignItems: 'start', gap: '0.625rem',
                }}>
                  <div style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    background: 'var(--n-primary)', flexShrink: 0, marginTop: '7px'
                  }}/>
                  <p 
                    className="break-words"
                    style={{
                      fontFamily: '"Inter", system-ui, sans-serif',
                      fontSize:   '13.5px', lineHeight: 1.4,
                      color:      'var(--n-on-surface-variant)',
                    }}
                  >
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="site-card w-full md:w-1/2 box-border" style={{ padding: '1.875rem' }}>
            <p className="text-label" style={{ marginBottom: '1.25rem' }}>
              Revenue Streams
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {REVENUE.map(item => (
                <div key={item} style={{
                  display: 'flex', alignItems: 'start', gap: '0.625rem',
                }}>
                  <div style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    background: 'var(--n-primary-container)', flexShrink: 0, marginTop: '7px'
                  }}/>
                  <p 
                    className="break-words"
                    style={{
                      fontFamily: '"Inter", system-ui, sans-serif',
                      fontSize:   '13.5px', lineHeight: 1.4,
                      color:      'var(--n-on-surface-variant)',
                    }}
                  >
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Roadmap */}
        <Reveal delay={0.2}>
          <p className="text-label" style={{ marginBottom: '1.25rem' }}>
            Global Roadmap
          </p>
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full"
            style={{
              gap:                 '1px',
              background:          'var(--n-outline-variant)',
              border:              '1px solid var(--n-outline-variant)',
              borderRadius:        '8px',
              overflow:            'hidden',
            }}
          >
            {ROADMAP.map((r, i) => (
              <Reveal key={r.year} delay={i * 0.08} y={16} className="h-full">
              <div
                className="w-full h-full box-border hover-lift"
                style={{ padding: '1.5rem', background: 'var(--n-surface-lowest)' }}
              >
                <p style={{
                  fontFamily:    '"Hanken Grotesk", system-ui, sans-serif',
                  fontSize:      '2rem', fontWeight: 300,
                  color:         'var(--n-primary)',
                  letterSpacing: '-0.02em', lineHeight: 1,
                  marginBottom:  '0.375rem',
                }}>
                  {r.year}
                </p>
                <div style={{
                  height: '1px', background: 'var(--n-outline-variant)',
                  marginBottom: '0.75rem', width: '70%',
                }}/>
                <p
                  className="break-words"
                  style={{
                    fontFamily:   '"Hanken Grotesk", system-ui, sans-serif',
                    fontSize:     '14.5px', fontWeight: 500,
                    color:        'var(--n-on-surface)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {r.title}
                </p>
                {r.items.map(item => (
                  <p
                    key={item}
                    className="break-words"
                    style={{
                      fontFamily:  '"Inter", system-ui, sans-serif',
                      fontSize:    '13px', lineHeight: 1.55,
                      color:       'var(--n-outline)', marginBottom: '2px',
                    }}
                  >
                    {item}
                  </p>
                ))}
              </div>
              </Reveal>
            ))}
          </div>
        </Reveal>

      </div>
    </section>
  );
}