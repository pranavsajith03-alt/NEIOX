'use client';

import { useEffect, useRef, useState } from 'react';

export default function ContactSection() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.05 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="contact" ref={sectionRef} className="site-section" style={{ background: '#ffffff', borderTop: '2px solid #e2e9e2', color: '#070f08' }}>
      <div className="site-container">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          
          {/* VISUAL & TECHNICAL INQUIRY SIDE */}
          <div className="lg:col-span-5" style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.8s ease' }}>
            <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3f692c', marginBottom: '1rem' }}>
              Interface Vector
            </p>
            <h2 style={{ fontFamily: '"Hanken Grotesk", system-ui, sans-serif', fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', fontWeight: 600, lineHeight: 1.12, letterSpacing: '-0.02em', color: '#070f08', marginBottom: '2rem' }}>
              Initiate System Integration.
            </h2>
            <p style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: '16px', lineHeight: '1.7', color: '#243325', marginBottom: '3rem' }}>
              Connect directly with our engineering groups to map custom material deployments and structural performance models across your physical operating asset stack.
            </p>

            {/* HIGH QUALITY COMPLIANCE STOCK IMAGE */}
            <div className="rounded-2xl overflow-hidden h-48 sm:h-60 shadow-inner relative mb-8">
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80" 
                alt="Stitch net-zero technical research meeting facility" 
                className="w-full h-full object-cover"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', fontWeight: 600, color: '#3f692c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inquiries Matrix</p>
                <a href="mailto:solutions@stitch-netzero.io" style={{ fontFamily: '"Inter", sans-serif', fontSize: '17px', fontWeight: 600, color: '#070f08', textDecoration: 'underline' }}>solutions@stitch-netzero.io</a>
              </div>
            </div>
          </div>

          {/* HIGH CONTRAST INPUT INTERFACE */}
          <div className="lg:col-span-7" style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(30px)', transition: 'all 0.8s ease 0.2s' }}>
            <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div className="grid sm:grid-cols-2 gap-6">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', fontWeight: 600, color: '#070f08' }}>Full Name</label>
                  <input type="text" maxLength={100} style={{ width: '100%', padding: '1rem', background: '#f5f9f4', border: '2px solid #c2c9ba', borderRadius: '8px', fontSize: '15px', color: '#070f08', fontWeight: 500 }} placeholder="E.g., Dr. Elena Rostova" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', fontWeight: 600, color: '#070f08' }}>Corporate Email</label>
                  <input type="email" maxLength={254} style={{ width: '100%', padding: '1rem', background: '#f5f9f4', border: '2px solid #c2c9ba', borderRadius: '8px', fontSize: '15px', color: '#070f08', fontWeight: 500 }} placeholder="elena@infrastructure.corp" />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', fontWeight: 600, color: '#070f08' }}>Operational Objective / Request Parameters</label>
                <textarea rows={5} maxLength={2000} style={{ width: '100%', padding: '1rem', background: '#f5f9f4', border: '2px solid #c2c9ba', borderRadius: '8px', fontSize: '15px', color: '#070f08', fontWeight: 500, resize: 'vertical' }} placeholder="Detail targeted emission constraints or asset parameters..." />
              </div>

              <button type="submit" className="btn-site-primary sheen" style={{ alignSelf: 'flex-start', padding: '1rem 2.5rem', fontSize: '15px', fontWeight: 600, marginTop: '0.5rem' }}>
                Submit Parameter Package
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}