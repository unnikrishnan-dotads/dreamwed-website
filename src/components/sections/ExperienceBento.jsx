import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import Button from "../ui/Button";
import EXPERIENCE_BENTO1 from "../../assets/images/EXPERIENCE_BENTO1.png";
import capure1 from "../../assets/images/capture1.png";
import capure2 from "../../assets/images/capture2.png";
import capure3 from "../../assets/images/capture3.png";
import capure4 from "../../assets/images/capture4.png";
import capure5 from "../../assets/images/capture5.png";
import capure6 from "../../assets/images/capture6.png";

const AnimatedCounter = ({ value, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = parseInt(value);
      if (start === end) return;

      let totalMilisecondsChildOut = duration * 1000;
      let incrementTime = (totalMilisecondsChildOut / end);

      let timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start === end) clearInterval(timer);
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}</span>;
};

const ExperienceBento = () => {
  return (
    <section className="bg-white py-20 md:py-32">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* VIDEO CARD */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#ececea] rounded-[30px] md:rounded-[40px] p-6 md:p-10 overflow-hidden group"
            >
              <div className="overflow-hidden rounded-[20px] md:rounded-[28px] relative aspect-video shadow-2xl">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/jnSAu-C6OmQ?autoplay=1&mute=1&loop=1&playlist=jnSAu-C6OmQ"
                  title="Dreamwed Wedding Stories"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>

            {/* HERO TEXT CARD */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#ececea] rounded-[30px] md:rounded-[40px] p-10 md:p-16 flex flex-col justify-center items-center text-center min-h-[280px] md:min-h-[320px] group hover:bg-white transition-all duration-700"
            >
              <h2 className="text-[36px] sm:text-[48px] md:text-[72px] leading-[1.1] md:leading-[1] tracking-[-0.04em] text-black font-normal flex flex-col md:flex-row items-center flex-wrap justify-center gap-4">
                Get Your
                <div className="flex -space-x-4 my-2 md:my-0">
                  <img src={capure1} className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-white object-cover" alt="User 1" />
                  <img src={capure2} className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-white object-cover" alt="User 2" />
                  <img src={capure3} className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-white object-cover" alt="User 3" />
                </div>
                Dream Picture
              </h2>
              <p className="mt-6 md:mt-8 text-[18px] md:text-[26px] text-[#6d756f] font-light max-w-xl mb-10">
                Your wedding happens once. Book your date now
              </p>
              <Button to="/contact" variant="primary" className="px-12 py-5">
                Check Availability
              </Button>
            </motion.div>

            {/* BOTTOM SUB-GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* EXPERIENCE CARD */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#f2f2ef] rounded-[30px] md:rounded-[40px] p-10 md:p-14 flex flex-col justify-center relative overflow-hidden group hover:bg-white transition-all duration-700 shadow-sm hover:shadow-xl"
              >
                <div className="relative z-10">
                  <h3 className="text-[36px] md:text-[64px] leading-tight md:leading-none tracking-[-0.04em] text-[#5d665f] font-normal">
                    <span className="numbers-pro text-black"><AnimatedCounter value="12" />+</span> Years <br /> Experience
                  </h3>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="mt-6"
                  >
                    <img src="/favicon.png" alt="Dreamwed Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain opacity-80" />
                  </motion.div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-white/60 transition-all duration-700" />
              </motion.div>

              {/* REVIEWS CARD */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#f2f2ef] rounded-[30px] md:rounded-[40px] p-10 md:p-14 flex flex-col justify-center relative overflow-hidden group hover:bg-white transition-all duration-700 shadow-sm hover:shadow-xl"
              >
                <div className="flex gap-1.5 text-[#b96b1d] text-lg md:text-2xl mb-4 group-hover:scale-110 transition-transform origin-left duration-500">★ ★ ★ ★ ★</div>
                <h3 className="text-[48px] md:text-[90px] leading-none tracking-[-0.04em] text-[#222] font-normal numbers-pro">
                  <AnimatedCounter value="250" duration={2.5} />+
                </h3>
                <p className="text-[#6d756f] text-lg md:text-2xl font-light">Happy Couples</p>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/40 blur-3xl rounded-full -mr-16 -mb-16 group-hover:bg-white/60 transition-all duration-700" />
              </motion.div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-6">
            {/* PRICING PREVIEW CARD */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#ececea] rounded-[30px] md:rounded-[40px] p-8 md:p-10 flex flex-col justify-between group hover:bg-white transition-all duration-700 min-h-[400px] md:min-h-[500px]"
            >
              <div>
                <h3 className="text-[36px] md:text-[58px] leading-[1.1] tracking-[-0.04em] text-black font-normal mb-6">
                  Starting @ <span className="numbers-pro">₹39,999</span>
                </h3>
                <p className="text-[17px] md:text-[22px] text-[#6d756f] leading-relaxed font-light">
                  Premium Wedding Photography in Trivandrum.
                </p>
              </div>
              <motion.div 
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8 md:mt-10 overflow-hidden rounded-[20px] md:rounded-[24px] aspect-[4/3] transition-transform duration-1000 group-hover:scale-105 shadow-lg"
              >
                <img 
                  src={EXPERIENCE_BENTO1}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                  alt="Wedding Moment" 
                />
              </motion.div>
            </motion.div>

            {/* MOMENTS CARD */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#1a1a1a] rounded-[30px] md:rounded-[40px] p-8 md:p-10 min-h-[240px] md:min-h-[300px] flex items-center justify-center text-center"
            >
              <h2 className="text-[36px] md:text-[58px] leading-[1.1] tracking-[-0.04em] text-white font-normal">
                Moments <br /> That Last <br /> Forever
              </h2>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ExperienceBento;
