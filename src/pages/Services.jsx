import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Video, BookOpen, Clock, Users, Heart, X, Check, Gift } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import SEO from '../components/SEO';
import customServiceImg from '../assets/images/new_portrait_3.jpg';

const Services = () => {
  const [activePlanIndex, setActivePlanIndex] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Keyboard Escape listener to exit modal smoothly
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActivePlanIndex(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-play slideshow for active modal gallery
  useEffect(() => {
    if (activePlanIndex === null) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => prev + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, [activePlanIndex]);

  const packages = [
    {
      title: "Wedding Photography",
      price: "₹39,999",
      tag: "Essential",
      desc: "Our highly sought-after single-side coverage package. Designed to capture every detail of your celebrations with elite creative precision.",
      images: ["/uploaded_bride_yellow.jpg", "/athulraj.jpg", "/anandha_lekshmi.jpg"],
      icon: <Camera className="w-10 h-10" />,
      features: [
        "Free Pre-Wedding (Photo Coverage)",
        "Wedding Day Photography & Videography",
        "Layflat panoramic album & duplicate parent copy",
        "Cinematic Highlights film & Full HD video",
        "1 Photographer + 1 Videographer Setup",
        "Premium Wall Frames & Desktop Calendar"
      ]
    },
    {
      title: "Wedding Photo & Pre-Wedding",
      price: "₹54,999",
      tag: "Premium",
      desc: "Perfect for capturing your beautiful pre-wedding love story and the complete wedding day celebrations. Includes comprehensive coverage.",
      images: ["/uploaded_couple_blackwhite.jpg", "/kochi_couple_carry.jpg", "/deepak.jpg"],
      icon: <Heart className="w-10 h-10" />,
      features: [
        "Premium Pre-Wedding Photo Shoot included",
        "Wedding Day Photography & Videography",
        "Layflat panoramic album & duplicate parent copy",
        "Cinematic Highlights film & Full HD video",
        "1 Photographer + 1 Videographer Setup",
        "Premium Wall Frames & Desktop Calendar"
      ]
    },
    {
      title: "Candid Photo & Videography",
      price: "₹69,999",
      tag: "Most Popular",
      desc: "Our creative 3-camera setup featuring dedicated candid photography. Ideal for artistic, natural, and unstaged storytelling.",
      images: ["/uploaded_bride_traditional.jpg", "/uploaded_bride_gold.jpg", "/chindu.jpg"],
      icon: <Video className="w-10 h-10" />,
      features: [
        "Premium Pre-Wedding Photo Shoot included",
        "Dedicated Candid photography coverage",
        "Traditional Wedding photo & video coverage",
        "Layflat panoramic album & duplicate parent copy",
        "1 Photographer + 1 Candid + 1 Videographer",
        "Premium Wall Frames & Desktop Calendar"
      ]
    }
  ];

  return (
    <div className="pt-24 bg-[#f5f5f3] select-none">
      <SEO 
        title="Services & Packages"
        description="Explore our curated wedding storytelling packages (Silver, Gold Lite, Gold) and custom bespoke photography services in Trivandrum, Kerala."
      />
      <section className="py-24">
        <div className="container">
          <SectionHeader 
            subtitle="Our Offerings" 
            title="Curated Storytelling Packages" 
            description="Premium photography and cinematic videography tailored to your unique love story."
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {packages.map((pkg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -10 }}
                onClick={() => {
                  setActivePlanIndex(i);
                  setCurrentSlide(0);
                }}
                className={`relative bg-white p-8 md:p-10 rounded-[40px] shadow-sm hover:shadow-2xl transition-all duration-700 border border-transparent cursor-pointer group flex flex-col justify-between ${i === 2 ? 'border-zinc-200 shadow-lg' : ''}`}
              >
                {/* Click hint inside card */}
                <div className="absolute top-4 left-8 text-[8px] font-bold tracking-widest uppercase opacity-40 group-hover:opacity-100 transition-opacity duration-300 text-zinc-500">
                  ✨ Click for photos & details
                </div>

                <div>
                  <div className="text-black mb-8 flex justify-center pt-2">{pkg.icon}</div>
                  <h3 className="text-[26px] font-normal text-center mb-4 tracking-tight leading-tight">{pkg.title}</h3>
                  <p className="text-[36px] font-normal text-center mb-8 text-black numbers-pro">{pkg.price}</p>
                  
                  <ul className="space-y-4 mb-10">
                    {pkg.features.slice(0, 5).map((feat, idx) => (
                      <li key={idx} className="flex gap-3 items-start text-[#66706a]">
                        <Heart size={16} className="text-[#5d665f] shrink-0 mt-1" />
                        <span className="numbers-pro font-light text-sm">{feat}</span>
                      </li>
                    ))}
                    {pkg.features.length > 5 && (
                      <li className="text-[11px] font-bold tracking-wider uppercase text-center mt-2 text-[#5d665f]">
                        + View {pkg.features.length - 5} More...
                      </li>
                    )}
                  </ul>
                </div>
                
                <div className="text-center mt-auto">
                  <Button to="/contact" variant={i === 2 ? 'primary' : 'outline'} className="w-full" onClick={(e) => e.stopPropagation()}>
                    Book a Consultation
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Photo Search Highlights Section */}
      <section className="w-full py-24 px-6 md:px-8 bg-zinc-950 text-white relative overflow-hidden">
        {/* Glow vector backdrops */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/5 rounded-full blur-[90px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#881337]/5 rounded-full blur-[90px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          {/* Left Scan Illustration Mockup */}
          <div className="flex-1 relative w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-black/60 p-5 flex items-center justify-center">
              <div className="absolute inset-6 rounded-2xl border border-[#b4975a]/30 bg-zinc-900/60 overflow-hidden flex items-center justify-center shadow-inner">
                <img 
                  src="/ai_search_banner.png" 
                  alt="AI Face Scan Preview"
                  className="w-full h-full object-cover opacity-70"
                />
                {/* Glowing bounce laser */}
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b] animate-bounce w-full" style={{ animationDuration: '4s' }}></div>
              </div>
              <div className="absolute bottom-10 left-10 right-10 bg-black/85 backdrop-blur-xl border border-white/5 rounded-xl p-3 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-300">Biometric Sync Active</span>
                </div>
                <span className="text-[8px] font-mono text-amber-500 uppercase tracking-widest">Confidence 99.2%</span>
              </div>
            </div>
          </div>

          {/* Right Text Contents */}
          <div className="flex-1 text-left space-y-8">
            <span className="text-[11px] font-bold uppercase tracking-[2.5px] text-[#b4975a] bg-[#b4975a]/10 px-4 py-2 rounded-full inline-block">
              ✨ Included in all packages
            </span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl sm:text-5xl text-white font-light tracking-tight leading-none">
              AI Photo Search & <span className="italic font-serif text-[#b4975a]">Print Preserves</span>
            </h2>
            <p className="text-zinc-400 text-sm font-light leading-relaxed max-w-lg">
              Empower your guests to skip scrolling through thousands of photos. By uploading a single portrait selfie, our high-precision facial scanner cross-references the wedding database to isolate their custom moments in milliseconds.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">⚡ Instant Selfie Scan</h4>
                <p className="text-[11px] text-zinc-500 font-light leading-relaxed">Guests scan in real-time with gold laser feedback & diagnostic logs.</p>
              </div>
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">🛍️ Archival Print Checkout</h4>
                <p className="text-[11px] text-zinc-500 font-light leading-relaxed">Direct size selection (8x12, 10x15, 12x18) with home dispatch.</p>
              </div>
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">🔒 Instagram Access Gate</h4>
                <p className="text-[11px] text-zinc-500 font-light leading-relaxed">Seamless lockscreen verification gate to grow social engagement.</p>
              </div>
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">📦 Real-time Dispatch Sync</h4>
                <p className="text-[11px] text-zinc-500 font-light leading-relaxed">Fulfilled and managed seamlessly in the central Dreamwed admin portal.</p>
              </div>
            </div>

            <div className="pt-4">
              <Button to="/ai-search/" variant="primary" className="px-10 py-4.5 text-xs tracking-widest uppercase font-bold">
                Experience AI Search Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* DYNAMIC IMMERSIVE DETAILED MODAL */}
      <AnimatePresence>
        {activePlanIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/25 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            onClick={() => setActivePlanIndex(null)}
          >
            <motion.div
              initial={{ scale: 0.93, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-4xl rounded-[40px] bg-white border border-zinc-100 overflow-y-auto md:overflow-hidden max-h-[90vh] md:max-h-[650px] shadow-[0_30px_80px_rgba(0,0,0,0.4)] grid grid-cols-1 md:grid-cols-2 text-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Extremely Prominent Close Button */}
              <button
                onClick={() => setActivePlanIndex(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full bg-black/75 hover:bg-black/90 border border-white/20 flex items-center justify-center text-white shadow-2xl transition-all hover:rotate-90 hover:scale-105 duration-300 z-50 cursor-pointer"
                title="Close popup"
              >
                <X size={22} strokeWidth={2.5} />
              </button>

              {/* Left Side: Auto-playing Wedding Photo Gallery with Dynamic Blurred Backdrop */}
              <div className="relative aspect-[4/5] md:aspect-auto w-full h-full bg-zinc-950 overflow-hidden min-h-[300px] md:min-h-[550px] flex items-center justify-center group select-none">
                
                {/* Dynamic Auto-rotating slideshow wrapper */}
                <div className="absolute inset-0 w-full h-full">
                  {/* Zoomed Blurred Background Layer */}
                  <motion.img
                    key={`bg-${packages[activePlanIndex].images[currentSlide % packages[activePlanIndex].images.length]}`}
                    src={packages[activePlanIndex].images[currentSlide % packages[activePlanIndex].images.length]}
                    alt=""
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.25 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 w-full h-full object-cover filter blur-3xl scale-110 opacity-25 select-none pointer-events-none"
                  />
                  {/* Semi-transparent dark overlay to ensure dynamic color contrast and block clear leaks */}
                  <div className="absolute inset-0 bg-black/45 z-0 pointer-events-none" />

                  {/* Crisp Foreground Layer */}
                  <motion.img
                    key={`fg-${packages[activePlanIndex].images[currentSlide % packages[activePlanIndex].images.length]}`}
                    src={packages[activePlanIndex].images[currentSlide % packages[activePlanIndex].images.length]}
                    alt="Dreamwed Stories Actual Wedding Capture"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 w-full h-full object-contain z-10"
                  />
                  {/* Subtle vignette shade overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none z-20" />
                </div>

                {/* Floating branding watermark */}
                <div className="absolute bottom-6 left-6 right-6 space-y-1 text-white z-10 pointer-events-none">
                  <span className="text-[#b4975a] text-[9px] font-bold tracking-[0.25em] uppercase block">Dreamwed Stories</span>
                  <h4 className="text-lg font-light tracking-tight text-white font-serif italic">
                    Actual Wedding Work Captures
                  </h4>
                  <p className="text-white/60 text-[9px] font-light">
                    Every pixel captured with high-fidelity professional optics.
                  </p>
                </div>

                {/* Slide indicator dots */}
                <div className="absolute top-6 left-6 flex gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/5 z-10 pointer-events-none">
                  {packages[activePlanIndex].images.map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1 h-1 rounded-full transition-all duration-300 ${
                        (currentSlide % packages[activePlanIndex].images.length) === i ? "bg-[#b4975a] scale-125" : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Right Side: Package Inclusions and Booking Option (Redesigned with Fixed Headers/CTA & Dynamic Scroll checklist) */}
              <div className="p-6 sm:p-10 flex flex-col justify-between gap-5 md:max-h-[650px] md:overflow-hidden overflow-visible h-auto">
                
                {/* Header detail */}
                <div className="space-y-2 select-none">
                  <span className="inline-flex items-center gap-1 bg-[#1e3f20]/5 text-[#1e3f20] px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase">
                    {packages[activePlanIndex].tag} Collection
                  </span>
                  <h3 className="text-2xl sm:text-3xl text-zinc-900 font-semibold tracking-tight font-serif">
                    {packages[activePlanIndex].title}
                  </h3>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-[#1e3f20]">{packages[activePlanIndex].price}/-</span>
                  </div>

                  {/* Symbolic Animated Scroll Arrow for Mobile */}
                  <div className="md:hidden flex justify-center pt-2 select-none pointer-events-none">
                    <motion.div
                      animate={{ y: [0, 6, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      className="text-[#b4975a] flex flex-col items-center gap-1"
                    >
                      <span className="text-[9px] font-semibold tracking-[0.25em] uppercase opacity-75">Scroll</span>
                      <svg className="w-5 h-5 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.div>
                  </div>
                </div>

                {/* Main Scroll Stream (Checklist) */}
                <div className="flex-grow md:overflow-y-auto pr-2 space-y-5 md:scrollbar-thin relative min-h-0 overflow-visible h-auto">
                  
                  {/* Short intro bio */}
                  <p className="text-zinc-500 font-light text-xs leading-relaxed select-none">
                    {packages[activePlanIndex].desc}
                  </p>

                  {/* Bonus highlight box */}
                  <div className="bg-[#1e3f20]/5 border border-[#1e3f20]/15 p-4 rounded-2xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1e3f20]/15 flex items-center justify-center text-[#1e3f20] shrink-0">
                      <Gift size={16} />
                    </div>
                    <div>
                      <span className="block text-[#1e3f20] text-xs font-bold uppercase tracking-wide">
                        Dreamwed Stories Standard
                      </span>
                      <span className="text-zinc-600 text-[10px] font-light leading-snug block mt-0.5">
                        Premium color-grading, handcrafted album delivery, and a personalized story design consultation session.
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-zinc-100" />

                  {/* Complete inclusions list */}
                  <div className="space-y-3.5 relative">
                    <span className="text-[10px] text-zinc-800 tracking-wider uppercase font-bold block select-none">
                      Complete Deliverables (Scroll for all {packages[activePlanIndex].features.length} items 👇):
                    </span>
                    <div className="space-y-3">
                      {packages[activePlanIndex].features.map((item, index) => (
                        <div key={index} className="flex items-start gap-3 text-xs text-zinc-600 font-light leading-relaxed">
                          <span className="w-4.5 h-4.5 rounded-full bg-[#1e3f20]/10 text-[#1e3f20] flex items-center justify-center shrink-0 mt-0.5">
                            <Check size={10} strokeWidth={3} />
                          </span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-4" />
                </div>

                <div className="w-full h-px bg-zinc-100 select-none" />

                {/* Book Consultation button */}
                <div className="space-y-3">
                  <Button
                    to="/contact"
                    variant="primary"
                    className="w-full py-4.5 rounded-2xl text-center text-xs uppercase tracking-widest font-bold select-none"
                    onClick={() => setActivePlanIndex(null)}
                  >
                    Book a Consultation Now 🌟
                  </Button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Standalone & Special Coverage Collections */}
      <section className="py-24 bg-[#ececea]/40 border-t border-b border-zinc-200/50">
        <div className="container">
          <SectionHeader 
            subtitle="Specialised Offerings" 
            title="Single Event & Standalone Packages" 
            description="Perfect for celebrating individual milestones or standalone day events with premium layflat albums and cinematic visuals."
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mt-16 items-start">
            
            {/* COLUMN 1: ENGAGEMENT SPECIAL COVERAGE */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-2 border-b border-zinc-300 pb-4">
                <span className="text-[#5d665f] text-xs font-bold tracking-[0.2em] uppercase">Collection 01</span>
                <h3 className="text-3xl text-zinc-900 font-normal tracking-tight font-serif italic">Engagement Special Coverage</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Pack A: Engagement Photo Only */}
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200/60 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-500 h-full group hover:border-[#1e3f20]/25">
                  <div className="space-y-4">
                    <span className="inline-flex bg-[#1e3f20]/5 text-[#1e3f20] px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase">Photo + Album</span>
                    <h4 className="text-[20px] font-normal leading-tight text-zinc-900">Engagement Photography</h4>
                    <p className="text-[28px] font-normal text-[#9b1c1c] numbers-pro">₹19,999/-</p>
                    <ul className="space-y-3 pt-2">
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span>Dedicated Candid & Traditional Photographer</span>
                      </li>
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span>4 Hours Coverage</span>
                      </li>
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span>150+ Edited High-Res Photos</span>
                      </li>
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span className="font-semibold text-zinc-800">Premium Layflat Panoramic Album</span>
                      </li>
                    </ul>
                  </div>
                  <Button to="/contact" variant="outline" className="w-full mt-8" onClick={(e) => e.stopPropagation()}>
                    Book Engagement
                  </Button>
                </div>

                {/* Pack B: Engagement Photo + Video */}
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200/60 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-500 h-full group hover:border-[#1e3f20]/25">
                  <div className="space-y-4">
                    <span className="inline-flex bg-[#1e3f20]/5 text-[#1e3f20] px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase">Photo + Video</span>
                    <h4 className="text-[20px] font-normal leading-tight text-zinc-900">Engagement with Videography</h4>
                    <p className="text-[28px] font-normal text-[#9b1c1c] numbers-pro">₹28,999/-</p>
                    <ul className="space-y-3 pt-2">
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span>1 Photographer + 1 Videographer</span>
                      </li>
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span>4 Hours Full Event Coverage</span>
                      </li>
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span>200+ Edited High-Res Photos</span>
                      </li>
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span className="font-semibold text-zinc-800">HD Cinematic Highlights Reel</span>
                      </li>
                    </ul>
                  </div>
                  <Button to="/contact" variant="outline" className="w-full mt-8" onClick={(e) => e.stopPropagation()}>
                    Book Full Event
                  </Button>
                </div>
              </div>
            </motion.div>
            
            {/* COLUMN 2: STANDALONE EVENT COVERAGE */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="space-y-8"
            >
              <div className="space-y-2 border-b border-zinc-300 pb-4">
                <span className="text-[#5d665f] text-xs font-bold tracking-[0.2em] uppercase">Collection 02</span>
                <h3 className="text-3xl text-zinc-900 font-normal tracking-tight font-serif italic">Standalone Event Coverage</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Pack A: Wedding Day Only */}
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200/60 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-500 h-full group hover:border-[#1e3f20]/25">
                  <div className="space-y-4">
                    <span className="inline-flex bg-[#1e3f20]/5 text-[#1e3f20] px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase">Wedding Day Only</span>
                    <h4 className="text-[20px] font-normal leading-tight text-zinc-900">Standalone Wedding Day</h4>
                    <p className="text-[28px] font-normal text-[#9b1c1c] numbers-pro">₹39,999/-</p>
                    <ul className="space-y-3 pt-2">
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span>Professional Photo & Video Team</span>
                      </li>
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span>Up to 8 Hours Event Coverage</span>
                      </li>
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span className="font-semibold text-zinc-800">Premium 70-Page Layflat Album</span>
                      </li>
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span>Full HD Video Film + Reels</span>
                      </li>
                    </ul>
                  </div>
                  <Button to="/contact" variant="outline" className="w-full mt-8" onClick={(e) => e.stopPropagation()}>
                    Book Standalone Wedding
                  </Button>
                </div>

                {/* Pack B: Reception Day Only */}
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200/60 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-500 h-full group hover:border-[#1e3f20]/25">
                  <div className="space-y-4">
                    <span className="inline-flex bg-[#1e3f20]/5 text-[#1e3f20] px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase">Reception Only</span>
                    <h4 className="text-[20px] font-normal leading-tight text-zinc-900">Standalone Reception</h4>
                    <p className="text-[28px] font-normal text-[#9b1c1c] numbers-pro">₹29,999/-</p>
                    <ul className="space-y-3 pt-2">
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span>Professional Photo & Video Team</span>
                      </li>
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span>Up to 5 Hours Reception Coverage</span>
                      </li>
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span className="font-semibold text-zinc-800">Premium 50-Page Layflat Album</span>
                      </li>
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span>Full HD Video Film + Highlights</span>
                      </li>
                    </ul>
                  </div>
                  <Button to="/contact" variant="outline" className="w-full mt-8" onClick={(e) => e.stopPropagation()}>
                    Book Standalone Reception
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* COLUMN 3: HALDI SPECIAL COVERAGE */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="space-y-2 border-b border-zinc-300 pb-4">
                <span className="text-[#5d665f] text-xs font-bold tracking-[0.25em] uppercase">Collection 03</span>
                <h3 className="text-3xl text-zinc-900 font-normal tracking-tight font-serif italic">Haldi Special Coverage</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                {/* Pack A: Just Haldi Photography */}
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200/60 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-500 h-full group hover:border-[#d1a852]/25">
                  <div className="space-y-4">
                    <span className="inline-flex bg-[#1e3f20]/5 text-[#1e3f20] px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase">Photo Only</span>
                    <h4 className="text-[20px] font-normal leading-tight text-zinc-900">Haldi Photography (Only)</h4>
                    <p className="text-[28px] font-normal text-[#9b1c1c] numbers-pro">₹10,000/-</p>
                    <ul className="space-y-3 pt-2">
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span>Professional Photographer</span>
                      </li>
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span>2-3 Hours Event Coverage</span>
                      </li>
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span>50+ Edited High-Res Photos</span>
                      </li>
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span>Online Gallery Access</span>
                      </li>
                    </ul>
                  </div>
                  <Button to="/contact" variant="outline" className="w-full mt-8" onClick={(e) => e.stopPropagation()}>
                    Book Haldi Photo
                  </Button>
                </div>

                {/* Pack B: Haldi Photography with Album */}
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200/60 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-500 h-full group hover:border-[#d1a852]/25">
                  <div className="space-y-4">
                    <span className="inline-flex bg-[#1e3f20]/5 text-[#1e3f20] px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase">Photo + Album</span>
                    <h4 className="text-[20px] font-normal leading-tight text-zinc-900">Haldi Photography with Album</h4>
                    <p className="text-[28px] font-normal text-[#9b1c1c] numbers-pro">₹15,000/-</p>
                    <ul className="space-y-3 pt-2">
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span>Dedicated Photographer</span>
                      </li>
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span>3-4 Hours Event Coverage</span>
                      </li>
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span>100+ Edited High-Res Photos</span>
                      </li>
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span className="font-semibold text-zinc-800">Premium Layflat Panoramic Album</span>
                      </li>
                    </ul>
                  </div>
                  <Button to="/contact" variant="outline" className="w-full mt-8" onClick={(e) => e.stopPropagation()}>
                    Book Haldi Album
                  </Button>
                </div>

                {/* Pack C: Haldi Photo & Videography */}
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200/60 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-500 h-full group hover:border-[#d1a852]/25 lg:col-span-1 sm:col-span-2">
                  <div className="space-y-4">
                    <span className="inline-flex bg-[#1e3f20]/5 text-[#1e3f20] px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase">Photo + Video</span>
                    <h4 className="text-[20px] font-normal leading-tight text-zinc-900">Haldi Photo & Videography</h4>
                    <p className="text-[28px] font-normal text-[#9b1c1c] numbers-pro">₹28,000/-</p>
                    <ul className="space-y-3 pt-2">
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span>1 Photographer + 1 Videographer</span>
                      </li>
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span>4 Hours Full Haldi Coverage</span>
                      </li>
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span>150+ Edited High-Res Photos</span>
                      </li>
                      <li className="flex gap-2 items-start text-zinc-500 text-xs">
                        <Heart size={14} className="text-[#5d665f] shrink-0 mt-0.5" />
                        <span className="font-semibold text-zinc-800">Premium Layflat Album & Edited Video</span>
                      </li>
                    </ul>
                  </div>
                  <Button to="/contact" variant="outline" className="w-full mt-8" onClick={(e) => e.stopPropagation()}>
                    Book Full Haldi
                  </Button>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="bg-white py-32">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="text-[48px] md:text-[56px] leading-[1.1] tracking-[-0.04em] font-normal mb-8">
                Looking for <br /> Something Custom?
              </h2>
              <p className="text-[#66706a] text-[18px] md:text-[20px] mb-12 leading-relaxed font-light">
                Every wedding is unique, and sometimes a standard package doesn't quite fit your vision. We offer customizable add-ons and bespoke collections for destination weddings, multi-day celebrations, and elopements.
              </p>
              <ul className="grid grid-cols-2 gap-x-8 gap-y-6 mb-12">
                {[
                  { icon: <Clock size={20} />, text: "Extra Hours" },
                  { icon: <Users size={20} />, text: "Addl. Shooters" },
                  { icon: <BookOpen size={20} />, text: "Luxury Albums" },
                  { icon: <Camera size={20} />, text: "Film Photos" }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4 text-[13px] font-bold uppercase tracking-widest text-black">
                    <div className="text-[#5d665f]">{item.icon}</div>
                    {item.text}
                  </li>
                ))}
              </ul>
              <Button to="/packages" variant="outline" className="px-12">Request Bespoke Quote</Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl bg-gray-50"
            >
              <img src={customServiceImg} alt="Process" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
