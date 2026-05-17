import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Video, BookOpen, Clock, Users, Heart } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import SEO from '../components/SEO';

const Services = () => {
  const packages = [
    {
      title: "Silver Package",
      price: "₹49,999",
      icon: <Camera className="w-10 h-10" />,
      features: [
        "8 Hours Coverage",
        "1 Professional Photographer",
        "400+ Edited High-Res Photos",
        "Online Gallery Access",
        "30-Day Delivery"
      ]
    },
    {
      title: "Gold Lite Package",
      price: "₹59,999",
      icon: <Heart className="w-10 h-10" />,
      features: [
        "Wedding Photography",
        "Wedding Videography",
        "Reception Photography",
        "Reception Videography",
        "Premium 70-Page Album",
        "HD Cinematic Highlights Reel",
        "Full HD Wedding Video",
        "Social Media Reel",
        "Personalised Desktop Calendar"
      ]
    },
    {
      title: "Gold Package",
      price: "₹69,999",
      icon: <Video className="w-10 h-10" />,
      features: [
        "Full Day Coverage (12 hrs)",
        "2 Photographers + 1 Videographer",
        "Cinematic Wedding Film (5–8 min)",
        "Social Media Highlight Reel",
        "500+ Edited High-Res Photos"
      ]
    },
    {
      title: "Platinum Package",
      price: "₹1,19,999",
      icon: <BookOpen className="w-10 h-10" />,
      features: [
        "Unlimited Day Coverage",
        "Full Photo & Cinematic Video Team",
        "Drone Videography",
        "Pre-Wedding Shoot Included",
        "Handcrafted Heirloom Album"
      ]
    }
  ];

  return (
    <div className="pt-24 bg-[#f5f5f3]">
      <SEO 
        title="Services & Packages"
        description="Explore our curated wedding storytelling packages (Silver, Gold Lite, Gold, Platinum) and custom bespoke photography services in Trivandrum, Kerala."
      />
      <section className="py-24">
        <div className="container">
          <SectionHeader 
            subtitle="Our Offerings" 
            title="Curated Storytelling Packages" 
            description="Premium photography and cinematic videography tailored to your unique love story."
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {packages.map((pkg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -10 }}
                className={`bg-white p-8 md:p-10 rounded-[40px] shadow-sm hover:shadow-2xl transition-all duration-700 border border-transparent ${i === 2 ? 'border-zinc-200' : ''}`}
              >
                <div className="text-black mb-8 flex justify-center">{pkg.icon}</div>
                <h3 className="text-[26px] font-normal text-center mb-4 tracking-tight leading-tight">{pkg.title}</h3>
                <p className="text-[36px] font-normal text-center mb-8 text-black numbers-pro">{pkg.price}</p>
                
                <ul className="space-y-4 mb-10">
                  {pkg.features.map((feat, idx) => (
                    <li key={idx} className="flex gap-3 items-start text-[#66706a]">
                      <Heart size={16} className="text-[#5d665f] shrink-0 mt-1" />
                      <span className="numbers-pro font-light text-sm">{feat}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="text-center mt-auto">
                  <Button to="/contact" variant={i === 2 ? 'primary' : 'outline'} className="w-full">
                    Book a Consultation
                  </Button>
                </div>
              </motion.div>
            ))}
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
              <Button to="/contact" variant="outline" className="px-12">Request Bespoke Quote</Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl bg-gray-50"
            >
              <img src="https://images.unsplash.com/photo-1510076857177-744361488957?auto=format&fit=crop&q=80&w=1000" alt="Process" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
