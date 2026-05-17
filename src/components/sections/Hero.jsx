import React from "react";
import { motion } from "framer-motion";
import Button from "../ui/Button";
import { FaArrowRight } from "react-icons/fa6";
import RED from "../../assets/images/RED.jpg"

const Hero = () => {
  const COUPLE_IMAGE_URL =
    {RED};

  return (
    <section className="relative h-screen flex items-center justify-center p-0 overflow-hidden">
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${RED})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      <div className="container relative z-10 text-center text-white px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-[52px] sm:text-[72px] md:text-[120px] leading-[1] tracking-[-0.05em] font-normal mb-4">
            Wedding
          </h1>
          <h1 className="text-[32px] sm:text-[42px] md:text-[64px] font-serif italic font-light -mt-2 sm:-mt-4 mb-8">
            Photography in Trivandrum
          </h1>
          <p className="text-[16px] sm:text-[18px] md:text-[22px] mb-12 text-white/90 max-w-2xl mx-auto font-light tracking-wide leading-relaxed">
            Capturing timeless love stories with elegance, emotion, and cinematic artistry. 
            Your special day, preserved forever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Button to="/services" variant="secondary" className="w-full sm:w-auto px-12">
              View Our Package
              <FaArrowRight className="ml-2" />
            </Button>
            <Button to="/contact" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-black px-12">
              Book A Consultation
            </Button>
          </div>
        </motion.div>
      </div>

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
