'use client';
import PollutionHero from '@/components/PollutionHero';
import TrustBar from '../components/TrustBar';
import WhatWeDo from '../components/WhatWeDo';
import InnovationSpotlight from '../components/InnovationSpotlight';
import IndustriesSection from '../components/IndustriesSection';
import ImpactSection from '../components/ImpactSection';
import WasteSliderSimulator from '../components/WasteSliderSimulator';
import InvestorsSection from '../components/InvestorsSection';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', color: '#000000' }}>
      <PollutionHero />
      <TrustBar />
      <WhatWeDo />
      <IndustriesSection />
      <InnovationSpotlight />
      <ImpactSection />
      <WasteSliderSimulator />
      <InvestorsSection />
      <Footer />
    </div>
  );
}