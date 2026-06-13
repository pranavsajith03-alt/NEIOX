// components/WhatWeDo.tsx
// Cards without box outlines — content only

import Reveal from './motion/Reveal';

const SOLUTIONS = [
  {
    icon: '🧪',
    title: 'Advanced Materials',
    desc:  'Developing next-generation materials that improve durability, efficiency, sustainability, and industrial performance.',
    img:   'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&q=75',
  },
  {
    icon: '🎨',
    title: 'Specialty Paints & Coatings',
    desc:  'Advanced coating technologies that enhance protection, efficiency, longevity, and environmental performance.',
    img:   'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=75',
  },
  {
    icon: '⚛️',
    title: 'Nanotechnology',
    desc:  'Applying nanoscale engineering and advanced material science to create high-performance industrial solutions.',
    img:   'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&q=75',
  },
  {
    icon: '⚓',
    title: 'Maritime Technologies',
    desc:  'Building cleaner, smarter, and more efficient technologies for maritime industries.',
    img:   'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=600&q=75',
  },
  {
    icon: '♻️',
    title: 'Circular Systems',
    desc:  'Transforming waste streams into valuable industrial resources.',
    img:   'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&q=75',
  },
  {
    icon: '🌍',
    title: 'Climate Intelligence',
    desc:  'Using science, engineering, and innovation to support climate-positive decisions and industrial transformation.',
    img:   'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=75',
  },
  {
    icon: '💡',
    title: 'Carbon Innovation',
    desc:  'Developing technologies that convert environmental liabilities into economic opportunities.',
    img:   'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&q=75',
  },
];

export default function WhatWeDo() {
  return (
    <section id="solutions" className="site-section" style={{ background: '#f8f9ff' }}>
      <div className="site-container">

        {/* Header */}
        <Reveal className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <div className="max-w-xl">
            <p className="text-label mb-3">What We Do</p>
            <h2 className="font-display font-semibold leading-tight"
                style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', color: '#0b1c30' }}>
              Seven Technology Verticals.{' '}
              <span style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontStyle: 'italic',
                fontWeight: 700,
                fontSize: 'clamp(2.4rem, 4.2vw, 3.5rem)',
                color: '#3f692c',
              }}>
                One Mission.
              </span>
            </h2>
          </div>
          <p className="text-base leading-relaxed max-w-sm" style={{ color: '#141a12' }}>
            Each vertical addresses a distinct industrial challenge and represents
            an independent commercial opportunity.
          </p>
        </Reveal>

        {/* Grid — no box outlines, just floating content */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
          {SOLUTIONS.map(({ icon, title, desc, img }, i) => (
            <Reveal key={title} delay={(i % 4) * 0.1} className="group">

              {/* Image — no card box, just the image with rounded corners */}
              <div className="relative overflow-hidden rounded-2xl mb-4 hover-lift"
                   style={{ height: '180px' }}>
                <img
                  src={img}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0"
                     style={{ background: 'linear-gradient(to top, rgba(11,28,48,0.5) 0%, transparent 60%)' }} />
                <span className="absolute top-3 left-3 text-2xl"
                      style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }}>
                  {icon}
                </span>
              </div>

              {/* Text — no box, no border */}
              <h3 className="font-display font-semibold mb-2"
                  style={{ fontSize: '1.15rem', color: '#0b1c30' }}>
                {title}
              </h3>
              <p className="leading-relaxed" style={{ fontSize: '0.975rem', color: '#252b22' }}>
                {desc}
              </p>

            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}