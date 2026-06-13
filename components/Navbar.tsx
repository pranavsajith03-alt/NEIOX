'use client';
// components/Navbar.tsx

import { useEffect, useState } from 'react';

const NAV_LINKS = [
  { label: 'Technology', href: '#solutions'   },
  { label: 'Industries', href: '#industries'  },
  { label: 'Innovation', href: '#innovations' },
  { label: 'Impact',     href: '#impact'      },
  { label: 'Investors',  href: '#investors'   },
];

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkColor = scrolled ? '#42493d' : 'rgba(255,255,255,0.8)';

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background:            scrolled ? 'rgba(248,249,255,0.78)' : 'transparent',
          backdropFilter:        scrolled ? 'blur(20px) saturate(180%)' : 'none',
          WebkitBackdropFilter:  scrolled ? 'blur(20px) saturate(180%)' : 'none',
          borderBottom:          scrolled ? '1px solid rgba(194,201,186,0.45)' : '1px solid transparent',
          boxShadow:             scrolled ? '0 1px 20px rgba(11,28,48,0.05)' : 'none',
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div className="site-container">
          <div className="flex items-center justify-between h-28 sm:h-32">

            {/* Logo */}
            <a href="#hero" className="flex items-center shrink-0">
              <div
                className="flex items-center rounded-2xl transition-all duration-500"
                style={{
                  background: 'rgba(248,249,255,0.92)',
                  padding:    '0.4rem 0.85rem',
                  border:     '1px solid rgba(164,212,138,0.3)',
                  boxShadow:  scrolled
                    ? '0 2px 14px rgba(11,28,48,0.08)'
                    : '0 8px 28px rgba(0,0,0,0.25)',
                }}
              >
                <img
                  src="/images/logo.png"
                  alt="NEIOX"
                  className="h-24 sm:h-28 w-auto"
                  style={{ mixBlendMode: 'multiply' }}
                />
              </div>
            </a>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <a key={href} href={href}
                   className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 hover:bg-black/5"
                   style={{ color: linkColor }}>
                  {label}
                </a>
              ))}
            </nav>

            {/* Login CTA */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <a
                  href="/login"
                  className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-opacity hover:opacity-85"
                  style={{ background: '#3f692c', color: '#ffffff' }}
                >
                  {/* lock icon */}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Employee Login
                </a>
                <p className="text-right mt-0.5 whitespace-nowrap"
                   style={{ fontSize: '11px', letterSpacing: '0.04em', fontWeight: 500,
                            color: scrolled ? '#42493d' : 'rgba(255,255,255,0.75)' }}>
                  For NEIOX team members only
                </p>
              </div>

              {/* Mobile hamburger */}
              <button onClick={() => setMobileOpen(v => !v)}
                      className="md:hidden flex flex-col gap-1.5 p-1" aria-label="Menu">
                {[0, 1, 2].map(i => (
                  <span key={i} className="block w-5 h-0.5 transition-all duration-200 rounded-full"
                        style={{
                          background: scrolled ? '#0b1c30' : '#ffffff',
                          transform: mobileOpen
                            ? i === 0 ? 'translateY(7px) rotate(45deg)'
                            : i === 2 ? 'translateY(-7px) rotate(-45deg)' : ''
                            : '',
                          opacity: mobileOpen && i === 1 ? 0 : 1,
                        }} />
                ))}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div className="fixed top-28 sm:top-32 left-0 right-0 z-40 md:hidden overflow-hidden transition-all duration-300"
           style={{ maxHeight: mobileOpen ? '360px' : '0',
                    background: 'rgba(248,249,255,0.97)',
                    backdropFilter: 'blur(16px)',
                    borderBottom: mobileOpen ? '1px solid #e5eeff' : 'none' }}>
        <div className="site-container py-4 flex flex-col gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={href} href={href} onClick={() => setMobileOpen(false)}
               className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-[#e8f5ee] transition-colors"
               style={{ color: '#0b1c30' }}>
              {label}
            </a>
          ))}
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid #e5eeff' }}>
            <a href="/login" onClick={() => setMobileOpen(false)}
               className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold"
               style={{ background: '#3f692c', color: '#ffffff' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Employee Login
            </a>
            <p className="text-center mt-1.5" style={{ fontSize: '11px', color: '#252b22' }}>
              For NEIOX team members only
            </p>
          </div>
        </div>
      </div>
    </>
  );
}