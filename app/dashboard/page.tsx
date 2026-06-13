import Navbar         from '@/components/Navbar';
import HeroSection    from '@/components/HeroSection';
import SolutionsGrid  from '@/components/SolutionsGrid';
import ImpactSection  from '@/components/ImpactSection';
import InnovationSpotlight from '@/components/InnovationSpotlight';
import ContactSection from '@/components/ContactSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SolutionsGrid />
      <ImpactSection />
      <InnovationSpotlight />
      <ContactSection />
    </>
  );
}