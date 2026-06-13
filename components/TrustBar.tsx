// components/TrustBar.tsx
// Copy all logo files into public/images/logos/ in your project:
//   csl.png, ksum.png, dpiit.png, iimk.png, iimk_live.jpg, nit.png, tbi.jpg

export default function TrustBar() {
  return (
    <section
      style={{
        background:   '#f0f4ff',
        borderTop:    '1px solid #dce9ff',
        borderBottom: '1px solid #dce9ff',
        padding:      '1.5rem 0',
      }}
    >
      <div className="site-container">

        {/* Label */}
        <p className="text-label" style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          Supported By
        </p>

        {/* Logo row */}
        <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-6 md:gap-8" style={{ rowGap: '1.5rem' }}>

          {/* ── CSL ───────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
            <img
              src="/images/logos/csl.png"
              alt="Cochin Shipyard Limited"
              className="h-12 sm:h-16 md:h-20 w-auto object-contain"
              style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.08))' }}
            />
            <span style={{ fontSize: '12.5px', color: '#1a2018', fontFamily: '"Inter", sans-serif', letterSpacing: '0.02em', fontWeight: 500 }}>
              Cochin Shipyard
            </span>
          </div>

          <Divider />

          {/* ── Kerala Startup Mission ────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
            <img
              src="/images/logos/ksum1.png"
              alt="Kerala Startup Mission"
              className="h-12 sm:h-16 md:h-20 w-auto object-contain"
              style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.08))' }}
            />
            <span style={{ fontSize: '12.5px', color: '#1a2018', fontFamily: '"Inter", sans-serif', letterSpacing: '0.02em', fontWeight: 500 }}>
              Kerala Startup Mission
            </span>
          </div>

          <Divider />

          {/* ── Startup India / DPIIT ─────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
            <img
              src="/images/logos/dpiit.png"
              alt="DPIIT Startup India"
              className="h-12 sm:h-16 md:h-20 w-auto object-contain"
              style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.08))' }}
            />
            <span style={{ fontSize: '12.5px', color: '#1a2018', fontFamily: '"Inter", sans-serif', letterSpacing: '0.02em', fontWeight: 500 }}>
              Startup India
            </span>
          </div>

          <Divider />

          {/* ── IIM Kozhikode + IIMK LIVE — grouped ─────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src="/images/logos/iimk.png"
                alt="IIM Kozhikode"
                className="h-12 sm:h-16 md:h-20 w-auto object-contain"
                style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.08))' }}
              />
              {/* Thin separator between the two grouped logos */}
              <div className="w-px h-8 sm:h-10 md:h-12" style={{ background: '#c2c9ba' }} />
              <img
                src="/images/logos/iimk_live.jpg"
                alt="IIMK LIVE"
                className="h-12 sm:h-16 md:h-20 w-auto object-contain"
                style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.08))' }}
              />
            </div>
            <span style={{ fontSize: '12.5px', color: '#1a2018', fontFamily: '"Inter", sans-serif', letterSpacing: '0.02em', fontWeight: 500 }}>
              IIM Kozhikode & IIMK LIVE
            </span>
          </div>

          <Divider />

          {/* ── NIT Calicut + TBI — grouped ───────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src="/images/logos/nit.png"
                alt="NIT Calicut"
                className="h-12 sm:h-16 md:h-20 w-auto object-contain"
                style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.08))' }}
              />
              <div className="w-px h-8 sm:h-10 md:h-12" style={{ background: '#c2c9ba' }} />
              <img
                src="/images/logos/tbi.jpg"
                alt="TBI NIT Calicut"
                className="h-12 sm:h-16 md:h-20 w-auto object-contain"
                style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.08))' }}
              />
            </div>
            <span style={{ fontSize: '12.5px', color: '#1a2018', fontFamily: '"Inter", sans-serif', letterSpacing: '0.02em', fontWeight: 500 }}>
              NIT Calicut & TBI
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}

/* Thin vertical divider between supporter groups */
function Divider() {
  return (
    <div
      className="w-px h-8 sm:h-10 md:h-12 shrink-0"
      style={{ background: 'linear-gradient(to bottom, transparent, #c2c9ba, transparent)' }}
    />
  );
}