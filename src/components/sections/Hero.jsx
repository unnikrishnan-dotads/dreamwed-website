import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../ui/Button";
import { FaArrowRight, FaPlay, FaXmark } from "react-icons/fa6";
import RED from "../../assets/images/RED.jpg"

const Hero = () => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center p-0 overflow-hidden bg-zinc-950">
      {/* 1. Static Image Fallback & Base Background */}
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat z-0 transition-opacity duration-1000 ${
          isVideoLoaded ? "md:opacity-0" : "opacity-100"
        }`}
        style={{ backgroundImage: `url(${RED})` }}
      />

      {/* 2. Cinematic Looping Background Video (Only mounted on desktop for data/battery optimization) */}
      {isDesktop && (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 hidden md:block">
          <iframe
            src="https://www.youtube.com/embed/jnSAu-C6OmQ?autoplay=1&mute=1&loop=1&playlist=jnSAu-C6OmQ&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1"
            title="Cinematic background loop"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            onLoad={() => setIsVideoLoaded(true)}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] object-cover scale-[1.3] pointer-events-none transition-opacity duration-1000 ${
              isVideoLoaded ? "opacity-60" : "opacity-0"
            }`}
            style={{ border: 0 }}
          ></iframe>
        </div>
      )}

      {/* 3. Luxury Black/Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-zinc-950/40 to-zinc-950 z-0" />

      <div className="container relative z-10 text-center text-white px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-[42px] sm:text-[72px] md:text-[120px] leading-[1] tracking-[-0.05em] font-normal mb-4">
            Wedding
          </h1>
          <h1 className="text-[22px] sm:text-[42px] md:text-[64px] font-serif italic font-light -mt-2 sm:-mt-4 mb-8">
            Photography in Trivandrum
          </h1>
          <p className="text-[16px] sm:text-[18px] md:text-[22px] mb-6 text-white/90 max-w-2xl mx-auto font-light tracking-wide leading-relaxed">
            Capturing timeless love stories with elegance, emotion, and cinematic artistry. 
            Your special day, preserved forever.
          </p>
          <div className="flex justify-center mb-12">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 text-[10px] font-bold uppercase tracking-[2px] text-zinc-300 hover:text-white transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
            >
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                <FaPlay size={8} className="ml-0.5 text-white" />
              </span>
              Play Prewedding Video
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Button to="/services" variant="secondary" className="w-full sm:w-auto px-12">
              View Packages
            </Button>
            <Button to="/contact" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-black px-12">
              Book Consultation
            </Button>
          </div>
        </motion.div>
      </div>

      {/* 4. Cinematic Video Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-10 backdrop-blur-md"
          >
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsModalOpen(false)} />
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl aspect-video bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-20 text-white/75 hover:text-white bg-black/40 hover:bg-black/80 p-2.5 rounded-full transition-all border border-white/10 cursor-pointer"
              >
                <FaXmark size={20} />
              </button>
              <iframe
                src="https://www.youtube.com/embed/jnSAu-C6OmQ?autoplay=1&controls=1&rel=0"
                title="Prewedding Film"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                className="w-full h-full border-0"
                allowFullScreen
              ></iframe>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden sm:block"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-1 h-2 bg-white rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
