import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Gift, Sparkles } from "lucide-react";
import Button from "../ui/Button";

const pricingPlans = [
  {
    title: "Silver",
    price: "₹49,999",
    tag: "Essential",
    desc: "Perfect for intimate weddings. Candid & traditional coverage for your special day.",
    images: ["/uploaded_bride_yellow.jpg", "/athulraj.jpg", "/anandha_lekshmi.jpg"],
    features: [
      "8 Hours Coverage",
      "1 Professional Photographer",
      "400+ Edited High-Res Photos",
      "Online Gallery Access",
      "30-Day Delivery",
    ],
  },
  {
    title: "Gold Lite",
    price: "₹99,999",
    tag: "Best Value",
    desc: "Complete photography & videography coverage with a premium layflat album.",
    images: ["/uploaded_couple_blackwhite.jpg", "/kochi_couple_carry.jpg", "/deepak.jpg"],
    features: [
      "Wedding Photo + Video Coverage",
      "Reception Photo + Video Coverage",
      "Premium 70-Page Album",
      "HD Cinematic Highlights Reel",
      "Full HD Wedding Video",
      "Social Media Reel",
      "Personalised Desktop Calendar",
    ],
  },
  {
    title: "Gold",
    price: "₹1,10,000",
    tag: "Most Popular",
    desc: "Our most-loved package — complete photo and video storytelling.",
    images: ["/uploaded_bride_traditional.jpg", "/uploaded_bride_gold.jpg", "/chindu.jpg"],
    features: [
      "Full Day Coverage (12 hrs)",
      "2 Photographers + 1 Videographer",
      "Cinematic Wedding Film (5–8 min)",
      "Social Media Highlight Reel",
      "500+ Edited High-Res Photos",
      "Online Gallery Access",
    ],
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { 
      delay: i * 0.1, 
      duration: 0.8, 
      ease: [0.22, 1, 0.36, 1] 
    },
  }),
};

