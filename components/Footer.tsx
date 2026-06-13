'use client';
// components/Footer.tsx

import Reveal from './motion/Reveal';

const NAV_LINKS = [
  { label: 'Home',       href: '#hero'        },
  { label: 'Technology', href: '#solutions'   },
  { label: 'Industries', href: '#industries'  },
  { label: 'Innovation', href: '#innovations' },
  { label: 'Impact',     href: '#impact'      },
  { label: 'Investors',  href: '#investors'   },
];

const PARTNER_LOGOS = [
  { src: '/images/logos/tbi.jpg',       alt: 'Technology Business Incubator, NIT Calicut' },
  { src: '/images/logos/nit.png',       alt: 'NIT Calicut'                                },
  { src: '/images/logos/iimk_live.jpg', alt: 'IIM Kozhikode LIVE'                         },
];

/* ── Inline icons ─────────────────────────────────────────────────── */
function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5"/>
      <polyline points="5,12 12,5 19,12"/>
    </svg>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  const CONTACT_LINKS = [
    { icon: <WhatsAppIcon />, value: '+91 94009 39955',         href: 'https://wa.me/919400939955' },
    { icon: <MailIcon />,     value: 'neioxecocycle@gmail.com', href: 'mailto:neioxecocycle@gmail.com' },
    { icon: <LinkedInIcon />, value: 'www.neioxecocycle.in',    href: 'https://www.neioxecocycle.in' },
  ];

  return (
    <footer style={{ background: 'var(--n-inverse-surface)', position: 'relative', overflow: 'hidden' }}>

      {/* Decorative glow accents */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '-12rem', right: '-8rem',
        width: '32rem', height: '32rem', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(164,212,138,0.12), transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: '-14rem', left: '-10rem',
        width: '34rem', height: '34rem', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(63,105,44,0.18), transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="site-container" style={{
        position: 'relative', zIndex: 1,
        paddingTop: 'clamp(4rem, 8vw, 6rem)', paddingBottom: '2.5rem',
      }}>

        {/* Vision + CTA band */}
        <Reveal style={{ borderBottom: '1px solid rgba(255,255,255,0.10)', paddingBottom: '3rem', marginBottom: '3.5rem' }}>
          <p className="text-label" style={{ color: 'var(--n-primary-fixed-dim)', marginBottom: '1.25rem' }}>
            Our Vision
          </p>
          <p style={{
            fontFamily: 'var(--font-display)', fontWeight: 500,
            fontSize: 'clamp(1.3rem, 2.4vw, 1.85rem)', lineHeight: 1.55,
            color: 'var(--n-inverse-on-surface)', maxWidth: '54rem', marginBottom: '2.5rem',
          }}>
            A future where pollution, waste, emissions, and resource inefficiencies are no
            longer viewed as liabilities — but as the foundation for new industries,
            stronger economies, and a more sustainable world. NEIOX exists to help build
            that future.
          </p>

          <h3 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', color: '#ffffff',
          }}>
            Let's Build The Future, Together.
          </h3>
        </Reveal>

        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.85fr_1.1fr_1.3fr] gap-x-10 gap-y-12 mb-16">

          {/* Brand */}
          <Reveal>
          <div>
            <div className="inline-flex items-center justify-center rounded-2xl bg-white"
                 style={{ padding: '0.5rem 0.75rem', marginBottom: '1.25rem' }}>
              <img src="/images/logo.png" alt="NEIOX Eco Cycle" className="h-20 sm:h-28 w-auto" />
            </div>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.75,
              color: 'rgba(234,241,255,0.5)', maxWidth: '22rem',
            }}>
              Transforming climate liabilities into industrial assets — building
              technologies that create real value from the world's biggest
              environmental challenges.
            </p>
          </div>
          </Reveal>

          {/* Explore */}
          <Reveal delay={0.1}>
          <div>
            <h4 className="text-label" style={{ color: 'var(--n-primary-fixed-dim)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
              Explore
            </h4>
            <nav className="flex flex-col gap-2.5">
              {NAV_LINKS.map(({ label, href }) => (
                <a key={href} href={href} className="link-arrow-light" style={{ fontSize: '14px' }}>
                  {label}
                </a>
              ))}
            </nav>
          </div>
          </Reveal>

          {/* Get in touch */}
          <Reveal delay={0.2}>
          <div>
            <h4 className="text-label" style={{ color: 'var(--n-primary-fixed-dim)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
              Get In Touch
            </h4>
            <ul className="flex flex-col gap-3">
              {CONTACT_LINKS.map(({ icon, value, href }) => (
                <li key={value}>
                  <a
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="group flex items-center gap-2.5"
                    style={{ color: 'rgba(234,241,255,0.7)', textDecoration: 'none' }}
                  >
                    <span style={{ color: 'var(--n-primary-fixed-dim)', flexShrink: 0, display: 'flex' }}>
                      {icon}
                    </span>
                    <span className="transition-colors group-hover:text-white"
                          style={{ fontFamily: 'var(--font-body)', fontSize: '14px' }}>
                      {value}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          </Reveal>

          {/* Office */}
          <Reveal delay={0.3}>
          <div>
            <h4 className="text-label" style={{ color: 'var(--n-primary-fixed-dim)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
              Our Office
            </h4>
            <div className="flex items-start gap-2.5" style={{ marginBottom: '1.25rem' }}>
              <span style={{ color: 'var(--n-primary-fixed-dim)', marginTop: '2px', flexShrink: 0, display: 'flex' }}>
                <PinIcon />
              </span>
              <address style={{
                fontFamily: 'var(--font-body)', fontStyle: 'normal',
                fontSize: '14px', lineHeight: 1.75, color: 'rgba(234,241,255,0.7)',
              }}>
                NEIOX Eco Cycle Pvt Ltd<br />
                Technology Business Incubator<br />
                NIT Calicut, Kozhikode<br />
                Kerala, India – 673601
              </address>
            </div>

            {/* Incubation credential */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 0.85rem', borderRadius: '9999px',
              border: '1px solid rgba(164,212,138,0.3)', background: 'rgba(164,212,138,0.08)',
              marginBottom: '1rem',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--n-primary-fixed-dim)', flexShrink: 0 }} />
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'var(--n-primary-fixed-dim)',
              }}>
                Co-Incubated at IIM-K LIVE
              </span>
            </div>

            {/* Partner logos */}
            <div className="flex items-center gap-3 sm:gap-4" style={{
              background:   'rgba(255,255,255,0.96)',
              borderRadius: '16px',
              padding:      '1rem 1.4rem',
              boxShadow:    '0 12px 36px rgba(0,0,0,0.28)',
            }}>
              {PARTNER_LOGOS.map(({ src, alt }, i) => (
                <div
                  key={src}
                  className="flex-1 min-w-0 flex items-center justify-center"
                  style={{
                    paddingRight: i < PARTNER_LOGOS.length - 1 ? '0.85rem' : 0,
                    borderRight:  i < PARTNER_LOGOS.length - 1 ? '1px solid rgba(11,28,48,0.1)' : 'none',
                  }}
                >
                  <img
                    src={src} alt={alt}
                    className="max-h-20 w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
          </Reveal>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
             style={{ borderTop: '1px solid rgba(255,255,255,0.10)', paddingTop: '2rem' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: '#ffffff', marginBottom: '4px' }}>
              NEIOX Eco Cycle Private Limited
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(234,241,255,0.4)' }}>
              Climate-Industrial Technology Company · Built in India, Designed for Global Impact
            </p>
          </div>

          <div className="flex items-center gap-5">
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(234,241,255,0.4)', margin: 0 }}>
              © {year} NEIOX Eco Cycle Private Limited. All rights reserved.
            </p>
            <a href="/privacy" className="transition-colors hover:text-white"
               style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(234,241,255,0.4)' }}>
              Privacy Policy
            </a>
            <a href="#hero" aria-label="Back to top"
               className="flex items-center justify-center transition-colors hover:text-white"
               style={{
                 width: '36px', height: '36px', borderRadius: '50%',
                 border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(234,241,255,0.6)',
                 flexShrink: 0,
               }}>
              <ArrowUpIcon />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
