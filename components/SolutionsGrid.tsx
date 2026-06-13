'use client';

import { useState, useRef, useEffect } from 'react';

const SOLUTIONS = [
  {
    svg: (
      <>
        <path d="M2 17h20M2 14h20M5 14V8h14v6M9 8V4h6v4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 17l1.5 4h15l1.5-4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ),
    title: 'Net Zero Shipping & Marine Logistics',
    desc:  'Decarbonizing global maritime lanes through high-density synthetic fuel frameworks and real-time hydrodynamic performance arrays.',
  },
  {
    svg: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 11l2 2 4-4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ),
    title: 'Advanced Protection & Barrier Coatings',
    desc:  'Next-generation non-toxic eco-coatings preventing marine bio-fouling without leaching copper matrices into fragile maritime ecosystems.',
  },
  {
    svg: (
      <>
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16M12 7v4M12 15v.01" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ),
    title: 'Corrosion Engineering Advisory',
    desc:  'Empirical micro-structural analysis and predictive modeling systems designed to extend structural longevity for offshore clean infrastructure assets.',
  },
  {
    svg: (
      <>
        <path d="M12 3v18M3 12h18M12 3l4 4M12 21l-4-4M3 12l4 4M21 12l-4-4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ),
    title: 'Material Science Resiliency Matrix',
    desc:  'Synthesizing structural concrete formulations and industrial composite compounds utilizing structural upcycled hazardous waste inputs.',
  },
];

export default function SolutionsGrid() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.05 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="solutions" ref={sectionRef} className="site-section" style={{ background: '#ffffff', color: '#0a120b' }}>
      <div className="site-container">
        
        {/* UPPER HEADER INTRO */}
        <div className="grid lg:grid-cols-12 gap-8 items-center" style={{ marginBottom: '5rem', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.8s ease' }}>
          <div className="lg:col-span-6">
            <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3f692c', marginBottom: '1rem' }}>
              Industrial Systems Architecture
            </p>
            <h2 style={{ fontFamily: '"Hanken Grotesk", system-ui, sans-serif', fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', fontWeight: 600, lineHeight: 1.12, letterSpacing: '-0.02em', color: '#0a120b' }}>
              Climate Resilient Frameworks.<br />Industrially Validated.
            </h2>
            <p style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: '17px', lineHeight: '1.65', color: '#243325', marginTop: '1.5rem', maxWidth: '34rem' }}>
              We synthesize custom physical material science processes with algorithmic carbon compliance layers to directly optimize massive industrial operating parameters.
            </p>
          </div>
          
          {/* STOCK PHOTO ANCHOR IN HEADER */}
          <div className="lg:col-span-6 h-64 lg:h-80 rounded-2xl overflow-hidden relative shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=1000&q=80" 
              alt="High precision automated laboratory infrastructure system" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(10,18,11,0.4), transparent)' }} />
          </div>
        </div>

        {/* SOLUTIONS GRID HOVER INTERACTIVE SUITE */}
        <div className="grid md:grid-cols-2 gap-6" style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(30px)', transition: 'all 0.8s ease 0.2s' }}>
          {SOLUTIONS.map((item, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered === idx ? '#f5f9f4' : '#fafcf9',
                border: '2px solid',
                borderColor: hovered === idx ? '#3f692c' : '#e2e9e2',
                borderRadius: '16px',
                padding: '3rem 2.5rem',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
              }}
            >
              <div className="flex items-start gap-5">
                <div style={{
                  color: '#3f692c',
                  background: 'rgba(63,105,44,0.06)',
                  padding: '1rem',
                  borderRadius: '12px',
                  transition: 'transform 0.3s ease',
                  transform: hovered === idx ? 'scale(1.05)' : 'none'
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '2.5rem', height: '2.5rem' }}>
                    {item.svg}
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontFamily: '"Hanken Grotesk", system-ui, sans-serif', fontSize: '20px', fontWeight: 600, color: '#0a120b', marginBottom: '0.75rem' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: '15px', lineHeight: '1.6', color: '#243325' }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}