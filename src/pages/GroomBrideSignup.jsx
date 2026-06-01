import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, Calendar, MapPin, User, Check, Sparkles, 
  ArrowRight, ShieldCheck, Mail, Info, Award, HelpCircle
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import SEO from "../components/SEO";

const GroomBrideSignup = () => {
  const navigate = useNavigate();

  // Onboarding States
  const [coverageType, setCoverageType] = useState("both"); // "both" or "single"
  const [coverageSide, setCoverageSide] = useState("groom"); // "groom" or "bride"
  
  // Groom Profile
  const [groomName, setGroomName] = useState("");
  const [groomPhone, setGroomPhone] = useState("");
  const [groomEmail, setGroomEmail] = useState("");

  // Bride Profile
  const [brideName, setBrideName] = useState("");
  const [bridePhone, setBridePhone] = useState("");
  const [brideEmail, setBrideEmail] = useState("");

  // Single Side Profile (if single is selected)
  const [singleName, setSingleName] = useState("");
  const [singlePhone, setSinglePhone] = useState("");
  const [singleEmail, setSingleEmail] = useState("");

  // Metadata & Booking details
  const [eventDate, setEventDate] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("Elite Signature Package");
  const [packagePrice, setPackagePrice] = useState(180000);
  const [advancePaid, setAdvancePaid] = useState(5000);
  const [termsAccepted, setTermsAccepted] = useState(true);

  const [signingUp, setSigningUp] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const PACKAGES = [
    {
      name: "Classic Heritage Package",
      price: 95000,
      badge: "Essential Luxury",
      description: "Timeless traditional coverage with unmatched clarity and elegant print archives.",
      features: [
        "1 Senior Photographer & 1 Senior Videographer",
        "Full Day Candid & Traditional Wedding Coverage",
        "1 Signature Hardcover Fine Art Photobook (200 Photos)",
        "Color-Graded High-Resolution Digital Archives",
        "Online Shared Cloud Gallery (1-Year Access)"
      ]
    },
    {
      name: "Premium Couture Package",
      price: 135000,
      badge: "Highly Popular",
      description: "Sophisticated storytelling featuring cinematic highlight films and enhanced drone viewpoints.",
      features: [
        "2 Senior Photographers & 2 Senior Videographers",
        "Full Multi-Day Coverage (Engagement & Wedding)",
        "2 Premium Couture Lay-flat Heirlooms & Leather Cases",
        "4K UHD Cinematic Highlight Film (5-7 Minutes)",
        "4K Drone Aerial Creative Coverage",
        "Digital Deliverables via Premium Custom USB"
      ]
    },
    {
      name: "Elite Signature Package",
      price: 180000,
      badge: "The Ultimate Masterpiece",
      description: "Award-winning elite visual poetry led by master artists, premium physical heirlooms, and comprehensive coverage.",
      features: [
        "Lead Creative Director + 3 Specialized Crew Artists",
        "Unlimited Wedding, Pre & Post Event Premium Coverage",
        "3 Masterpiece Handcrafted Premium Leather Heirlooms",
        "4K Cinematic Director's Cut Film (15-20 Minutes)",
        "Premium Cinema Drone & Aerial Cinematography",
        "Exclusive 4K Wedding Teaser/Reel (1 Minute)",
        "Fine Art Linen Mounted Portrait Prints",
        "Dedicated VIP Concierge Delivery Support"
      ]
    }
  ];

  const handlePackageSelect = (pkgName, pkgPrice) => {
    setSelectedPackage(pkgName);
    setPackagePrice(pkgPrice);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!termsAccepted) {
      alert("Please accept the terms and privacy conditions to initialize booking.");
      return;
    }

    let payload = {};
    if (coverageType === "both") {
      if (!groomName.trim() || !groomPhone.trim() || !brideName.trim() || !bridePhone.trim() || !eventDate.trim() || !eventVenue.trim()) {
        alert("Please fill in all required fields marked with * for both Bride & Groom.");
        return;
      }
      payload = {
        customer_name: `${groomName.trim()} & ${brideName.trim()}`,
        customer_phone: groomPhone.trim(),
        customer_email: groomEmail.trim(),
        customer_name_2: brideName.trim(),
        customer_phone_2: bridePhone.trim(),
        customer_email_2: brideEmail.trim(),
        coverage_type: "both",
        coverage_side: "",
        event_date: eventDate,
        event_venue: eventVenue.trim(),
        package_name: selectedPackage,
        package_price: packagePrice,
        total_price: packagePrice,
        advance_paid: Number(advancePaid) || 0,
        status: "pending"
      };
    } else {
      if (!singleName.trim() || !singlePhone.trim() || !eventDate.trim() || !eventVenue.trim()) {
        alert("Please fill in all required fields marked with *.");
        return;
      }
      payload = {
        customer_name: `${singleName.trim()} (${coverageSide === "groom" ? "Groom's Side" : "Bride's Side"})`,
        customer_phone: singlePhone.trim(),
        customer_email: singleEmail.trim(),
        customer_name_2: "",
        customer_phone_2: "",
        customer_email_2: "",
        coverage_type: "single",
        coverage_side: coverageSide,
        event_date: eventDate,
        event_venue: eventVenue.trim(),
        package_name: selectedPackage,
        package_price: packagePrice,
        total_price: packagePrice,
        advance_paid: Number(advancePaid) || 0,
        status: "pending"
      };
    }

    setSigningUp(true);
    setSignupSuccess(false);

    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newBooking = await res.json();
        
        // Sync locally
        const localBookings = JSON.parse(localStorage.getItem("dreamwed_bookings") || "[]");
        localStorage.setItem("dreamwed_bookings", JSON.stringify([newBooking, ...localBookings]));

        setCreatedBooking(newBooking);
        setSignupSuccess(true);
      } else {
        throw new Error("API Server error");
      }
    } catch (err) {
      console.warn("Couple signup API error, falling back locally:", err);

      const localBookings = JSON.parse(localStorage.getItem("dreamwed_bookings") || "[]");
      const id = localBookings.length > 0 ? Math.max(...localBookings.map(b => b.id)) + 1 : 10;
      const invoiceNo = `DW-${new Date().getFullYear()}-${String(id).padStart(3, '0')}`;
      
      const newBooking = {
        id,
        ...payload,
        invoice_number: invoiceNo,
        invoice_date: new Date().toISOString().split('T')[0],
        status: "pending",
        payment_milestones: [
          { label: `Advance - Wedding Photography (${payload.package_name})`, amount: payload.advance_paid, date: new Date().toISOString().split('T')[0], status: 'Paid' },
          { label: 'Second Payment (Event Day)', amount: 0, date: payload.event_date, status: 'Pending' },
          { label: 'Final Payment (Before Delivery)', amount: payload.total_price - payload.advance_paid, date: '', status: 'Pending' }
        ],
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };

      localStorage.setItem("dreamwed_bookings", JSON.stringify([newBooking, ...localBookings]));
      
      setCreatedBooking(newBooking);
      setSignupSuccess(true);
    } finally {
      setSigningUp(false);
    }
  };

  const handleEnterPortal = () => {
    // Save phone query to let MyBooking load instantly
    const phone = coverageType === "both" ? groomPhone : singlePhone;
    sessionStorage.setItem("dreamwed_auto_login_phone", phone);
    navigate("/my-booking");
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white pt-32 pb-24 font-sans select-none relative overflow-x-hidden">
      <SEO 
        title="Luxury Couple Registry & Onboarding | Dreamwed Stories"
        description="Initialize your premium digital wedding workspace, capture beautiful Bride and Groom creative coverage specifications, and unlock your luxury invoice client console instantly."
      />

      {/* Decorative luxury glows */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-[600px] h-[600px] bg-[#b4975a]/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 space-y-12 relative z-10">
        
        {/* Navigation & Breadcrumbs */}
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Home
          </Link>
          <span className="text-[10px] text-[#b4975a] font-bold tracking-[0.2em] uppercase bg-[#b4975a]/10 px-3.5 py-1.5 rounded-full">
            Couple Workspace Portal
          </span>
        </div>

        {/* Hero Title */}
        <div className="text-center space-y-4">
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl sm:text-6xl text-zinc-100 font-light tracking-tight">
            Timeless Stories, <span className="italic font-serif text-[#b4975a]">Together</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm font-light max-w-xl mx-auto leading-relaxed">
            Register your couple celebration details to construct a stunning, high-end private client workspace. Download tax-invoice drafts, synchronize creative briefs, and manage your fine-art milestones.
          </p>
        </div>

        {/* Scope Coverage Visual Switcher */}
        <div className="bg-zinc-900/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/5 shadow-2xl space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[9px] text-[#b4975a] font-bold tracking-widest uppercase block">Onboarding Stage 1</span>
            <h2 className="text-lg font-medium text-zinc-200">Select Coverage Scope</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 p-1 bg-black/40 rounded-2xl border border-white/5">
            <button 
              onClick={() => { setCoverageType("both"); }}
              className={`py-3.5 px-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                coverageType === "both" 
                  ? "bg-gradient-to-r from-amber-500/10 via-[#b4975a]/25 to-amber-500/10 text-[#b4975a] border border-[#b4975a]/40 shadow-[0_0_20px_rgba(180,151,90,0.1)]" 
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span>💍</span> <span className="truncate">Both Sides</span>
            </button>
            <button 
              onClick={() => { setCoverageType("single"); setCoverageSide("groom"); }}
              className={`py-3.5 px-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                coverageType === "single" && coverageSide === "groom"
                  ? "bg-gradient-to-r from-amber-500/10 via-[#b4975a]/25 to-amber-500/10 text-[#b4975a] border border-[#b4975a]/40 shadow-[0_0_20px_rgba(180,151,90,0.1)]" 
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span>🎩</span> <span className="truncate">Groom's Side</span>
            </button>
            <button 
              onClick={() => { setCoverageType("single"); setCoverageSide("bride"); }}
              className={`py-3.5 px-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                coverageType === "single" && coverageSide === "bride"
                  ? "bg-gradient-to-r from-amber-500/10 via-[#b4975a]/25 to-amber-500/10 text-[#b4975a] border border-[#b4975a]/40 shadow-[0_0_20px_rgba(180,151,90,0.1)]" 
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span>👰</span> <span className="truncate">Bride's Side</span>
            </button>
          </div>
        </div>

        {/* Master Registry Form */}
        <form onSubmit={handleFormSubmit} className="space-y-12">

          {/* Onboarding Stage 2: Account Specifications */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] font-bold text-[#b4975a]">2</span>
              <h3 className="text-xl font-medium text-zinc-100">Couple Profiles & Contacts</h3>
            </div>

            {coverageType === "both" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Groom Card */}
                <div className="bg-zinc-900/40 border border-white/5 p-6 sm:p-8 rounded-[32px] space-y-5 relative overflow-hidden group hover:border-[#b4975a]/30 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎩</span>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-200">Groom (Husband-to-be)</h4>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2 text-left">
                      <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Groom Name *</label>
                      <div className="relative">
                        <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input 
                          type="text" 
                          required
                          placeholder="Full Name"
                          value={groomName}
                          onChange={(e) => setGroomName(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-zinc-200 text-xs focus:border-[#b4975a] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 text-left">
                      <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Groom WhatsApp Phone *</label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input 
                          type="tel" 
                          required
                          placeholder="WhatsApp Contact"
                          value={groomPhone}
                          onChange={(e) => setGroomPhone(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-zinc-200 text-xs focus:border-[#b4975a] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 text-left">
                      <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Groom Email</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input 
                          type="email" 
                          placeholder="groom@gmail.com"
                          value={groomEmail}
                          onChange={(e) => setGroomEmail(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-zinc-200 text-xs focus:border-[#b4975a] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bride Card */}
                <div className="bg-zinc-900/40 border border-white/5 p-6 sm:p-8 rounded-[32px] space-y-5 relative overflow-hidden group hover:border-[#b4975a]/30 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#b4975a]/5 rounded-full blur-2xl pointer-events-none"></div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">👰</span>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-200">Bride (Wife-to-be)</h4>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2 text-left">
                      <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Bride Name *</label>
                      <div className="relative">
                        <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input 
                          type="text" 
                          required
                          placeholder="Full Name"
                          value={brideName}
                          onChange={(e) => setBrideName(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-zinc-200 text-xs focus:border-[#b4975a] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 text-left">
                      <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Bride WhatsApp Phone *</label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input 
                          type="tel" 
                          required
                          placeholder="WhatsApp Contact"
                          value={bridePhone}
                          onChange={(e) => setBridePhone(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-zinc-200 text-xs focus:border-[#b4975a] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 text-left">
                      <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Bride Email</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input 
                          type="email" 
                          placeholder="bride@gmail.com"
                          value={brideEmail}
                          onChange={(e) => setBrideEmail(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-zinc-200 text-xs focus:border-[#b4975a] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              /* Single Side Card */
              <div className="bg-zinc-900/40 border border-white/5 p-6 sm:p-8 rounded-[32px] space-y-6 max-w-2xl mx-auto relative overflow-hidden hover:border-[#b4975a]/30 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{coverageSide === "groom" ? "🎩" : "👰"}</span>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                      {coverageSide === "groom" ? "Groom's Side Details" : "Bride's Side Details"}
                    </h4>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 text-left sm:col-span-2">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Full Name *</label>
                    <div className="relative">
                      <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        type="text" 
                        required
                        placeholder="Client Full Name"
                        value={singleName}
                        onChange={(e) => setSingleName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-zinc-200 text-xs focus:border-[#b4975a] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">WhatsApp Phone *</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        type="tel" 
                        required
                        placeholder="WhatsApp Number"
                        value={singlePhone}
                        onChange={(e) => setSinglePhone(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-zinc-200 text-xs focus:border-[#b4975a] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Email Address</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        type="email" 
                        placeholder="client@gmail.com"
                        value={singleEmail}
                        onChange={(e) => setSingleEmail(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-zinc-200 text-xs focus:border-[#b4975a] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Onboarding Stage 3: Celebration Metadata */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] font-bold text-[#b4975a]">3</span>
              <h3 className="text-xl font-medium text-zinc-100">Celebration Schedule & Venue</h3>
            </div>

            <div className="bg-zinc-900/30 border border-white/5 p-6 sm:p-8 rounded-[32px] grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div className="space-y-2 text-left">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Wedding Date *</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input 
                    type="date" 
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    style={{ colorScheme: "dark" }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-zinc-200 text-xs focus:border-[#b4975a] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2 text-left sm:col-span-2">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Venue Location *</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Taj Green Cove, Kovalam, Trivandrum"
                    value={eventVenue}
                    onChange={(e) => setEventVenue(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-zinc-200 text-xs focus:border-[#b4975a] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Expected Guests (Optional)</label>
                <div className="relative">
                  <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input 
                    type="number" 
                    placeholder="e.g. 500"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-zinc-200 text-xs focus:border-[#b4975a] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2 text-left sm:col-span-2">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Retainer Advance Payment (₹)</label>
                <div className="relative">
                  <Award size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input 
                    type="number" 
                    placeholder="5000"
                    value={advancePaid}
                    onChange={(e) => setAdvancePaid(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-zinc-200 text-xs focus:border-[#b4975a] focus:outline-none transition-colors"
                  />
                </div>
                <span className="text-[9px] text-zinc-500 mt-1 block">A minimum retainer token of ₹5,000 reserves your custom calendar slot.</span>
              </div>

            </div>
          </div>

          {/* Onboarding Stage 4: Package Tiers */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] font-bold text-[#b4975a]">4</span>
              <h3 className="text-xl font-medium text-zinc-100">Select Artistry Package Collection</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {PACKAGES.map((pkg, idx) => {
                const isSelected = selectedPackage === pkg.name;
                return (
                  <div 
                    key={idx}
                    onClick={() => handlePackageSelect(pkg.name, pkg.price)}
                    className={`rounded-[32px] p-6 sm:p-8 text-left border relative overflow-hidden transition-all duration-500 cursor-pointer flex flex-col justify-between ${
                      isSelected 
                        ? "bg-zinc-900 border-[#b4975a] shadow-[0_15px_40px_rgba(180,151,90,0.15)] scale-[1.02]" 
                        : "bg-zinc-950 border-white/5 hover:border-white/10 hover:scale-[1.01]"
                    }`}
                  >
                    {/* Selected Glowing Corner */}
                    {isSelected && (
                      <div className="absolute top-0 right-0 bg-[#b4975a] text-zinc-950 px-4 py-1.5 rounded-bl-2xl text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Check size={10} strokeWidth={3} /> Selected
                      </div>
                    )}

                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-[#b4975a] font-bold uppercase tracking-widest bg-[#b4975a]/10 px-2.5 py-1 rounded-md inline-block">
                          {pkg.badge}
                        </span>
                        <h4 className="text-lg font-bold text-white tracking-tight">{pkg.name}</h4>
                      </div>

                      <p className="text-xs text-zinc-400 font-light leading-relaxed min-h-[48px]">{pkg.description}</p>

                      <div className="py-4 border-y border-white/5">
                        <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block">Investment</span>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="text-2xl sm:text-3xl font-serif text-[#b4975a]">₹ {pkg.price.toLocaleString("en-IN")}</span>
                          <span className="text-[10px] text-zinc-500 font-medium">INR Net</span>
                        </div>
                      </div>

                      <ul className="space-y-3 pt-2">
                        {pkg.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2.5 text-xs font-light text-zinc-300">
                            <Sparkles size={12} className="text-[#b4975a] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-8">
                      <button
                        type="button"
                        className={`w-full py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border ${
                          isSelected 
                            ? "bg-[#b4975a] text-zinc-950 border-[#b4975a]" 
                            : "bg-transparent text-zinc-400 border-white/10 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {isSelected ? "Active Choice" : "Select Creative Collection"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Privacy Terms & Conditions */}
          <div className="bg-zinc-900/20 border border-white/5 rounded-[32px] p-6 max-w-2xl mx-auto flex items-start gap-4 text-left">
            <input 
              type="checkbox" 
              id="terms" 
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 accent-[#b4975a] cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-zinc-400 font-light leading-relaxed cursor-pointer select-none">
              By initializing this couple registry, I authorize Dreamwed Stories to lock our wedding date draft, generate milestone schedules, and construct a private digital client console. Contacts provided will receive WhatsApp sync alerts.
            </label>
          </div>

          {/* Action button */}
          <div className="pt-4 max-w-md mx-auto">
            <button 
              type="submit"
              disabled={signingUp}
              className="w-full py-5 bg-gradient-to-r from-amber-500 via-[#d1a852] to-[#b4975a] text-zinc-950 hover:brightness-110 active:scale-[0.98] font-bold rounded-2xl transition-all text-xs tracking-[3px] uppercase shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              {signingUp ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin"></span>
                  Processing Couple Workspace...
                </>
              ) : (
                <>
                  Initialize Couple Workspace
                  <ArrowRight size={14} strokeWidth={2.5} />
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* EXQUISITE LUXURY SUCCESS OVERLAY MODAL */}
      <AnimatePresence>
        {signupSuccess && createdBooking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#0f0f12] border border-[#b4975a]/30 p-8 sm:p-10 rounded-[40px] max-w-lg w-full text-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              {/* Luxury ambient light inside modal */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>

              <div className="w-16 h-16 bg-[#b4975a]/10 border border-[#b4975a]/30 rounded-full flex items-center justify-center mx-auto text-[#b4975a]">
                <ShieldCheck size={32} />
              </div>

              <div className="space-y-2">
                <span className="text-[9px] text-[#b4975a] font-bold tracking-[0.25em] uppercase block">Onboarding Complete</span>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl font-light text-zinc-100">
                  Workspace Approved & Ready
                </h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-sm mx-auto">
                  Congratulations! Your private wedding creative workspace is now successfully generated. Your custom client invoice and review drafts have been compiled.
                </p>
              </div>

              {/* Dynamic Workspace Snapshot Card */}
              <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5 text-left text-xs space-y-3 font-light">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-[#b4975a] border-b border-white/5 pb-2">
                  <span>Workspace ID</span>
                  <span className="font-mono text-zinc-300">{createdBooking.invoice_number || "DW-2026-PEND"}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-300">
                  <span>Couple Names</span>
                  <span className="font-medium text-white">{createdBooking.customer_name}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-300">
                  <span>Selected Package</span>
                  <span className="font-medium text-white truncate max-w-[180px]">{createdBooking.package_name}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-300">
                  <span>Wedding Date</span>
                  <span className="font-medium text-white">
                    {new Date(createdBooking.event_date).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-300">
                  <span>Balance Remaining</span>
                  <span className="font-medium text-[#b4975a] font-bold">
                    ₹ {Number(createdBooking.total_price - createdBooking.advance_paid).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button 
                  onClick={handleEnterPortal}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 via-[#d1a852] to-[#b4975a] text-zinc-950 font-bold rounded-xl transition-all text-xs tracking-widest uppercase shadow-md flex items-center justify-center gap-2 cursor-pointer hover:brightness-110 active:scale-[0.98]"
                >
                  Enter Client Portal
                  <ArrowRight size={14} strokeWidth={2.5} />
                </button>
                <button 
                  onClick={() => setSignupSuccess(false)}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 font-bold tracking-widest uppercase"
                >
                  Adjust Registration Details
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default GroomBrideSignup;
