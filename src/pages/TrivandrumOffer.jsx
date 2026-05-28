import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Clock, Check, Star, ArrowRight, Gift, Flame, 
  Heart, Camera, ShieldCheck, Mail, Phone, Calendar, User, MessageSquare, AlertCircle, X, Tv
} from "lucide-react";
import { FaWhatsapp, FaInstagram, FaFacebook } from "react-icons/fa6";
import SEO from "../components/SEO";
import Button from "../components/ui/Button";

// Local image imports for ad & Instagram consistency
import pic1 from "../assets/images/pic1.jpeg";
import pic2 from "../assets/images/pic2.jpeg";
import pic3 from "../assets/images/pic3.jpeg";
import pic4 from "../assets/images/pic4.jpeg";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzy15y5t2F5uM9NiYPimHvlS6xDw2N1Z5oTHF3SQnR6AI_fxo6y6mhIepsUj-kav31g/exec";

const TrivandrumOffer = () => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", date: "", receptionDate: "", sameDate: true, message: "" });
  const [status, setStatus] = useState("idle"); 
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isAlbumVideoModalOpen, setIsAlbumVideoModalOpen] = useState(false);
  const [isAddonsModalOpen, setIsAddonsModalOpen] = useState(false);
  const [activeDetailPackage, setActiveDetailPackage] = useState(null);
  const [addonsForPackage, setAddonsForPackage] = useState(null); // null, 1, 2, or 3

  // Addons configuration state
  const [selectedAddons, setSelectedAddons] = useState({
    drone: false,
    prewedVideo: false,
    ledScreen: "none" // "none", "single" (14999), "double" (24999)
  });

  const [isConfirmBookingOpen, setIsConfirmBookingOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("Bride & Groom Pack 01");
  const [selectedPackagePrice, setSelectedPackagePrice] = useState(49999);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
    venue: "",
    notes: ""
  });
  const [bookingStatus, setBookingStatus] = useState("idle");

  // Automatically reset pre-wedding video if selected package already includes it (Pack 03 includes both photo and video)
  useEffect(() => {
    if (addonsForPackage === 3) {
      setSelectedAddons((prev) => ({ ...prev, prewedVideo: false }));
    }
  }, [addonsForPackage]);

  // Keyboard Escape listener to exit modals smoothly
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsVideoModalOpen(false);
        setIsAlbumVideoModalOpen(false);
        setIsAddonsModalOpen(false);
        setActiveDetailPackage(null);
        setAddonsForPackage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Countdown timer that resets dynamically to midnight
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
      else setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
    }
    setTouchStartX(null);
  };

  const carouselImages = [
    { src: "/uploaded_bride_yellow.jpg", alt: "Dreamwed Stories Premium Portrait — Radiant Smile & Sacred Ties", position: "center 30%", fit: "object-cover" },
    { src: "/uploaded_bride_traditional.jpg", alt: "Traditional Kerala Bridal Grace — Capturing Authentic Moments", position: "center 30%", fit: "object-cover" },
    { src: "/uploaded_bride_gold.jpg", alt: "Golden Hour Traditional Splendor — Smiling Bride", position: "center 25%", fit: "object-cover" },
    { src: "/uploaded_couple_blackwhite.jpg", alt: "Breathtaking Intimate Couple Portraiture", position: "center 25%", fit: "object-cover" },
    { src: pic1, alt: "Emerald Elegance — Dancing Joyfully Hand-in-Hand", position: "center", fit: "object-cover" },
    { src: pic2, alt: "Golden Hour Romance — Holding Hands Forever", position: "center", fit: "object-cover" },
    { src: pic3, alt: "Bridal Tradition — Pure Intimacy & Whispered Promises", position: "center", fit: "object-contain" },
    { src: pic4, alt: "Cliffside Love Story — Breathtaking Wind-blown Romance", position: "center", fit: "object-contain" }
  ];

  const packagesInfo = [
    {
      id: 1,
      title: "Bride or Groom Pack 01",
      subtitle: "Special Package Coverage",
      regularPrice: "65,000",
      offerPrice: "49,999",
      bonus: "FREE PRE-WEDDING PHOTO",
      bonusDesc: "Save ₹15,000! Premium pre-wedding photography session is fully included.",
      images: ["/uploaded_bride_yellow.jpg", "/athulraj.jpg", "/anandha_lekshmi.jpg"],
      details: [
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
      ],
      description: "Our highly sought-after single-side coverage package. Designed to capture every detail of the Bride's OR Groom's celebrations with elite creative precision and beautiful physical heirlooms."
    },
    {
      id: 2,
      title: "Bride & Groom Pack 02",
      subtitle: "Premium Photo & Video Package",
      regularPrice: "1,09,999",
      offerPrice: "99,999",
      bonus: "FREE PRE-WEDDING PHOTO",
      bonusDesc: "Save ₹15,000! Premium pre-wedding photography session is fully included.",
      images: ["/uploaded_couple_blackwhite.jpg", pic1, pic2],
      details: [
        "Free Pre-Wedding (Photo Coverage)",
        "Bride Reception (Photo + Video)",
        "Candid Wedding (Photo + Video)",
        "Wedding Day (Photo + Video)",
        "Groom Reception (Photo + Video)",
        "4 Camera Wedding Setup",
        "One 80-Page Premium layflat Album (Panoramic layout)",
        "One 80-Page Mini layflat Album (Parent copy)",
        "Cinematic Highlights Video Film",
        "Full HD Wedding Film with Candids & Live streams",
        "Instagram reels & Edited Social Photos in private cloud",
        "2x Luxury Wall Frames",
        "Signature Album Bag, Custom Calendar & Pen Drive"
      ],
      description: "Our comprehensive premium dual-side package. Ideal for capturing both sides of the family together in one unified, masterfully crafted visual narrative with a full 4-camera creative setup."
    },
    {
      id: 3,
      title: "Bride & Groom Pack 03",
      subtitle: "Complete Cinematic & Portraiture",
      regularPrice: "1,20,000",
      offerPrice: "1,10,000",
      bonus: "FREE PHOTO & CINEMA FILM",
      bonusDesc: "Save ₹30,000! Includes both Pre-wedding Photos and Pre-wedding Cinematic video!",
      images: ["/uploaded_bride_traditional.jpg", "/uploaded_bride_gold.jpg", "/kochi_couple_carry.jpg"],
      details: [
        "Free Pre-Wedding (Photo AND Cinematic Video Film!)",
        "Bride Reception (Photo + Video)",
        "Candid Wedding (Photo + Video)",
        "Wedding Day (Photo + Video)",
        "Groom Reception (Photo + Video)",
        "4 Camera Wedding Setup",
        "One 90-Page Premium layflat Album (Archival paper)",
        "One 90-Page Mini layflat Album (Parent copy)",
        "Cinematic Highlights Video Film (Cinema grade coloring)",
        "Full HD Wedding Film with Candids & Live sound capture",
        "Instagram reels & Edited Social Photos in private cloud",
        "2x Luxury Wall Frames",
        "Signature Album Bag, Custom Calendar & Pen Drive"
      ],
      description: "Our absolute signature masterpiece package. Includes premium pre-wedding photos and cinematic video films, fine-art layflat albums, and full-spectrum cinema-grade wedding production. Highly recommended."
    },
    {
      id: 4,
      title: "Engagement + Wedding Pack 04",
      subtitle: "Multi-Day Complete Coverage",
      regularPrice: "1,79,999",
      offerPrice: "1,59,000",
      bonus: "FREE DRONE AERIAL COVERAGE",
      bonusDesc: "Save ₹15,000! Drone aerial coverage is fully included for both days.",
      images: ["/uploaded_couple_blackwhite.jpg", pic1, pic2],
      details: [
        "Engagement Day Photo + Video",
        "Pre-Wedding Photo Shoot",
        "Bride Reception (Photo + Video)",
        "Groom Reception (Photo + Video)",
        "Wedding Day (Photo + Video)",
        "Wedding Day Candid (Photo + Video)",
        "Drone Aerial Coverage (Both Days)",
        "One 80-Page Premium layflat Album (Panoramic layout)",
        "One 80-Page Mini layflat Album (Parent copy)",
        "Full HD Wedding Film with Candid edits",
        "Cinematic Highlights Video & Wedding Reel",
        "3x Luxury Wall Frames",
        "Signature Album Bag, Custom Calendar & Pen Drive"
      ],
      description: "Our ultimate, all-inclusive multi-day celebration package. Captures your entire love story from the intimate engagement rituals to the grand wedding reception, with elite 4-camera setups and aerial drone artistry."
    }
  ];

  // Auto play
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const triggerBookingModal = (packageName, packagePrice) => {
    setSelectedPackage(packageName);
    setSelectedPackagePrice(packagePrice);
    setBookingForm(prev => ({
      ...prev,
      name: formData.name || prev.name,
      phone: formData.phone || prev.phone,
      email: formData.email || prev.email,
      date: formData.date || prev.date,
      venue: formData.message || prev.venue
    }));
    setIsConfirmBookingOpen(true);
  };

  const handleConfirmBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingStatus("loading");
    
    const isPack03 = selectedPackage === "Bride & Groom Pack 03";
    const selectedAddonsList = [];
    if (!isPack03 && selectedAddons.prewedVideo) {
      selectedAddonsList.push({ name: "Cinematic Pre-Wedding Shoot", price: 9999 });
    }
    if (selectedAddons.drone) {
      selectedAddonsList.push({ name: "Aerial Drone Coverage", price: 8000 });
    }
    if (selectedAddons.ledScreen === "single") {
      selectedAddonsList.push({ name: "Single LED Screen setup", price: 14999 });
    } else if (selectedAddons.ledScreen === "double") {
      selectedAddonsList.push({ name: "Double LED Screen setup", price: 24999 });
    }
    
    const addonsSum = selectedAddonsList.reduce((sum, item) => sum + item.price, 0);
    const totalPrice = selectedPackagePrice + addonsSum;
    const advancePaid = 5000;
    
    const bookingPayload = {
      customer_name: bookingForm.name,
      customer_phone: bookingForm.phone,
      customer_email: bookingForm.email,
      event_date: bookingForm.date,
      event_venue: bookingForm.venue,
      package_name: selectedPackage,
      package_price: selectedPackagePrice,
      add_ons: selectedAddonsList,
      total_price: totalPrice,
      advance_paid: advancePaid,
      status: "pending"
    };

    // Google Sheets Backup Sync
    try {
      const gForm = new FormData();
      gForm.append("name", bookingForm.name);
      gForm.append("email", bookingForm.email);
      gForm.append("phone", bookingForm.phone);
      gForm.append("date", bookingForm.date);
      gForm.append("reception_date", "Wedding Booking Order");
      
      const addonsStr = selectedAddonsList.map(a => `${a.name}(₹${a.price})`).join(", ");
      gForm.append("message", `[CONFIRMED BOOKING ORDER] Package: ${selectedPackage} (₹${selectedPackagePrice}). Add-ons: [${addonsStr || 'None'}]. Venue: ${bookingForm.venue}. Notes: ${bookingForm.notes}`);
      gForm.append("timestamp", new Date().toLocaleString());
      
      fetch(SCRIPT_URL, { method: "POST", body: gForm, mode: "no-cors" }).catch(e => console.log('AppsScript backup sync error ignored'));
    } catch (gErr) {
      console.log('AppsScript payload err', gErr);
    }
    
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
    
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload)
      });
      
      if (res.ok) {
        setBookingStatus("success");
        setTimeout(() => {
          setIsConfirmBookingOpen(false);
          setBookingStatus("idle");
          setBookingForm({ name: "", phone: "", email: "", date: "", venue: "", notes: "" });
        }, 5000);
      } else {
        throw new Error("Server rejected booking request");
      }
    } catch (err) {
      console.error("Booking API error:", err);
      setBookingStatus("error");
      setTimeout(() => setBookingStatus("idle"), 8000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("email", formData.email);
      form.append("phone", formData.phone);
      form.append("date", formData.date);
      form.append("reception_date", formData.sameDate ? "Same as Wedding Date" : formData.receptionDate);
      
      const dateInfo = formData.sameDate 
        ? `[Wedding & Reception: ${formData.date}]` 
        : `[Wedding: ${formData.date}] [Reception: ${formData.receptionDate}]`;

      form.append("message", `${dateInfo} [TRIVANDRUM META PACK 01/02/03/04 ₹49K-₹1.59L INQUIRY] ${formData.message}`);
      form.append("timestamp", new Date().toLocaleString());

      await fetch(SCRIPT_URL, { method: "POST", body: form, mode: "no-cors" });
      setStatus("success");
      setFormData({ name: "", email: "", phone: "", date: "", receptionDate: "", sameDate: true, message: "" });
      setTimeout(() => setStatus("idle"), 6000);
    } catch (error) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 6000);
    }
  };

  const scrollToForm = () => {
    document.getElementById("booking-form").scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-[#fbfbfa] text-zinc-800 min-h-screen select-none overflow-hidden pb-20 font-sans">
      <SEO 
        title="Exclusive Bride & Groom Wedding Packages | Dreamwed Stories"
        description="Premium 4-Camera Wedding Photography Packages start @ Rs. 49,999/- only. Claim your slot today and receive a FREE pre-wedding shoot for a limited duration."
      />

      {/* 1. TOP STICKY URGENCY BAR */}
      <div className="fixed top-[72px] md:top-[88px] left-0 w-full bg-[#9b1c1c] text-white py-2.5 z-40 flex justify-center items-center gap-3 px-6 shadow-md border-b border-red-800">
        <span className="flex items-center gap-1.5 text-[9px] md:text-xs font-extrabold tracking-[0.15em] uppercase">
          <Flame size={12} className="fill-current text-white animate-pulse" /> Limited Time Offer
        </span>
        <span className="text-[10px] md:text-xs opacity-50">|</span>
        <span className="text-[9px] md:text-xs font-bold tracking-[0.05em] uppercase flex items-center gap-2">
          FREE Pre-Wedding Shoot expires in: 
          <span className="bg-black text-white px-2 py-0.5 rounded font-mono text-[10px] md:text-xs">
            {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
          </span>
        </span>
      </div>

      {/* 2. HERO HEADER SECTION (Vibrant Light & Soft Organic Theme) */}
      <section className="relative pt-44 pb-16 px-6 overflow-hidden bg-white border-b border-zinc-100">
        {/* Red Angled Ribbon in top-left (Matches the ad creative perfectly!) */}
        <div className="absolute top-36 left-[-60px] w-[240px] bg-[#9b1c1c] text-white py-2 text-center text-[10px] font-bold tracking-widest uppercase rotate-[-35deg] shadow-md z-10 hidden lg:block">
          Special Deal
        </div>

        {/* Soft emerald background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1e3f20]/5 rounded-full blur-[120px] pointer-events-none z-0" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-[#1e3f20]/5 border border-[#1e3f20]/10 px-5 py-2 rounded-full text-[#1e3f20] text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase"
          >
            <Sparkles size={12} className="text-[#b4975a]" /> Exclusively for Trivandrum Couples
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-4xl sm:text-6xl md:text-7xl text-zinc-900 font-light tracking-tight leading-[1.1]"
          >
            Wedding Photography <br className="hidden sm:block" />
            <span className="font-serif italic font-light text-[#b4975a]">Package Redefined</span>
          </motion.h1>

          {/* Malayalam Quote (From the ad creative) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto pt-2"
          >
            <p className="text-zinc-500 font-serif italic text-base sm:text-lg leading-relaxed">
              " ചില നിമിഷങ്ങൾ എന്നും ഓർമ്മയിൽ സൂക്ഷിക്കാൻ ഉള്ളതാണ് "
            </p>
            <span className="block text-zinc-400 text-[10px] tracking-widest uppercase font-bold mt-1.5">— Some moments are meant to be preserved forever</span>
          </motion.div>

          {/* Redesigned Sliding Photo Carousel */}
          <div
            className="relative max-w-lg mx-auto aspect-[3/4] rounded-[32px] overflow-hidden border-4 border-white shadow-[0_25px_60px_rgba(0,0,0,0.1)] bg-zinc-100 group select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.img
                key={currentSlide}
                src={carouselImages[currentSlide].src}
                alt={carouselImages[currentSlide].alt}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ objectPosition: carouselImages[currentSlide].position || "center" }}
                className={`w-full h-full ${carouselImages[currentSlide].fit || "object-cover"} select-none pointer-events-none bg-zinc-900`}
              />
            </AnimatePresence>

            {/* Left/Right Nav Buttons — always visible on mobile, hover-only on desktop */}
            <button 
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/50 hover:bg-white/80 backdrop-blur-md flex items-center justify-center text-zinc-800 shadow-md opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto z-20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/50 hover:bg-white/80 backdrop-blur-md flex items-center justify-center text-zinc-800 shadow-md opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto z-20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Floating Overlay Info */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center z-10 pointer-events-none">
              {/* Image Description Tag */}
              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white text-[9px] font-bold tracking-widest uppercase">
                {carouselImages[currentSlide].alt.split(" — ")[0]}
              </div>
              
              {/* Dot Indicators */}
              <div className="flex gap-1.5 bg-black/40 backdrop-blur-md px-3 py-2 rounded-full border border-white/5">
                {carouselImages.map((_, index) => (
                  <div 
                    key={index} 
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      index === currentSlide ? "bg-[#b4975a] scale-125" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Top Red Urgency Badge inside Carousel */}
            <div className="absolute top-4 left-4 bg-[#9b1c1c] text-white px-3.5 py-1.5 rounded-full text-[9px] font-extrabold tracking-widest uppercase shadow-md pointer-events-none z-10 animate-pulse">
              Special Offer
            </div>

          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={scrollToForm}
              className="w-full sm:w-auto px-12 py-5 bg-[#9b1c1c] hover:bg-[#801414] text-white font-bold rounded-full hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_10px_35px_rgba(155,28,28,0.25)] text-xs tracking-widest uppercase"
            >
              Book Your Slots Now <ArrowRight size={14} className="inline ml-2" />
            </button>
            <button 
              onClick={() => document.getElementById("reels-wow").scrollIntoView({ behavior: "smooth" })}
              className="w-full sm:w-auto px-12 py-5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold rounded-full hover:scale-105 active:scale-95 transition-all duration-300 text-xs tracking-widest uppercase"
            >
              Watch Video Teaser
            </button>
          </motion.div>
        </div>
      </section>

      {/* 3. CORE PACKAGE DETAILS (Dual-Column side-by-side grid) */}
      <section className="py-24 px-6 bg-white border-b border-zinc-100">
        <div className="max-w-5xl mx-auto">
          
          {/* Urgency Announcement */}
          <div className="mb-16 bg-[#1e3f20]/5 border border-[#1e3f20]/20 p-6 sm:p-8 rounded-[28px] max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-6 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-[#1e3f20]/10 flex items-center justify-center text-[#1e3f20] shrink-0">
              <Gift size={26} />
            </div>
            <div className="text-center sm:text-left space-y-1">
              <span className="inline-block bg-[#1e3f20] text-white px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase">Special Launch Bonus</span>
              <h3 className="text-xl sm:text-2xl text-[#1e3f20] font-medium tracking-tight">FREE Pre-Wedding Shoot Included!</h3>
              <p className="text-zinc-600 text-xs sm:text-sm font-light leading-relaxed">
                When you secure our Special Bride or Groom packages in the next 2 slots, we will include a completely **FREE Pre-Wedding session** worth up to ₹30,000!
              </p>
            </div>
          </div>

          <div className="text-center mb-16 space-y-4">
            <span className="text-[#b4975a] text-xs font-bold tracking-[0.2em] uppercase">Premium Offer Packages</span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-zinc-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Claim Your <span className="italic font-serif text-[#b4975a]">Exclusive Pricing</span>
            </h2>
            <p className="text-zinc-500 font-light text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              Compare our wedding packages and lock in your special discount today! All packages include a professional setup and premium deliverables.
            </p>
            
            {/* Highly interactive Add-ons badge trigger */}
            <button 
              onClick={() => { setActiveDetailPackage(1); setCurrentSlide(0); }}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1e3f20] to-[#2d5c30] text-white rounded-full text-[10px] font-extrabold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_4px_15px_rgba(30,63,32,0.2)] cursor-pointer select-none"
            >
              ✨ Customize with Premium Add-ons <Sparkles size={11} className="animate-pulse" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
            
            {/* TIER 1: BRIDE OR GROOM PACK 01 (Rs. 49,999) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              onClick={() => setActiveDetailPackage(0)}
              className="rounded-[32px] overflow-hidden border border-zinc-200 bg-[#fbfbfa] p-6 sm:p-8 space-y-6 relative shadow-md hover:border-[#1e3f20]/30 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:shadow-[0_15px_45px_rgba(30,63,32,0.06)] group/card"
            >
              {/* Tap Indicator Tag */}
              <div className="absolute top-4 right-4 bg-[#1e3f20]/5 text-[#1e3f20] px-3 py-1.5 rounded-full text-[8px] font-bold tracking-widest uppercase opacity-60 group-hover/card:opacity-100 transition-opacity duration-300">
                ✨ View Photos
              </div>

              <div className="space-y-6">
                <div className="space-y-1 pt-2">
                  <h3 className="text-2xl text-zinc-900 font-medium tracking-tight">Bride or Groom Pack 01</h3>
                  <p className="text-[#b4975a] text-[10px] font-bold tracking-wider uppercase">Special Package Coverage</p>
                </div>

                <div className="space-y-1">
                  <div className="text-zinc-400 text-xs line-through tracking-wider">Regular: 65,000/-</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-bold text-[#9b1c1c] tracking-tight">Rs. 49,999/-</span>
                  </div>
                </div>

                {/* Bonus tag inside card */}
                <div className="bg-[#1e3f20]/5 border border-[#1e3f20]/15 p-4 rounded-2xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1e3f20]/15 flex items-center justify-center text-[#1e3f20] shrink-0">
                    <Gift size={16} />
                  </div>
                  <div>
                    <span className="block text-[#1e3f20] text-xs font-bold uppercase tracking-wide">FREE PRE-WEDDING PHOTO</span>
                    <span className="text-zinc-600 text-[10px] font-light leading-snug block mt-0.5">
                      Save ₹15,000! Premium pre-wedding photography session is fully included.
                    </span>
                  </div>
                </div>

                <div className="w-full h-px bg-zinc-200" />

                <div className="space-y-4">
                  <span className="text-[9px] text-zinc-400 tracking-widest uppercase font-bold block">What's Included:</span>
                  {[
                    "Free Pre-Wedding (Photo Coverage)",
                    "Wedding Day Photography",
                    "Wedding Day Videography",
                    "One 80-Pages Premium layflat Album",
                    "Cinematic Highlights Video"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 text-xs text-zinc-600 font-light">
                      <span className="w-4.5 h-4.5 rounded-full bg-[#1e3f20]/10 text-[#1e3f20] flex items-center justify-center shrink-0">
                        <Check size={10} strokeWidth={3} />
                      </span>
                      {item}
                    </div>
                  ))}
                  
                  {/* Elegant View More Button */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveDetailPackage(0); }}
                    className="w-full py-3 mt-2 bg-gradient-to-r from-zinc-50 to-zinc-100 border border-zinc-200 hover:border-zinc-300 text-zinc-800 text-[10px] tracking-widest uppercase font-bold rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] select-none cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    ✨ View Full Details & Photos
                  </button>
                </div>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); triggerBookingModal("Bride & Groom Pack 01", 49999); }}
                className="w-full py-4 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold rounded-xl transition-all text-xs tracking-widest uppercase shadow-sm mt-4"
              >
                Secure ₹49,999 Offer
              </button>
            </motion.div>

            {/* TIER 2: BRIDE & GROOM PACK 02 (Rs. 99,999) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              onClick={() => setActiveDetailPackage(1)}
              className="rounded-[32px] overflow-hidden border border-zinc-200 bg-[#fbfbfa] p-6 sm:p-8 space-y-6 relative shadow-md hover:border-[#1e3f20]/30 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:shadow-[0_15px_45px_rgba(30,63,32,0.06)] group/card"
            >
              {/* Tap Indicator Tag */}
              <div className="absolute top-4 right-4 bg-[#1e3f20]/5 text-[#1e3f20] px-3 py-1.5 rounded-full text-[8px] font-bold tracking-widest uppercase opacity-60 group-hover/card:opacity-100 transition-opacity duration-300">
                ✨ View Photos
              </div>

              <div className="space-y-6">
                <div className="space-y-1 pt-2">
                  <h3 className="text-2xl text-zinc-900 font-medium tracking-tight">Bride & Groom Pack 02</h3>
                  <p className="text-[#b4975a] text-[10px] font-bold tracking-wider uppercase">Premium Photo & Video Package</p>
                </div>

                <div className="space-y-1">
                  <div className="text-zinc-400 text-xs line-through tracking-wider">Regular: 1,09,999/-</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-bold text-[#9b1c1c] tracking-tight">Rs. 99,999/-</span>
                  </div>
                </div>

                {/* Bonus tag inside card */}
                <div className="bg-[#1e3f20]/5 border border-[#1e3f20]/15 p-4 rounded-2xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1e3f20]/15 flex items-center justify-center text-[#1e3f20] shrink-0">
                    <Gift size={16} />
                  </div>
                  <div>
                    <span className="block text-[#1e3f20] text-xs font-bold uppercase tracking-wide">FREE PRE-WEDDING PHOTO</span>
                    <span className="text-zinc-600 text-[10px] font-light leading-snug block mt-0.5">
                      Save ₹15,000! Premium pre-wedding photography session is fully included.
                    </span>
                  </div>
                </div>

                <div className="w-full h-px bg-zinc-200" />

                <div className="space-y-4">
                  <span className="text-[9px] text-zinc-400 tracking-widest uppercase font-bold block">What's Included:</span>
                  {[
                    "Free Pre-Wedding (Photo Coverage)",
                    "Wedding Day (Photo + Video)",
                    "4 Camera Wedding Setup",
                    "One 80-Page Premium layflat Album",
                    "Cinematic Highlights Video"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 text-xs text-zinc-600 font-light">
                      <span className="w-4.5 h-4.5 rounded-full bg-[#1e3f20]/10 text-[#1e3f20] flex items-center justify-center shrink-0">
                        <Check size={10} strokeWidth={3} />
                      </span>
                      {item}
                    </div>
                  ))}
                  
                  {/* Elegant View More Button */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveDetailPackage(1); }}
                    className="w-full py-3 mt-2 bg-gradient-to-r from-zinc-50 to-zinc-100 border border-zinc-200 hover:border-zinc-300 text-zinc-800 text-[10px] tracking-widest uppercase font-bold rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] select-none cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    ✨ View Full Details & Photos
                  </button>
                </div>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); triggerBookingModal("Bride & Groom Pack 02", 99999); }}
                className="w-full py-4 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold rounded-xl transition-all text-xs tracking-widest uppercase shadow-sm mt-4"
              >
                Secure ₹99,999 Offer
              </button>
            </motion.div>

            {/* TIER 3: BRIDE & GROOM PACK 03 (Rs. 1,10,000) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              onClick={() => setActiveDetailPackage(2)}
              className="rounded-[32px] overflow-hidden border-2 border-[#9b1c1c] bg-white p-6 sm:p-8 space-y-6 relative shadow-xl flex flex-col justify-between cursor-pointer hover:shadow-[0_20px_50px_rgba(155,28,28,0.1)] group/card"
            >
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-[#9b1c1c] text-white px-5 py-1.5 rounded-full text-[9px] font-bold tracking-widest uppercase whitespace-nowrap shadow-md z-10">
                🔥 Best Deal (Highly Recommended)
              </div>

              {/* Tap Indicator Tag */}
              <div className="absolute top-5 right-4 bg-[#9b1c1c]/5 text-[#9b1c1c] px-3 py-1.5 rounded-full text-[8px] font-bold tracking-widest uppercase opacity-60 group-hover/card:opacity-100 transition-opacity duration-300">
                ✨ View Photos
              </div>

              <div className="space-y-6">
                <div className="space-y-1 pt-2">
                  <h3 className="text-2xl text-zinc-900 font-semibold tracking-tight">Bride & Groom Pack 03</h3>
                  <p className="text-[#1e3f20] text-[10px] font-bold tracking-wider uppercase">Complete Cinematic & Portraiture</p>
                </div>

                <div className="space-y-1">
                  <div className="text-zinc-400 text-xs line-through tracking-wider">Regular: 1,20,000/-</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-bold text-[#9b1c1c] tracking-tight">Rs. 1,10,000/-</span>
                  </div>
                </div>

                {/* Bonus tag inside card */}
                <div className="bg-[#1e3f20]/5 border border-[#1e3f20]/15 p-4 rounded-2xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1e3f20]/15 flex items-center justify-center text-[#1e3f20] shrink-0">
                    <Gift size={16} />
                  </div>
                  <div>
                    <span className="block text-[#1e3f20] text-xs font-bold uppercase tracking-wide">FREE PHOTO & CINEMA FILM</span>
                    <span className="text-zinc-600 text-[10px] font-light leading-snug block mt-0.5">
                      Save ₹30,000! Includes **both** Pre-wedding Photos **and** Pre-wedding Cinematic video!
                    </span>
                  </div>
                </div>

                <div className="w-full h-px bg-zinc-200" />

                <div className="space-y-4">
                  <span className="text-[9px] text-[#1e3f20] tracking-widest uppercase font-extrabold block">What's Included:</span>
                  {[
                    "Free Pre-Wedding (Photo AND Cinematic Video!)",
                    "Wedding Day (Photo + Video)",
                    "4 Camera Wedding Setup",
                    "One 90-Page Premium layflat Album",
                    "Cinematic Highlights Video"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 text-xs text-zinc-600 font-light">
                      <span className="w-4.5 h-4.5 rounded-full bg-[#1e3f20]/10 text-[#1e3f20] flex items-center justify-center shrink-0">
                        <Check size={10} strokeWidth={3} />
                      </span>
                      {item}
                    </div>
                  ))}
                  
                  {/* Elegant View More Button */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveDetailPackage(2); }}
                    className="w-full py-3 mt-2 bg-[#9b1c1c]/5 hover:bg-[#9b1c1c]/10 border border-[#9b1c1c]/20 hover:border-[#9b1c1c]/30 text-[#9b1c1c] text-[10px] tracking-widest uppercase font-bold rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] select-none cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    ✨ View Full Details & Photos
                  </button>
                </div>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); triggerBookingModal("Bride & Groom Pack 03", 110000); }}
                className="w-full py-4 bg-[#9b1c1c] text-white font-bold rounded-xl hover:bg-[#801414] transition-all text-xs tracking-widest uppercase shadow-md mt-4"
              >
                Secure ₹1,10,000 Offer
              </button>
            </motion.div>

            {/* TIER 4: ENGAGEMENT + WEDDING PACK 04 (Rs. 1,59,000) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              onClick={() => setActiveDetailPackage(3)}
              className="rounded-[32px] overflow-hidden border border-zinc-200 bg-[#fbfbfa] p-6 sm:p-8 space-y-6 relative shadow-md hover:border-[#1e3f20]/30 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:shadow-[0_15px_45px_rgba(30,63,32,0.06)] group/card"
            >
              {/* Tap Indicator Tag */}
              <div className="absolute top-4 right-4 bg-[#1e3f20]/5 text-[#1e3f20] px-3 py-1.5 rounded-full text-[8px] font-bold tracking-widest uppercase opacity-60 group-hover/card:opacity-100 transition-opacity duration-300">
                ✨ View Photos
              </div>

              <div className="space-y-6">
                <div className="space-y-1 pt-2">
                  <h3 className="text-2xl text-zinc-900 font-semibold tracking-tight leading-tight">Engagement + Wedding Pack 04</h3>
                  <p className="text-[#b4975a] text-[10px] font-bold tracking-wider uppercase">Multi-Day Complete Coverage</p>
                </div>

                <div className="space-y-1">
                  <div className="text-zinc-400 text-xs line-through tracking-wider">Regular: 1,79,999/-</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[#9b1c1c] tracking-tight">Rs. 1,59,000/-</span>
                  </div>
                </div>

                {/* Bonus tag inside card */}
                <div className="bg-[#1e3f20]/5 border border-[#1e3f20]/15 p-4 rounded-2xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1e3f20]/15 flex items-center justify-center text-[#1e3f20] shrink-0">
                    <Gift size={16} />
                  </div>
                  <div>
                    <span className="block text-[#1e3f20] text-xs font-bold uppercase tracking-wide">FREE DRONE COVERAGE</span>
                    <span className="text-zinc-600 text-[10px] font-light leading-snug block mt-0.5">
                      Save ₹15,000! Drone aerial coverage is fully included for both days.
                    </span>
                  </div>
                </div>

                <div className="w-full h-px bg-zinc-200" />

                <div className="space-y-4">
                  <span className="text-[9px] text-zinc-400 tracking-widest uppercase font-bold block">What's Included:</span>
                  {[
                    "Engagement Day Photo + Video",
                    "Pre-Wedding Photo Shoot",
                    "Bride Reception (Photo + Video)",
                    "Groom Reception (Photo + Video)",
                    "Drone Aerial Coverage (Both Days)",
                    "One 80-Page Premium layflat Album"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 text-xs text-zinc-600 font-light">
                      <span className="w-4.5 h-4.5 rounded-full bg-[#1e3f20]/10 text-[#1e3f20] flex items-center justify-center shrink-0">
                        <Check size={10} strokeWidth={3} />
                      </span>
                      {item}
                    </div>
                  ))}
                  
                  {/* Elegant View More Button */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveDetailPackage(3); }}
                    className="w-full py-3 mt-2 bg-gradient-to-r from-zinc-50 to-zinc-100 border border-zinc-200 hover:border-zinc-300 text-zinc-800 text-[10px] tracking-widest uppercase font-bold rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] select-none cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    ✨ View Full Details & Photos
                  </button>
                </div>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); triggerBookingModal("Engagement + Wedding Pack 04", 159000); }}
                className="w-full py-4 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold rounded-xl transition-all text-xs tracking-widest uppercase shadow-sm mt-4"
              >
                Secure ₹1,59,000 Offer
              </button>
            </motion.div>

          </div>

        </div>
      </section>

      {/* Standalone & Special Coverage Collections */}
      <section className="py-24 px-6 bg-[#f5f5f3] border-t border-b border-zinc-200/50">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-16 space-y-4">
            <span className="text-[#b4975a] text-xs font-bold tracking-[0.2em] uppercase">Specialised Offerings</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl sm:text-5xl text-zinc-900 font-light tracking-tight">
              Single Event & <span className="italic font-serif text-[#b4975a]">Standalone Packages</span>
            </h2>
            <p className="text-zinc-500 font-light text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              Perfect for celebrating individual milestones or standalone day events with premium layflat albums and cinematic visuals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto mt-16 items-start">
            
            {/* COLUMN 1: ENGAGEMENT SPECIAL COVERAGE */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-2 border-b border-zinc-300 pb-4">
                <span className="text-[#5d665f] text-xs font-bold tracking-[0.2em] uppercase">Collection 01</span>
                <h3 className="text-3xl text-zinc-900 font-normal tracking-tight font-serif italic">Engagement Special Coverage</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Pack A: Engagement Photo Only */}
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200/60 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-500 h-full group hover:border-[#1e3f20]/25">
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
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, message: "Hi! I am interested in booking the Engagement Photography with Album package for ₹19,999/-." }); scrollToForm(); }}
                    className="w-full py-3 mt-8 bg-gradient-to-r from-zinc-50 to-zinc-100 border border-zinc-200 hover:border-zinc-300 text-zinc-800 text-[10px] tracking-widest uppercase font-bold rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] select-none cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    Book Engagement
                  </button>
                </div>

                {/* Pack B: Engagement Photo + Video */}
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200/60 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-500 h-full group hover:border-[#1e3f20]/25">
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
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, message: "Hi! I am interested in booking the Engagement with Videography package for ₹28,999/-." }); scrollToForm(); }}
                    className="w-full py-3 mt-8 bg-gradient-to-r from-zinc-50 to-zinc-100 border border-zinc-200 hover:border-zinc-300 text-zinc-800 text-[10px] tracking-widest uppercase font-bold rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] select-none cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    Book Full Event
                  </button>
                </div>
              </div>
            </motion.div>
            
            {/* COLUMN 2: STANDALONE EVENT COVERAGE */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="space-y-8"
            >
              <div className="space-y-2 border-b border-zinc-300 pb-4">
                <span className="text-[#5d665f] text-xs font-bold tracking-[0.2em] uppercase">Collection 02</span>
                <h3 className="text-3xl text-zinc-900 font-normal tracking-tight font-serif italic">Standalone Event Coverage</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Pack A: Wedding Day Only */}
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200/60 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-500 h-full group hover:border-[#1e3f20]/25">
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
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, message: "Hi! I am interested in booking the Standalone Wedding Day Coverage package for ₹39,999/-." }); scrollToForm(); }}
                    className="w-full py-3 mt-8 bg-gradient-to-r from-zinc-50 to-zinc-100 border border-zinc-200 hover:border-zinc-300 text-zinc-800 text-[10px] tracking-widest uppercase font-bold rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] select-none cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    Book Standalone Wedding
                  </button>
                </div>

                {/* Pack B: Reception Day Only */}
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200/60 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-500 h-full group hover:border-[#1e3f20]/25">
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
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, message: "Hi! I am interested in booking the Standalone Reception Coverage package for ₹29,999/-." }); scrollToForm(); }}
                    className="w-full py-3 mt-8 bg-gradient-to-r from-zinc-50 to-zinc-100 border border-zinc-200 hover:border-zinc-300 text-zinc-800 text-[10px] tracking-widest uppercase font-bold rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] select-none cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    Book Standalone Reception
                  </button>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 4. PREMIUM HANDCRAFTED ALBUMS SHOWCASE */}
      <section className="py-24 px-6 bg-white border-b border-zinc-100">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-16 space-y-4">
            <span className="inline-flex items-center gap-1.5 text-[#1e3f20] text-xs font-bold tracking-[0.25em] uppercase">
              ✦ Handcrafted Heirloom Art — Click to Play Video
            </span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl sm:text-5xl text-zinc-900 font-light tracking-tight">
              Our Premium <span className="italic font-serif text-[#b4975a]">Layflat Wedding Albums</span>
            </h2>
            <p className="text-zinc-500 font-light text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              Every couple receives our premium signature album package—handcrafted with layflat panoramic spreads, organic leatherette textures, and lifetime archival guarantees.
            </p>
          </div>

          <div className="bg-[#fbfbfa] rounded-[36px] border border-zinc-200 p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.02)] grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Left Side: Real-life Album Cover Mockup */}
            <div className="relative group flex flex-col items-center">
              {/* Main Album Card */}
              <div 
                onClick={() => setIsAlbumVideoModalOpen(true)}
                className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-zinc-100 transform -rotate-1 group-hover:rotate-0 transition-transform duration-500 cursor-pointer hover:shadow-emerald-950/10"
              >
                <img 
                  src="/anandha_lekshmi.jpg" 
                  alt="Ananthalakshmi & Deepak Premium Album Cover" 
                  className="w-full h-full object-cover filter brightness-[0.85] group-hover:brightness-[0.75] transition-all duration-500" 
                />
                
                {/* Glowing, pulsing play button overlay in the center */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <motion.div
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#9b1c1c] text-white flex items-center justify-center shadow-[0_0_35px_rgba(155,28,28,0.5)] border border-red-500/25 relative"
                  >
                    <span className="absolute inset-0 rounded-full bg-[#9b1c1c] opacity-35 animate-ping pointer-events-none" style={{ animationDuration: "2s" }} />
                    <svg className="w-5 h-5 fill-current text-white translate-x-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </motion.div>
                </div>

                {/* Album Gutter Line Shadow (gives the real book layflat feel) */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-black/20 shadow-xl" />
                
                {/* Embossed Text Overlay (matches the real cover text from your story highlight!) */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20 text-center shadow-lg transform translate-y-0 group-hover:-translate-y-1 transition-transform duration-500">
                  <span className="block font-serif text-sm sm:text-base text-zinc-800 tracking-wide font-medium">Ananthalakshmi & Deepak</span>
                  <span className="block text-[8px] sm:text-[9px] text-[#b4975a] font-bold tracking-widest uppercase mt-0.5">27 January 2024 — Layflat Heirloom</span>
                </div>
              </div>

              {/* Behind/Floating Mini Album replica shadow card */}
              <div className="absolute top-4 -right-4 -z-10 aspect-[4/3] w-[80%] rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-zinc-200 transform rotate-3 opacity-60 hidden sm:block">
                <img 
                  src="/anandha_lekshmi.jpg" 
                  alt="Mini Album Replica" 
                  className="w-full h-full object-cover filter blur-[0.5px]" 
                />
              </div>

              {/* Help Caption below album card */}
              <span className="text-[10px] text-zinc-400 font-serif italic mt-5 block tracking-wide select-none group-hover:text-zinc-600 transition-colors animate-pulse">
                *Click the album cover to watch our physical layflat albums reel!
              </span>
            </div>

            {/* Right Side: Album Features Description List */}
            <div className="space-y-6">
              <div className="space-y-2 pb-4 border-b border-zinc-100">
                <span className="text-[#b4975a] text-[10px] font-bold tracking-widest uppercase block">Uncompromising Quality</span>
                <h3 className="text-2xl sm:text-3xl text-zinc-900 font-normal tracking-tight">The Story Highlight Standard</h3>
                <p className="text-zinc-500 text-xs sm:text-sm font-light leading-relaxed">
                  As shown in our Instagram highlights, we do not cut corners. Your digital memories are translated into handcrafted physical luxury art.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { title: "Archival Matte Fine-Art Papers", desc: "Chemical-free papers imported to ensure vivid colors and moisture resistance for over 100 years." },
                  { title: "Seamless Layflat Panoramic Binding", desc: "No middle gutter cut-offs or stitch-marks—allowing beautiful spreads to breathe across double pages." },
                  { title: "Direct Mini Album Replicas", desc: "Pocket-sized exact replicas of your main album cover, handcrafted specifically for parents." },
                  { title: "Premium Protective Leather Case", desc: "Includes custom felt album bags and handcrafted luxury cases to protect from external dust." }
                ].map((item, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <span className="w-6 h-6 rounded-full bg-[#1e3f20]/10 text-[#1e3f20] flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <div>
                      <span className="block text-zinc-800 text-xs sm:text-sm font-bold">{item.title}</span>
                      <span className="block text-zinc-500 text-[11px] sm:text-xs font-light leading-relaxed mt-0.5">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. THE "WOW" PRE-WEDDING FILM SHOWCASE (Immersive Active Cover Card & Cinematic Modal) */}
      <section id="reels-wow" className="py-24 px-6 bg-[#fbfbfa] relative">
        {/* Soft elegant glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#1e3f20]/5 rounded-full blur-[100px] pointer-events-none z-0" />

        <div className="max-w-5xl mx-auto relative z-10">
          
          <div className="text-center mb-16 space-y-4">
            <span className="inline-flex items-center gap-1.5 text-[#1e3f20] text-xs font-bold tracking-[0.25em] uppercase">
              <Gift size={12} className="text-[#b4975a]" /> Experience The Wow Factor
            </span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl sm:text-5xl md:text-6xl text-zinc-900 font-light tracking-tight">
              Watch Our <span className="italic font-serif text-[#b4975a]">Cinematic Storytelling</span>
            </h2>
            <p className="text-zinc-500 font-light text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Experience the breath-taking moments of our custom color-graded couples. We edit and frame your memories into high-end romance films.
            </p>
          </div>

          {/* Immersive white player card with actual screenshots/visuals matching ad creative */}
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            onClick={() => setIsVideoModalOpen(true)}
            className="relative w-full rounded-[36px] overflow-hidden border border-zinc-200 shadow-[0_30px_70px_rgba(0,0,0,0.06)] bg-white p-3 md:p-4 z-10 cursor-pointer group select-none hover:shadow-[0_35px_80px_rgba(30,63,32,0.08)] transition-shadow duration-500"
          >
            {/* Elegant inner wrapper with pre-wedding couple background */}
            <div className="relative aspect-video w-full rounded-[24px] overflow-hidden bg-zinc-900 shadow-inner">
              <img 
                src={pic2} 
                alt="Dreamwed Stories Cinematic Prewed" 
                className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 select-none pointer-events-none"
              />
              
              {/* Soft overlay gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/40" />

              {/* A. BRAND BADGE (TOP LEFT) - Matches your modern prewed theme perfectly */}
              <div className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center gap-3 z-20">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg font-serif text-white font-bold text-xs sm:text-sm tracking-tighter">
                  DW
                </div>
                <div className="text-left select-none">
                  <span className="block text-white font-extrabold text-xs sm:text-base tracking-tight uppercase leading-tight">
                    modern prewed
                  </span>
                  <span className="block text-zinc-300 text-[8px] sm:text-[10px] font-bold tracking-wider uppercase">
                    Dreamwed stories
                  </span>
                </div>
              </div>

              {/* B. GLOWING PULSING PLAY BUTTON (CENTER) */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <motion.div
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#9b1c1c] text-white flex items-center justify-center shadow-[0_0_40px_rgba(155,28,28,0.55)] transition-all duration-300 border border-red-500/25 relative"
                >
                  <span className="absolute inset-0 rounded-full bg-[#9b1c1c] opacity-35 animate-ping pointer-events-none" style={{ animationDuration: "2s" }} />
                  <svg className="w-5 h-5 sm:w-7 sm:h-7 fill-current text-white translate-x-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </motion.div>
              </div>

              {/* C. PREMIUM STATS OVERLAY CARD (BOTTOM OVERFLOW) */}
              <div className="absolute bottom-4 left-4 right-4 sm:left-8 sm:right-8 bg-white/95 backdrop-blur-md px-4 py-4 sm:py-6 rounded-[22px] border border-zinc-200/50 flex justify-around items-center text-center shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-20 select-none transform translate-y-0 group-hover:-translate-y-1 transition-transform duration-500">
                <div className="flex-1">
                  <span className="block text-[#1e3f20] font-extrabold text-sm sm:text-2xl leading-none">124,500+</span>
                  <span className="text-zinc-400 text-[7px] sm:text-[9px] tracking-wider uppercase font-extrabold mt-1 sm:mt-1.5 block">Instagram Views</span>
                </div>
                <div className="w-px h-6 sm:h-8 bg-zinc-200/80" />
                <div className="flex-1">
                  <span className="block text-[#1e3f20] font-extrabold text-sm sm:text-2xl leading-none">12,450+</span>
                  <span className="text-zinc-400 text-[7px] sm:text-[9px] tracking-wider uppercase font-extrabold mt-1 sm:mt-1.5 block">Likes Received</span>
                </div>
                <div className="w-px h-6 sm:h-8 bg-zinc-200/80" />
                <div className="flex-1">
                  <span className="block text-[#1e3f20] font-extrabold text-sm sm:text-2xl leading-none">99.8%</span>
                  <span className="text-zinc-400 text-[7px] sm:text-[9px] tracking-wider uppercase font-extrabold mt-1 sm:mt-1.5 block">Couple Love Score</span>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Testimonial Quote */}
          <div className="mt-20 text-center max-w-2xl mx-auto space-y-4">
            <p className="text-zinc-600 font-serif italic text-base sm:text-xl leading-relaxed">
              "The cinematic pre-wedding film on the boat made our entire family cry! The shots look like a high-budget Bollywood movie. Simply spectacular work!"
            </p>
            <span className="block text-zinc-500 text-[10px] tracking-widest font-bold uppercase">— Chindu & Athira (Destination Couple)</span>
          </div>

        </div>
      </section>


      {/* 6. DYNAMIC HIGH-CONVERTING BOOKING FORM (Clean White Card Layout) */}
      <section id="booking-form" className="py-24 px-6 bg-[#fbfbfa] relative">
        <div className="max-w-xl mx-auto space-y-10 relative z-10">
          
          <div className="text-center space-y-3">
            <span className="text-[#b4975a] text-xs font-semibold tracking-[0.2em] uppercase">Claim Your Slot</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl sm:text-4xl md:text-5xl text-zinc-900 font-light tracking-tight">
              Lock In <span className="italic font-serif text-[#b4975a]">Your Wedding Date</span>
            </h2>
            <p className="text-zinc-500 text-xs sm:text-sm font-light leading-relaxed">
              Verify our availability for your wedding day. Secure your special ₹49,999/-, ₹99,999/-, ₹1,10,000/- or ₹1,59,000/- ad package and claim your **FREE Pre-Wedding Shoot** bonus.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 sm:p-10 rounded-[32px] border border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative">
            <div className="space-y-2">
              <label className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="text" 
                  required
                  placeholder="Athulraj"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 pl-12 pr-4 text-zinc-800 text-sm focus:border-[#9b1c1c] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input 
                    type="tel" 
                    required
                    placeholder="+91 9995412955"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 pl-12 pr-4 text-zinc-800 text-sm focus:border-[#9b1c1c] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2 flex flex-col justify-between">
                <div>
                  <label className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase">Wedding Date</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="date" 
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 pl-12 pr-4 text-zinc-800 text-sm focus:border-[#9b1c1c] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={formData.sameDate}
                    onChange={(e) => setFormData({ ...formData, sameDate: e.target.checked })}
                    className="accent-[#9b1c1c] w-4.5 h-4.5 rounded cursor-pointer"
                  />
                  <span className="text-[10px] sm:text-[11px] text-zinc-600 font-light">Reception and Wedding are on the same date</span>
                </label>
              </div>
            </div>

            {/* Conditionally reveal Reception Date with standard clean animation */}
            <AnimatePresence>
              {!formData.sameDate && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase">Reception Date</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="date" 
                      required={!formData.sameDate}
                      value={formData.receptionDate}
                      onChange={(e) => setFormData({ ...formData, receptionDate: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 pl-12 pr-4 text-zinc-800 text-sm focus:border-[#9b1c1c] focus:outline-none transition-colors"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="email" 
                  required
                  placeholder="athul@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 pl-12 pr-4 text-zinc-800 text-sm focus:border-[#9b1c1c] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase">Event Venue & Details</label>
              <div className="relative">
                <MessageSquare size={16} className="absolute left-4 top-5 text-zinc-400" />
                <textarea 
                  rows="3"
                  placeholder="Please specify your wedding hall/venue in Trivandrum..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 pl-12 pr-4 text-zinc-800 text-sm focus:border-[#9b1c1c] focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={status === "loading"}
              className="w-full py-4.5 bg-[#9b1c1c] text-white font-bold rounded-xl hover:bg-[#801414] active:scale-98 transition-all text-xs tracking-widest uppercase shadow-md flex items-center justify-center gap-2"
            >
              {status === "loading" ? "Submitting Inquiry..." : "Lock in My Special Offer"}
            </button>

            <AnimatePresence>
              {status === "success" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-xs text-center flex items-center gap-2"
                >
                  <Check size={16} className="shrink-0 text-green-600" />
                  🎉 Success! Details submitted. Our team will contact you within 2 hours to confirm availability and claim your FREE Pre-Wedding shoot!
                </motion.div>
              )}
              {status === "error" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs text-center flex items-center gap-2"
                >
                  <AlertCircle size={16} className="shrink-0 text-red-600" />
                  ⚠️ Error submitting. Please click the WhatsApp button below to message us directly!
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Direct WhatsApp Call options */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
            <a 
              href="https://wa.me/919995412955?text=Hello%20Dreamwed%20Stories,%20I%20would%20like%20to%20claim%20the%20Bride%20and%20Groom%20Special%20Offer!"
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4.5 bg-[#25D366] hover:bg-[#1ebd57] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2.5 text-xs tracking-wider uppercase"
            >
              <FaWhatsapp size={18} /> Chat on WhatsApp
            </a>
            <a 
              href="tel:+919995412955"
              className="w-full sm:w-auto px-8 py-4.5 bg-zinc-200 border border-zinc-300 hover:bg-zinc-300 text-zinc-800 font-bold rounded-xl transition-all flex items-center justify-center gap-2.5 text-xs tracking-wider uppercase"
            >
              Call +91 9995412955
            </a>
          </div>

        </div>
      </section>

      {/* FLOATING WHATSAPP BUTTON */}
      <a 
        href="https://wa.me/919995412955?text=Hello%20Dreamwed%20Stories,%20I%20would%20like%20to%20claim%20the%20Bride%20and%20Groom%20Special%20Offer!"
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] hover:bg-[#1ebd57] hover:scale-110 active:scale-95 transition-all duration-300 rounded-full flex items-center justify-center text-white shadow-2xl z-50 animate-bounce"
        style={{ animationDuration: "3s" }}
      >
        <FaWhatsapp size={28} />
      </a>

      {/* 8. INTERACTIVE BOOKING CONFIRMATION MODAL */}
      <AnimatePresence>
        {isConfirmBookingOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            onClick={() => setIsConfirmBookingOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-xl rounded-[32px] bg-white p-8 border border-zinc-200 shadow-[0_25px_60px_rgba(0,0,0,0.15)] overflow-hidden text-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsConfirmBookingOpen(false)}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200/50 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-all hover:rotate-90 duration-300 z-10 cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="space-y-6">
                <div>
                  <span className="text-[#b4975a] text-[10px] font-bold tracking-[0.2em] uppercase block mb-1">Secure Your Wedding Offer</span>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl text-zinc-900 font-light tracking-tight">
                    Confirm Your <span className="italic font-serif text-[#b4975a]">Booking Request</span>
                  </h3>
                  <p className="text-zinc-500 text-[11px] font-light mt-1">
                    Fill out the reservation form below. We will check availability for your date, save a pending invoice, and send a coordinator to confirm details.
                  </p>
                </div>

                {/* Pre-selected package card summary */}
                <div className="bg-[#fbfbfa] border border-zinc-200/60 p-5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#b4975a]">Package Chosen</span>
                      <h4 className="text-base font-semibold text-zinc-900 mt-0.5">{selectedPackage}</h4>
                    </div>
                    <span className="text-base font-bold text-[#9b1c1c]">₹{selectedPackagePrice.toLocaleString("en-IN")}</span>
                  </div>
                  
                  {/* Real-time Dynamic Add-ons Selector */}
                  <div className="border-t border-zinc-200/60 pt-3 mt-2 space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Customize Optional Add-ons</span>
                    
                    {/* Cinematic Pre-wedding check (Unless it's Pack 03, which includes it free) */}
                    {selectedPackage !== "Bride & Groom Pack 03" ? (
                      <label className="flex items-center justify-between text-xs text-zinc-600 cursor-pointer py-1 hover:text-zinc-900 select-none">
                        <span className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={selectedAddons.prewedVideo}
                            onChange={(e) => setSelectedAddons({ ...selectedAddons, prewedVideo: e.target.checked })}
                            className="accent-[#9b1c1c] w-4.5 h-4.5 rounded cursor-pointer"
                          />
                          <span>Cinematic Pre-Wedding Shoot Add-on</span>
                        </span>
                        <span className="font-semibold text-zinc-800">+ ₹9,999</span>
                      </label>
                    ) : (
                      <div className="flex justify-between text-xs text-emerald-700 py-1 font-medium bg-emerald-50/50 px-3 rounded-lg border border-emerald-100">
                        <span>Cinematic Pre-Wedding shoot</span>
                        <span className="uppercase text-[9px] tracking-wider font-bold">Included Free</span>
                      </div>
                    )}

                    <label className="flex items-center justify-between text-xs text-zinc-600 cursor-pointer py-1 hover:text-zinc-900 select-none">
                      <span className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedAddons.drone}
                          onChange={(e) => setSelectedAddons({ ...selectedAddons, drone: e.target.checked })}
                          className="accent-[#9b1c1c] w-4.5 h-4.5 rounded cursor-pointer"
                        />
                        <span>Aerial Drone Coverage</span>
                      </span>
                      <span className="font-semibold text-zinc-800">+ ₹8,000</span>
                    </label>

                    <div className="flex items-center justify-between text-xs text-zinc-600 py-1">
                      <span className="flex items-center gap-2">
                        <Tv size={14} className="text-zinc-400" />
                        <span>Rental LED Screen Setup</span>
                      </span>
                      <select
                        value={selectedAddons.ledScreen}
                        onChange={(e) => setSelectedAddons({ ...selectedAddons, ledScreen: e.target.value })}
                        className="bg-zinc-50 border border-zinc-200 rounded px-2 py-0.5 text-zinc-800 font-medium text-xs focus:outline-none"
                      >
                        <option value="none">No LED Screen</option>
                        <option value="single">Single screen (+₹14,999)</option>
                        <option value="double">Double screen (+₹24,999)</option>
                      </select>
                    </div>
                  </div>

                  {/* Calculated live total */}
                  <div className="border-t border-zinc-200/60 pt-3 flex justify-between items-center text-sm font-bold">
                    <span className="text-zinc-800">Total Booking Value:</span>
                    <span className="text-lg text-[#9b1c1c]">
                      ₹{(
                        selectedPackagePrice + 
                        (selectedPackage !== "Bride & Groom Pack 03" && selectedAddons.prewedVideo ? 9999 : 0) + 
                        (selectedAddons.drone ? 8000 : 0) + 
                        (selectedAddons.ledScreen === "single" ? 14999 : selectedAddons.ledScreen === "double" ? 24999 : 0)
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Form fields */}
                <form onSubmit={handleConfirmBookingSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase">Full Names (Bride & Groom)</label>
                      <input 
                        type="text" 
                        required
                        value={bookingForm.name}
                        onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                        placeholder="Athul & Priya"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-zinc-800 text-xs focus:border-[#9b1c1c] focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase">WhatsApp Number</label>
                      <input 
                        type="tel" 
                        required
                        value={bookingForm.phone}
                        onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                        placeholder="+91 9995412955"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-zinc-800 text-xs focus:border-[#9b1c1c] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={bookingForm.email}
                        onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                        placeholder="athul@example.com"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-zinc-800 text-xs focus:border-[#9b1c1c] focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase">Wedding Date</label>
                      <input 
                        type="date" 
                        required
                        value={bookingForm.date}
                        onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-zinc-800 text-xs focus:border-[#9b1c1c] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase">Event Venue & Location</label>
                    <input 
                      type="text" 
                      required
                      value={bookingForm.venue}
                      onChange={(e) => setBookingForm({ ...bookingForm, venue: e.target.value })}
                      placeholder="e.g. Al Saj Convention Centre, Trivandrum"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-zinc-800 text-xs focus:border-[#9b1c1c] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase">Additional Notes / Special Requests</label>
                    <textarea 
                      rows="2"
                      value={bookingForm.notes}
                      onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                      placeholder="Any customized album requirements, coverage times, etc..."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-zinc-800 text-xs focus:border-[#9b1c1c] focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={bookingStatus === "loading"}
                    className="w-full py-4 bg-[#9b1c1c] text-white font-bold rounded-xl hover:bg-[#801414] active:scale-98 transition-all text-xs tracking-widest uppercase shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    {bookingStatus === "loading" ? "Submitting Booking..." : "Confirm Booking Request"}
                  </button>
                </form>

                <AnimatePresence>
                  {bookingStatus === "success" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-xs text-center flex items-center gap-2"
                    >
                      <Check size={16} className="shrink-0 text-green-600" />
                      🎉 Booking submitted successfully! Our coordinator will contact you on WhatsApp to confirm details, and your printable pending invoice is registered!
                    </motion.div>
                  )}
                  {bookingStatus === "error" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs text-center flex items-center gap-2"
                    >
                      <AlertCircle size={16} className="shrink-0 text-red-600" />
                      ⚠️ Server connection error. We have backup synced your details! Please WhatsApp us directly to confirm dates immediately.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CINEMATIC THEATER MODAL */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/25 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={() => setIsVideoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-5xl rounded-[32px] overflow-hidden bg-zinc-950 p-2 sm:p-3 border border-zinc-800 shadow-[0_25px_60px_rgba(0,0,0,0.5)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button with circular layout */}
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 flex items-center justify-center text-white transition-all hover:rotate-90 duration-300 z-50 cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* 16:9 Aspect Video Embed Container */}
              <div className="relative aspect-video w-full rounded-[24px] overflow-hidden bg-black shadow-inner">
                <iframe
                  src="https://www.youtube.com/embed/S9-SrdnKsMs?autoplay=1&mute=0&loop=1&playlist=S9-SrdnKsMs&controls=1&modestbranding=1&rel=0"
                  title="Cinematic pre-wedding film"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ border: 0 }}
                ></iframe>
              </div>

              {/* Theater footer details */}
              <div className="pt-4 pb-2 px-4 flex justify-between items-center text-zinc-400 text-[10px] sm:text-xs font-semibold tracking-wider uppercase select-none">
                <span>Dreamwed Stories — Cinematic Pre-Wedding Film</span>
                <span className="hidden sm:inline opacity-60">Press ESC to close theater</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HANDCRAFTED LAYFLAT ALBUMS REEL MODAL */}
      <AnimatePresence>
        {isAlbumVideoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/25 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={() => setIsAlbumVideoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md rounded-[32px] overflow-hidden bg-zinc-950 p-2 sm:p-3 border border-zinc-800 shadow-[0_25px_60px_rgba(0,0,0,0.5)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button with circular layout */}
              <button
                onClick={() => setIsAlbumVideoModalOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 flex items-center justify-center text-white transition-all hover:rotate-90 duration-300 z-50 cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* Vertical 9:16 Aspect Video Embed Container */}
              <div className="relative aspect-[9/16] w-full rounded-[24px] overflow-hidden bg-black shadow-inner">
                <iframe
                  src="https://www.instagram.com/reel/C428oQZpPJb/embed/"
                  title="Handcrafted Layflat Albums Showcase Reel"
                  allowTransparency="true"
                  frameBorder="0"
                  scrolling="no"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ border: 0 }}
                ></iframe>
              </div>

              {/* Theater footer details */}
              <div className="pt-4 pb-2 px-4 flex justify-between items-center text-zinc-400 text-[10px] sm:text-xs font-semibold tracking-wider uppercase select-none">
                <span>Dreamwed Stories — Premium Layflat Albums Reel</span>
                <span className="hidden sm:inline opacity-60">Press ESC to close</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PREMIUM PACKAGE CUSTOM ADD-ONS MODAL */}
      <AnimatePresence>
        {isAddonsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/25 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            onClick={() => setIsAddonsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.93, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg rounded-[36px] bg-white border border-zinc-100 p-6 sm:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.2)] flex flex-col gap-6 text-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsAddonsModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200/50 flex items-center justify-center text-zinc-600 transition-all hover:rotate-90 duration-300 z-50 cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* Modal Header */}
              <div className="space-y-1.5 pr-6">
                <span className="inline-flex items-center gap-1 bg-[#1e3f20]/10 text-[#1e3f20] px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase">
                  Premium Extras
                </span>
                <h3 className="text-2xl text-zinc-900 font-semibold tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Customize Your Package
                </h3>
                <p className="text-zinc-500 font-light text-xs leading-relaxed">
                  Add premium cinematic extras to take your wedding films and presentation to the next level.
                </p>
              </div>

              <div className="w-full h-px bg-zinc-100" />

              {/* Interactive Add-on Items list */}
              <div className="space-y-4">
                
                {/* DRONE REMOVED — included in larger packs */}
                
                {/* ITEM 2: PRE-WEDDING CINEMATIC VIDEO */}
                <div 
                  className={`p-4 rounded-2xl border transition-all duration-300 ${
                    selectedAddons.prewedVideo
                      ? "bg-[#1e3f20]/5 border-[#1e3f20]/40 shadow-sm" 
                      : "bg-zinc-50/50 border-zinc-200 hover:border-zinc-100"
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-sm text-zinc-900">Pre-Wedding Cinematic Video</span>
                    <span className="font-extrabold text-xs text-zinc-500 italic">Optional Add-on</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-light leading-relaxed block mb-4">
                    High-end romantic video shoot before the wedding, capturing a stunning cinematic film to share or play at your reception.
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: false, label: "No Video", price: "—" },
                      { value: true, label: "Add Video Film", price: "₹9,999" }
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => setSelectedAddons({ ...selectedAddons, prewedVideo: opt.value })}
                        className={`py-2.5 px-1 rounded-xl text-center flex flex-col gap-0.5 border cursor-pointer transition-all duration-300 ${
                          selectedAddons.prewedVideo === opt.value
                            ? "bg-[#1e3f20] border-[#1e3f20] text-white shadow-md scale-[1.02]"
                            : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300"
                        }`}
                      >
                        <span className="text-[10px] font-bold select-none">{opt.label}</span>
                        <span className={`text-[9px] font-extrabold ${selectedAddons.prewedVideo === opt.value ? "text-amber-300" : "text-[#9b1c1c]"}`}>
                          {opt.price}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ITEM 3: LED SCREEN SETUP */}
                <div 
                  className={`p-4 rounded-2xl border transition-all duration-300 ${
                    selectedAddons.ledScreen !== "none" 
                      ? "bg-[#1e3f20]/5 border-[#1e3f20]/40 shadow-sm" 
                      : "bg-zinc-50/50 border-zinc-200 hover:border-zinc-100"
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-sm text-zinc-900">Premium LED Screen Setup</span>
                    <span className="font-extrabold text-xs text-zinc-500 italic">Optional Add-on</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-light leading-relaxed block mb-4">
                    Massive panoramic live-stream displays for receptions, allowing everyone to see the candid joy in high definition.
                  </span>
                  
                  {/* Options Segmented Pill selection */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "none", label: "No Screen", price: "—" },
                      { value: "single", label: "Single (8x10ft)", price: "₹14,999" },
                      { value: "double", label: "Double Side", price: "₹24,999" }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSelectedAddons({ ...selectedAddons, ledScreen: opt.value })}
                        className={`py-2.5 px-1 rounded-xl text-center flex flex-col gap-0.5 border cursor-pointer transition-all duration-300 ${
                          selectedAddons.ledScreen === opt.value
                            ? "bg-[#1e3f20] border-[#1e3f20] text-white shadow-md scale-[1.02]"
                            : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300"
                        }`}
                      >
                        <span className="text-[10px] font-bold select-none">{opt.label}</span>
                        <span className={`text-[9px] font-extrabold ${selectedAddons.ledScreen === opt.value ? "text-amber-300" : "text-[#9b1c1c]"}`}>
                          {opt.price}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Direct Book Now Button below the LED selector */}
                  <div className="mt-4 pt-1 select-none">
                    <button
                      type="button"
                      onClick={() => {
                        let extras = [];

                        if (selectedAddons.prewedVideo) extras.push("Pre-Wedding Cinematic Video (₹9,999)");
                        if (selectedAddons.ledScreen === "single") extras.push("Single 8x10ft LED Screen (₹14,999)");
                        if (selectedAddons.ledScreen === "double") extras.push("Double Side Dual-LED Display (₹24,999)");

                        let messageStr = "Hi! I would like to lock in the special package slot.";
                        if (extras.length > 0) {
                          messageStr += ` I am interested in adding these custom Add-ons: [${extras.join(", ")}]. Please contact me to secure this!`;
                        }

                        setFormData({
                          ...formData,
                          message: messageStr
                        });
                        setIsAddonsModalOpen(false);
                        setTimeout(() => {
                          scrollToForm();
                        }, 200);
                      }}
                      className="w-full py-3 bg-[#9b1c1c] hover:bg-[#801414] text-white font-bold rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all text-xs tracking-widest uppercase shadow-sm cursor-pointer text-center flex items-center justify-center gap-2"
                    >
                      <span>Book Package Now</span>
                      <span>🌟</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* LIVE PRICE SUMMARY CONTAINER */}
              <div className="bg-[#fbfbfa] border border-zinc-200 p-5 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-zinc-500 select-none">
                  <span>Selected Add-ons Total:</span>
                  <span className="text-[#9b1c1c] font-extrabold text-sm">
                    + ₹{(
                      (selectedAddons.ledScreen === "single" ? 14999 : selectedAddons.ledScreen === "double" ? 24999 : 0) +
                      (selectedAddons.prewedVideo ? 9999 : 0)
                    ).toLocaleString("en-IN")}/-
                  </span>
                </div>
                <div className="text-[9px] text-zinc-400 font-light select-none">
                  *Prices will be added to your selected base packages. Secure slot discounts now!
                </div>
              </div>

              {/* CTA: Secure Packages & Auto-fill Form */}
              <button
                onClick={() => {
                  // Generate a custom request details message
                  let extras = [];

                  if (selectedAddons.prewedVideo) extras.push("Pre-Wedding Cinematic Video (₹9,999)");
                  if (selectedAddons.ledScreen === "single") extras.push("Single 8x10ft LED Screen (₹14,999)");
                  if (selectedAddons.ledScreen === "double") extras.push("Double Side Dual-LED Display (₹24,999)");

                  let messageStr = "Hi! I would like to lock in the special package slot.";
                  if (extras.length > 0) {
                    messageStr += ` I am interested in adding these custom Add-ons: [${extras.join(", ")}]. Please contact me to secure this!`;
                  }

                  setFormData({
                    ...formData,
                    message: messageStr
                  });
                  
                  setIsAddonsModalOpen(false);
                  setTimeout(() => {
                    scrollToForm();
                  }, 200);
                }}
                className="w-full py-4 bg-[#9b1c1c] hover:bg-[#801414] text-white font-bold rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all text-xs tracking-widest uppercase shadow-md cursor-pointer text-center"
              >
                Apply Extras & Book Offer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAILED PACKAGE DETAILS & WEDDING GALLERY MODAL */}
      <AnimatePresence>
        {activeDetailPackage !== null && (() => {
          // Dynamic calculation of final price inside the AnimatePresence closure
          const basePriceNum = parseInt(packagesInfo[activeDetailPackage].offerPrice.replace(/[^0-9]/g, ""));
          const addonPrice = 
            (selectedAddons.ledScreen === "single" ? 14999 : selectedAddons.ledScreen === "double" ? 24999 : 0) +
            ((selectedAddons.prewedVideo && activeDetailPackage !== 2) ? 9999 : 0);
          const finalCalculatedPrice = basePriceNum + addonPrice;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/25 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
              onClick={() => setActiveDetailPackage(null)}
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
                  onClick={() => setActiveDetailPackage(null)}
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
                      key={`bg-${packagesInfo[activeDetailPackage].images[currentSlide % packagesInfo[activeDetailPackage].images.length]}`}
                      src={packagesInfo[activeDetailPackage].images[currentSlide % packagesInfo[activeDetailPackage].images.length]}
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
                      key={`fg-${packagesInfo[activeDetailPackage].images[currentSlide % packagesInfo[activeDetailPackage].images.length]}`}
                      src={packagesInfo[activeDetailPackage].images[currentSlide % packagesInfo[activeDetailPackage].images.length]}
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
                    {packagesInfo[activeDetailPackage].images.map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1 h-1 rounded-full transition-all duration-300 ${
                          (currentSlide % packagesInfo[activeDetailPackage].images.length) === i ? "bg-[#b4975a] scale-125" : "bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Right Side: Package Inclusions and Booking Option (Redesigned with Fixed Headers/CTA & Unified Scroll Stream) */}
                <div className="p-6 sm:p-10 flex flex-col justify-between gap-5 md:max-h-[650px] md:overflow-hidden overflow-visible h-auto">
                  
                  {/* Header detail */}
                  <div className="space-y-2 select-none">
                    <span className="inline-flex items-center gap-1 bg-[#1e3f20]/10 text-[#1e3f20] px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase">
                      {packagesInfo[activeDetailPackage].subtitle}
                    </span>
                    <h3 className="text-2xl sm:text-3xl text-zinc-900 font-semibold tracking-tight leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {packagesInfo[activeDetailPackage].title}
                    </h3>
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-bold text-[#9b1c1c]">Rs. {packagesInfo[activeDetailPackage].offerPrice}/-</span>
                      <span className="text-zinc-400 text-xs line-through">Regular: {packagesInfo[activeDetailPackage].regularPrice}/-</span>
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

                  {/* Main Scroll Stream (Checklist + Integrated Add-ons) */}
                  <div className="flex-1 md:overflow-y-auto pr-2 space-y-6 md:scrollbar-thin relative min-h-0 overflow-visible h-auto">
                    
                    {/* Short intro bio */}
                    <p className="text-zinc-500 font-light text-xs leading-relaxed select-none">
                      {packagesInfo[activeDetailPackage].description}
                    </p>

                    {/* Bonus highlight box */}
                    <div className="bg-[#1e3f20]/5 border border-[#1e3f20]/15 p-4 rounded-2xl flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1e3f20]/15 flex items-center justify-center text-[#1e3f20] shrink-0">
                        <Gift size={16} />
                      </div>
                      <div>
                        <span className="block text-[#1e3f20] text-xs font-bold uppercase tracking-wide">
                          {packagesInfo[activeDetailPackage].bonus}
                        </span>
                        <span className="text-zinc-600 text-[10px] font-light leading-snug block mt-0.5">
                          {packagesInfo[activeDetailPackage].bonusDesc}
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-px bg-zinc-100" />

                    {/* Complete inclusions list */}
                    <div className="space-y-3.5 relative">
                      <span className="text-[10px] text-zinc-800 tracking-wider uppercase font-bold block select-none">
                        🎁 What's Included ({packagesInfo[activeDetailPackage].details.length} Inclusions):
                      </span>
                      <div className="space-y-3">
                        {packagesInfo[activeDetailPackage].details.map((item, index) => (
                          <div key={index} className="flex items-start gap-3 text-xs text-zinc-600 font-light leading-relaxed">
                            <span className="w-4.5 h-4.5 rounded-full bg-[#1e3f20]/10 text-[#1e3f20] flex items-center justify-center shrink-0 mt-0.5">
                              <Check size={10} strokeWidth={3} />
                            </span>
                            {item}
                          </div>
                        ))}
                      </div>
                      <span className="text-[9px] text-[#1e3f20] font-bold block tracking-wider pt-2 select-none animate-pulse">
                        Scroll down to customize options 👇
                      </span>
                    </div>

                    <div className="w-full h-px bg-zinc-100" />

                    {/* INTEGRATED ADD-ONS SECTION (Scroll completely down to reveal) */}
                    <div className="space-y-4 pt-1">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 bg-[#1e3f20]/10 text-[#1e3f20] px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase select-none">
                          Step 2
                        </span>
                        <h4 className="text-sm font-bold text-zinc-900 select-none">
                          ✨ Customize with Premium Extras (Optional):
                        </h4>
                      </div>

                      <div className="space-y-3">
                        {/* DRONE REMOVED — included in larger pack */}
                        
                        {/* ITEM 2: PRE-WEDDING CINEMATIC VIDEO */}
                        {activeDetailPackage === 2 ? (
                          <div className="p-3.5 rounded-2xl border bg-[#1e3f20]/5 border-[#1e3f20]/20">
                            <div className="flex justify-between items-center mb-2 select-none">
                              <span className="font-bold text-xs text-[#1e3f20]">Pre-Wedding Cinematic Video</span>
                              <span className="text-[9px] font-extrabold bg-[#1e3f20] text-white px-2 py-0.5 rounded uppercase">Included Free</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 font-light leading-relaxed block select-none">
                              Save ₹30,000! Pre-wedding cinematic video film is fully included free in Pack 03!
                            </span>
                          </div>
                        ) : (
                          <div className={`p-3.5 rounded-2xl border transition-all duration-300 ${selectedAddons.prewedVideo ? 'bg-[#1e3f20]/5 border-[#1e3f20]/30 shadow-sm' : 'bg-zinc-50/50 border-zinc-200'}`}>
                            <div className="flex justify-between items-center mb-2 select-none">
                              <span className="font-bold text-xs text-zinc-900">Pre-Wedding Cinematic Video</span>
                              <span className="text-[9px] font-semibold text-zinc-500">Romantic Film Extra</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 font-light leading-relaxed block mb-3 select-none">
                              High-end cinematic video shoot before the wedding, creating a beautiful romantic story film.
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { value: false, label: "No Video", price: "—" },
                                { value: true, label: "Add Video Film", price: "₹9,999" }
                              ].map((opt) => (
                                <button
                                  key={opt.label}
                                  type="button"
                                  onClick={() => setSelectedAddons({ ...selectedAddons, prewedVideo: opt.value })}
                                  className={`py-2 px-1 rounded-xl text-center flex flex-col gap-0.5 border cursor-pointer transition-all duration-300 select-none ${
                                    selectedAddons.prewedVideo === opt.value
                                      ? "bg-[#1e3f20] border-[#1e3f20] text-white shadow-sm scale-[1.02]"
                                      : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300"
                                  }`}
                                >
                                  <span className="text-[10px] font-bold">{opt.label}</span>
                                  <span className={`text-[9px] font-extrabold ${selectedAddons.prewedVideo === opt.value ? "text-amber-300" : "text-[#9b1c1c]"}`}>
                                    {opt.price}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ITEM 3: LED SCREEN SETUP */}
                        <div className={`p-3.5 rounded-2xl border transition-all duration-300 ${selectedAddons.ledScreen !== "none" ? 'bg-[#1e3f20]/5 border-[#1e3f20]/30 shadow-sm' : 'bg-zinc-50/50 border-zinc-200'}`}>
                          <div className="flex justify-between items-center mb-2 select-none">
                            <span className="font-bold text-xs text-zinc-900">Premium LED Screen Setup</span>
                            <span className="text-[9px] font-semibold text-zinc-500">Live Broadcast Extra</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-light leading-relaxed block mb-3 select-none">
                            High-definition modular live video streaming screen for receptions.
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: "none", label: "No Screen", price: "—" },
                              { value: "single", label: "Single (8x10ft)", price: "₹14,999" },
                              { value: "double", label: "Double Side", price: "₹24,999" }
                            ].map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setSelectedAddons({ ...selectedAddons, ledScreen: opt.value })}
                                className={`py-2 px-1 rounded-xl text-center flex flex-col gap-0.5 border cursor-pointer transition-all duration-300 select-none ${
                                  selectedAddons.ledScreen === opt.value
                                    ? "bg-[#1e3f20] border-[#1e3f20] text-white shadow-sm scale-[1.02]"
                                    : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300"
                                }`}
                              >
                                <span className="text-[10px] font-bold">{opt.label}</span>
                                <span className={`text-[9px] font-extrabold ${selectedAddons.ledScreen === opt.value ? "text-amber-300" : "text-[#9b1c1c]"}`}>
                                  {opt.price}
                                </span>
                              </button>
                            ))}
                          </div>

                          {/* Direct Book Now Button below the LED selector */}
                          <div className="mt-4 pt-1 select-none">
                            <button
                              type="button"
                              onClick={() => {
                                let extras = [];

                                if (selectedAddons.prewedVideo && activeDetailPackage !== 2) extras.push("Pre-Wedding Cinematic Video (₹9,999)");
                                if (selectedAddons.ledScreen === "single") extras.push("Single 8x10ft LED Screen (₹14,999)");
                                if (selectedAddons.ledScreen === "double") extras.push("Double Side Dual-LED Display (₹24,999)");

                                let messageStr = `Hi! I would like to book the special package slot: [${packagesInfo[activeDetailPackage].title} - Rs. ${packagesInfo[activeDetailPackage].offerPrice}/-]`;
                                if (extras.length > 0) {
                                  messageStr += ` customized with these Add-ons: [${extras.join(", ")}]. Total Calculated Investment: Rs. ${finalCalculatedPrice.toLocaleString("en-IN")}/-.`;
                                } else {
                                  messageStr += ".";
                                }
                                messageStr += " Please contact me to secure this offer!";

                                setFormData({
                                  ...formData,
                                  message: messageStr
                                });
                                setActiveDetailPackage(null);
                                setTimeout(() => {
                                  scrollToForm();
                                }, 200);
                              }}
                              className="w-full py-3 bg-[#9b1c1c] hover:bg-[#801414] text-white font-bold rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all text-xs tracking-widest uppercase shadow-sm cursor-pointer text-center flex items-center justify-center gap-2"
                            >
                              <span>Book Package Now</span>
                              <span>🌟</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>

                    <div className="h-6" />
                  </div>

                  {/* Absolute subtle bottom fade for active scroll stream */}
                  <div className="w-full h-px bg-zinc-100 select-none" />

                  {/* Anchored CTA Button at the bottom (Static & Dynamically updating price) */}
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        let extras = [];

                        if (selectedAddons.prewedVideo && activeDetailPackage !== 2) extras.push("Pre-Wedding Cinematic Video (₹9,999)");
                        if (selectedAddons.ledScreen === "single") extras.push("Single 8x10ft LED Screen (₹14,999)");
                        if (selectedAddons.ledScreen === "double") extras.push("Double Side Dual-LED Display (₹24,999)");

                        let messageStr = `Hi! I would like to book the special package slot: [${packagesInfo[activeDetailPackage].title} - Rs. ${packagesInfo[activeDetailPackage].offerPrice}/-]`;
                        if (extras.length > 0) {
                          messageStr += ` customized with these Add-ons: [${extras.join(", ")}]. Total Calculated Investment: Rs. ${finalCalculatedPrice.toLocaleString("en-IN")}/-.`;
                        } else {
                          messageStr += ".";
                        }
                        messageStr += " Please contact me to secure this offer!";

                        setFormData({
                          ...formData,
                          message: messageStr
                        });
                        setActiveDetailPackage(null);
                        setTimeout(() => {
                          scrollToForm();
                        }, 200);
                      }}
                      className="w-full py-4.5 bg-[#9b1c1c] hover:bg-[#801414] text-white font-bold rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all text-xs tracking-widest uppercase shadow-md cursor-pointer text-center select-none"
                    >
                      Secure Slot (Total: Rs. {finalCalculatedPrice.toLocaleString("en-IN")}/-) 🌟
                    </button>
                  </div>
                </div>

              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
};

export default TrivandrumOffer;
