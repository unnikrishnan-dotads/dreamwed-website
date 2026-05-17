import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Maximize2, X, ChevronLeft, ChevronRight, Sparkles, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Import the new high-res assets
import portrait1 from "../../assets/images/new_portrait_1.jpg";
import portrait2 from "../../assets/images/new_portrait_2.jpg";
import portrait3 from "../../assets/images/new_portrait_3.jpg";
import portrait4 from "../../assets/images/new_portrait_4.jpg";

const galleryImages = [
  {
    id: 1,
    src: portrait1,
    title: "The Regal Bride",
    style: "Traditional & Portraiture",
    desc: "A breathtaking high-fidelity capture detailing the intricate gold temple jewelry and the rich textures of a heritage red wedding saree.",
    camera: "Sony Alpha A7R V | 85mm f/1.4"
  },
  {
    id: 2,
    src: portrait2,
    title: "Eternal Journey",
    style: "Candid Walkway",
    desc: "Capturing a cinematic, slow-paced candid moment as the couple strolls down a timeless street, showcasing emotion in motion.",
    camera: "Sony Alpha A7R V | 50mm f/1.2"
  },
  {
    id: 3,
    src: portrait3,
    title: "Whispered Promises",
    style: "Minimalist Cinematic",
    desc: "A beautiful, bright composition against a pristine white wall, focusing on natural smiles and a relaxed, contemporary wedding vibe.",
    camera: "Sony Alpha A7R V | 35mm f/1.4"
  },
  {
    id: 4,
    src: portrait4,
    title: "Garden Rhapsody",
    style: "Fine Art Dance",
    desc: "An enchanting, dreamlike dance in a lush emerald garden, perfectly capturing the elegance of green traditional attire against nature.",
    camera: "Sony Alpha A7R V | 70-200mm f/2.8"
  }
];

// Interactive 3D Tilt Card Component
const TiltCard = ({ item, isHovered, isAnyHovered, onHoverStart, onHoverEnd, onClick }) => {
  const cardRef = useRef(null);
  
  // Motion values for tilt angles
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Smooth spring physics for tilt transition
  const rotateX = useSpring(x, { stiffness: 150, damping: 20 });
  const rotateY = useSpring(y, { stiffness: 150, damping: 20 });
  
  // Glare/Shine overlay coordinates
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareBg = useTransform(
    [glareX, glareY],
    ([gx, gy]) => `radial-gradient(circle 220px at ${gx}% ${gy}%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 80%)`
  );

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    // Width and height of card
    const width = rect.width;
    const height = rect.height;
    
    // Relative mouse position from center of card (-0.5 to 0.5)
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;
    
    // Calculate tilt angles (max 12 degrees)
    x.set(-mouseY * 12);
    y.set(mouseX * 12);
    
    // Update glare position (percentage coordinates)
    glareX.set(((e.clientX - rect.left) / width) * 100);
    glareY.set(((e.clientY - rect.top) / height) * 100);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    glareX.set(50);
    glareY.set(50);
    onHoverEnd();
  };

  // Determine scale and opacity based on hover state of siblings
  let cardScale = 1;
  let cardOpacity = 1;
  
  if (isAnyHovered) {
    if (isHovered) {
      cardScale = 1.04;
      cardOpacity = 1;
    } else {
      cardScale = 0.96;
      cardOpacity = 0.45;
    }
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={onHoverStart}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d"
      }}
      animate={{
        scale: cardScale,
        opacity: cardOpacity
      }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative aspect-[3/4] w-full max-w-[280px] sm:max-w-none rounded-[28px] overflow-hidden bg-zinc-950 cursor-pointer shadow-[0_15px_35px_rgba(0,0,0,0.08)] border border-zinc-100/50 hover:shadow-[0_25px_50px_rgba(180,151,90,0.15)] group transition-shadow duration-500"
    >
      {/* 3D glare overlay */}
      <motion.div 
        style={{ background: glareBg }}
        className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay"
      />

      {/* Main Image */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{ transform: "translateZ(-10px)" }}
      >
        <img
          src={item.src}
          alt={item.title}
          className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {/* Soft shadow gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-500" />
      </motion.div>

      {/* Interactive Expand Indicator */}
      <div className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
        <Maximize2 size={16} />
      </div>

      {/* Slide-Up Text Info */}
      <div 
        style={{ transform: "translateZ(20px)" }}
        className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white flex flex-col justify-end min-h-[50%]"
      >
        <span className="text-[#b4975a] font-semibold text-[10px] tracking-[0.2em] uppercase mb-1 block">
          {item.style}
        </span>
        <h3 className="text-xl font-light tracking-tight mb-2 text-white/95 group-hover:text-white transition-colors">
          {item.title}
        </h3>
        
        {/* Hidden detail description that reveals on hover */}
        <motion.p 
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isHovered ? 0.8 : 0,
            height: isHovered ? "auto" : 0
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-xs text-zinc-300 font-light leading-relaxed overflow-hidden"
        >
          {item.desc}
        </motion.p>
      </div>
    </motion.div>
  );
};

