import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Button from "../ui/Button";

const pricingPlans = [
  {
    title: "Silver",
    price: "₹49,999",
    tag: "Essential",
    desc: "Perfect for intimate weddings. Candid & traditional coverage for your special day.",
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
    price: "₹59,999",
    tag: "Best Value",
    desc: "Complete photography & videography coverage with a premium layflat album.",
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
    price: "₹69,999",
    tag: "Most Popular",
    desc: "Our most-loved package — complete photo and video storytelling.",
    features: [
      "Full Day Coverage (12 hrs)",
      "2 Photographers + 1 Videographer",
      "Cinematic Wedding Film (5–8 min)",
      "Social Media Highlight Reel",
      "500+ Edited High-Res Photos",
      "Online Gallery Access",
    ],
  },
  {
    title: "Platinum",
    price: "₹1,19,999",
    tag: "Premium",
    desc: "The complete luxury experience — for couples who want it all.",
    features: [
      "Unlimited Day Coverage",
      "Full Photo & Cinematic Video Team",
      "Drone Videography",
      "Pre-Wedding Shoot Included",
      "Handcrafted Heirloom Album",
      "Premium Digital Archive Box",
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
  return (
    <section className="w-full bg-[#f5f5f3] py-24 md:py-32 px-4 md:px-6 overflow-hidden">
      <div className="container">
        
        {/* Header Section */}
        <div className="text-center mb-16 md:mb-24 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-5 py-2 rounded-full bg-[#ececea] text-[#5d665f] text-[11px] md:text-[13px] tracking-[0.2em] uppercase font-semibold mb-6 md:mb-8">
              Investment
            </span>
            <h2 className="text-[42px] sm:text-[52px] md:text-[80px] leading-[1.1] tracking-[-0.04em] text-black font-normal mb-6 md:mb-8 text-balance">
              Wedding Packages
            </h2>
            <p className="text-[17px] md:text-[22px] leading-relaxed text-[#6f766f] max-w-2xl mx-auto font-light">
              Choose the package that fits your vision. All packages include a 
              personalised story consultation before the wedding.
            </p>
          </motion.div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
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
                className={`relative rounded-[30px] md:rounded-[40px] p-8 md:p-10 flex flex-col transition-all duration-700 ease-[0.22, 1, 0.36, 1] group ${
                  isPopular 
                    ? "bg-[#1a1a1a] text-white xl:scale-105 xl:z-10 shadow-2xl" 
                    : "bg-[#ececea] text-black hover:bg-white border border-transparent hover:border-zinc-200"
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute top-8 right-8 md:top-10 md:right-10 px-4 py-1.5 bg-white text-black text-[10px] md:text-[12px] font-bold rounded-full tracking-widest uppercase">
                    ✦ Most Popular
                  </div>
                )}

                <div className="flex-1">
                  <span className={`text-[11px] tracking-[0.25em] uppercase font-bold mb-6 block ${
                    isPopular ? "text-zinc-500" : "text-[#8a9289]"
                  }`}>
                    {plan.tag}
                  </span>
                  
                  <h3 className="text-[36px] md:text-[48px] leading-[1] tracking-[-0.04em] font-normal mb-4">
                    {plan.title}
                  </h3>
                  
                  <p className={`text-[15px] md:text-[17px] leading-relaxed mb-10 md:mb-12 min-h-[3rem] font-light ${
                    isPopular ? "text-zinc-400" : "text-[#66706a]"
                  }`}>
                    {plan.desc}
                  </p>

                  <div className="mb-8 md:mb-10">
                    <span className="text-[42px] md:text-[56px] leading-none tracking-[-0.04em] font-normal numbers-pro">
                      {plan.price}
                    </span>
                  </div>

                  <div className={`w-full h-px mb-10 md:mb-12 ${
                    isPopular ? "bg-zinc-800" : "bg-[#d8d8d8]"
                  }`} />

                  <ul className="space-y-4 md:space-y-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <Check 
                          size={18} 
                          className={`mt-1 shrink-0 ${
                            isPopular ? "text-white" : "text-[#5d665f]"
                          }`} 
                        />
                        <span className={`text-[15px] md:text-[17px] leading-snug font-light numbers-pro ${
                          isPopular ? "text-zinc-300" : "text-[#2c2c2c]"
                        }`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  to="/contact"
                  variant={isPopular ? "secondary" : "primary"}
                  className="mt-10 md:mt-14 w-full py-5 md:py-6 rounded-[20px] md:rounded-[24px]"
                >
                  Book a Consultation
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
