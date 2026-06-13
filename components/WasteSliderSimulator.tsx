'use client';
// components/WasteSliderSimulator.tsx

import { useMemo, useState } from 'react';
import Reveal from './motion/Reveal';

const MIN_TONS  = 500;
const MAX_TONS  = 50000;
const STEP_TONS = 100;
const DEFAULT_TONS = 10000;

// EPA-aligned conversion factors
const METHANE_FACTOR     = 0.024; // metric tons of pure CH4 avoided per ton of waste diverted
const CH4_TO_CO2E        = 28;    // methane GWP relative to CO2 over 100 years
const CARBON_CREDIT_RATE = 45;    // USD per metric ton of CO2e (compliant market baseline)
const TONS_PER_CAR_YEAR  = 4.6;   // average metric tons CO2e emitted per passenger vehicle / year

interface Preset {
  label: string;
  sublabel: string;
  tons: number;
}

const PRESETS: Preset[] = [
  { label: 'Small Community',    sublabel: '2,500 t',  tons: 2500  },
  { label: 'Mid-Sized City',      sublabel: '15,000 t', tons: 15000 },
  { label: 'Industrial Complex',  sublabel: '40,000 t', tons: 40000 },
];

const formatNumber = (value: number, fractionDigits = 0) =>
  value.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

const formatCurrency = (value: number) =>
  value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

