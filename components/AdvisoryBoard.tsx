// components/AdvisoryBoard.tsx

const EXPERTISE = [
  { icon: '🏭', area: 'Industrial Innovation',  desc: 'Deep expertise in scaling industrial technology from lab to market.' },
  { icon: '🧪', area: 'Advanced Materials',      desc: 'Material science and next-generation performance applications.' },
  { icon: '⚓', area: 'Maritime Technologies',   desc: 'Maritime industry operations, regulations, and sustainability.' },
  { icon: '🌍', area: 'Climate Strategy',         desc: 'Policy, frameworks, and pathways toward decarbonisation.' },
  { icon: '📈', area: 'Business Growth',          desc: 'Scaling innovation-led companies for global markets.' },
  { icon: '🏛️', area: 'Public Policy',            desc: 'Government engagement, regulatory navigation, and advocacy.' },
];

export default function AdvisoryBoard() {
  return (
    <section id="advisory" className="site-section" style={{ background: '#ffffff' }}>
      <div className="site-container">
        <p className="text-label mb-3">Advisory Board</p>
        <div className="flex flex-col lg:flex-row lg:items-end gap-6 mb-12">
          <h2
            className="font-display font-semibold leading-tight max-w-lg"
            style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: '#0b1c30' }}
          >
            Guided By Deep{' '}
            <span style={{ color: '#3f692c' }}>Industry Expertise.</span>
          </h2>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#73796c' }}>
            Our advisors bring decades of experience across the sectors
            and disciplines that matter most to our mission.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {EXPERTISE.map(({ icon, area, desc }) => (
            <div
              key={area}
              className="rounded-2xl p-6 border transition-all hover:-translate-y-1 hover:shadow-md"
              style={{ background: '#f8f9ff', borderColor: '#e5eeff' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
                style={{ background: '#e8f5ee' }}
              >
                {icon}
              </div>
              <h3 className="font-display font-medium mb-2 text-sm" style={{ color: '#0b1c30' }}>
                {area}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: '#73796c' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
