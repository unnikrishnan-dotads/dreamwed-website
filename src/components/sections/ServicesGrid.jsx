import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ArrowRight } from "lucide-react";
import { FiX, FiInstagram, FiHeart, FiMessageCircle, FiSend, FiBookmark, FiPlay, FiMaximize2 } from "react-icons/fi";

// Assets
import capture1 from "../../assets/images/capture1.png";
import capture2 from "../../assets/images/capture2.png";
import capture3 from "../../assets/images/capture3.png";
import capture4 from "../../assets/images/capture4.png";
import capture5 from "../../assets/images/capture5.png";
import capture6 from "../../assets/images/capture6.png";

import pic1 from "../../assets/images/pic1.jpeg";
import pic2 from "../../assets/images/pic2.jpeg";
import pic3 from "../../assets/images/pic3.jpeg";
import pic4 from "../../assets/images/pic4.jpeg";

import newPortrait1 from "../../assets/images/new_portrait_1.jpg";
import newPortrait2 from "../../assets/images/new_portrait_2.jpg";
import newPortrait3 from "../../assets/images/new_portrait_3.jpg";
import newPortrait4 from "../../assets/images/new_portrait_4.jpg";

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
  },
  {
    id: 7,
    title: "AI Photo Search",
    description: "Upload a selfie to find all your high-resolution wedding photos instantly with neural scanning.",
    rating: "5.0",
    tag: "New ✨",
    image: "/ai_search_banner.png",
    link: "/ai-search/",
    isExternal: true
  }
];

