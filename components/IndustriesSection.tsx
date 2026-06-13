'use client';

import { useState } from 'react';
import Reveal from './motion/Reveal';

const INDUSTRIES = [
  { label: 'Maritime & Shipping',         desc: 'Vessel performance, asset protection, operational efficiency and environmental sustainability.' },
  { label: 'Ports & Logistics',           desc: 'Smarter, cleaner, and more resilient logistics infrastructure.' },
  { label: 'Oil, Gas & Energy',           desc: 'Improved efficiency, sustainability, and asset performance for energy operators.' },
  { label: 'Manufacturing & Heavy Industry', desc: 'Industrial transformation through advanced materials and resource optimisation.' },
  { label: 'Infrastructure & Construction', desc: 'Technologies and materials for stronger, more sustainable infrastructure.' },
  { label: 'Carbon Sequestration',        desc: 'Capture, utilise, store, or create value from carbon emissions.' },
  { label: 'Waste-To-Value Systems',      desc: 'Industrial waste transformed into commercially valuable products and opportunities.' },
  { label: 'Industrial Sustainability',   desc: 'Improved environmental performance while creating business value.' },
  { label: 'Circular Economy',            desc: 'Maximise resource recovery. Minimise waste generation.' },
  { label: 'Specialty Coatings',          desc: 'Advanced coating solutions for industrial, marine, infrastructure, and energy applications.' },
  { label: 'Government & Public Sector',  desc: 'Climate action, sustainable development, and innovation initiatives.' },
  { label: 'Research & Innovation',       desc: 'Collaboration with universities, startups, and innovation programs.' },
];

export default function IndustriesSection() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section
      id="industries"
      className="site-section"
      style={{ background: 'var(--n-surface-low)' }}
    >
      <div className="site-container">

        {/* Header */}
        <Reveal style={{ marginBottom: '3rem' }}>
          <p className="text-label" style={{ marginBottom: '1rem' }}>
            Industries We Serve
          </p>
          <h2 style={{
            fontFamily:    '"Hanken Grotesk", system-ui, sans-serif',
            fontSize:      'clamp(1.8rem, 3vw, 2.5rem)',
            fontWeight:    500, lineHeight: 1.2,
            letterSpacing: '-0.01em', color: 'var(--n-on-surface)',
            maxWidth:      '520px',
          }}>
            Built For The Industries<br />Driving Global Change.
          </h2>
        </Reveal>

        {/* 4-col grid — 1 col on mobile, 2 on tablet, 4 on desktop */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          style={{
            gap:          '1px',
            background:   'var(--n-outline-variant)',
            border:       '1px solid var(--n-outline-variant)',
            borderRadius: '8px',
            overflow:     'hidden',
          }}
        >
          {INDUSTRIES.map((ind, i) => (
            <Reveal key={ind.label} delay={(i % 4) * 0.08} y={16}>
              <div
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  height:     '100%',
                  padding:    '1.375rem 1.5rem',
                  background: hovered === i
                    ? 'var(--n-surface-mid)'
                    : 'var(--n-surface-lowest)',
                  transition: 'background 0.2s ease',
                  cursor:     'default',
                }}
              >
                <p style={{
                  fontFamily:    '"JetBrains Mono", monospace',
                  fontSize:      '9px', fontWeight: 500,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color:         hovered === i
                    ? 'var(--n-primary)' : 'var(--n-outline)',
                  marginBottom:  '0.5rem',
                  transition:    'color 0.2s ease',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </p>
                <p style={{
                  fontFamily:   '"Hanken Grotesk", system-ui, sans-serif',
                  fontSize:     '15px', fontWeight: 500, lineHeight: 1.3,
                  color:        hovered === i
                    ? 'var(--n-primary)' : 'var(--n-on-surface)',
                  marginBottom: '0.375rem',
                  transition:   'color 0.2s ease',
                }}>
                  {ind.label}
                </p>
                <p style={{
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontSize:   '15px', lineHeight: 1.55,
                  color:      'var(--n-outline)',
                }}>
                  {ind.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
