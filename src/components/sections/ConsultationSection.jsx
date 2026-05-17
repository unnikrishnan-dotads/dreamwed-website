import React from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Button from "../ui/Button";

// Assets
import capure1 from "../../assets/images/capture1.png";
import capure2 from "../../assets/images/capture2.png";
import capure3 from "../../assets/images/capture3.png";
import capure4 from "../../assets/images/capture4.png";
import capure5 from "../../assets/images/capture5.png";
import capure6 from "../../assets/images/capture6.png";
import portrait1 from "../../assets/images/portrait1.png";
import portrait2 from "../../assets/images/portrait2.png";
import portrait3 from "../../assets/images/portrait3.png";
import portrait4 from "../../assets/images/portrait4.png";

// Setup two sets of premium images
const leftImages = [capure1, capure2, capure3, portrait1, portrait3];
const rightImages = [capure4, capure5, capure6, portrait2, portrait4];

const ConsultationSection = () => {
  return (
    <section className="w-full bg-[#f5f5f3] pt-20 md:pt-32 pb-32 md:pb-48 px-4 md:px-6 overflow-hidden">
      <div
        className="
          max-w-7xl
          mx-auto
          bg-[#ececea]
          rounded-[30px]
          md:rounded-[40px]
          p-8
          md:p-12
          lg:p-16
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-12
          md:gap-16
          items-center
          shadow-sm
        "
      >

        {/* LEFT CONTENT */}
        <div className="max-w-3xl">
          <h2
            className="
              text-[36px]
              sm:text-[48px]
              md:text-[80px]
              leading-[1.1]
              md:leading-[0.95]
              tracking-[-0.04em]
              text-black
              font-normal
              text-balance
            "
          >
            Ready to capture your love story?
          </h2>

          <p
            className="
              mt-6
              md:mt-8
              text-[18px]
              md:text-[28px]
              leading-relaxed
              text-[#697169]
              max-w-2xl
              font-light
            "
          >
            Book a free consultation to speak with our lead photographers
            and discuss your wedding vision. Let’s create a timeless narrative
            of your special day.
          </p>

          <Button 
            to="/contact"
            variant="dark"
            className="mt-10 md:mt-12 h-[64px] md:h-[76px] text-[18px] md:text-[24px] w-full sm:w-auto rounded-full shadow-lg hover:shadow-xl transition-all duration-500"
          >
            Book my free consultation
            <ArrowRight size={24} className="md:w-7 md:h-7" />
          </Button>
        </div>

        {/* RIGHT IMAGE GRID - SEAMLESS INFINITE AUTO-SCROLL */}
        <div className="grid grid-cols-2 gap-4 md:gap-5 h-[450px] md:h-[600px] overflow-hidden rounded-[24px] md:rounded-[32px] relative bg-[#e3e3e0]">
          
          {/* LEFT COLUMN - SCROLLS UPWARD */}
          <div className="relative h-full overflow-hidden">
            <motion.div
              animate={{ y: [0, "-50%"] }}
              transition={{
                ease: "linear",
                duration: 22,
                repeat: Infinity,
              }}
              className="flex flex-col gap-4 md:gap-5 pb-4 md:pb-5"
            >
              {[...leftImages, ...leftImages].map((img, i) => (
                <div key={`left-${i}`} className="overflow-hidden rounded-[16px] md:rounded-[24px] shadow-sm hover:shadow-md transition-shadow duration-300">
                  <motion.img
                    src={img}
                    alt={`Love Story Up ${i}`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    className="h-[180px] md:h-[240px] w-full object-cover cursor-pointer"
                  />
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT COLUMN - SCROLLS DOWNWARD */}
          <div className="relative h-full overflow-hidden">
            <motion.div
              animate={{ y: ["-50%", 0] }}
              transition={{
                ease: "linear",
                duration: 22,
                repeat: Infinity,
              }}
              className="flex flex-col gap-4 md:gap-5 pb-4 md:pb-5"
            >
              {[...rightImages, ...rightImages].map((img, i) => (
                <div key={`right-${i}`} className="overflow-hidden rounded-[16px] md:rounded-[24px] shadow-sm hover:shadow-md transition-shadow duration-300">
                  <motion.img
                    src={img}
                    alt={`Love Story Down ${i}`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    className="h-[180px] md:h-[240px] w-full object-cover cursor-pointer"
                  />
                </div>
              ))}
            </motion.div>
          </div>

          {/* TOP & BOTTOM SMOOTH BLUR GRADIENT OVERLAYS */}
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#ececea] via-[#ececea]/60 to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#ececea] via-[#ececea]/60 to-transparent pointer-events-none z-10" />
        </div>

      </div>
    </section>
  );
};

export default ConsultationSection;