// Rich portfolio gallery data for each service (featuring photos & vertical reels)
const serviceGalleries = {
  1: {
    title: "Wedding Photography",
    tagline: "Vibrant and authentic emotional moments captured forever.",
    items: [
      { id: "wp-p1", type: "photo", url: capture2, likes: 4890, comments: 142, caption: "Traditional smiles and laughter under forever promises." },
      { id: "wp-p2", type: "photo", url: "/athulraj.jpg", likes: 6241, comments: 204, caption: "Dr. Athulraj & Aswathy's beautiful traditional wedding day." },
      { id: "wp-v1", type: "video", url: "/anandha_lekshmi.jpg", videoId: "c310o24XVN0", likes: 12450, comments: 231, caption: "Cinematic traditional entry highlights and high-energy drums. 🥁" },
      { id: "wp-p3", type: "photo", url: "/anandha_lekshmi.jpg", likes: 5102, comments: 167, caption: "Silent moments of pristine Kasavu crimson elegance." },
      { id: "wp-v2", type: "video", url: pic1, videoId: "eC-z1oW-bUo", likes: 14890, comments: 310, caption: "Thrissur traditional rhythm showcase highlights." },
      { id: "wp-p4", type: "photo", url: pic1, likes: 5821, comments: 189, caption: "Vibrant emerald themes and laughter shared hand-in-hand." }
    ]
  },
  2: {
    title: "Pre-Wedding Shoots",
    tagline: "Romantic love stories documented in majestic landscapes.",
    items: [
      { id: "pw-p1", type: "photo", url: capture3, likes: 7852, comments: 198, caption: "Golden hour sunset glances and quiet whispers of love." },
      { id: "pw-p2", type: "photo", url: pic2, likes: 6912, comments: 154, caption: "A serene sunset walk by the backwaters of Alappuzha." },
      { id: "pw-v1", type: "video", url: "/chindu.jpg", videoId: "S9-SrdnKsMs", likes: 11980, comments: 188, caption: "Backwater sunset romance cruise with Chindu & Athira. 🌅" },
      { id: "pw-p3", type: "photo", url: "/chindu.jpg", likes: 5421, comments: 120, caption: "Unveiling modern moments of romantic destination storytelling." },
      { id: "pw-v2", type: "video", url: newPortrait1, videoId: "4T_fQo2ZqQo", likes: 13240, comments: 215, caption: "Destination cliff-side pre-wedding trailer in Varkala." },
      { id: "pw-p4", type: "photo", url: newPortrait1, likes: 6304, comments: 176, caption: "Dramatic cliffs, sea breeze, and forever promises." }
    ]
  },
  3: {
    title: "Engagement / Reception",
    tagline: "Lively celebrations, ring exchanges, and festive highlights.",
    items: [
      { id: "er-p1", type: "photo", url: capture4, likes: 8120, comments: 215, caption: "Pre-event preparation and beautiful traditional details." },
      { id: "er-p2", type: "photo", url: pic3, likes: 5930, comments: 142, caption: "Stunning floral decor and traditional ring ceremony layouts." },
      { id: "er-v1", type: "video", url: "/deepak.jpg", videoId: "O4zR8hS1tA0", likes: 15320, comments: 289, caption: "Deepak & Anjali's spectacular high-energy sangeet entry! 💃" },
      { id: "er-p3", type: "photo", url: "/deepak.jpg", likes: 4921, comments: 110, caption: "Vivid, candid reception moments captured in Kollam." },
      { id: "er-v2", type: "video", url: newPortrait2, videoId: "8r9NEx29o4w", likes: 11560, comments: 176, caption: "Ring exchange and forever vows under the starlight." },
      { id: "er-p4", type: "photo", url: newPortrait2, likes: 6412, comments: 180, caption: "Exquisite details and candid smiles during ring exchange." }
    ]
  },
  4: {
    title: "Cinematic Wedding Films",
    tagline: "Luxury, movie-like wedding highlights and documentary films.",
    items: [
      { id: "cf-p1", type: "photo", url: capture1, likes: 9241, comments: 245, caption: "Candid film frames capturing raw, unfiltered preparation." },
      { id: "cf-p2", type: "photo", url: pic4, likes: 7852, comments: 198, caption: "Spectacular sunset walks captured in rich 4K cinematic clarity." },
      { id: "cf-v1", type: "video", url: "/chindu.jpg", videoId: "jnSAu-C6OmQ", likes: 16900, comments: 342, caption: "Traditional elegance meets grand, epic storytelling. 🎬" },
      { id: "cf-p3", type: "photo", url: "/chindu.jpg", likes: 5892, comments: 167, caption: "Perfect film color grade capturing gold and green hues." },
      { id: "cf-v2", type: "video", url: newPortrait3, videoId: "S9-SrdnKsMs", likes: 14820, comments: 290, caption: "Documentary prep teaser and intimate couple walks." },
      { id: "cf-p4", type: "photo", url: newPortrait3, likes: 6812, comments: 182, caption: "Preparing for the biggest walk of their life." }
    ]
  },
  5: {
    title: "Drone Coverage",
    tagline: "Spectacular aerial perspectives of grand destination venues.",
    items: [
      { id: "dc-p1", type: "photo", url: capture5, likes: 8940, comments: 210, caption: "Stunning overhead couples dip captured by the shores." },
      { id: "dc-p2", type: "photo", url: pic2, likes: 6732, comments: 154, caption: "Sailing through Alappuzha backwaters from above." },
      { id: "dc-v1", type: "video", url: newPortrait4, videoId: "c310o24XVN0", likes: 13900, comments: 245, caption: "Grand scale drone entrance and temple procession views. 🚁" },
      { id: "dc-p3", type: "photo", url: newPortrait4, likes: 5410, comments: 118, caption: "Panoramic landscape views of luxury destination weddings." },
      { id: "dc-v2", type: "video", url: capture2, videoId: "eC-z1oW-bUo", likes: 15210, comments: 312, caption: "Vast destination scale and landscape aerial flybys." },
      { id: "dc-p4", type: "photo", url: capture2, likes: 7302, comments: 187, caption: "Traditional entry procession scaled grandly from above." }
    ]
  },
  6: {
    title: "Albums & Prints",
    tagline: "Custom layflat heirloom printed books and textured frames.",
    items: [
      { id: "ap-p1", type: "photo", url: capture6, likes: 6890, comments: 142, caption: "Custom leather layflat custom books designed with care." },
      { id: "ap-p2", type: "photo", url: pic3, likes: 5120, comments: 98, caption: "Textured canvas printing and gold foil calligraphy detailing." },
      { id: "ap-v1", type: "video", url: capture3, videoId: "O4zR8hS1tA0", likes: 9840, comments: 154, caption: "Flipping through 70 pages of premium printed memories. 📖" },
      { id: "ap-p3", type: "photo", url: capture3, likes: 4912, comments: 89, caption: "Personalized desktop wedding calendar layout details." },
      { id: "ap-v2", type: "video", url: pic3, videoId: "8r9NEx29o4w", likes: 10450, comments: 180, caption: "Inspecting printed premium photo frame textures." },
      { id: "ap-p4", type: "photo", url: newPortrait4, likes: 6241, comments: 142, caption: "Preserving your legacy in double-spread printed glory." }
    ]
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 45 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const ServicesGrid = () => {
  const [activeServiceId, setActiveServiceId] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // "all", "photos", "reels"
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [playingVideoId, setPlayingVideoId] = useState(null);

  // Close gallery modal on ESC press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (lightboxPhoto) setLightboxPhoto(null);
        else setActiveServiceId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxPhoto]);

  const activeGallery = activeServiceId ? serviceGalleries[activeServiceId] : null;

  // Filtered gallery items based on active tab inside modal
  const getFilteredItems = () => {
    if (!activeGallery) return [];
    if (activeTab === "photos") return activeGallery.items.filter(item => item.type === "photo");
    if (activeTab === "reels") return activeGallery.items.filter(item => item.type === "video");
    return activeGallery.items;
  };

  const filteredItems = getFilteredItems();

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
              onClick={() => {
                if (service.isExternal) {
                  window.location.href = service.link;
                  return;
                }
                setActiveServiceId(service.id);
                setActiveTab("all");
                setPlayingVideoId(null);
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`group relative h-[480px] sm:h-[520px] rounded-[32px] overflow-hidden cursor-pointer shadow-[0_15px_35px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] transition-all duration-500 bg-zinc-100 ${
                service.id === 7 ? "lg:col-span-3 md:col-span-2" : ""
              }`}
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

        {/* FULLSCREEN POPUP GALLERY MODAL */}
        <AnimatePresence>
          {activeServiceId && activeGallery && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-y-auto bg-black/25 backdrop-blur-md py-12 px-6 flex flex-col justify-start select-none"
            >
              <div className="max-w-6xl w-full mx-auto relative flex-1 flex flex-col justify-start">
                
                {/* CLOSE BUTTON */}
                <button
                  onClick={() => {
                    setActiveServiceId(null);
                    setPlayingVideoId(null);
                  }}
                  className="absolute top-0 right-0 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black hover:scale-110 active:scale-90 transition-all duration-300 cursor-pointer z-50"
                >
                  <FiX size={20} />
                </button>

                {/* MODAL HEADER */}
                <div className="text-center mt-6 mb-12 max-w-2xl mx-auto space-y-4">
                  <span className="text-[#b4975a] font-semibold text-xs tracking-[0.25em] uppercase block">
                    Portfolio Gallery
                  </span>
                  <h3
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    className="text-4xl sm:text-5xl md:text-6xl text-white font-light leading-none"
                  >
                    {activeGallery.title}
                  </h3>
                  <p className="text-zinc-400 font-light text-sm sm:text-base leading-relaxed">
                    {activeGallery.tagline}
                  </p>
                </div>

                {/* GALLERY TAB NAVIGATION */}
                <div className="flex justify-center mb-12">
                  <div className="bg-zinc-900/80 p-1.5 rounded-full flex items-center gap-1 border border-zinc-800">
                    {[
                      { id: "all", label: "All Works" },
                      { id: "photos", label: "Signature Portraits" },
                      { id: "reels", label: "Cinematic Reels" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setPlayingVideoId(null); // Stop any playing video on tab shift
                        }}
                        className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 relative cursor-pointer outline-none"
                      >
                        <span className={`relative z-10 transition-colors duration-300 ${activeTab === tab.id ? "text-black font-semibold" : "text-zinc-400 hover:text-white"}`}>
                          {tab.label}
                        </span>
                        {activeTab === tab.id && (
                          <motion.div
                            layoutId="activeModalTabGlow"
                            className="absolute inset-0 bg-[#b4975a] rounded-full shadow-[0_4px_12px_rgba(180,151,90,0.3)]"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DYNAMIC PORTFOLIO GALLERY GRID */}
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full mt-4 flex-1"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredItems.map((item, i) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                        className="bg-zinc-900/60 rounded-[24px] border border-zinc-800/80 overflow-hidden flex flex-col justify-between hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)] transition-all duration-500 group"
                      >
                        {/* INSTAGRAM-STYLE HEADER */}
                        <div className="flex items-center justify-between p-4 border-b border-zinc-800/40">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]">
                              <div className="w-full h-full rounded-full bg-zinc-900 p-[1.5px]">
                                <img
                                  src="/favicon.png"
                                  alt="dreamwed_stories.co verified avatar"
                                  className="w-full h-full rounded-full object-cover"
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="text-[12px] font-semibold text-white leading-none">
                                  dreamwed_stories.co
                                </span>
                                <svg className="w-3.5 h-3.5 text-[#0095f6]" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                              </div>
                              <span className="text-[10px] text-zinc-500 leading-none block mt-0.5">
                                Kochi, Kerala
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* WORK MEDIA CONTAINER */}
                        {item.type === "photo" ? (
                          <div
                            onClick={() => setLightboxPhoto(item.url)}
                            className="relative aspect-square w-full overflow-hidden bg-zinc-950 cursor-pointer group"
                          >
                            <img
                              src={item.url}
                              alt={item.caption}
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 text-black text-xs font-semibold shadow-lg scale-90 group-hover:scale-100 transition-all duration-300">
                                <FiMaximize2 size={13} />
                                View Full Size
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* VIDEO/REEL ITEM WITH aspect-[9/16] portrait normalizations */
                          <div className="relative aspect-[9/16] w-full overflow-hidden bg-black cursor-pointer">
                            {playingVideoId === item.id ? (
                              <div className="absolute inset-0 w-full h-full bg-black">
                                <iframe
                                  src={`https://www.youtube.com/embed/${item.videoId}?autoplay=1&mute=0&rel=0&modestbranding=1&loop=1&playlist=${item.videoId}`}
                                  title={item.caption}
                                  style={{ border: 0 }}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                  className="absolute inset-0 w-full h-full pointer-events-auto"
                                ></iframe>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPlayingVideoId(null);
                                  }}
                                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                                >
                                  <FiX size={14} />
                                </button>
                              </div>
                            ) : (
                              <div className="w-full h-full relative" onClick={() => setPlayingVideoId(item.id)}>
                                <img
                                  src={item.url}
                                  alt={item.caption}
                                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
                                
                                {/* Play overlay */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-14 h-14 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-xl border border-white/30 group-hover:scale-110 transition-transform duration-300">
                                    <FiPlay fill="black" size={20} className="text-black ml-0.5" />
                                  </div>
                                </div>

                                <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-medium">
                                  <svg className="w-3 h-3 fill-white text-white" viewBox="0 0 24 24">
                                    <polygon points="23 7 16 12 23 17 23 7" />
                                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                  </svg>
                                  Play Reel
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* INSTAGRAM ACTION BAR & STATS */}
                        <div className="p-4 flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            <FiHeart size={18} className="text-zinc-400" />
                            <FiMessageCircle size={18} className="text-zinc-400" />
                            <FiSend size={18} className="text-zinc-400" />
                          </div>
                          <span className="text-[12px] font-semibold text-white leading-none">
                            {item.likes.toLocaleString()} {item.type === "photo" ? "likes" : "views"}
                          </span>
                          <p className="text-[12px] text-zinc-300 font-light leading-relaxed">
                            <span className="font-semibold text-white mr-1.5">dreamwed_stories.co</span>
                            {item.caption}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HIGH-RES LIGHTBOX MODAL */}
        <AnimatePresence>
          {lightboxPhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxPhoto(null)}
              className="fixed inset-0 z-50 bg-black/25 backdrop-blur-md flex items-center justify-center p-6 cursor-zoom-out select-none"
            >
              <button
                onClick={() => setLightboxPhoto(null)}
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <FiX size={20} />
              </button>
              
              <motion.img
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                src={lightboxPhoto}
                alt="Fullscreen lightboxed showcase"
                className="max-w-full max-h-[85vh] rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.8)] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};

export default ServicesGrid;