const PricingSection = () => {
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

  return (
    <section className="w-full bg-[#f5f5f3] py-20 md:py-24 px-4 md:px-6 overflow-hidden">
      <div className="container">
        
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-5 py-2 rounded-full bg-[#ececea] text-[#5d665f] text-[11px] md:text-[12px] tracking-[0.2em] uppercase font-semibold mb-4 md:mb-6">
              Investment
            </span>
            <h2 className="text-[36px] sm:text-[44px] md:text-[56px] leading-[1.1] tracking-[-0.04em] text-black font-normal mb-4 md:mb-6 text-balance">
              Wedding Packages
            </h2>
            <p className="text-[15px] md:text-[18px] leading-relaxed text-[#6f766f] max-w-xl mx-auto font-light">
              Choose the package that fits your vision. All packages include a 
              personalised story consultation before the wedding.
            </p>
          </motion.div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
          {pricingPlans.map((plan, index) => {
            const isPopular = index === 2;
            return (
              <motion.div
                key={index}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                onClick={() => {
                  setActivePlanIndex(index);
                  setCurrentSlide(0);
                }}
                className={`relative rounded-[30px] md:rounded-[40px] p-8 md:p-10 flex flex-col transition-all duration-700 ease-[0.22, 1, 0.36, 1] group cursor-pointer hover:scale-[1.02] ${
                  isPopular 
                    ? "bg-[#1a1a1a] text-white xl:scale-105 xl:z-10 shadow-2xl" 
                    : "bg-[#ececea] text-black hover:bg-white border border-transparent hover:border-zinc-200"
                }`}
              >
                {/* Click hint inside card */}
                <div className={`absolute top-4 left-6 text-[8px] font-bold tracking-widest uppercase opacity-40 group-hover:opacity-100 transition-opacity duration-300 ${isPopular ? "text-white/60" : "text-zinc-500"}`}>
                  ✨ Click for photos & details
                </div>

                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute top-6 right-6 md:top-8 md:right-8 px-3 py-1 bg-white text-black text-[9px] md:text-[10px] font-bold rounded-full tracking-widest uppercase shadow-md">
                    ✦ Most Popular
                  </div>
                )}

                <div className="flex-1 pt-4">
                  <span className={`text-[10px] tracking-[0.2em] uppercase font-bold mb-4 block ${
                    isPopular ? "text-zinc-500" : "text-[#8a9289]"
                  }`}>
                    {plan.tag}
                  </span>
                  
                  <h3 className="text-[28px] md:text-[34px] leading-[1.1] tracking-[-0.04em] font-normal mb-3 font-serif">
                    {plan.title}
                  </h3>
                  
                  <p className={`text-[14px] md:text-[15px] leading-relaxed mb-6 md:mb-8 min-h-[2.5rem] font-light ${
                    isPopular ? "text-zinc-400" : "text-[#66706a]"
                  }`}>
                    {plan.desc}
                  </p>

                  <div className="mb-6 md:mb-8">
                    <span className="text-[34px] md:text-[44px] leading-none tracking-[-0.04em] font-normal numbers-pro">
                      {plan.price}
                    </span>
                  </div>

                  <div className={`w-full h-px mb-6 md:mb-8 ${
                    isPopular ? "bg-zinc-800" : "bg-[#d8d8d8]"
                  }`} />

                  <ul className="space-y-3 md:space-y-4">
                    {plan.features.slice(0, 5).map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check 
                          size={16} 
                          className={`mt-1 shrink-0 ${
                            isPopular ? "text-white" : "text-[#5d665f]"
                          }`} 
                        />
                        <span className={`text-[14px] md:text-[15px] leading-snug font-light numbers-pro ${
                          isPopular ? "text-zinc-300" : "text-[#2c2c2c]"
                        }`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                    {plan.features.length > 5 && (
                      <li className={`text-[12px] font-bold tracking-wider uppercase pl-7 mt-2 ${
                        isPopular ? "text-zinc-400" : "text-[#5d665f]"
                  }`}>
                        + View {plan.features.length - 5} More features...
                      </li>
                    )}
                  </ul>
                </div>

                <Button 
                  to="/contact"
                  variant={isPopular ? "secondary" : "primary"}
                  className="mt-8 md:mt-10 w-full py-4 md:py-4.5 rounded-[16px] md:rounded-[20px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  Book a Consultation
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

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
                    key={`bg-${pricingPlans[activePlanIndex].images[currentSlide % pricingPlans[activePlanIndex].images.length]}`}
                    src={pricingPlans[activePlanIndex].images[currentSlide % pricingPlans[activePlanIndex].images.length]}
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
                    key={`fg-${pricingPlans[activePlanIndex].images[currentSlide % pricingPlans[activePlanIndex].images.length]}`}
                    src={pricingPlans[activePlanIndex].images[currentSlide % pricingPlans[activePlanIndex].images.length]}
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
                  {pricingPlans[activePlanIndex].images.map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1 h-1 rounded-full transition-all duration-300 ${
                        (currentSlide % pricingPlans[activePlanIndex].images.length) === i ? "bg-[#b4975a] scale-125" : "bg-white/40"
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
                    {pricingPlans[activePlanIndex].tag} Collection
                  </span>
                  <h3 className="text-2xl sm:text-3xl text-zinc-900 font-semibold tracking-tight font-serif">
                    {pricingPlans[activePlanIndex].title} Package
                  </h3>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-[#1e3f20]">{pricingPlans[activePlanIndex].price}/-</span>
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
                    {pricingPlans[activePlanIndex].desc}
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
                      Complete Deliverables (Scroll for all {pricingPlans[activePlanIndex].features.length} items 👇):
                    </span>
                    <div className="space-y-3">
                      {pricingPlans[activePlanIndex].features.map((item, index) => (
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
    </section>
  );
};

export default PricingSection;

