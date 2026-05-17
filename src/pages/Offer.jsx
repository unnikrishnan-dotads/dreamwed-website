import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Sparkles, Clock, Calendar, CheckCircle2, 
  Send, Loader2, Play, Award, ShieldCheck 
} from "lucide-react";
import { FaInstagram } from "react-icons/fa6";
import Button from "../components/ui/Button";
import SEO from "../components/SEO";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzy15y5t2F5uM9NiYPimHvlS6xDw2N1Z5oTHF3SQnR6AI_fxo6y6mhIepsUj-kav31g/exec";

const Offer = () => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", date: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  // Countdown Timer Logic (Dynamic 48-hour rolling or reset)
  const [timeLeft, setTimeLeft] = useState({ days: 1, hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    // Ticking countdown logic
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        } else {
          // Reset to 2 days to maintain urgency loop
          return { days: 1, hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("email", formData.email);
      form.append("phone", formData.phone);
      form.append("date", formData.date);
      form.append("message", `[SPECIAL OFFER ₹59,999 INQUIRY] ${formData.message}`);
      form.append("timestamp", new Date().toLocaleString());

      await fetch(SCRIPT_URL, {
        method: "POST",
        body: form,
        mode: "no-cors"
      });

      setStatus("success");
      setFormData({ name: "", email: "", phone: "", date: "", message: "" });
      setTimeout(() => setStatus("idle"), 6000);
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 6000);
    }
  };

  const instagramLink = "https://www.instagram.com/dreamwed_stories.co?igsh=MWxuOXZkcHZ2cWgwdw==";

  // Cinematic Youtube Videos
  const videos = [
    {
      id: "c310o24XVN0",
      title: "The Symphony of Rituals",
      desc: "Cinematic traditional wedding highlights with epic drone and detail captures."
    },
    {
      id: "S9-SrdnKsMs",
      title: "Glimpses of Forever",
      desc: "Emotional highlights showing wedding candids and quiet shared glances."
    },
    {
      id: "jnSAu-C6OmQ",
      title: "An Elegant Rhapsody",
      desc: "Modern reception storytelling capturing high-energy traditional events."
    }
  ];

  // Best Candid Shots representing Instagram grid
  const instaPics = [
    { url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=600", tag: "Candid Smile" },
    { url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600", tag: "Eternal Vows" },
    { url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600", tag: "Groom Portrait" },
    { url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=600", tag: "The First Dance" },
    { url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=600", tag: "Romantic Walks" },
    { url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=600", tag: "Bride Entry" }
  ];

  return (
    <div className="bg-[#f5f5f3] pt-24 pb-20 select-none overflow-hidden">
      <SEO 
        title="Exclusive Wedding Offer"
        description="Claim our limited-time full-combo wedding package starting @ ₹59,999/- only. Complete photography, videography, reception coverage, 70-page custom album, reels, and calendar included."
      />

      {/* TOP PROMO ANNOUNCEMENT */}
      <div className="w-full bg-black py-3 text-center text-white text-[11px] font-bold uppercase tracking-[0.25em] flex justify-center items-center gap-2">
        <Sparkles size={14} className="text-[#b4975a] animate-pulse" />
        <span>Limited-Time Special Offer: Save ₹10,000 On Our Signature Package</span>
      </div>

      {/* HERO SECTION */}
      <section className="relative py-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#ececea] text-[#5d665f] text-xs tracking-wider uppercase font-bold">
              ✦ Exclusive Combo Offer
            </span>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-5xl md:text-7xl font-light text-zinc-950 leading-[1.05] tracking-tight">
              Lock in Your Timeless <br/>
              <span className="italic font-normal text-[#b4975a]">Love Story Showcase</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-600 font-light leading-relaxed max-w-xl">
              Get complete, premium wedding and reception photography and cinematic films for a highly specialized rate of <strong className="text-zinc-900">₹59,999/-</strong>. 
            </p>
          </motion.div>

          {/* DYNAMIC COUNTDOWN TIMER */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="p-6 bg-white rounded-[28px] border border-zinc-200/60 shadow-sm inline-block space-y-4"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              <Clock size={16} className="text-red-500 animate-pulse" />
              <span>Offer Expiries Soon: Locked-in Price</span>
            </div>

            <div className="flex gap-4 md:gap-6 text-center select-none">
              {[
                { label: "Days", val: timeLeft.days },
                { label: "Hours", val: timeLeft.hours },
                { label: "Mins", val: timeLeft.minutes },
                { label: "Secs", val: timeLeft.seconds }
              ].map((time, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-900 text-white rounded-[20px] flex items-center justify-center text-2xl md:text-3xl font-bold font-sans shadow-md">
                    {String(time.val).padStart(2, "0")}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 mt-2 tracking-wider">{time.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button 
              onClick={() => document.getElementById("booking-form").scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 rounded-full bg-zinc-950 text-white font-semibold text-sm hover:bg-black shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              Claim Special Offer Now
            </button>
            <Button to="/services" variant="outline" className="px-8 py-4">
              View Other Packages
            </Button>
          </div>
        </div>

        {/* PACKAGE DETAILS FOCUSED CARD */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="lg:col-span-5 bg-zinc-900 text-white rounded-[40px] p-8 md:p-10 shadow-2xl relative border border-zinc-800"
        >
          <div className="absolute top-6 right-6 px-4 py-1.5 bg-[#b4975a] text-white text-[10px] font-bold rounded-full tracking-wider uppercase">
            Save ₹10,000
          </div>

          <span className="text-[#b4975a] font-bold text-[11px] tracking-[0.2em] uppercase block mb-2">Signature Combo</span>
          <h3 className="text-3xl font-light font-serif mb-2 tracking-tight">Ultimate Gold Lite</h3>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl font-normal tracking-tight numbers-pro">₹59,999/-</span>
            <span className="text-zinc-500 line-through text-lg numbers-pro">₹69,999</span>
          </div>

          <div className="w-full h-px bg-zinc-800 mb-6" />

          <ul className="space-y-4 mb-8">
            {[
              "Wedding Photography Coverage",
              "Wedding Videography Coverage",
              "Reception Photography Coverage",
              "Reception Videography Coverage",
              "Premium Layflat 70-Pages Album",
              "HD Cinematic Highlights Video",
              "Full HD Documentary Wedding Video",
              "1 Custom Social Media Reel",
              "Personalised Desktop Calendar"
            ].map((feat, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[#b4975a] shrink-0 mt-0.5" />
                <span className="text-sm font-light text-zinc-300">{feat}</span>
              </li>
            ))}
          </ul>

          <div className="p-4 bg-zinc-800/60 border border-zinc-700/60 rounded-[20px] flex items-center gap-3">
            <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
            <p className="text-[11px] leading-relaxed text-zinc-400 font-medium">
              Free consultation & style customization meetings included. Secure your dates today.
            </p>
          </div>
        </motion.div>
      </section>

      {/* CINEMATIC WEDDING FILMS VIDEO DISPLAY */}
      <section className="py-20 bg-white border-t border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-[#b4975a] text-xs uppercase font-bold tracking-[0.25em] block">Cinematography Showcase</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl md:text-5xl font-light text-zinc-950 leading-tight">
              Watch Our Live Wedding Films
            </h2>
            <p className="text-sm md:text-base text-zinc-500 font-light leading-relaxed">
              Experience the actual storytelling quality. These films represent our standard gold cinematic styles, custom-tailored to the couples.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {videos.map((vid, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.8 }}
                className="bg-[#f9f9f7] rounded-[32px] overflow-hidden border border-zinc-100/60 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-500 flex flex-col"
              >
                <div className="relative aspect-video w-full bg-black group overflow-hidden">
                  {/* Embedded Youtube Responsive Player */}
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${vid.id}`} 
                    title={vid.title} 
                    style={{ border: 0 }} 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                    loading="lazy"
                    className="absolute inset-0"
                  ></iframe>
                </div>
                <div className="p-6 md:p-8 flex flex-col flex-1 justify-between">
                  <div className="space-y-2">
                    <h4 className="font-serif text-xl font-normal text-zinc-900">{vid.title}</h4>
                    <p className="text-xs md:text-sm text-zinc-500 font-light leading-relaxed">{vid.desc}</p>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[#b4975a] tracking-wider block mt-4 flex items-center gap-1.5">
                    <Play size={10} className="fill-[#b4975a]" /> Full Cinematic Standard
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BEST CANDID MOMENTS (INSTAGRAM SIMULATION) */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <span className="text-[#b4975a] text-xs uppercase font-bold tracking-[0.25em] block mb-2">Our Best Works</span>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl md:text-5xl font-light text-zinc-950">
                Instagram Candid Portfolio
              </h2>
            </div>
            
            <a 
              href={instagramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border border-zinc-200 text-zinc-800 text-xs font-bold uppercase tracking-widest rounded-full hover:border-zinc-900 hover:text-zinc-900 shadow-sm hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <FaInstagram size={16} className="text-[#b4975a]" /> Visit Instagram Feed
            </a>
          </div>

          {/* Bento Instagram Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {instaPics.map((pic, idx) => (
              <motion.a
                key={idx}
                href={instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group relative aspect-square rounded-[24px] overflow-hidden shadow-sm bg-gray-50 cursor-pointer"
              >
                <img src={pic.url} alt={pic.tag} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-3">
                  <FaInstagram size={20} className="text-white mb-2" />
                  <span className="text-white text-[11px] font-bold uppercase tracking-wider">{pic.tag}</span>
                  <span className="text-zinc-300 text-[9px] font-medium tracking-wide mt-1">View Post ✦</span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIAL URGENCY BOOKING INQUIRIES FORM */}
      <section id="booking-form" className="py-20 bg-white border-t border-zinc-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-[#f9f9f7] rounded-[40px] p-8 md:p-16 border border-zinc-100/60 shadow-sm relative overflow-hidden">
            
            {status === "success" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-[#f9f9f7] z-20"
              >
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-8 shadow-sm">
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl text-zinc-950 font-light mb-4">
                  Offer Pricing Claimed!
                </h3>
                <p className="text-[#66706a] text-lg font-light max-w-md">
                  Thank you! We have logged your details. Our coordination team will get in touch with you shortly to book your consultation and locking in the ₹59,999/- rate.
                </p>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-[#f9f9f7] z-20"
              >
                <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-8 shadow-sm">
                  <CheckCircle2 size={32} className="rotate-45" />
                </div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl text-zinc-950 font-light mb-4">
                  Inquiry Logged (no-cors)
                </h3>
                <p className="text-[#66706a] text-lg font-light max-w-md">
                  Thank you! Your details have been submitted and added. We will contact you shortly to lock in this special offer.
                </p>
              </motion.div>
            )}

            <div className="text-center max-w-xl mx-auto mb-12 space-y-4">
              <span className="text-[#b4975a] text-xs uppercase font-bold tracking-[0.25em] block">Lock in Pricing</span>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl md:text-5xl font-light text-zinc-950">
                Claim the Limited Offer
              </h2>
              <p className="text-sm text-zinc-500 font-light">
                Fill in your details below to log your inquiry. This instantly reserves your wedding dates under our ₹59,999/- package terms.
              </p>
            </div>

            <form onSubmit={handleSubmit} className={`space-y-8 transition-opacity duration-300 ${status === "loading" ? "opacity-50 pointer-events-none" : ""}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.25em] text-[#8a9289] mb-3 ml-2">Client Name</label>
                  <input 
                    name="name"
                    required
                    className="w-full px-6 py-4.5 rounded-[20px] bg-white border border-zinc-100 focus:border-black outline-none transition-all text-sm font-light shadow-sm"
                    placeholder="E.g. Sarah & Leo"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.25em] text-[#8a9289] mb-3 ml-2">Phone Number</label>
                  <input 
                    name="phone"
                    type="tel"
                    required
                    className="w-full px-6 py-4.5 rounded-[20px] bg-white border border-zinc-100 focus:border-black outline-none transition-all text-sm font-light shadow-sm numbers-pro"
                    placeholder="+91 90000 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.25em] text-[#8a9289] mb-3 ml-2">Email Address</label>
                  <input 
                    name="email"
                    type="email"
                    required
                    className="w-full px-6 py-4.5 rounded-[20px] bg-white border border-zinc-100 focus:border-black outline-none transition-all text-sm font-light shadow-sm"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.25em] text-[#8a9289] mb-3 ml-2">Wedding Date (Approx)</label>
                  <input 
                    name="date"
                    type="text"
                    required
                    className="w-full px-6 py-4.5 rounded-[20px] bg-white border border-zinc-100 focus:border-black outline-none transition-all text-sm font-light shadow-sm numbers-pro"
                    placeholder="E.g. November 2026"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.25em] text-[#8a9289] mb-3 ml-2">Your Story Vision</label>
                <textarea 
                  name="message"
                  rows="3"
                  className="w-full px-6 py-4.5 rounded-[20px] bg-white border border-zinc-100 focus:border-black outline-none transition-all resize-none text-sm font-light shadow-sm"
                  placeholder="Share a little bit about your wedding and reception plans..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={status === "loading"}
                className="w-full py-5 text-sm font-semibold tracking-wider flex items-center justify-center gap-3 shadow-lg rounded-full bg-zinc-950 hover:bg-black text-white cursor-pointer active:scale-95 transition-all duration-300"
              >
                {status === "loading" ? (
                  <>Logging Details... <Loader2 className="animate-spin" size={18} /></>
                ) : (
                  <>Lock In Special Pricing (Save ₹10,000) <Send size={18} /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* VALUE BADGES */}
      <section className="py-12 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center pt-20">
        {[
          { icon: <Award size={28} className="text-[#b4975a] mx-auto mb-4" />, title: "Award-Winning Team", desc: "Trivandrum's premium accredited fine-art wedding creators." },
          { icon: <ShieldCheck size={28} className="text-[#b4975a] mx-auto mb-4" />, title: "Secure Date Booking", desc: "Instantly lock in standard backup dates in case of scheduling adjustments." },
          { icon: <Sparkles size={28} className="text-[#b4975a] mx-auto mb-4" />, title: "Premium Finishes", desc: "Lustre-finished print materials and flawless 4K cinematic outputs." }
        ].map((badge, idx) => (
          <div key={idx} className="space-y-2">
            {badge.icon}
            <h4 className="font-serif text-lg text-zinc-900">{badge.title}</h4>
            <p className="text-xs text-zinc-500 font-light max-w-xs mx-auto leading-relaxed">{badge.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Offer;
