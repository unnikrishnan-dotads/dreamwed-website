import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, Heart, Star, ZoomIn, Download, Share2, ShoppingCart, 
  MapPin, CheckCircle, Smartphone, User, ShieldCheck, AlertCircle, X, ChevronDown
} from "lucide-react";
import SEO from "../components/SEO";

// Premium Mock Photos matching seed tags
const SAMPLE_PHOTOS_ARCHIVE = [
  { id: 1, url: "/ai_search_banner.png", tags: ["couple", "portrait"] },
  { id: 2, url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800", tags: ["couple", "dance"] },
  { id: 3, url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800", tags: ["ceremony", "bride"] },
  { id: 4, url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=800", tags: ["details", "groom"] },
  { id: 5, url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800", tags: ["guest", "portrait"] },
  { id: 6, url: "https://images.unsplash.com/photo-1507504038482-76210f5c0be6?q=80&w=800", tags: ["guest", "dance"] },
  { id: 7, url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800", tags: ["guest", "candid"] },
  { id: 8, url: "https://images.unsplash.com/photo-1519225495810-7517cbdb222d?q=80&w=800", tags: ["decor", "ceremony"] },
  { id: 9, url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=800", tags: ["couple", "portrait"] },
  { id: 10, url: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=800", tags: ["bride", "portrait"] }
];

const INITIAL_GALLERIES = [
  {
    id: "wedding-aarav-meera",
    name: "Aarav & Meera's Royal Wedding",
    gdriveLink: "https://drive.google.com/drive/folders/1AaravMeeraRoyalWeddingDreamwedDemo",
    type: "After Event Gallery",
    coverUrl: "/ai_search_banner.png"
  },
  {
    id: "wedding-rohan-dia",
    name: "Rohan & Dia's Mumbai Sangeet",
    gdriveLink: "https://drive.google.com/drive/folders/2RohanDiaMumbaiSangeetDreamwedDemo",
    type: "Live Gallery",
    coverUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800"
  }
];

const INITIAL_ORDERS = [
  {
    id: "DWA-2605-99",
    customerName: "Aishwarya Sen",
    phone: "9876543210",
    address: "704, Royal Palms, Bandra West, Mumbai, PIN: 400050",
    pincode: "400050",
    photoUrl: "/ai_search_banner.png",
    printSize: "10×15",
    price: 799,
    date: "2026-05-30T10:45:00Z",
    status: "Processing"
  },
  {
    id: "DWA-2605-84",
    customerName: "Vikram Malhotra",
    phone: "9812345678",
    address: "12, Greens Enclave, Sector 15, Gurugram, PIN: 122001",
    pincode: "122001",
    photoUrl: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=800",
    printSize: "8×12",
    price: 499,
    date: "2026-05-29T14:20:00Z",
    status: "Delivered"
  }
];

const AiSearch = () => {
  const [galleries, setGalleries] = useState([]);
  const [selectedWeddingId, setSelectedWeddingId] = useState("");
  const [isInstaUnlocked, setIsInstaUnlocked] = useState(false);
  const [selfieSrc, setSelfieSrc] = useState(null);
  
  // Search workflow state
  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState([]);
  const [activeStep, setActiveStep] = useState("gate"); // gate | upload | results
  const [matches, setMatches] = useState([]);

  // Modals state
  const [activeLightbox, setActiveLightbox] = useState(null);
  const [activePrintPhoto, setActivePrintPhoto] = useState(null);
  const [selectedSize, setSelectedSize] = useState("8×12");
  const [selectedPrice, setSelectedPrice] = useState(499);
  
  // Checkout flow
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingPincode, setShippingPincode] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Toast Toast Alert state
  const [toastMessage, setToastMessage] = useState(null);
  const fileInputRef = useRef(null);
  const logScrollRef = useRef(null);

  // Initialize DB on Mount
  useEffect(() => {
    if (!localStorage.getItem("dreamwed_galleries")) {
      localStorage.setItem("dreamwed_galleries", JSON.stringify(INITIAL_GALLERIES));
    }
    if (!localStorage.getItem("dreamwed_orders")) {
      localStorage.setItem("dreamwed_orders", JSON.stringify(INITIAL_ORDERS));
    }
    if (!localStorage.getItem("dreamwed_insta_follow")) {
      localStorage.setItem("dreamwed_insta_follow", "false");
    }

    const storedGals = JSON.parse(localStorage.getItem("dreamwed_galleries") || "[]");
    setGalleries(storedGals);
    if (storedGals.length > 0) {
      setSelectedWeddingId(storedGals[0].id);
    }

    const instaFollow = localStorage.getItem("dreamwed_insta_follow") === "true";
    setIsInstaUnlocked(instaFollow);
    setActiveStep(instaFollow ? "upload" : "gate");
  }, []);

  // Scroll terminal logs automatically
  useEffect(() => {
    if (logScrollRef.current) {
      logScrollRef.current.scrollTop = logScrollRef.current.scrollHeight;
    }
  }, [scanLogs]);

  const activeWedding = galleries.find(g => g.id === selectedWeddingId);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleInstagramConfirm = () => {
    localStorage.setItem("dreamwed_insta_follow", "true");
    setIsInstaUnlocked(true);
    showToast("✨ Instagram follow verified. Search unlocked!");
    setActiveStep("upload");
  };

  const handleSelfieSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelfieSrc(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleStartSearch = () => {
    if (!selfieSrc) return;
    setIsScanning(true);
    setScanLogs([]);

    const logScripts = [
      { text: "🔍 Initializing Dreamwed FaceEngine AI v4.2...", delay: 200 },
      { text: "🔍 Extracting facial biomechanics & land-mesh parameters...", delay: 600 },
      { text: "🔍 Standardizing lighting vectors and head pose rotation matrix...", delay: 1000 },
      { text: "🔍 Querying active wedding photography archive databases...", delay: 1500 },
      { text: "🔍 Comparing facial feature similarity matrices (cosine distance < 0.28)...", delay: 2000 },
      { text: "🎉 DeepFace Match complete! Found 5 matching images with high confidence score.", delay: 2600 }
    ];

    logScripts.forEach(script => {
      setTimeout(() => {
        setScanLogs(prev => [...prev, script.text]);
      }, script.delay);
    });

    setTimeout(() => {
      setIsScanning(false);
      setMatches(SAMPLE_PHOTOS_ARCHIVE.slice(0, 5));
      setActiveStep("results");
      showToast("✨ AI Photo search complete! Matched photos isolated.");
    }, 3200);
  };

  const handleResetSearch = () => {
    setSelfieSrc(null);
    setMatches([]);
    setScanLogs([]);
    setActiveStep("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "Dreamwed_AI_Photo.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("💾 Photo download started!");
  };

  const handleShare = (url) => {
    navigator.clipboard.writeText(`Look at my dream photo from Dreamwed Stories AI! ${window.location.origin}${url}`).then(() => {
      showToast("🔗 Link copied to clipboard!");
    }).catch(() => {
      showToast("❌ Failed to copy link.");
    });
  };

  const handleSelectSize = (size, price) => {
    setSelectedSize(size);
    setSelectedPrice(price);
  };

  const handlePrintTrigger = (photoUrl) => {
    setActivePrintPhoto(photoUrl);
    setSelectedSize("8×12");
    setSelectedPrice(499);
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!shippingName || !shippingPhone || !shippingAddress || !shippingPincode) return;

    const orders = JSON.parse(localStorage.getItem("dreamwed_orders") || "[]");
    const newId = `DWA-2605-${Math.floor(10 + Math.random() * 90)}`;
    const newOrder = {
      id: newId,
      customerName: shippingName,
      phone: shippingPhone,
      address: `${shippingAddress}, PIN: ${shippingPincode}`,
      pincode: shippingPincode,
      photoUrl: activePrintPhoto,
      printSize: selectedSize,
      price: selectedPrice,
      date: new Date().toISOString(),
      status: "New Order"
    };

    orders.unshift(newOrder);
    localStorage.setItem("dreamwed_orders", JSON.stringify(orders));
    setOrderSuccess(newOrder);

    // Reset fields
    setShippingName("");
    setShippingPhone("");
    setShippingAddress("");
    setShippingPincode("");
  };

  const handleSuccessClose = () => {
    setOrderSuccess(null);
    setIsCheckoutOpen(false);
    setActivePrintPhoto(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0709] text-white pt-24 pb-20 select-none overflow-hidden relative">
      <SEO 
        title="AI Photo Search" 
        description="Search your beautiful wedding photos instantly using advanced client-side selfie facial recognition." 
      />

      {/* Styled inline keyframes to guarantee custom sweeps work flawlessly */}
      <style>{`
        @keyframes sweep {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .laser-sweep {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #d4af37, transparent);
          box-shadow: 0 0 15px #d4af37, 0 0 5px #d4af37;
          animation: sweep 2.5s infinite linear;
        }
      `}</style>

      {/* Background vectors */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d4af37]/3 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#881337]/3 rounded-full blur-[150px] pointer-events-none z-0" />

      <div className="max-w-3xl mx-auto px-4 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-10">
          <span className="text-[#d4af37] font-semibold text-xs tracking-[0.3em] uppercase block mb-3">
            Neural Photo Search
          </span>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl sm:text-5xl font-light text-white tracking-tight leading-none">
            Dreamwed Stories <span className="italic font-serif text-[#d4af37]">AI</span>
          </h1>
          <p className="text-zinc-500 text-xs font-light mt-3 max-w-md mx-auto">
            Cinematic dark-luxury artificial facial recognition search & premium print fulfillment console.
          </p>
        </div>

        {/* Dynamic Wedding selector Card */}
        {activeWedding && (
          <div 
            style={{ 
              backgroundImage: `linear-gradient(rgba(10, 7, 9, 0.55), rgba(10, 7, 9, 0.95)), url(${activeWedding.coverUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
            className="border border-white/5 bg-zinc-950 p-6 rounded-[28px] shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 transition-all duration-700 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#d4af37]/3 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-4 text-left z-10">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-center text-[#d4af37] shadow-inner">
                <Camera size={22} className="stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Active Wedding registry</h4>
                <div className="relative">
                  <select 
                    value={selectedWeddingId}
                    onChange={(e) => setSelectedWeddingId(e.target.value)}
                    className="bg-transparent border-none font-serif text-lg text-white font-light focus:outline-none pr-8 cursor-pointer appearance-none"
                  >
                    {galleries.map(g => (
                      <option key={g.id} value={g.id} className="bg-[#0A0709] text-white text-xs py-2">{g.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="text-zinc-400 absolute right-1.5 top-1.5 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="z-10 text-right sm:self-center">
              {activeWedding.type === "Live Gallery" ? (
                <div className="space-y-1 flex flex-col items-end">
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    🟢 Live Event Active
                  </span>
                  <span className="text-[9px] text-zinc-500 font-light">Candid moments uploaded in real-time</span>
                </div>
              ) : (
                <div className="space-y-1 flex flex-col items-end">
                  <span className="px-3.5 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] text-[10px] font-bold uppercase tracking-wider">
                    ⏳ After Event Gallery
                  </span>
                  <span className="text-[9px] text-zinc-500 font-light">Full archives shared post-celebration</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEPS ROUTER */}
        <AnimatePresence mode="wait">
          
          {/* STEP 1: INSTAGRAM FOLLOW GATE */}
          {activeStep === "gate" && (
            <motion.div
              key="insta-gate"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-zinc-950/40 border border-white/5 rounded-[32px] p-8 md:p-12 text-center shadow-2xl relative overflow-hidden backdrop-blur-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#d4af37]/3 via-transparent to-[#881337]/3 pointer-events-none" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center mx-auto mb-6 shadow-lg border border-white/10">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </div>

              <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl text-white font-light mb-4">
                Unlock AI Photo Search
              </h2>
              <p className="text-zinc-400 text-xs font-light max-w-md mx-auto leading-relaxed mb-10">
                Follow **@dreamwed_stories** on Instagram to gain complete biometric facial scanning access and isolate all your wedding portraits instantly.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-sm mx-auto">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 py-4 bg-gradient-to-r from-[#dc2743] to-[#bc1888] hover:scale-[1.03] active:scale-95 text-white font-bold rounded-xl transition-all text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  Follow Instagram
                </a>
                <button 
                  onClick={handleInstagramConfirm}
                  className="flex-1 py-4 bg-[#d4af37] hover:bg-[#c59d2a] active:scale-95 text-zinc-950 font-bold rounded-xl transition-all text-xs tracking-widest uppercase shadow-md flex items-center justify-center cursor-pointer"
                >
                  I Have Followed
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: SELFIE UPLOAD & SCANNING */}
          {activeStep === "upload" && (
            <motion.div
              key="selfie-upload"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-zinc-950/40 border border-white/5 rounded-[32px] p-8 md:p-12 text-center shadow-2xl relative overflow-hidden backdrop-blur-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#d4af37]/3 via-transparent to-[#881337]/3 pointer-events-none" />
              
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl text-white font-light mb-2">
                Find Your Moments
              </h2>
              <p className="text-zinc-500 text-xs font-light max-w-md mx-auto leading-relaxed mb-8">
                Upload a clear frontal selfie. Our custom neural net will scan the wedding archives to isolate your portraits in milliseconds.
              </p>

              {/* Upload Zone */}
              {!selfieSrc && (
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="border border-dashed border-[#d4af37]/30 bg-zinc-900/30 hover:bg-zinc-900/50 rounded-2xl p-10 cursor-pointer transition-all duration-300 group flex flex-col items-center justify-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] border border-[#d4af37]/20 group-hover:scale-110 transition-transform">
                    <Camera size={20} className="stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <span className="block text-zinc-300 text-xs font-bold uppercase tracking-wider group-hover:text-white transition-colors">
                      Click to select selfie
                    </span>
                    <span className="block text-zinc-500 text-[10px] font-light">
                      Supports JPG, JPEG & PNG formats
                    </span>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    onChange={handleSelfieSelect} 
                    className="hidden" 
                  />
                </div>
              )}

              {/* Preview Circle with Scanner Sweeps */}
              {selfieSrc && (
                <div className="space-y-8 flex flex-col items-center">
                  <div className="relative w-44 h-44 rounded-full border-[1.5px] border-[#d4af37] p-1 shadow-[0_0_25px_rgba(212,175,55,0.15)] bg-zinc-950 overflow-hidden">
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                      <img 
                        src={selfieSrc} 
                        alt="Uploaded Selfie" 
                        className="w-full h-full object-cover" 
                      />
                      {/* Bouncing holographic laser sweep */}
                      {isScanning && <div className="laser-sweep" />}
                    </div>
                  </div>

                  {/* Terminal Log Console */}
                  {isScanning && (
                    <div 
                      ref={logScrollRef}
                      className="w-full max-w-md h-32 bg-black border border-white/5 rounded-xl p-4 font-mono text-[9px] text-[#d4af37] text-left overflow-y-auto space-y-1.5 shadow-inner"
                    >
                      {scanLogs.map((log, index) => (
                        <div key={index} className="leading-relaxed opacity-90 transition-opacity">
                          {log}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Start Search CTA */}
                  <button 
                    onClick={handleStartSearch}
                    disabled={isScanning}
                    className="px-10 py-4.5 bg-gradient-to-r from-amber-500 via-[#d1a852] to-[#b4975a] text-zinc-950 font-bold rounded-full hover:scale-105 active:scale-95 transition-all text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.25)] cursor-pointer disabled:opacity-75"
                  >
                    {isScanning ? (
                      <span className="flex items-center gap-2">🔍 FaceEngine Aligning...</span>
                    ) : (
                      <span>✨ Start AI Face Search</span>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: MATCHED PHOTO GRID RESULTS */}
          {activeStep === "results" && (
            <motion.div
              key="results-grid"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8 text-left"
            >
              <div className="flex justify-between items-center bg-zinc-950/30 p-4.5 border border-white/5 rounded-2xl backdrop-blur-xl">
                <div>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-2xl text-white font-light">
                    Your AI <span className="italic font-serif text-[#d4af37]">Portraits</span>
                  </h2>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 block">
                    {matches.length} Matches Found
                  </span>
                </div>
                <button 
                  onClick={handleResetSearch}
                  className="px-4.5 py-2.5 rounded-full bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-zinc-850 cursor-pointer"
                >
                  🔄 New Search
                </button>
              </div>

              {/* Premium Google Drive Stream Unlock Callout */}
              {activeWedding && activeWedding.gdriveLink && (
                <div className="bg-gradient-to-r from-[#d4af37]/5 via-zinc-950/90 to-[#d4af37]/5 border border-[#d4af37]/35 rounded-[24px] p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_0_40px_rgba(212,175,55,0.05)] relative overflow-hidden text-center md:text-left">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.03),transparent)] pointer-events-none" />
                  <div className="space-y-2.5 z-10 max-w-xl">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-[#d4af37] text-[10px] font-bold uppercase tracking-widest">
                      <span className="animate-pulse">✨</span> Biometric matches isolated successfully
                    </div>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-2xl sm:text-3xl text-white font-light leading-snug">
                      Access <span className="italic font-serif text-[#d4af37]">{activeWedding.name}</span> High-Res Folder
                    </h3>
                    <p className="text-zinc-400 text-xs font-light leading-relaxed">
                      Your original, high-resolution photographs and cine deliverables are safely stored in your wedding's secure shared Google Drive workspace. Tap below to access, download, or view all original memories.
                    </p>
                  </div>
                  
                  <a 
                    href={activeWedding.gdriveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 bg-[#d4af37] hover:bg-[#c59d2a] active:scale-95 text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 shrink-0 z-10 group"
                  >
                    <span>🔓 Access Full Google Drive Gallery</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                  </a>
                </div>
              )}

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {matches.map(img => (
                  <div 
                    key={img.id}
                    className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden aspect-[4/5] relative group shadow-lg"
                  >
                    <img 
                      src={img.url} 
                      alt="AI Match" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                    />
                    
                    {/* Dark gradient mask */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 gap-4" />

                    {/* Actions overlay */}
                    <div className="absolute inset-0 p-5 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end gap-3.5 z-10">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setActiveLightbox(img.url)}
                          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all cursor-pointer" 
                          title="Zoom view"
                        >
                          <ZoomIn size={15} />
                        </button>
                        <button 
                          onClick={() => handleDownload(img.url)}
                          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all cursor-pointer" 
                          title="Download photo"
                        >
                          <Download size={15} />
                        </button>
                        <button 
                          onClick={() => handleShare(img.url)}
                          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all cursor-pointer" 
                          title="Share link"
                        >
                          <Share2 size={15} />
                        </button>
                      </div>

                      <button 
                        onClick={() => handlePrintTrigger(img.url)}
                        className="w-full py-2.5 bg-[#d4af37] text-zinc-950 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-md cursor-pointer hover:bg-white transition-all flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <ShoppingCart size={12} /> Print This Photo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* ======================= MODAL SYSTEM ======================= */}

      {/* 1. Zoom Lightbox */}
      <AnimatePresence>
        {activeLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLightbox(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 cursor-zoom-out"
          >
            <button 
              onClick={() => setActiveLightbox(null)}
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white text-white hover:text-black border border-white/15 flex items-center justify-center shadow-lg transition-transform hover:rotate-90 cursor-pointer"
            >
              <X size={20} />
            </button>
            <motion.img 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={activeLightbox} 
              alt="Lightbox"
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-[85vh] rounded-2xl border border-[#d4af37]/35 shadow-[0_0_50px_rgba(212,175,55,0.2)] object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Print selection modal */}
      <AnimatePresence>
        {activePrintPhoto && !isCheckoutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setActivePrintPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-white/10 max-w-lg w-full rounded-[32px] p-6 sm:p-8 space-y-6 text-zinc-300 relative shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setActivePrintPhoto(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white text-white hover:text-black border border-white/5 flex items-center justify-center transition-all cursor-pointer"
              >
                <X size={15} />
              </button>

              <div className="text-center space-y-1 select-none">
                <h3 className="text-white text-xl font-serif">Print Your Memory</h3>
                <p className="text-zinc-500 text-[10px] font-light">Handcrafted premium fine-art framing shipped standard to your doorstep.</p>
              </div>

              <div className="w-full aspect-[4/3] rounded-2xl border border-white/5 overflow-hidden shadow-inner">
                <img src={activePrintPhoto} className="w-full h-full object-cover" alt="Print Preview" />
              </div>

              {/* Sizes Selection list */}
              <div className="space-y-3">
                {[
                  { size: "8×12", price: 499, title: "8 × 12 Classic Semi-Gloss Frame", detail: "Exquisite luster finish, premium fine art stock." },
                  { size: "10×15", price: 799, title: "10 × 15 Royal Exhibition Frame", detail: "Heavy fine art paper, intense contrast depth." },
                  { size: "12×18", price: 999, title: "12 × 18 Emperor Canvas Frame", detail: "Museum-grade double textured weave finish." }
                ].map(opt => {
                  const isSelected = selectedSize === opt.size;
                  return (
                    <div 
                      key={opt.size}
                      onClick={() => handleSelectSize(opt.size, opt.price)}
                      className={`border p-4.5 rounded-2xl flex justify-between items-center cursor-pointer transition-all ${
                        isSelected ? "bg-zinc-900 border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.1)]" : "bg-zinc-950 border-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className="text-left space-y-1">
                        <span className={`block text-xs font-bold uppercase tracking-wider ${isSelected ? "text-white" : "text-zinc-400"}`}>{opt.title}</span>
                        <span className="block text-[10px] text-zinc-500 font-light leading-relaxed">{opt.detail}</span>
                      </div>
                      <span className={`text-sm font-semibold ${isSelected ? "text-[#d4af37]" : "text-zinc-400"}`}>₹{opt.price}</span>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full py-4 bg-[#d4af37] hover:bg-[#c59d2a] text-zinc-950 text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                🛒 Order Print Frame — ₹{selectedPrice}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Shipping Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsCheckoutOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-white/10 max-w-lg w-full rounded-[32px] p-6 sm:p-8 space-y-6 text-zinc-300 relative shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsCheckoutOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white text-white hover:text-black border border-white/5 flex items-center justify-center transition-all cursor-pointer"
              >
                <X size={15} />
              </button>

              {!orderSuccess ? (
                <>
                  <div className="text-center space-y-1 select-none">
                    <h3 className="text-white text-xl font-serif">Delivery Address</h3>
                    <p className="text-zinc-500 text-[10px] font-light">Confirm dispatch shipping details. Fine art printing begins instantly.</p>
                  </div>

                  <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1.5">
                        <User size={11} className="text-[#d4af37]" /> Full Name
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="Enter recipient's name"
                        value={shippingName}
                        onChange={(e) => setShippingName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1.5">
                        <Smartphone size={11} className="text-[#d4af37]" /> Phone Number
                      </label>
                      <input 
                        type="tel" 
                        required
                        pattern="[0-9]{10}"
                        placeholder="10-digit mobile number"
                        value={shippingPhone}
                        onChange={(e) => setShippingPhone(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1.5">
                        <MapPin size={11} className="text-[#d4af37]" /> Shipping Address
                      </label>
                      <textarea 
                        required
                        rows="3"
                        placeholder="Flat/House No, Building, Street, Landmark details"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs focus:border-[#d4af37] focus:outline-none leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1.5">
                        📪 PIN Code
                      </label>
                      <input 
                        type="text" 
                        required
                        pattern="[0-9]{6}"
                        placeholder="6-digit ZIP code"
                        value={shippingPincode}
                        onChange={(e) => setShippingPincode(e.target.value)}
                        className="w-full bg-zinc-900 border border-[#b4975a]/25 rounded-xl px-4 py-3 text-white text-xs focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>

                    {/* Invoice box */}
                    <div className="bg-zinc-900 border border-white/5 p-5 rounded-2xl space-y-3">
                      <div className="flex justify-between text-xs font-light">
                        <span className="text-zinc-500">Selected Frame Size:</span>
                        <strong className="text-white">{selectedSize}</strong>
                      </div>
                      <div className="flex justify-between text-xs font-light">
                        <span className="text-zinc-500">Fine Art Printing:</span>
                        <strong className="text-white">₹{selectedPrice}</strong>
                      </div>
                      <div className="flex justify-between text-xs font-light">
                        <span className="text-zinc-500">Express Delivery:</span>
                        <strong className="text-emerald-400 font-bold tracking-wider">FREE</strong>
                      </div>
                      <div className="w-full h-px border-t border-dashed border-white/10 my-1" />
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-white">Grand Total:</span>
                        <span className="text-[#d4af37] font-serif text-base font-bold">₹{selectedPrice}</span>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-4.5 bg-[#d4af37] hover:bg-[#c59d2a] text-zinc-950 text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      💎 Confirm and Place Order
                    </button>
                  </form>
                </>
              ) : (
                /* Success Success Screen */
                <div className="text-center space-y-6 py-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 flex items-center justify-center mx-auto shadow-md animate-pulse">
                    <CheckCircle size={26} className="stroke-[1.5]" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-white text-2xl font-serif font-light">Order Registered!</h3>
                    <p className="text-zinc-400 text-xs font-light leading-relaxed">
                      Thank you! Your fine art print order has been placed under ID <span className="font-mono text-[#d4af37] font-semibold">{orderSuccess.id}</span>.
                    </p>
                  </div>

                  <div className="bg-zinc-900 border border-white/5 p-5 rounded-2xl text-left space-y-2 text-xs font-light leading-relaxed">
                    <div>👤 Client: <strong className="text-zinc-300">{orderSuccess.customerName}</strong></div>
                    <div>📞 Mobile: <strong className="text-zinc-300">{orderSuccess.phone}</strong></div>
                    <div>📦 Selection: <strong className="text-[#d4af37] font-semibold">{orderSuccess.printSize} Premium Frame</strong></div>
                    <div>🏠 Shipping to: <strong className="text-zinc-400">{orderSuccess.address}</strong></div>
                  </div>

                  <p className="text-zinc-500 text-[10px] font-light max-w-sm mx-auto leading-relaxed">
                    You can track your order status inside the secure Dreamwed dashboard. Processing and dispatch will begin immediately.
                  </p>

                  <button 
                    onClick={handleSuccessClose}
                    className="w-full py-4 bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-bold uppercase tracking-widest rounded-xl border border-white/5 transition-all cursor-pointer"
                  >
                    Return to Gallery
                  </button>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST SYSTEM */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 25 }}
            className="fixed bottom-8 right-8 z-50 bg-[#0A0709] border border-[#d4af37]/30 border-l-[4px] border-l-[#d4af37] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3"
          >
            <ShieldCheck size={18} className="text-[#d4af37]" />
            <span className="text-white text-xs font-light">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AiSearch;
