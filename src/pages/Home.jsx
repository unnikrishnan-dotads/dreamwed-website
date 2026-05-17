import React from "react";
import { motion } from "framer-motion";
import Hero from "../components/sections/Hero";
import FeatureGrid from "../components/sections/FeatureGrid";
import ExperienceBento from "../components/sections/ExperienceBento";
import PricingSection from "../components/pricing/PricingSection";
import TestimonialSection from "../components/sections/TestimonialSection";
import ConsultationSection from "../components/sections/ConsultationSection";
import StickyServices from "../components/sections/StickyServices";
import PortraitShowcase from "../components/sections/PortraitShowcase";
import Button from "../components/ui/Button";
import { FaArrowRight } from "react-icons/fa6";
import { Nicklo } from "../components/ui/Nicklo";
import ServicesGrid from "../components/sections/ServicesGrid";
import SEO from "../components/SEO";

const Home = () => {
  return (
    <div className="relative w-full ">
      <SEO 
        title="Home"
        description="Capture your timeless love story with Dreamwed Stories, the premier wedding photography and cinematic wedding films studio in Trivandrum, Kerala. Browse premium packages and book professional shoots today."
      />
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Portrait Gallery Preview */}
      <PortraitShowcase />

      {/* 3. Mission / Statement Section */}

       

      <section className="w-full py-0 px-0 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-[36px] md:text-[62px] leading-[1.1] tracking-[-0.05em] text-[#5f6963] font-light"
          >
            Wedding photography in <br className="hidden md:block" /> Trivandrum
            with candid, traditional <br className="hidden md:block" /> &
            cinematic styles. Book professional{" "}
            <br className="hidden md:block" /> wedding shoots in Kerala today.
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 1 }}
            className="mt-20"
          >
            <Button
              to="/about"
              variant="primary"
              className="px-14 py-6 text-[18px]"
            >
              Discover Our Process <FaArrowRight className="ml-3" />
            </Button>
          </motion.div>
        </div>
      </section>

      <ServicesGrid />

       <Nicklo />

      {/* 4. Sticky Services Section */}
      <StickyServices />

      {/* 5. Expertise / Feature Grid */}
      <FeatureGrid />

      {/* 6. Bento Grid Experience */}
      <ExperienceBento />

      {/* 7. Pricing Section */}
      <PricingSection />

      {/* 8. Testimonials Section */}
      <TestimonialSection />

      {/* 9. Consultation CTA */}
      <ConsultationSection />
    </div>
  );
};

export default Home;