export default function WasteSliderSimulator() {
  const [tons, setTons] = useState<number>(DEFAULT_TONS);

  const avoidedMethaneTons = useMemo(
    () => tons * METHANE_FACTOR,
    [tons]
  );

  const netCarbonOffsetTons = useMemo(
    () => avoidedMethaneTons * CH4_TO_CO2E,
    [avoidedMethaneTons]
  );

  const carbonCreditValueUsd = useMemo(
    () => netCarbonOffsetTons * CARBON_CREDIT_RATE,
    [netCarbonOffsetTons]
  );

  const carsOffRoad = useMemo(
    () => Math.floor(netCarbonOffsetTons / TONS_PER_CAR_YEAR),
    [netCarbonOffsetTons]
  );

  const sliderPercent = useMemo(
    () => ((tons - MIN_TONS) / (MAX_TONS - MIN_TONS)) * 100,
    [tons]
  );

  return (
    <section
      id="waste-simulator"
      className="site-section w-full overflow-hidden"
      style={{ background: 'var(--n-surface-low)' }}
    >
      <div className="site-container w-full box-border">

        {/* Header */}
        <Reveal className="flex flex-col lg:flex-row w-full" style={{ gap: '2rem', marginBottom: '3rem' }}>
          <div className="w-full lg:w-1/2">
            <p className="text-label" style={{ marginBottom: '1rem' }}>
              Waste Reduction &amp; Carbon Credit Simulator
            </p>
            <h2 style={{
              fontFamily:    'var(--font-display)',
              fontSize:      'clamp(1.6rem, 4vw, 2.35rem)',
              fontWeight:    500, lineHeight: 1.25,
              letterSpacing: '-0.01em', color: 'var(--n-on-surface)',
            }}>
              Model Your Carbon Credit Potential.
            </h2>
          </div>
          <div className="w-full lg:w-1/2 lg:pt-12">
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize:   '15px', lineHeight: 1.75,
              color:      'var(--n-on-surface-variant)',
            }}>
              Drag the slider to model how diverting industrial waste from
              landfill translates into avoided methane emissions, net CO₂e
              offsets, and tradable carbon credit value. Figures use standard
              EPA landfill-methane conversion benchmarks and are illustrative.
            </p>
          </div>
        </Reveal>

        {/* Slider panel */}
        <Reveal delay={0.1}>
        <div className="site-card w-full box-border" style={{ padding: '1.875rem', marginBottom: '1.5rem' }}>

          {/* Presets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ marginBottom: '2rem' }}>
            {PRESETS.map(preset => {
              const active = tons === preset.tons;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setTons(preset.tons)}
                  aria-pressed={active}
                  className="focus-glow"
                  style={{
                    display:        'flex',
                    flexDirection:  'column',
                    alignItems:     'flex-start',
                    justifyContent: 'center',
                    minHeight:      '48px',
                    width:          '100%',
                    padding:        '0.75rem 1rem',
                    borderRadius:   '0.5rem',
                    border:         `1.5px solid ${active ? 'var(--n-primary)' : 'var(--n-outline-variant)'}`,
                    background:     active ? 'var(--n-primary)' : 'var(--n-surface-lowest)',
                    color:          active ? '#ffffff' : 'var(--n-on-surface)',
                    fontFamily:     'var(--font-body)',
                    cursor:         'pointer',
                    textAlign:      'left',
                    transition:     'all 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: '13.5px', fontWeight: 600 }}>
                    {preset.label}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '11px',
                    color:      active ? 'rgba(255,255,255,0.8)' : 'var(--n-outline)',
                    marginTop:  '2px',
                  }}>
                    {preset.sublabel}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Primary slider */}
          <label
            htmlFor="waste-simulator-tons"
            className="text-label"
            style={{ display: 'block', marginBottom: '1rem' }}
          >
            Annual Waste Diverted
          </label>
          <input
            id="waste-simulator-tons"
            type="range"
            min={MIN_TONS}
            max={MAX_TONS}
            step={STEP_TONS}
            value={tons}
            onChange={e => setTons(Number(e.target.value))}
            className="waste-simulator-slider focus-glow"
            style={{
              width:      '100%',
              background: `linear-gradient(to right, var(--n-primary) ${sliderPercent}%, var(--n-outline-variant) ${sliderPercent}%)`,
            }}
          />
          <div className="flex items-center justify-between" style={{ marginTop: '0.75rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--n-outline)' }}>
              {formatNumber(MIN_TONS)} t
            </span>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '1.35rem',
              fontWeight: 600, color: 'var(--n-primary)',
            }}>
              {formatNumber(tons)}{' '}
              <span style={{ fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                metric tons / yr
              </span>
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--n-outline)' }}>
              {formatNumber(MAX_TONS)} t
            </span>
          </div>
        </div>
        </Reveal>

        {/* Metric grid — 1 col mobile, 3 cols from sm */}
        <div className="grid grid-cols-1 sm:grid-cols-3 w-full" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>

          {/* Avoided methane */}
          <Reveal delay={0.2}>
          <div className="site-card box-border" style={{ padding: '1.875rem' }}>
            <p className="text-label" style={{ marginBottom: '0.75rem' }}>
              Avoided Methane Emissions
            </p>
            <p style={{
              fontFamily:         'var(--font-mono)',
              fontSize:           'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight:         600, lineHeight: 1,
              color:              'var(--n-primary)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {formatNumber(avoidedMethaneTons, 1)}
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '13px',
              color: 'var(--n-on-surface-variant)', marginTop: '0.5rem',
            }}>
              metric tons CH₄ / year
            </p>
          </div>
          </Reveal>

          {/* Net carbon offset */}
          <Reveal delay={0.3}>
          <div className="site-card box-border" style={{ padding: '1.875rem' }}>
            <p className="text-label" style={{ marginBottom: '0.75rem' }}>
              Net Carbon Offset (CO₂e)
            </p>
            <p style={{
              fontFamily:         'var(--font-mono)',
              fontSize:           'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight:         600, lineHeight: 1,
              color:              'var(--n-primary)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {formatNumber(netCarbonOffsetTons, 1)}
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '13px',
              color: 'var(--n-on-surface-variant)', marginTop: '0.5rem',
            }}>
              metric tons CO₂e / year
            </p>
          </div>
          </Reveal>

          {/* Carbon credit value */}
          <Reveal delay={0.4}>
          <div className="site-card box-border" style={{ padding: '1.875rem' }}>
            <p className="text-label" style={{ marginBottom: '0.75rem' }}>
              Simulated Carbon Credit Value
            </p>
            <p style={{
              fontFamily:         'var(--font-mono)',
              fontSize:           'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight:         600, lineHeight: 1,
              color:              'var(--n-primary)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {formatCurrency(carbonCreditValueUsd)}
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '13px',
              color: 'var(--n-on-surface-variant)', marginTop: '0.5rem',
            }}>
              estimated value / year @ $45 per ton CO₂e
            </p>
          </div>
          </Reveal>
        </div>

        {/* Real-world equivalence */}
        <Reveal delay={0.5}>
        <div
          className="site-card w-full box-border flex flex-col sm:flex-row sm:items-center"
          style={{ padding: '1.875rem', gap: '1.25rem' }}
        >
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            width:          '56px',
            height:         '56px',
            borderRadius:   '0.5rem',
            background:     'var(--n-primary)',
            flexShrink:     0,
          }}>
            <svg
              viewBox="0 0 24 24" fill="none"
              style={{ width: '28px', height: '28px' }}
              stroke="#ffffff" strokeWidth={1.75}
              strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M3 13l1.5-4.5A2 2 0 0 1 6.4 7h11.2a2 2 0 0 1 1.9 1.5L21 13" />
              <path d="M3 13h18v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4z" />
              <circle cx="7.5" cy="17.5" r="1.5" />
              <circle cx="16.5" cy="17.5" r="1.5" />
            </svg>
          </div>
          <div>
            <p className="text-label" style={{ marginBottom: '0.375rem' }}>
              Real-World Equivalence
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '13px',
              lineHeight: 1.6, color: 'var(--n-on-surface-variant)',
            }}>
              Equivalent to taking{' '}
              <span style={{
                fontFamily: 'var(--font-mono)', fontWeight: 600,
                color: 'var(--n-primary)', fontVariantNumeric: 'tabular-nums',
              }}>
                {formatNumber(carsOffRoad)}
              </span>{' '}
              gasoline-powered cars off the road for one year.
            </p>
          </div>
        </div>
        </Reveal>

        {/* Disclaimer */}
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.04em',
          color: 'var(--n-outline)', marginTop: '1.5rem',
        }}>
          Estimates use standard EPA landfill-methane and global-warming-potential
          benchmarks (1 t diverted waste ≈ {METHANE_FACTOR} t CH₄ avoided;
          CH₄ GWP ≈ {CH4_TO_CO2E}x CO₂; carbon credit value at ${CARBON_CREDIT_RATE}/t CO₂e).
          Actual results vary by feedstock composition and site conditions.
        </p>

      </div>

      {/* Larger slider thumb — easier to grab on touch screens, with a filled active track */}
      <style>{`
        .waste-simulator-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 10px;
          border-radius: 9999px;
          outline: none;
          cursor: pointer;
        }
        .waste-simulator-slider::-webkit-slider-runnable-track {
          height: 10px;
          border-radius: 9999px;
          background: transparent;
        }
        .waste-simulator-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          margin-top: -9px;
          border-radius: 50%;
          background: var(--n-primary);
          border: 4px solid var(--n-surface-lowest);
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
          cursor: pointer;
          transition: box-shadow 0.25s ease, transform 0.15s ease;
        }
        .waste-simulator-slider:focus-visible::-webkit-slider-thumb {
          box-shadow: 0 0 0 6px rgba(164,212,138,0.30), 0 2px 8px rgba(0,0,0,0.18);
        }
        .waste-simulator-slider:active::-webkit-slider-thumb {
          transform: scale(1.12);
        }
        .waste-simulator-slider::-moz-range-track {
          height: 10px;
          border-radius: 9999px;
          background: var(--n-outline-variant);
        }
        .waste-simulator-slider::-moz-range-progress {
          height: 10px;
          border-radius: 9999px;
          background: var(--n-primary);
        }
        .waste-simulator-slider::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--n-primary);
          border: 4px solid var(--n-surface-lowest);
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
          cursor: pointer;
          transition: box-shadow 0.25s ease, transform 0.15s ease;
        }
        .waste-simulator-slider:focus-visible::-moz-range-thumb {
          box-shadow: 0 0 0 6px rgba(164,212,138,0.30), 0 2px 8px rgba(0,0,0,0.18);
        }
        .waste-simulator-slider:active::-moz-range-thumb {
          transform: scale(1.12);
        }
      `}</style>
    </section>
  );
}
