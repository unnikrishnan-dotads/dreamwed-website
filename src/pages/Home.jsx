import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Hero from "../components/sections/Hero";
import ExperienceBento from "../components/sections/ExperienceBento";
import TestimonialSection from "../components/sections/TestimonialSection";
import ConsultationSection from "../components/sections/ConsultationSection";
import InstagramFeed from "../components/sections/InstagramFeed";
import StickyServices from "../components/sections/StickyServices";
import Button from "../components/ui/Button";
import { FaArrowRight } from "react-icons/fa6";
import { Nicklo } from "../components/ui/Nicklo";
import BeforeAfterSlider from "../components/sections/BeforeAfterSlider";
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

      {/* 2b. AI Photo Search Section */}
      <section className="w-full py-24 px-8 lg:px-16 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-[40px] border border-white/5 bg-zinc-950 p-12 md:p-20 shadow-2xl flex flex-col lg:flex-row items-center gap-16">
            
            {/* Background glowing effects */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-[#881337]/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Left Content */}
            <div className="flex-1 text-left relative z-10">
              <span className="text-[11px] font-bold uppercase tracking-[3px] text-[#b4975a] bg-[#b4975a]/10 px-4 py-2.5 rounded-full inline-block mb-8">
                ✨ Now Live: Dreamwed AI
              </span>
              <h2 className="text-[36px] md:text-[54px] font-serif font-light leading-tight tracking-tight text-white mb-6">
                Find Your Wedding <br /> Photos Instantly
              </h2>
              <p className="text-zinc-400 text-lg md:text-xl font-light mb-10 max-w-lg leading-relaxed">
                No more scrolling through thousands of photos. Upload a simple selfie, and our high-performance AI scanner will cross-reference the wedding database to isolate all your high-resolution memories in milliseconds.
              </p>
              <div className="flex flex-wrap gap-6">
                <Link
                  to="/ai-search"
                  className="px-10 py-5 text-sm font-bold uppercase tracking-[2px] bg-gradient-to-r from-amber-500 via-[#d1a852] to-[#b4975a] text-white rounded-full hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_30px_rgba(180,151,90,0.25)]"
                >
                  Access AI Photo Search
                </Link>
              </div>
            </div>

            {/* Right Visual Scanner Demo */}
            <div className="flex-1 relative z-10 w-full max-w-md lg:max-w-none">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-black/60 p-6 flex items-center justify-center">
                
                {/* Simulated photo scanning frame */}
                <div className="absolute inset-8 rounded-2xl border border-[#b4975a]/30 bg-zinc-900/60 overflow-hidden flex items-center justify-center shadow-inner">
                  <img 
                    src="/ai_search_banner.png" 
                    alt="AI Face Scan Preview"
                    className="w-full h-full object-cover opacity-75"
                  />
                  
                  {/* Glowing Laser Sweep */}
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_20px_#f59e0b] animate-bounce w-full" style={{ animationDuration: '4s' }}></div>
                  
                  {/* Facial landmarks dots overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-36 h-36 border border-dashed border-[#b4975a]/50 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
                    <div className="absolute w-4 h-4 bg-amber-400/80 rounded-full blur-[2px] top-[40%] left-[35%] animate-ping" style={{ animationDuration: '3s' }}></div>
                    <div className="absolute w-4 h-4 bg-amber-400/80 rounded-full blur-[2px] top-[40%] right-[35%] animate-ping" style={{ animationDuration: '3.5s' }}></div>
                    <div className="absolute w-3 h-3 bg-amber-400/80 rounded-full blur-[1px] bottom-[35%] left-[48%] animate-ping" style={{ animationDuration: '2.5s' }}></div>
                  </div>
                </div>

                {/* Micro tech logs badge */}
                <div className="absolute bottom-12 left-12 right-12 bg-black/80 backdrop-blur-xl border border-white/5 rounded-xl p-3 flex justify-between items-center shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Neural Network Active</span>
                  </div>
                  <span className="text-[9px] font-mono text-amber-500">Matching Conf: 98.4%</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

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

      <BeforeAfterSlider />

       <Nicklo />

      {/* 4. Sticky Services Section */}
      <StickyServices />

      {/* 6. Bento Grid Experience */}
      <ExperienceBento />

      {/* 8. Testimonials Section */}
      <TestimonialSection />

      {/* 9. Instagram Feed */}
      <InstagramFeed />

      {/* 10. Consultation CTA */}
      <ConsultationSection />
    </div>
  );
};

export default Home;
