import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Gift, Sparkles, Heart, Tag, Camera, Plane } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

const pricingPlans = [
  {
    title: "Wedding Photography",
    price: "₹39,999",
    tag: "+ FREE PRE-WEDDING PHOTO (LIMITED TIME)",
    modalTag: "Essential",
    subtitle: "ESSENTIAL SINGLE-SIDE",
    preweddingOffer: "FREE PRE-WEDDING PHOTO (WORTH ₹15,000)",
    desc: "Our highly sought-after single-side coverage package. Designed to capture every detail of your celebrations with elite creative precision and beautiful physical heirlooms.",
    setup: "1 Photographer + 1 Videographer",
    images: ["/uploaded_bride_yellow.jpg", "/athulraj.jpg", "/anandha_lekshmi.jpg"],
    features: [
      "Free Pre-Wedding (Photo Coverage)",
      "Wedding Reception Photography",
      "Wedding Reception Videography",
      "Wedding Day Photography",
      "Wedding Day Videography",
      "One 80-Pages Premium layflat Album (Panoramic layout)",
      "One 80-Pages Mini layflat Album (Parent copy)",
      "Cinematic Highlights Video Film",
      "Full HD Wedding Video Film (Traditional & Candid mix)",
      "Instagram Wedding Reel & Social Media edits",
      "1 Photographer Setup",
      "1 Videographer Setup",
      "2x Premium Wall Frames & Custom Calendar",
      "Edited Social-Media Photos & High-speed Pendrive"
    ]
  },
  {
    title: "Wedding Photo & Pre-Wedding",
    price: "₹54,999",
    tag: "+ FREE PRE-WEDDING VIDEO (LIMITED TIME)",
    modalTag: "Premium",
    subtitle: "PRE-WEDDING & PHOTO",
    preweddingOffer: "FREE PRE-WEDDING VIDEO FILM (WORTH ₹9,999)",
    desc: "Perfect for capturing your beautiful pre-wedding love story and the complete wedding day celebrations. Includes comprehensive coverage and professional deliverables.",
    setup: "1 Photographer + 1 Videographer",
    images: ["/uploaded_couple_blackwhite.jpg", "/kochi_couple_carry.jpg", "/deepak.jpg"],
    features: [
      "Premium Pre-Wedding Photo Shoot",
      "Wedding Day Photography",
      "Wedding Day Videography",
      "One 80-Pages Premium layflat Album (Panoramic layout)",
      "One 80-Pages Mini layflat Album (Parent copy)",
      "Cinematic Highlights Video Film",
      "Full HD Wedding Video Film (Traditional & Candid mix)",
      "Instagram Wedding Reel & Social Media edits",
      "1 Photographer Setup",
      "1 Videographer Setup",
      "2x Premium Wall Frames & Custom Calendar",
      "Edited Social-Media Photos & High-speed Pendrive"
    ]
  },
  {
    title: "Candid Photo & Videography",
    price: "₹69,999",
    tag: "+ LIMITED TIME OFFER",
    modalTag: "Signature",
    subtitle: "ARTISTIC CANDID SHOTS",
    preweddingOffer: "FREE PRE-WEDDING PHOTO SESSION",
    desc: "Our creative 3-camera setup featuring dedicated candid photography. Ideal for couples who want artistic, natural, and unstaged storytelling of their special day.",
    setup: "1 Photographer + 1 Candid Photographer + 1 Videographer",
    images: ["/uploaded_bride_traditional.jpg", "/uploaded_bride_gold.jpg", "/chindu.jpg"],
    features: [
      "Premium Pre-Wedding Photo Shoot",
      "Dedicated Candid Photography Coverage",
      "Traditional Wedding Photography",
      "Traditional Wedding Videography",
      "One 80-Pages Premium layflat Album (Panoramic layout)",
      "One 80-Pages Mini layflat Album (Parent copy)",
      "Cinematic Highlights Video Film",
      "Full HD Wedding Film (Traditional & Candid mix)",
      "Instagram Wedding Reel & Social Media edits",
      "1 Photographer + 1 Candid Photographer + 1 Videographer Setup",
      "2x Premium Wall Frames & Custom Calendar",
      "Edited Social-Media Photos & High-speed Pendrive"
    ]
  },
  {
    title: "Candid Photo & Videography",
    price: "₹79,999",
    tag: "+ LIMITED TIME OFFER",
    modalTag: "Ultimate",
    subtitle: "CINEMATIC CINEMA STORY",
    preweddingOffer: "FREE BOTH PRE-WEDDING PHOTO & VIDEO (WORTH ₹30,000)",
    desc: "Our signature high-production cinematic package. Includes both premium pre-wedding photo & cinema film, fine-art layflat albums, and full-spectrum cinema-grade wedding storytelling.",
    setup: "1 Photographer + 1 Candid Photographer + 1 Videographer",
    images: ["/uploaded_couple_blackwhite.jpg", "/kochi_couple_carry.jpg", "/deepak.jpg"],
    features: [
      "Pre-Wedding Photo AND Cinematic Video Film!",
      "Dedicated Candid Photography Coverage",
      "Traditional Wedding Photography",
      "Cinematic Wedding Videography (Cinema-grade coloring)",
      "One 90-Page Premium layflat Album (Archival Fine-Art Paper)",
      "One 90-Page Mini layflat Album (Parent copy)",
      "Cinematic Highlights Video Film (Cinema-grade coloring & sound design)",
      "Full HD Wedding Film with Candids & Live sound capture",
      "Instagram Wedding Reel & Social Media edits",
      "1 Photographer + 1 Candid Photographer + 1 Videographer Setup",
      "2x Luxury Wall Frames & Signature Album Bag",
      "Custom Desktop Calendar & High-speed Pendrive"
    ]
  }
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
  const [likedPlans, setLikedPlans] = useState({});

  const toggleLike = (e, index) => {
    e.stopPropagation();
    setLikedPlans((prev) => ({ ...prev, [index]: !prev[index] }));
  };

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

  // WhatsApp Share Functionality
  const handleShare = (e, plan, idx) => {
    e.stopPropagation();
    
    const ids = ["pkgWeddingBasicCard", "pkgWeddingPreCard", "pkgCandidCard", "pkgCandidVideoCard"];
    const cardId = ids[idx];
    const shareUrl = `${window.location.origin}/packages?pkg=${cardId}`;
    
    const featuresList = plan.features.slice(0, 5).map(f => `• ${f}`).join('\n');
    
    const message = `📸 *DREAMWED STORIES — Premium Wedding Package* \n\n` +
                    `📦 *${plan.title}* (${plan.subtitle})\n` +
                    `💰 *Price:* ${plan.price} Net\n` +
                    `⚙️ *Setup:* ${plan.setup}\n\n` +
                    `🎁 *EXCLUSIVE OFFER:* \n` +
                    `⭐ ${plan.tag ? plan.tag.replace('+ ', '') : plan.preweddingOffer}\n\n` +
                    `📜 *Key Inclusions:* \n${featuresList}\n\n` +
                    `Explore details, custom add-ons & our actual wedding work portfolio here:\n` +
                    `🔗 ${shareUrl}`;
                    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Auto-open modal on shared link access
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pkgParam = params.get("pkg");
    if (pkgParam !== null) {
      let matchedIndex = parseInt(pkgParam);
      if (isNaN(matchedIndex)) {
        const ids = ["pkgWeddingBasicCard", "pkgWeddingPreCard", "pkgCandidCard", "pkgCandidVideoCard"];
        matchedIndex = ids.indexOf(pkgParam);
      }
      if (matchedIndex >= 0 && matchedIndex < pricingPlans.length) {
        setActivePlanIndex(matchedIndex);
        
        // Smooth scroll to pricing grid
        setTimeout(() => {
          const element = document.getElementById("pricing-grid-container");
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 300);
      }
    }
  }, []);

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
        <div id="pricing-grid-container" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
          {pricingPlans.map((plan, index) => {
            const isSpecial = index === 3;
            
            // Helper to split title elegantly on two lines
            const getSplitTitle = (title, idx) => {
              if (idx === 0) return ["Wedding", "Photography"];
              if (idx === 1) return ["Wedding Photo &", "Pre-Wedding"];
              if (idx === 2 || idx === 3) return ["Candid Photo &", "Videography"];
              return [title, ""];
            };

            const [titleLine1, titleLine2] = getSplitTitle(plan.title, index);

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
                className={`relative rounded-[32px] md:rounded-[40px] overflow-hidden flex flex-col transition-all duration-700 ease-[0.22, 1, 0.36, 1] group cursor-pointer hover:scale-[1.02] ${
                  isSpecial 
                    ? "border-[3px] border-[#d1a852] shadow-[0_0_35px_rgba(209,168,82,0.3),_0_20px_50px_rgba(0,0,0,0.4)]" 
                    : "border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
                } aspect-[9/17.2] min-h-[580px] md:min-h-[640px]`}
              >
                {/* Background Cover Image with Zoom Effect */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={plan.images[0]}
                    alt={plan.title}
                    className="w-full h-full object-cover transition-transform duration-1000 ease-[0.16, 1, 0.3, 1] group-hover:scale-105"
                  />
                  {/* Luxury black gradients for extreme legibility */}
                  <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-transparent to-black/95 z-10 pointer-events-none" />
                </div>

                {/* Floating Top Elements */}
                <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-center">
                  {/* Badge */}
                  <div className={`px-3.5 py-1.5 rounded-full text-[8.5px] font-extrabold tracking-widest uppercase flex items-center gap-1 backdrop-blur-md transition-all duration-300 ${
                    isSpecial 
                      ? "bg-gradient-to-r from-[#d1a852] to-[#b8903b] text-black border border-[#d1a852] shadow-[0_0_15px_rgba(209,168,82,0.45)]" 
                      : "bg-black/50 border border-[#d1a852]/35 text-[#d1a852] shadow-[0_0_10px_rgba(209,168,82,0.2)]"
                  }`}>
                    {plan.tag}
                  </div>

                  {/* Floating Heart Icon Button */}
                  <button
                    onClick={(e) => toggleLike(e, index)}
                    className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 cursor-pointer"
                    title="Add to wishlist"
                  >
                    <Heart
                      size={16}
                      className={`transition-colors duration-300 ${likedPlans[index] ? "fill-red-500 stroke-red-500" : "stroke-white"}`}
                    />
                  </button>
                </div>

                {/* Click hint inside card */}
                <div className="absolute top-20 left-0 right-0 z-20 text-center flex items-center justify-center gap-1.5 text-[8.5px] font-bold tracking-[0.2em] text-white/50 group-hover:text-white/90 transition-colors duration-300">
                  <span className="text-amber-400">✈</span> CLICK FOR PHOTOS & DETAILS
                </div>

                {/* Card Content Overlaid on Bottom */}
                <div className="relative z-10 flex flex-col h-full justify-end p-6 md:p-8 mt-auto select-none">
                  {/* Title */}
                  <h3 className="text-[26px] sm:text-[28px] md:text-[32px] leading-tight font-serif text-white font-light text-center mb-1">
                    {titleLine1}
                    {titleLine2 && <span className="block mt-0.5">{titleLine2}</span>}
                  </h3>

                  {/* Category */}
                  <p className="text-[#d1a852] text-[9.5px] md:text-[10px] tracking-[0.2em] font-semibold uppercase text-center mb-3">
                    {plan.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-zinc-400 text-[11px] md:text-[12px] font-light text-center max-w-[255px] mx-auto mb-4 line-clamp-2 leading-relaxed">
                    {plan.desc}
                  </p>

                  {/* Luxury Pre-Wedding Offer Callout */}
                  {plan.preweddingOffer && (
                    <div className="mb-4 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d1a852]/12 via-[#d1a852]/3 to-transparent border border-[#d1a852]/30 backdrop-blur-md flex items-center justify-center gap-1.5 max-w-[260px] mx-auto shadow-[0_0_15px_rgba(209,168,82,0.08)]">
                      <Sparkles size={10} className="text-[#d1a852] animate-pulse flex-shrink-0" />
                      <span className="text-[#d1a852] text-[8.5px] font-bold tracking-[0.12em] uppercase text-center leading-tight">
                        {plan.preweddingOffer}
                      </span>
                    </div>
                  )}

                  {/* Pills Stack */}
                  <div className="flex flex-col items-center gap-2 mb-6">
                    {/* Price Pill */}
                    <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white text-xs font-light">
                      <Tag size={12} className="text-[#d1a852]" />
                      <span>from <strong className="font-semibold text-white">{plan.price}</strong></span>
                    </div>

                    {/* Setup Pill */}
                    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 text-white/90 text-xs font-light">
                      {plan.title.includes("Pack 04") ? (
                        <Plane size={12} className="text-amber-400 rotate-45" />
                      ) : (
                        <Camera size={12} className="text-zinc-300" />
                      )}
                      <span>{plan.setup}</span>
                    </div>
                  </div>

                  {/* CTA Secure Offer Button */}
                  <Link
                    to="/contact"
                    className="py-3.5 px-8 w-full max-w-[170px] mx-auto rounded-[20px] bg-white text-black hover:bg-zinc-100 hover:shadow-lg transition-all duration-300 text-[11px] font-extrabold tracking-[0.2em] flex flex-col items-center justify-center leading-tight shadow-md select-none cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>SECURE</span>
                    <span>OFFER</span>
                  </Link>

                  {/* WhatsApp Share Button */}
                  <button
                    onClick={(e) => handleShare(e, plan, index)}
                    className="mt-3.5 py-2 px-6 w-full max-w-[170px] mx-auto rounded-[16px] bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[9px] font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer"
                  >
                    <span className="text-emerald-400">📲</span> Share Package
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Standalone & Special Coverage Collections */}
        <div className="mt-28 pt-20 border-t border-zinc-300/60">
          <div className="text-center mb-16 px-4">
            <span className="inline-block px-5 py-2 rounded-full bg-[#ececea] text-[#5d665f] text-[11px] md:text-[12px] tracking-[0.2em] uppercase font-semibold mb-4 md:mb-6">
              Specialised Offerings
            </span>
            <h2 className="text-[32px] sm:text-[40px] md:text-[50px] leading-[1.1] tracking-[-0.04em] text-black font-normal mb-4 md:mb-6 text-balance">
              Single Event & Standalone Packages
            </h2>
            <p className="text-[15px] md:text-[18px] leading-relaxed text-[#6f766f] max-w-xl mx-auto font-light">
              Perfect for celebrating individual milestones or standalone day events with premium layflat albums and cinematic visuals.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
            
            {/* COLUMN 1: ENGAGEMENT SPECIAL COVERAGE */}
            <div className="space-y-6">
              <div className="space-y-2 border-b border-zinc-300 pb-4">
                <span className="text-[#5d665f] text-xs font-bold tracking-[0.2em] uppercase">Collection 01</span>
                <h3 className="text-2xl text-zinc-900 font-normal tracking-tight font-serif italic">Engagement Special Coverage</h3>
              </div>
              
              <div className="space-y-6">
                {/* Pack A: Engagement Photo Only */}
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200/60 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-500 h-full group hover:border-[#d1a852]/25">
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
                  <Link to="/contact" className="mt-8 py-3 w-full rounded-[16px] border border-zinc-300 text-black hover:bg-zinc-50 transition-all text-center text-xs font-bold uppercase tracking-wider block">
                    Book Engagement
                  </Link>
                </div>

                {/* Pack B: Engagement Photo + Video */}
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200/60 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-500 h-full group hover:border-[#d1a852]/25">
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
                  <Link to="/contact" className="mt-8 py-3 w-full rounded-[16px] border border-zinc-300 text-black hover:bg-zinc-50 transition-all text-center text-xs font-bold uppercase tracking-wider block">
                    Book Full Event
                  </Link>
                </div>
              </div>
            </div>

            {/* COLUMN 2: STANDALONE EVENT COVERAGE */}
            <div className="space-y-6">
              <div className="space-y-2 border-b border-zinc-300 pb-4">
                <span className="text-[#5d665f] text-xs font-bold tracking-[0.2em] uppercase">Collection 02</span>
                <h3 className="text-2xl text-zinc-900 font-normal tracking-tight font-serif italic">Standalone Event Coverage</h3>
              </div>
              
              <div className="space-y-6">
                {/* Pack A: Wedding Day Only */}
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200/60 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-500 h-full group hover:border-[#d1a852]/25">
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
                  <Link to="/contact" className="mt-8 py-3 w-full rounded-[16px] border border-zinc-300 text-black hover:bg-zinc-50 transition-all text-center text-xs font-bold uppercase tracking-wider block">
                    Book Standalone Wedding
                  </Link>
                </div>

                {/* Pack B: Reception Day Only */}
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200/60 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-500 h-full group hover:border-[#d1a852]/25">
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
                  <Link to="/contact" className="mt-8 py-3 w-full rounded-[16px] border border-zinc-300 text-black hover:bg-zinc-50 transition-all text-center text-xs font-bold uppercase tracking-wider block">
                    Book Standalone Reception
                  </Link>
                </div>
              </div>
            </div>

            {/* COLUMN 3: HALDI SPECIAL COVERAGE */}
            <div className="space-y-6">
              <div className="space-y-2 border-b border-zinc-300 pb-4">
                <span className="text-[#5d665f] text-xs font-bold tracking-[0.25em] uppercase">Collection 03</span>
                <h3 className="text-2xl text-zinc-900 font-normal tracking-tight font-serif italic">Haldi Special Coverage</h3>
              </div>
              
              <div className="space-y-6">
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
                  <Link to="/contact" className="mt-8 py-3 w-full rounded-[16px] border border-zinc-300 text-black hover:bg-zinc-50 transition-all text-center text-xs font-bold uppercase tracking-wider block">
                    Book Haldi Photo
                  </Link>
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
                  <Link to="/contact" className="mt-8 py-3 w-full rounded-[16px] border border-zinc-300 text-black hover:bg-zinc-50 transition-all text-center text-xs font-bold uppercase tracking-wider block">
                    Book Haldi Album
                  </Link>
                </div>

                {/* Pack C: Haldi Photo & Videography */}
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200/60 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-500 h-full group hover:border-[#d1a852]/25">
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
                  <Link to="/contact" className="mt-8 py-3 w-full rounded-[16px] border border-zinc-300 text-black hover:bg-zinc-50 transition-all text-center text-xs font-bold uppercase tracking-wider block">
                    Book Full Haldi
                  </Link>
                </div>
              </div>
            </div>

          </div>
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
                    {pricingPlans[activePlanIndex].modalTag || "Premium"} Collection
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
                      {pricingPlans[activePlanIndex].features.map((item, index) => {
                        const isFree = item.toLowerCase().includes("free") || item.toLowerCase().includes("pre-wedding");
                        return (
                          <div key={index} className={`flex items-start gap-3 text-xs leading-relaxed ${
                            isFree ? "font-semibold text-[#b8903b]" : "text-zinc-600 font-light"
                          }`}>
                            <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              isFree ? "bg-[#d1a852]/25 text-[#b8903b] shadow-[0_0_8px_rgba(209,168,82,0.2)] animate-pulse" : "bg-[#1e3f20]/10 text-[#1e3f20]"
                            }`}>
                              {isFree ? (
                                <Sparkles size={10} strokeWidth={3} />
                              ) : (
                                <Check size={10} strokeWidth={3} />
                              )}
                            </span>
                            {item}
                          </div>
                        );
                      })}
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
                  <button
                    onClick={(e) => handleShare(e, pricingPlans[activePlanIndex], activePlanIndex)}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.25)] select-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.504-5.719-1.465zm9.882-2.51c1.56.929 3.085 1.454 4.553 1.456 4.887 0 8.862-3.973 8.865-8.87.001-2.373-.921-4.604-2.597-6.282s-3.91-2.597-6.285-2.599c-4.895 0-8.868 3.977-8.871 8.874-.001 1.666.449 3.29 1.306 4.7l-.993 3.626zm12.39-7.235c-.26-.13-1.53-.755-1.77-.84-.23-.085-.4-.13-.57.13-.17.26-.65.82-.8 1-.15.17-.3.19-.56.06-.26-.13-1.1-.4-2.1-1.3-.77-.69-1.3-1.54-1.45-1.8-.15-.26-.016-.4.115-.53.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.3-.02-.43-.06-.13-.57-1.37-.78-1.88-.2-.5-.41-.43-.57-.44-.15-.008-.32-.01-.5-.01-.17 0-.46.06-.7.33-.24.27-.92.9-1.09 1.1-.17.2-.32.41-.53.5-.21.09-1.12.37-1.92-1.07-.63-.56-1.05-1.25-1.17-1.46-.12-.21-.01-.33.12-.46.12-.11.26-.26.39-.39.13-.13.17-.22.26-.36.09-.15.04-.28-.02-.41-.06-.13-.57-1.37-.78-1.88-.21-.51-.43-.43-.58-.44-.15-.01-.32-.01-.5-.01s-.46.07-.7.33c-.24.26-.92.9-1.09 1.1-.17.2-.32.41-.53.5-.21.09-1.12.37-1.92-1.07zm-1.8 1.48c.18-.09.38-.19.59-.29-.2-.31-.4-.63-.59-.95-.19-.32-.37-.64-.54-.97a6.22 6.22 0 0 1-.41-.85c-.07-.18-.1-.36-.08-.54.02-.18.1-.34.22-.47c.5-.53 1.01-1.07 1.5-1.6c.49-.53.97-1.07 1.44-1.61.16-.18.31-.37.45-.56.12-.16.2-.33.22-.52c.02-.19-.04-.38-.17-.53c-.33-.37-.67-.74-1.01-1.11a24.32 24.32 0 0 0-2.31-2.42c-.15-.14-.33-.23-.53-.25c-.2-.02-.4.04-.55.17a32.96 32.96 0 0 0-3.32 3.19c-.19.2-.34.42-.45.66c-.11.24-.16.5-.16.76c.01.26.07.51.19.74c.24.47.53.92.85 1.36c.64.88 1.41 1.68 2.27 2.37c.86.69 1.83 1.25 2.87 1.66c.52.2 1.06.36 1.62.46c.28.05.57.06.85.04c.28-.02.55-.1.79-.24z"/>
                    </svg>
                    Share Package on WhatsApp
                  </button>
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


