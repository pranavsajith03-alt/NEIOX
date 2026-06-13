// components/ESGConsulting.tsx

const SERVICES = [
  { title: 'Sustainability Strategy',          desc: 'End-to-end sustainability strategy aligned with global frameworks.' },
  { title: 'Decarbonisation Roadmaps',         desc: 'Science-based pathways toward net zero for industrial operations.' },
  { title: 'Circular Economy Planning',        desc: 'Designing systems that maximise resource recovery and minimise waste.' },
  { title: 'Climate Impact Assessment',        desc: 'Quantifying environmental performance and opportunity areas.' },
  { title: 'Carbon Intelligence',              desc: 'Data-driven insights into carbon exposure, risk, and opportunity.' },
  { title: 'ESG Program Development',          desc: 'Building credible, measurable ESG programs for organisations.' },
  { title: 'Industrial Innovation Consulting', desc: 'Applying innovation methodologies to industrial environmental challenges.' },
  { title: 'Environmental Opportunity Mapping', desc: 'Identifying where environmental challenges create commercial value.' },
];

export default function ESGConsulting() {
  return (
    <section
      id="consulting"
      className="site-section relative overflow-hidden"
      style={{ background: '#213145' }}
    >
      <div className="absolute inset-0 opacity-10">
        <img
          src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1600&q=50"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
          loading="lazy"
        />
      </div>

      <div className="site-container relative z-10">
        <p className="text-label mb-3" style={{ color: '#a4d48a' }}>ESG & Industrial Consulting</p>
        <div className="flex flex-col lg:flex-row lg:items-end gap-6 mb-12">
          <h2
            className="font-display font-semibold text-white leading-tight max-w-xl"
            style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)' }}
          >
            Turning Environmental Obligations Into{' '}
            <span style={{ color: '#a4d48a' }}>Strategic Advantages.</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            We work with organisations to build ESG capability and identify
            commercial value in environmental challenges.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map(({ title, desc }) => (
            <div
              key={title}
              className="rounded-xl p-5 border transition-colors hover:bg-white/5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderColor: 'rgba(164,212,138,0.15)',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full mb-3"
                style={{ background: '#a4d48a' }}
              />
              <p className="font-medium text-white text-sm mb-1.5">{title}</p>
              <p className="text-xs leading-relaxed text-white/45">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