// Main Portrait Showcase Gallery
const PortraitShowcase = () => {
  const [hoveredId, setHoveredId] = useState(null);
  const [activeLightboxId, setActiveLightboxId] = useState(null);
  const navigate = useNavigate();

  // Handle escape key to close lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveLightboxId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeItem = galleryImages.find(item => item.id === activeLightboxId);

  const handleNext = () => {
    setActiveLightboxId(prev => (prev === galleryImages.length ? 1 : prev + 1));
  };

  const handlePrev = () => {
    setActiveLightboxId(prev => (prev === 1 ? galleryImages.length : prev - 1));
  };

  return (
    <div className="w-full bg-white py-16 px-6 md:px-12 border-b border-zinc-100">
      
      {/* 3D tilt gallery grid container */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          visible: { transition: { staggerChildren: 0.12 } }
        }}
        className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center mb-16"
      >
        {galleryImages.map((item) => (
          <motion.div
            key={item.id}
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
            }}
            className="w-full h-full flex justify-center"
          >
            <TiltCard
              item={item}
              isHovered={hoveredId === item.id}
              isAnyHovered={hoveredId !== null}
              onHoverStart={() => setHoveredId(item.id)}
              onHoverEnd={() => setHoveredId(null)}
              onClick={() => setActiveLightboxId(item.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Immersive Lightbox Modal */}
      <AnimatePresence>
        {activeLightboxId !== null && activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/98 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          >
            {/* Background close area */}
            <div className="absolute inset-0" onClick={() => setActiveLightboxId(null)} />

            {/* Lightbox Content Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-6xl bg-zinc-900 border border-zinc-800 rounded-[32px] overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 z-10"
            >
              
              {/* IMAGE PANEL (7 COLS) */}
              <div className="lg:col-span-8 bg-black relative flex items-center justify-center aspect-[4/3] lg:aspect-auto lg:h-[75vh] overflow-hidden">
                
                {/* Image carousel display with transition */}
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeItem.id}
                    src={activeItem.src}
                    alt={activeItem.title}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full object-contain pointer-events-none select-none max-h-[70vh] lg:max-h-full"
                  />
                </AnimatePresence>

                {/* Left Arrow Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-4 w-12 h-12 rounded-full bg-zinc-900/60 border border-zinc-800 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer z-20"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Right Arrow Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 w-12 h-12 rounded-full bg-zinc-900/60 border border-zinc-800 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer z-20"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Bottom Photo Count */}
                <div className="absolute bottom-5 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 text-xs font-semibold">
                  {activeItem.id} / {galleryImages.length}
                </div>
              </div>

              {/* DETAILS PANEL (4 COLS) */}
              <div className="lg:col-span-4 p-8 md:p-10 flex flex-col justify-between h-full bg-zinc-900 border-t lg:border-t-0 lg:border-l border-zinc-800 text-white min-h-[300px] lg:min-h-0">
                
                {/* Top Details */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={14} className="text-[#b4975a]" />
                    <span className="text-[#b4975a] font-semibold text-xs tracking-[0.20em] uppercase block">
                      {activeItem.style}
                    </span>
                  </div>

                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl font-light tracking-tight text-white mb-6">
                    {activeItem.title}
                  </h2>

                  <p className="text-sm font-light leading-relaxed text-zinc-400 mb-8">
                    {activeItem.desc}
                  </p>

                  <div className="flex items-center gap-3 p-4 bg-zinc-950/40 border border-zinc-800/80 rounded-[18px] text-zinc-400 text-xs font-medium">
                    <Camera size={16} className="text-zinc-500" />
                    <span>{activeItem.camera}</span>
                  </div>
                </div>

                {/* Bottom Action buttons */}
                <div className="mt-8 pt-6 border-t border-zinc-800/60 flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setActiveLightboxId(null);
                      navigate("/contact");
                    }}
                    className="w-full py-4 bg-[#b4975a] text-zinc-950 rounded-[16px] font-semibold hover:bg-[#d1a852] active:scale-[0.98] transition-all cursor-pointer text-center text-sm shadow-md"
                  >
                    Inquire For This Style
                  </button>
                  <button
                    onClick={() => setActiveLightboxId(null)}
                    className="w-full py-4 bg-transparent border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 rounded-[16px] font-semibold active:scale-[0.98] transition-all cursor-pointer text-center text-sm"
                  >
                    Back to Gallery
                  </button>
                </div>

              </div>

            </motion.div>

            {/* Absolute close top button outside panel */}
            <button
              onClick={() => setActiveLightboxId(null)}
              className="absolute top-6 right-6 w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer"
            >
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortraitShowcase;
