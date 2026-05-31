import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, Calendar, MapPin, Search, Download, CheckCircle, 
  Clock, AlertCircle, X, Printer, Mail, Gift 
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import SEO from "../components/SEO";

const MyBooking = () => {
  const [activeMode, setActiveMode] = useState("lookup");
  const [phoneQuery, setPhoneQuery] = useState("");
  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, loading, success, error, not_found
  const [errorMessage, setErrorMessage] = useState("");
  const [isInvoicePrintOpen, setIsInvoicePrintOpen] = useState(false);

  // Signup form states
  const [coverageType, setCoverageType] = useState("both"); // "single" or "both"
  const [coverageSide, setCoverageSide] = useState("groom"); // "groom" or "bride"
  
  // Single side credentials
  const [singleName, setSingleName] = useState("");
  const [singlePhone, setSinglePhone] = useState("");
  const [singleEmail, setSingleEmail] = useState("");
  
  // Both sides credentials
  const [groomName, setGroomName] = useState("");
  const [groomPhone, setGroomPhone] = useState("");
  const [groomEmail, setGroomEmail] = useState("");
  const [brideName, setBrideName] = useState("");
  const [bridePhone, setBridePhone] = useState("");
  const [brideEmail, setBrideEmail] = useState("");

  const [eventDate, setEventDate] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("Elite Signature Package");
  const [packagePrice, setPackagePrice] = useState(180000);
  const [advancePaid, setAdvancePaid] = useState(5000);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signingUp, setSigningUp] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const INITIAL_BOOKINGS = [
    {
      id: 3,
      customer_name: "Adarsh & Anjali",
      customer_phone: "9042544997",
      customer_email: "adarsh.anjali@gmail.com",
      event_date: "2026-12-18",
      event_venue: "Taj Green Cove, Kovalam",
      package_name: "Elite Signature Package",
      package_price: 180000,
      add_ons: ["Pre-wedding Cinematic Video (Offer Price - 9999/-)", "Drone Coverage Upgrade"],
      total_price: 189999,
      advance_paid: 50000,
      balance_amount: 139999,
      invoice_number: "DW-2026-003",
      invoice_date: "2026-05-28",
      status: "confirmed",
      payment_milestones: [
        { label: "Advance - Wedding Photography (Elite Signature Package)", amount: 50000, date: "2026-05-28", status: "Paid" },
        { label: "Second Payment (Event Day)", amount: 0, date: "2026-12-18", status: "Pending" },
        { label: "Final Payment (Before Delivery)", amount: 139999, date: "", status: "Pending" }
      ],
      created_at: "2026-05-28 18:26:08",
      updated_at: "2026-05-28 18:26:08"
    },
    {
      id: 4,
      customer_name: "Rahul & Sneha",
      customer_phone: "9895412895",
      customer_email: "rahul.sneha@gmail.com",
      event_date: "2026-11-20",
      event_venue: "The Leela Raviz, Kovalam",
      package_name: "Elite Signature Package",
      package_price: 180000,
      add_ons: ["Pre-wedding Cinematic Video (Offer Price - 9999/-)", "Drone Coverage Upgrade"],
      total_price: 189999,
      advance_paid: 50000,
      balance_amount: 139999,
      invoice_number: "DW-2026-004",
      invoice_date: "2026-05-28",
      status: "confirmed",
      payment_milestones: [
        { label: "Advance - Wedding Photography (Elite Signature Package)", amount: 50000, date: "2026-05-28", status: "Paid" },
        { label: "Second Payment (Event Day)", amount: 0, date: "2026-11-20", status: "Pending" },
        { label: "Final Payment (Before Delivery)", amount: 139999, date: "", status: "Pending" }
      ],
      created_at: "2026-05-28 18:26:08",
      updated_at: "2026-05-28 18:26:08"
    }
  ];

  useEffect(() => {
    if (!localStorage.getItem("dreamwed_bookings")) {
      localStorage.setItem("dreamwed_bookings", JSON.stringify(INITIAL_BOOKINGS));
    }
  }, []);

  const handlePackageChange = (pName) => {
    setSelectedPackage(pName);
    if (pName === "Elite Signature Package") setPackagePrice(180000);
    else if (pName === "Premium Couture Package") setPackagePrice(135000);
    else setPackagePrice(95000);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    let payload = {};
    if (coverageType === "both") {
      if (!groomName.trim() || !groomPhone.trim() || !brideName.trim() || !bridePhone.trim() || !eventDate.trim() || !eventVenue.trim()) {
        alert("Please fill in all required fields for both Bride & Groom.");
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
        alert("Please fill in all required fields.");
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
        
        // Save locally in sync
        const localBookings = JSON.parse(localStorage.getItem("dreamwed_bookings") || "[]");
        localStorage.setItem("dreamwed_bookings", JSON.stringify([newBooking, ...localBookings]));

        setSignupSuccess(true);
        setSingleName("");
        setSinglePhone("");
        setSingleEmail("");
        setGroomName("");
        setGroomPhone("");
        setGroomEmail("");
        setBrideName("");
        setBridePhone("");
        setBrideEmail("");
        setEventDate("");
        setEventVenue("");
        setAdvancePaid(5000);
        alert("✅ Wedding booking request submitted! Admin will review and approve shortly.");
      } else {
        throw new Error("Server error");
      }
    } catch (err) {
      console.error("Signup error, falling back locally:", err);
      
      const localBookings = JSON.parse(localStorage.getItem("dreamwed_bookings") || "[]");
      const id = localBookings.length > 0 ? Math.max(...localBookings.map(b => b.id)) + 1 : 5;
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

      setSignupSuccess(true);
      setSingleName("");
      setSinglePhone("");
      setSingleEmail("");
      setGroomName("");
      setGroomPhone("");
      setGroomEmail("");
      setBrideName("");
      setBridePhone("");
      setBrideEmail("");
      setEventDate("");
      setEventVenue("");
      setAdvancePaid(5000);
      alert("✅ Wedding booking request submitted (Local Offline Sync Active)! Admin will review and approve shortly.");
    } finally {
      setSigningUp(false);
    }
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!phoneQuery.trim()) return;

    setStatus("loading");
    setBooking(null);
    setErrorMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/client/booking?phone=${encodeURIComponent(phoneQuery.trim())}`);
      
      if (res.status === 404) {
        // Local fallback
        const localBookings = JSON.parse(localStorage.getItem("dreamwed_bookings") || "[]");
        const normalizedInput = phoneQuery.trim().replace(/\D/g, '');
        const match = localBookings.find(b => {
          const normalizedBookingPhone = (b.customer_phone || '').replace(/\D/g, '');
          const normalizedBookingPhone2 = (b.customer_phone_2 || '').replace(/\D/g, '');
          return normalizedBookingPhone === normalizedInput || 
                 normalizedBookingPhone.endsWith(normalizedInput) || 
                 normalizedInput.endsWith(normalizedBookingPhone) ||
                 (normalizedBookingPhone2 && (
                   normalizedBookingPhone2 === normalizedInput ||
                   normalizedBookingPhone2.endsWith(normalizedInput) ||
                   normalizedInput.endsWith(normalizedBookingPhone2)
                 ));
        });

        if (match) {
          setBooking(match);
          setStatus("success");
          return;
        }

        setStatus("not_found");
        return;
      }
      
      if (!res.ok) {
        throw new Error("Unable to contact backend server");
      }

      const data = await res.json();
      setBooking(data);
      setStatus("success");
    } catch (err) {
      console.error("Lookup error, falling back locally:", err);
      
      // Local fallback
      const localBookings = JSON.parse(localStorage.getItem("dreamwed_bookings") || "[]");
      const normalizedInput = phoneQuery.trim().replace(/\D/g, '');
      const match = localBookings.find(b => {
        const normalizedBookingPhone = (b.customer_phone || '').replace(/\D/g, '');
        const normalizedBookingPhone2 = (b.customer_phone_2 || '').replace(/\D/g, '');
        return normalizedBookingPhone === normalizedInput || 
               normalizedBookingPhone.endsWith(normalizedInput) || 
               normalizedInput.endsWith(normalizedBookingPhone) ||
               (normalizedBookingPhone2 && (
                 normalizedBookingPhone2 === normalizedInput ||
                 normalizedBookingPhone2.endsWith(normalizedInput) ||
                 normalizedInput.endsWith(normalizedBookingPhone2)
               ));
      });

      if (match) {
        setBooking(match);
        setStatus("success");
        return;
      }

      setStatus("error");
      setErrorMessage("Could not connect to the booking server. Please check if your number is correct or try again shortly.");
    }
  };

  const formatCurrency = (num) => {
    return Number(num).toLocaleString("en-IN", { style: "decimal", maximumFractionDigits: 0 });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }).replace(/\//g, "-");
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] pt-28 pb-24 text-zinc-800 font-sans select-none overflow-x-hidden">
      <SEO 
        title="Client Invoice Portal | Dreamwed Stories"
        description="Access your custom photography booking, track milestone schedules, and download approved tax-invoice PDFs."
      />

      <div className="max-w-xl mx-auto px-6 space-y-8">
        {/* Portal Header */}
        <div className="text-center space-y-3">
          <span className="text-[#b4975a] text-xs font-semibold tracking-[0.25em] uppercase block">Client Console</span>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl sm:text-5xl text-zinc-900 font-light tracking-tight">
            Wedding <span className="italic font-serif text-[#b4975a]">Booking Console</span>
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm font-light leading-relaxed max-w-sm mx-auto">
            Find your tax invoice, register a new wedding project booking request, or review milestone schedules.
          </p>
        </div>

        {/* Toggle between Find Invoice and Request Booking */}
        <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl w-fit mx-auto border border-zinc-200 shadow-sm z-10 relative">
          <button 
            onClick={() => { setActiveMode("lookup"); setSignupSuccess(false); }}
            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeMode === "lookup" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-850"
            }`}
          >
            Find My Invoice
          </button>
          <button 
            onClick={() => { setActiveMode("signup"); setStatus("idle"); setBooking(null); }}
            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeMode === "signup" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-850"
            }`}
          >
            Request New Booking
          </button>
        </div>

        {/* Search Input Box / Signup Form */}
        <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200 shadow-[0_15px_40px_rgba(0,0,0,0.02)] space-y-6">
          {activeMode === "lookup" ? (
            <form onSubmit={handleLookup} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase block text-left">Registered Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input 
                    type="tel" 
                    required
                    placeholder="+91 9995412955"
                    value={phoneQuery}
                    onChange={(e) => setPhoneQuery(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 pl-12 pr-4 text-zinc-800 text-sm focus:border-[#b4975a] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={status === "loading"}
                className="w-full py-4 bg-zinc-950 text-white font-bold rounded-xl hover:bg-black transition-all text-xs tracking-widest uppercase shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search size={14} />
                {status === "loading" ? "Searching Booking DB..." : "Find Invoice"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-5 text-left">
              {/* Coverage Scope Select Radio Toggles */}
              <div className="space-y-2">
                <label className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase block">Coverage Scope *</label>
                <div className="grid grid-cols-2 gap-3 bg-zinc-100 p-1 rounded-xl border border-zinc-200 shadow-xs relative z-10 w-full">
                  <button 
                    type="button"
                    onClick={() => setCoverageType("both")}
                    className={`py-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      coverageType === "both" ? "bg-zinc-900 text-white shadow-xs" : "bg-white text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    💍 Both Sides (Bride & Groom)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setCoverageType("single")}
                    className={`py-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      coverageType === "single" ? "bg-zinc-900 text-white shadow-xs" : "bg-white text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    👤 Single Side
                  </button>
                </div>
              </div>

              {/* Dynamic Form Sections */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coverageType === "both" ? (
                  <>
                    {/* Groom's Account Block */}
                    <div className="col-span-2 sm:col-span-1 p-4 bg-zinc-50 rounded-2xl border border-zinc-200/60 space-y-3">
                      <div className="flex items-center gap-1.5 text-zinc-900 font-bold text-xs border-b border-zinc-200 pb-1.5">
                        <span>🎩</span> Groom's Account Details
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest block">Groom Name *</label>
                        <input 
                          type="text" 
                          required={coverageType === "both"}
                          placeholder="Groom's Name"
                          value={groomName}
                          onChange={(e) => setGroomName(e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-800 text-xs focus:border-[#b4975a] focus:outline-none font-light"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest block">Groom WhatsApp Phone *</label>
                        <input 
                          type="tel" 
                          required={coverageType === "both"}
                          placeholder="e.g. 9895412895"
                          value={groomPhone}
                          onChange={(e) => setGroomPhone(e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-800 text-xs focus:border-[#b4975a] focus:outline-none font-light"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest block">Groom Email</label>
                        <input 
                          type="email" 
                          placeholder="groom@gmail.com"
                          value={groomEmail}
                          onChange={(e) => setGroomEmail(e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-800 text-xs focus:border-[#b4975a] focus:outline-none font-light"
                        />
                      </div>
                    </div>

                    {/* Bride's Account Block */}
                    <div className="col-span-2 sm:col-span-1 p-4 bg-zinc-50 rounded-2xl border border-zinc-200/60 space-y-3">
                      <div className="flex items-center gap-1.5 text-zinc-900 font-bold text-xs border-b border-zinc-200 pb-1.5">
                        <span>👰</span> Bride's Account Details
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest block">Bride Name *</label>
                        <input 
                          type="text" 
                          required={coverageType === "both"}
                          placeholder="Bride's Name"
                          value={brideName}
                          onChange={(e) => setBrideName(e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-800 text-xs focus:border-[#b4975a] focus:outline-none font-light"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest block">Bride WhatsApp Phone *</label>
                        <input 
                          type="tel" 
                          required={coverageType === "both"}
                          placeholder="e.g. 9895412896"
                          value={bridePhone}
                          onChange={(e) => setBridePhone(e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-800 text-xs focus:border-[#b4975a] focus:outline-none font-light"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest block">Bride Email</label>
                        <input 
                          type="email" 
                          placeholder="bride@gmail.com"
                          value={brideEmail}
                          onChange={(e) => setBrideEmail(e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-800 text-xs focus:border-[#b4975a] focus:outline-none font-light"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Single Side Account Block */}
                    <div className="col-span-2 p-4 bg-zinc-50 rounded-2xl border border-zinc-200/60 space-y-4">
                      <div className="flex items-center justify-between text-zinc-900 font-bold text-xs border-b border-zinc-200 pb-2">
                        <div className="flex items-center gap-1.5">
                          <span>👤</span> Client Account Details
                        </div>
                        {/* Side selector */}
                        <div className="flex gap-1 bg-zinc-200/60 p-0.5 rounded-lg border border-zinc-200 w-fit">
                          <button 
                            type="button"
                            onClick={() => setCoverageSide("groom")}
                            className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              coverageSide === "groom" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
                            }`}
                          >
                            Groom
                          </button>
                          <button 
                            type="button"
                            onClick={() => setCoverageSide("bride")}
                            className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              coverageSide === "bride" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
                            }`}
                          >
                            Bride
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest block">Client Name *</label>
                          <input 
                            type="text" 
                            required={coverageType === "single"}
                            placeholder="Client Name"
                            value={singleName}
                            onChange={(e) => setSingleName(e.target.value)}
                            className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-3 text-zinc-800 text-xs focus:border-[#b4975a] focus:outline-none font-light"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest block">WhatsApp Phone Number *</label>
                          <input 
                            type="tel" 
                            required={coverageType === "single"}
                            placeholder="e.g. 9895412895"
                            value={singlePhone}
                            onChange={(e) => setSinglePhone(e.target.value)}
                            className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-3 text-zinc-800 text-xs focus:border-[#b4975a] focus:outline-none font-light"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest block">Email Address</label>
                          <input 
                            type="email" 
                            placeholder="e.g. yourname@gmail.com"
                            value={singleEmail}
                            onChange={(e) => setSingleEmail(e.target.value)}
                            className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-3 text-zinc-800 text-xs focus:border-[#b4975a] focus:outline-none font-light"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <div className="space-y-1.5">
                  <label className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase block">Wedding Date *</label>
                  <input 
                    type="date" 
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    style={{ colorScheme: "light" }}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-800 text-xs focus:border-[#b4975a] focus:outline-none font-light"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase block">Select Package *</label>
                  <select 
                    value={selectedPackage}
                    onChange={(e) => handlePackageChange(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-800 text-xs focus:border-[#b4975a] focus:outline-none font-light"
                  >
                    <option value="Elite Signature Package">Elite Signature (₹1,80,000)</option>
                    <option value="Premium Couture Package">Premium Couture (₹1,35,000)</option>
                    <option value="Classic Heritage Package">Classic Heritage (₹95,000)</option>
                  </select>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase block">Wedding Venue Location *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Taj Green Cove, Kovalam, Trivandrum"
                    value={eventVenue}
                    onChange={(e) => setEventVenue(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-800 text-xs focus:border-[#b4975a] focus:outline-none font-light"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase block">Advance Paid Amount (₹)</label>
                  <input 
                    type="number" 
                    placeholder="5000"
                    value={advancePaid}
                    onChange={(e) => setAdvancePaid(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-800 text-xs focus:border-[#b4975a] focus:outline-none font-light"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={signingUp}
                className="w-full py-4.5 bg-[#b4975a] hover:bg-[#c5a86b] text-zinc-950 font-bold rounded-xl transition-all text-xs tracking-widest uppercase shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] mt-2"
              >
                {signingUp ? "Submitting Request..." : "Submit Booking Request"}
              </button>
            </form>
          )}

          {/* Feedback states */}
          <AnimatePresence mode="wait">
            {activeMode === "lookup" && status === "not_found" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-2xl text-xs space-y-3"
              >
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <AlertCircle size={16} className="shrink-0 text-amber-600" />
                  <span>No Booking Found</span>
                </div>
                <p className="font-light leading-relaxed text-left">
                  We couldn't locate a booking request matching <strong>{phoneQuery}</strong>. Please ensure you entered the exact contact number used during submission.
                </p>
                <a 
                  href="https://wa.me/919995412955?text=Hello%20Dreamwed%20Stories,%20I%20am%20unable%20to%20find%20my%20invoice%20for%20phone%20number"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#b4975a] hover:underline"
                >
                  <FaWhatsapp size={14} /> Contact Coordinator
                </a>
              </motion.div>
            )}

            {activeMode === "lookup" && status === "error" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-2xl text-xs space-y-2"
              >
                <div className="flex items-center gap-2 font-bold text-red-900">
                  <AlertCircle size={16} className="shrink-0 text-red-600" />
                  <span>Connection Issue</span>
                </div>
                <p className="font-light leading-relaxed text-left">{errorMessage}</p>
              </motion.div>
            )}

            {activeMode === "signup" && signupSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl text-xs space-y-2 text-left"
              >
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle size={16} className="shrink-0 text-emerald-600" />
                  <span>Request Received!</span>
                </div>
                <p className="font-light leading-relaxed">
                  Thank you! Your wedding photography and cinematic film booking request has been submitted. Our team will review the date and venue shortly. Once approved by the administrator, you can search using your registered number to access your tax invoice.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Booking Details Card */}
        <AnimatePresence>
          {status === "success" && booking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)] space-y-6"
            >
              <div className="flex justify-between items-start border-b border-zinc-100 pb-5">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Client Profile</span>
                  <h2 className="text-xl font-bold text-zinc-900 mt-1">{booking.customer_name}</h2>
                  <p className="text-zinc-500 text-xs font-light mt-0.5">{booking.customer_email || booking.customer_phone}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</span>
                  {booking.status === "confirmed" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/20">
                      <CheckCircle size={12} className="fill-emerald-700 stroke-emerald-50" />
                      Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/20">
                      <Clock size={12} className="fill-amber-700 stroke-amber-50" />
                      Pending Approval
                    </span>
                  )}
                </div>
              </div>

              {/* Event details */}
              <div className="grid grid-cols-2 gap-4 text-xs font-light">
                <div className="space-y-1 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Wedding Date</span>
                  <div className="flex items-center gap-1.5 text-zinc-800 font-medium mt-1">
                    <Calendar size={14} className="text-zinc-400" />
                    <span>{formatDate(booking.event_date)}</span>
                  </div>
                </div>

                <div className="space-y-1 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Selected Package</span>
                  <div className="flex items-center gap-1.5 text-zinc-800 font-medium mt-1">
                    <Gift size={14} className="text-zinc-400" />
                    <span className="truncate">{booking.package_name}</span>
                  </div>
                </div>

                <div className="col-span-2 space-y-1 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Wedding Venue</span>
                  <div className="flex items-center gap-1.5 text-zinc-800 font-medium mt-1">
                    <MapPin size={14} className="text-zinc-400 shrink-0" />
                    <span className="line-clamp-1">{booking.event_venue}</span>
                  </div>
                </div>
              </div>

              {/* Custom Status message mapping user's exact approval condition */}
              {booking.status !== "confirmed" ? (
                <div className="bg-amber-50/50 border border-amber-200/60 p-5 rounded-2xl text-xs space-y-2 text-zinc-700">
                  <div className="flex items-center gap-2 font-bold text-amber-900 uppercase tracking-wide text-[10px]">
                    <Clock size={14} className="text-amber-600" />
                    <span>Invoice Pending Approval</span>
                  </div>
                  <p className="font-light leading-relaxed">
                    Your wedding booking request is received! However, your invoice details are currently undergoing admin date confirmation. Once approved by our team, your printable brand invoice will be instantly unlocked for download here.
                  </p>
                </div>
              ) : (
                <div className="space-y-5 pt-2">
                  <div className="bg-emerald-50/50 border border-emerald-200/60 p-5 rounded-2xl text-xs space-y-1.5 text-zinc-700">
                    <div className="flex items-center gap-2 font-bold text-emerald-900 uppercase tracking-wide text-[10px]">
                      <CheckCircle size={14} className="text-emerald-600" />
                      <span>Invoice Unlocked</span>
                    </div>
                    <p className="font-light leading-relaxed">
                      Congratulations! Your wedding booking is approved. Your printable custom brand invoice is locked and ready below.
                    </p>
                  </div>

                  {/* Financial breakdown */}
                  <div className="bg-zinc-900 text-zinc-100 p-5 rounded-2xl flex justify-between items-center">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Total Package Price</span>
                      <div className="text-lg font-bold text-white">₹ {formatCurrency(booking.total_price)}</div>
                    </div>
                    <div className="text-right space-y-0.5">
                      <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Advance Paid</span>
                      <div className="text-xs font-semibold text-emerald-400">₹ {formatCurrency(booking.advance_paid)}</div>
                    </div>
                    <div className="text-right space-y-0.5 border-l border-zinc-800 pl-5">
                      <span className="text-[9px] text-[#b4975a] uppercase tracking-wider font-bold">Remaining Balance</span>
                      <div className="text-base font-bold text-[#b4975a]">₹ {formatCurrency(booking.total_price - booking.advance_paid)}</div>
                    </div>
                  </div>

                  {/* PDF Download Button */}
                  <button 
                    onClick={() => setIsInvoicePrintOpen(true)}
                    className="w-full py-4.5 bg-[#b4975a] text-zinc-950 font-bold rounded-xl hover:bg-[#c5a86b] active:scale-98 transition-all text-xs tracking-widest uppercase shadow-md flex items-center justify-center gap-2.5 cursor-pointer font-Montserrat"
                  >
                    <Download size={15} />
                    Download Printable Invoice
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RENDER DYNAMIC BRAND A4 PRINT INVOICE MODAL */}
      <AnimatePresence>
        {isInvoicePrintOpen && booking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="invoice-overlay !block"
          >
            {/* Control Bar (hidden during PDF print) */}
            <div className="invoice-control-bar no-print">
              <button 
                onClick={() => setIsInvoicePrintOpen(false)}
                className="action-btn"
                style={{ background: "#222", color: "#fff", border: "1px solid #333" }}
              >
                ✕ Close Portal
              </button>
              <button 
                onClick={() => window.print()}
                className="action-btn"
                style={{ background: "#b4975a", color: "#000" }}
              >
                <Printer size={14} /> Print / Save as PDF
              </button>
            </div>

            {/* A4 Container */}
            <div className="invoice-container">
              {/* Branding header exactly styled like invoice images */}
              <div className="invoice-brand">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div className="brand-logo-circle">DW</div>
                  <div className="brand-text-name">Dreamwed Stories</div>
                </div>
                <div style={{ fontSize: "11px", textAlign: "right", color: "#555", lineHeight: "1.5" }}>
                  dreamwedstories.co.in<br />
                  +91 98954 12895
                </div>
              </div>

              {/* Bold Minimalist Title */}
              <div className="invoice-header-title">
                <h2>Invoice</h2>
              </div>

              {/* Meta details split */}
              <div className="invoice-meta-section">
                <div className="invoice-to">
                  <h3>Invoice To:</h3>
                  <div className="invoice-to-name">{booking.customer_name}</div>
                  <div className="invoice-to-details">
                    <div>{booking.event_venue}</div>
                    <div>Ph: {booking.customer_phone}</div>
                    {booking.customer_email && <div>Email: {booking.customer_email}</div>}
                  </div>
                </div>

                <div className="invoice-details-right">
                  <table>
                    <tbody>
                      <tr>
                        <td className="lbl">Issued:</td>
                        <td className="val">{formatDate(booking.invoice_date || booking.created_at.split(" ")[0])}</td>
                      </tr>
                      <tr>
                        <td className="lbl">Invoice:</td>
                        <td className="val">{booking.invoice_number}</td>
                      </tr>
                      <tr>
                        <td className="lbl">Due:</td>
                        <td className="val">On Receipt</td>
                      </tr>
                      <tr>
                        <td className="lbl">Package Price:</td>
                        <td className="val">₹ {formatCurrency(booking.package_price)}/-</td>
                      </tr>
                      <tr>
                        <td className="lbl">Element:</td>
                        <td className="val">{booking.package_name}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Milestone items list */}
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Product / Service</th>
                    <th className="amount-col" style={{ width: "140px" }}>Price</th>
                    <th style={{ width: "150px", paddingLeft: "20px" }}>Date</th>
                    <th class="amount-col" style={{ width: "140px" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.payment_milestones.map((m, index) => (
                    <tr key={index}>
                      <td>
                        <div style={{ fontWeight: 700, color: "#000", marginBottom: "2px" }}>{m.label}</div>
                        <div style={{ fontSize: "10px", color: "#666", fontStyle: "italic" }}>Stage {index + 1} ({m.status})</div>
                      </td>
                      <td className="amount-col">₹ {formatCurrency(m.amount)}</td>
                      <td style={{ paddingLeft: "20px" }}>{m.date ? formatDate(m.date) : "TBD"}</td>
                      <td className="amount-col">₹ {formatCurrency(m.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Right Summary breakdown */}
              <div className="invoice-summary">
                <table className="invoice-summary-table">
                  <tbody>
                    <tr>
                      <td className="lbl">Subtotal:</td>
                      <td className="val">
                        ₹ {formatCurrency(booking.payment_milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0))}/-
                      </td>
                    </tr>
                    <tr>
                      <td className="lbl">Tax (0%):</td>
                      <td className="val">₹ 0/-</td>
                    </tr>
                    <tr>
                      <td className="lbl">Total:</td>
                      <td className="val">
                        ₹ {formatCurrency(booking.payment_milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0))}/-
                      </td>
                    </tr>
                    <tr className="total-payable-row">
                      <td class="lbl">Total Payable Amount:</td>
                      <td className="val">₹ {formatCurrency(booking.total_price - booking.advance_paid)}/-</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Cursive Signature script footer matching templates */}
              <div className="invoice-footer">
                <div className="payment-instructions">
                  <strong>Send Payments To:</strong>
                  Dreamwed Stories<br />
                  UPI: dreamwedstories@okaxis<br />
                  GPay / PhonePe: +91 98954 12895
                </div>
                <div>
                  <div className="signature-thankyou">Thank You!</div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MyBooking;
