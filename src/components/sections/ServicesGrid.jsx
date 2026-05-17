import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, ArrowRight } from "lucide-react";

// Assets
import capture1 from "../../assets/images/capture1.png";
import capture2 from "../../assets/images/capture2.png";
import capture3 from "../../assets/images/capture3.png";
import capture4 from "../../assets/images/capture4.png";
import capture5 from "../../assets/images/capture5.png";
import capture6 from "../../assets/images/capture6.png";

const services = [
  {
    id: 1,
    title: "Wedding Photography",
    description: "Capturing your special moments forever.",
    rating: "4.9",
    tag: "Popular",
    image: capture2, // couple laughing in red saree & black shirt
    link: "/services"
  },
  {
    id: 2,
    title: "Pre-Wedding Shoots",
    description: "Beautiful shoots to tell your love story.",
    rating: "4.8",
    tag: "Romantic",
    image: capture3, // golden hour nose-to-nose couple
    link: "/services"
  },
  {
    id: 3,
    title: "Engagement / Reception",
    description: "Full coverage for your reception and henna parties.",
    rating: "5.0",
    tag: "Festive",
    image: capture4, // close up bride smiling with flowers
    link: "/services"
  },
  {
    id: 4,
    title: "Cinematic Wedding Films",
    description: "Movie-like films to relive your best day.",
    rating: "4.9",
    tag: "Cinematic",
    image: capture1, // close up bride adjusting earring
    link: "/services"
  },
  {
    id: 5,
    title: "Drone Coverage",
    description: "Aerial views for a spectacular perspective.",
    rating: "4.9",
    tag: "Epic",
    image: capture5, // couple dipping in white clothing
    link: "/services"
  },
  {
    id: 6,
    title: "Albums & Prints",
    description: "High-quality albums to preserve your memories.",
    rating: "5.0",
    tag: "Memories",
    image: capture6, // collage of photos/portraits
    link: "/services"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.215, 0.61, 0.355, 1]
    }
  }
};

const ServicesGrid = () => {
  return (
    <section className="w-full py-24 bg-white select-none">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-16 md:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-[#b4975a] font-semibold text-xs md:text-sm tracking-[0.3em] uppercase block mb-3"
          >
            Our Services
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.8 }}
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-4xl sm:text-5xl md:text-6xl text-zinc-900 font-light tracking-tight text-balance leading-tight"
          >
            Every frame tells your beautiful wedding story
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 1 }}
            className="w-24 h-[1px] bg-zinc-200 mx-auto mt-8 origin-center"
          />
        </div>

        {/* GRID OF SERVICES */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
        >
          {services.map((service) => (
            <motion.div
              key={service.id}
              variants={cardVariants}
              whileHover={{ y: -12 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group relative h-[480px] sm:h-[520px] rounded-[32px] overflow-hidden cursor-pointer shadow-[0_15px_35px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] transition-all duration-500 bg-zinc-100"
            >
              
              {/* IMAGE BACKGROUND */}
              <motion.img
                src={service.image}
                alt={service.title}
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.06 }}
                transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* GRADIENT OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 group-hover:via-black/45 transition-colors duration-500" />

              {/* CARD CONTENT */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-white z-10">
                
                {/* RATING & TAG BADGES */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-400/20 backdrop-blur-md px-3 py-1 rounded-full text-amber-200 text-xs font-semibold">
                    <Star size={11} className="fill-amber-300 stroke-none" />
                    <span>{service.rating}</span>
                  </div>
                  <div className="bg-white/10 border border-white/10 backdrop-blur-md px-3 py-1 rounded-full text-white/90 text-[11px] font-medium tracking-wide">
                    {service.tag}
                  </div>
                </div>

                {/* TEXT CONTAINER */}
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
                    {service.title}
                  </h3>
                  <p className="text-white/70 text-sm font-light leading-relaxed max-w-[90%] opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                    {service.description}
                  </p>
                </div>

                {/* ACTION LINK */}
                <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between overflow-hidden">
                  <span className="text-white/90 text-sm font-medium tracking-wider group-hover:text-white transition-colors duration-300">
                    Explore more
                  </span>
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    whileHover={{ x: 5 }}
                    className="p-1 rounded-full bg-white/10 group-hover:bg-white group-hover:text-black text-white transition-all duration-300"
                  >
                    <ArrowRight size={14} className="stroke-[2.5]" />
                  </motion.div>
                </div>

              </div>

            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default ServicesGrid;
