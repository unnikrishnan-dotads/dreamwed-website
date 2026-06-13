import React from 'react';
import PricingSection from '../components/pricing/PricingSection';
import SEO from '../components/SEO';

const Packages = () => {
  return (
    <div className="pt-24">
      <SEO 
        title="Wedding Packages & Pricing"
        description="View our premium wedding photography and cinematic videography packages. Select from essential single-side coverage to all-inclusive cinematic cinema stories."
      />
      <PricingSection />
    </div>
  );
};

export default Packages;
