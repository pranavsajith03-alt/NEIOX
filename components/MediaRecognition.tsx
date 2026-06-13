// components/MediaRecognition.tsx

const ITEMS = [
  { icon: '📰', label: 'Press Coverage'       },
  { icon: '🏆', label: 'Awards'               },
  { icon: '🏛️', label: 'Government Recognition' },
  { icon: '💡', label: 'Innovation Challenges' },
  { icon: '🎤', label: 'Industry Conferences'  },
  { icon: '📄', label: 'Research Publications' },
  { icon: '🎙️', label: 'Speaking Engagements'  },
  { icon: '📍', label: 'Strategic Milestones'  },
];

export default function MediaRecognition() {
  return (
    <section id="media" className="site-section" style={{ background: '#f8f9ff' }}>
      <div className="site-container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div>
            <p className="text-label mb-3">Media & Recognition</p>
            <h2
              className="font-display font-semibold leading-tight mb-6"
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: '#0b1c30' }}
            >
              Where NEIOX Is{' '}
              <span style={{ color: '#3f692c' }}>Being Recognised.</span>
            </h2>
            <p className="leading-relaxed" style={{ color: '#42493d' }}>
              Our work at the intersection of industry and climate is attracting
              attention from media, institutions, and industry bodies.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {ITEMS.map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-4 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-sm"
                style={{ background: '#ffffff', borderColor: '#e5eeff' }}
              >
                <span className="text-xl">{icon}</span>
                <span className="text-sm font-medium" style={{ color: '#0b1c30' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
