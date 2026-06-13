import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Sparkles, Camera, Music, Calendar, Baby, 
  Check, Info, AlertTriangle, Loader2, ArrowLeft, 
  ArrowRight, Settings2, Receipt, Send, Plus, Minus,
  Gift, MapPin
} from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import Button from "../components/ui/Button";

// Custom icons mapping for event types
const EventIcons = {
  Heart: Heart,
  Sparkles: Sparkles,
  Ring: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="5"></circle>
      <line x1="8.3" y1="18" x2="15.7" y2="18"></line>
      <line x1="12" y1="13" x2="12" y2="23"></line>
    </svg>
  ),
  Flower2: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
    </svg>
  ),
  Camera: Camera,
  Music: Music,
  Baby: Baby
};

function EventIcon({ name, className }) {
  const IconComponent = EventIcons[name] || Calendar;
  return <IconComponent className={className} />;
}

// Format price in INR currency
const formatPrice = (price) => {
  return "₹" + Number(price).toLocaleString("en-IN");
};

// OpenStreetMap Autocomplete Input Component
function LocationSearchInput({ value, onChange, placeholder }) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    onChange(text);
    setShowDropdown(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (text.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            text
          )}&countrycodes=in&format=json&limit=5&addressdetails=0`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("OSM Nominatim fetch error:", err);
        setSuggestions([]);
      }
      setSearching(false);
    }, 500);
  };

  const selectSuggestion = (item) => {
    // Simplify place name (first 2 parts)
    const displayName = item.display_name.split(",").slice(0, 3).join(",").trim();
    setQuery(displayName);
    onChange(displayName);
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex items-center">
        <MapPin className="absolute left-3.5 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder={placeholder || "Search venue or location..."}
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim().length >= 3 && setShowDropdown(true)}
          className="w-full bg-[#16161a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#d1a852]/50 transition-colors"
        />
      </div>

      {showDropdown && (searching || suggestions.length > 0) && (
        <div className="absolute z-50 mt-1 w-full bg-[#1c1c24] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
          {searching && (
            <div className="flex items-center gap-2 text-xs text-zinc-400 px-4 py-3.5">
              <Loader2 className="h-3 w-3 animate-spin text-[#d1a852]" />
              <span>Finding locations...</span>
            </div>
          )}
          {!searching &&
            suggestions.map((item) => (
              <button
                key={item.place_id}
                type="button"
                onMouseDown={() => selectSuggestion(item)}
                className="w-full text-left px-4 py-3 text-xs text-zinc-300 hover:bg-[#d1a852]/10 hover:text-white border-b border-white/5 last:border-0 truncate transition-colors block"
              >
                {item.display_name}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

// Option item (Coverage/Deliverable card helper)
function OptionCard({ name, description, price, selected, onToggle, required, compact, count, onCountChange }) {
  const [showInclusions, setShowInclusions] = useState(false);
  const isRecommendedNotSelected = required && !selected;
  const unitCount = count || 1;

  return (
    <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
      isRecommendedNotSelected 
        ? "border-amber-500/30 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.05)]" 
        : selected 
          ? "border-[#d1a852] bg-[#d1a852]/5 shadow-[0_0_20px_rgba(209,168,82,0.05)]" 
          : "border-white/5 bg-[#16161a]/60 hover:border-white/10 hover:bg-[#16161a]"
    }`}>
      <div className={`flex items-center gap-3.5 ${compact ? "p-3.5" : "p-5"}`}>
        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 focus:outline-none group cursor-pointer"
        >
          {selected ? (
            <div className="w-5.5 h-5.5 rounded-full bg-[#d1a852] flex items-center justify-center text-black">
              <Check className="h-3.5 w-3.5 stroke-[3]" />
            </div>
          ) : (
            <div className="w-5.5 h-5.5 rounded-full border-2 border-zinc-600 group-hover:border-[#d1a852] transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0" onClick={onToggle} className="cursor-pointer flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`${compact ? "text-xs" : "text-sm"} font-semibold text-white tracking-wide`}>
              {name}
            </span>
            {required && (
              <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isRecommendedNotSelected ? "bg-amber-500/10 text-amber-400" : "bg-[#d1a852]/10 text-[#d1a852]"
              }`}>
                Recommended
              </span>
            )}
          </div>
          {!compact && (
            <p className="text-sm font-bold text-[#d1a852] mt-1">
              {formatPrice(price)}
              <span className="text-[10px] font-normal text-zinc-500 ml-1">per unit</span>
            </p>
          )}
        </div>

        {selected && onCountChange && !compact && (
          <div className="flex items-center gap-1.5 shrink-0 bg-[#121215] border border-white/5 rounded-full p-1" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => onCountChange(Math.max(1, unitCount - 1))}
              className="w-6 h-6 rounded-full bg-[#1c1c22] hover:bg-zinc-800 flex items-center justify-center transition-colors focus:outline-none"
            >
              <Minus className="h-2.5 w-2.5 text-zinc-400" />
            </button>
            <span className="w-5 text-center text-xs font-extrabold text-white">
              {unitCount}
            </span>
            <button
              type="button"
              onClick={() => onCountChange(Math.min(10, unitCount + 1))}
              className="w-6 h-6 rounded-full bg-[#1c1c22] hover:bg-[#d1a852] hover:text-black flex items-center justify-center transition-colors focus:outline-none"
            >
              <Plus className="h-2.5 w-2.5 text-[#d1a852] hover:text-black" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowInclusions(!showInclusions)}
          className="shrink-0 text-zinc-500 hover:text-[#d1a852] p-1.5 focus:outline-none transition-colors"
          title="Info"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>

      {isRecommendedNotSelected && (
        <div className="flex items-start gap-2.5 px-5 pb-3.5 border-t border-amber-500/10 pt-2.5 bg-amber-500/5">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-300/90 leading-snug">
            This coverage is recommended for your event type selection. Removing it might compromise the standard coverage quality.
          </p>
        </div>
      )}

      {showInclusions && (
        <div className="px-5 pb-5 border-t border-white/5 bg-[#121215]/50">
          <p className="text-xs text-zinc-400 leading-relaxed pt-3.5 font-light">
            {description}
          </p>
        </div>
      )}
    </div>
  );
}

// Single Event Details Component
function EventDetailCard({ event, dateVal, venueVal, onDateChange, onVenueChange, onRemove }) {
  return (
    <div className="bg-[#16161a] border border-white/5 rounded-2xl p-5 md:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#d1a852]/10 flex items-center justify-center shrink-0 text-[#d1a852]">
            <EventIcon name={event.icon} className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">{event.name}</h4>
            <p className="text-[10px] text-zinc-500">Add schedule details for this event</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">Event Date</label>
          <input
            type="text"
            placeholder="e.g. 18 December 2026"
            value={dateVal}
            onChange={e => onDateChange(e.target.value)}
            className="w-full bg-[#1c1c22] border border-white/5 rounded-xl px-4 py-3 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-[#d1a852]/50 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">Venue / Location</label>
          <LocationSearchInput
            value={venueVal}
            onChange={onVenueChange}
            placeholder="e.g. Leela Raviz Resort, Kovalam"
          />
        </div>
      </div>
    </div>
  );
}

const STEPS = ["Your Events", "Timeline Details", "Select Tier", "Bespoke Details", "Summary"];

export default function CustomPackage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Selections state
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [otherEventsText, setOtherEventsText] = useState("");
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [eventDetails, setEventDetails] = useState({}); // { eventId: { date, venue } }
  const [guestCount, setGuestCount] = useState("");
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedCoverage, setSelectedCoverage] = useState([]);
  const [coverageCounts, setCoverageCounts] = useState({});
  const [selectedDeliverables, setSelectedDeliverables] = useState([]);
  const [customizeExpanded, setCustomizeExpanded] = useState(false);

  // Form info states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [phoneWarning, setPhoneWarning] = useState("");

  const pageTopRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

  // Fetch package configs
  useEffect(() => {
    fetch(`${API_BASE}/api/public/package-config`)
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load package config:", err);
        setLoading(false);
      });
  }, [API_BASE]);

  // Scroll to top on step changes
  useEffect(() => {
    if (pageTopRef.current) {
      pageTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentStep]);

  // Compute recommended coverage based on selected event types
  const getRecommendedCoverageIds = useCallback(() => {
    if (!config) return [];
    const recommendedSet = new Set();
    const tier = selectedTier ? config.tiers.find(t => t.id === selectedTier) : null;
    
    selectedEvents.forEach(evtId => {
      if (tier && tier.eventCoverageMap[String(evtId)]) {
        tier.eventCoverageMap[String(evtId)].forEach(id => recommendedSet.add(id));
      } else {
        const evtType = config.eventTypes.find(e => e.id === evtId);
        if (evtType && evtType.minimumCoverage) {
          evtType.minimumCoverage.forEach(item => recommendedSet.add(item.coverageOptionId));
        }
      }
    });

    return Array.from(recommendedSet);
  }, [config, selectedEvents, selectedTier]);

  // Get coverage multipliers: how many events require this coverage option
  const getCoverageMultipliers = useCallback(() => {
    if (!config) return {};
    const multipliers = {};
    const tier = selectedTier ? config.tiers.find(t => t.id === selectedTier) : null;

    selectedEvents.forEach(evtId => {
      const tierMap = tier?.eventCoverageMap[String(evtId)];
      const defaultMap = config.eventTypes.find(e => e.id === evtId)?.minimumCoverage.map(c => c.coverageOptionId) || [];
      const coverages = (tierMap && tierMap.length > 0) ? tierMap : defaultMap;

      coverages.forEach(id => {
        multipliers[id] = (multipliers[id] || 0) + 1;
      });
    });

    return multipliers;
  }, [config, selectedEvents, selectedTier]);

  // Handle tier click selection
  const handleTierSelect = (tier) => {
    setSelectedTier(tier.id);
    
    // Automatically select coverages in the tier
    const recommendedIds = new Set();
    selectedEvents.forEach(evtId => {
      const map = tier.eventCoverageMap[String(evtId)] || config.eventTypes.find(e => e.id === evtId)?.minimumCoverage.map(c => c.coverageOptionId) || [];
      map.forEach(id => recommendedIds.add(id));
    });
    // Add explicitly required coverage IDs for the tier
    tier.coverageIds.forEach(id => recommendedIds.add(id));
    
    setSelectedCoverage(Array.from(recommendedIds));
    setSelectedDeliverables([...tier.deliverableIds]);

    // Scroll slightly down to checkout button/config accordion
    setTimeout(() => {
      const el = document.getElementById("tier-confirm-btn");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  };

  // Pricing calculations
  const calculateCoverageTotal = useCallback(() => {
    if (!config) return 0;
    const multipliers = getCoverageMultipliers();
    
    return selectedCoverage.reduce((total, id) => {
      const option = config.coverage.find(c => c.id === id);
      if (!option) return total;
      
      const unitPrice = option.price;
      const count = coverageCounts[id] || 1;
      const eventMultiplier = multipliers[id] || 1;
      
      return total + (unitPrice * count * eventMultiplier);
    }, 0);
  }, [config, selectedCoverage, coverageCounts, getCoverageMultipliers]);

  const calculateDeliverablesTotal = useCallback(() => {
    if (!config) return 0;
    return selectedDeliverables.reduce((total, id) => {
      const option = config.deliverables.find(d => d.id === id);
      if (!option) return total;
      
      // Some deliverables are scoped per event (e.g. Reels or Highlights per function, if any)
      const multiplier = option.scope === "PER_EVENT" ? Math.max(1, selectedEvents.length) : 1;
      return total + (option.price * multiplier);
    }, 0);
  }, [config, selectedDeliverables, selectedEvents]);

  const calculateGrandTotal = useCallback(() => {
    return calculateCoverageTotal() + calculateDeliverablesTotal();
  }, [calculateCoverageTotal, calculateDeliverablesTotal]);

  // Autocomplete checkbox triggers
  const toggleEventSelection = (eventId) => {
    setSelectedEvents((prev) => {
      const updated = prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId];
      if (updated.length > 0) {
        setTimeout(() => {
          const el = document.getElementById("step0-nav-btn");
          el?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 100);
      }
      return updated;
    });
  };

  const toggleCoverage = (id) => {
    setSelectedCoverage(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const toggleDeliverable = (id) => {
    setSelectedDeliverables(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  // Phone check on blur to warn about active bookings
  const checkPhoneNumber = async (num) => {
    if (!num || num.length < 8) {
      setPhoneWarning("");
      return;
    }
    setPhoneChecking(true);
    try {
      const res = await fetch(`${API_BASE}/api/public/check-phone?phone=${encodeURIComponent(num)}`);
      const resData = await res.json();
      if (resData.data && resData.data.exists) {
        setPhoneWarning("You already have a wedding project or request with this phone number. Submitting will register another inquiry.");
      } else {
        setPhoneWarning("");
      }
    } catch (err) {
      console.warn("Failed to cross-verify phone details:", err);
    }
    setPhoneChecking(false);
  };

  // Form validations & submission
  const submitEnquiry = async () => {
    // Basic validation
    const tempErrors = {};
    if (!name.trim()) tempErrors.name = "Full name is required";
    if (!phone.trim()) {
      tempErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-]{8,15}$/.test(phone.trim())) {
      tempErrors.phone = "Provide a valid phone number (8-15 digits)";
    }
    if (!email.trim()) {
      tempErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      tempErrors.email = "Provide a valid email address";
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const compiledEvents = selectedEvents.map(id => {
      const type = config.eventTypes.find(e => e.id === id);
      return {
        id,
        name: type.name,
        date: eventDetails[id]?.date || "",
        venue: eventDetails[id]?.venue || ""
      };
    });

    const multipliers = getCoverageMultipliers();
    const coveragePayload = selectedCoverage.map(id => {
      const option = config.coverage.find(c => c.id === id);
      const unitPrice = option.price;
      const count = coverageCounts[id] || 1;
      const eventCount = multipliers[id] || 1;
      return {
        id,
        name: option.name,
        unitPrice,
        count,
        eventCount,
        lineTotal: unitPrice * count * eventCount
      };
    });

    const deliverablesPayload = selectedDeliverables.map(id => {
      const option = config.deliverables.find(d => d.id === id);
      return {
        id,
        name: option.name,
        price: option.price
      };
    });

    const body = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      message: message.trim(),
      events: compiledEvents,
      otherEventsText: isOtherSelected ? otherEventsText.trim() : "",
      guestCount: guestCount.trim(),
      selectedCoverage: coveragePayload,
      selectedDeliverables: deliverablesPayload,
      totalPrice: calculateGrandTotal()
    };

    try {
      const res = await fetch(`${API_BASE}/api/public/package-enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const resData = await res.json();
      if (resData.success) {
        setSubmissionResult({
          invoice: resData.invoice,
          bookingId: resData.bookingId,
          totalPrice: calculateGrandTotal()
        });
      } else {
        setErrors({ submit: resData.message || "Submission failed. Please try again." });
      }
    } catch (err) {
      setErrors({ submit: "A connection issue occurred. Please check your internet and retry." });
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <Loader2 className="h-9 w-9 animate-spin text-[#d1a852]" />
          <span className="text-xs uppercase tracking-widest font-bold">Synchronizing Config...</span>
        </div>
      </div>
    );
  }

  // Success view
  if (submissionResult) {
    return (
      <div ref={pageTopRef} className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 py-24 text-white">
        <SEO 
          title="Custom Package Confirmed"
          description="Your bespoke wedding packages calculator request has been locked. Our team will verify and get back shortly."
        />
        
        <div className="text-center max-w-lg space-y-7 bg-[#16161a] border border-white/5 p-8 md:p-12 rounded-[32px] shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
          <div className="w-20 h-20 rounded-full bg-[#d1a852]/10 flex items-center justify-center mx-auto border border-[#d1a852]/20">
            <Check className="h-10 w-10 text-[#d1a852] stroke-[2.5]" />
          </div>
          
          <div className="space-y-2.5">
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl sm:text-4xl text-white font-light tracking-tight">
              Bespoke Package Received!
            </h2>
            <p className="text-zinc-400 text-sm font-light leading-relaxed max-w-md mx-auto">
              Thank you, <strong className="text-white font-medium">{name}</strong>. We've logged your requirements as a pending booking under reference <code className="text-[#d1a852] font-semibold">{submissionResult.invoice}</code>.
            </p>
          </div>

          <div className="bg-[#121215] rounded-2xl p-5 border border-white/5 text-left">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Estimated Bespoke Pricing</p>
            <p className="text-3xl font-extrabold text-[#d1a852]">{formatPrice(submissionResult.totalPrice)}</p>
            <span className="text-[9px] text-zinc-500 font-light block mt-1">Our customer service representatives will contact you within 24 hours to confirm date availability and Lock the details.</span>
          </div>

          <div className="pt-2">
            <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-zinc-400 hover:text-white transition-colors border border-white/10 px-8 py-3.5 rounded-full hover:bg-white/5">
              <ArrowLeft className="h-3.5 w-3.5" /> Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Option lists categorised
  const categoriseOptions = (items) => {
    const categories = {};
    items.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });
    return categories;
  };

  const coverageCats = categoriseOptions(config.coverage);
  const deliverableCats = categoriseOptions(config.deliverables);

  const recommendedCoverageIds = getRecommendedCoverageIds();
  const recommendedDeliverableIds = selectedTier ? config.tiers.find(t => t.id === selectedTier)?.deliverableIds || [] : [];
  const coverageMultipliers = getCoverageMultipliers();

  // Helper color map for tiers
  const tierColorMap = {
    silver: {
      border: selectedTier === 4 ? "border-zinc-400 bg-zinc-400/5" : "border-white/5 bg-[#16161a]/60 hover:border-zinc-700",
      text: "text-zinc-300",
      tagline: "text-zinc-500"
    },
    gold: {
      border: selectedTier === 5 ? "border-[#d1a852] bg-[#d1a852]/5" : "border-white/5 bg-[#16161a]/60 hover:border-zinc-700",
      text: "text-[#d1a852]",
      tagline: "text-zinc-400"
    },
    platinum: {
      border: selectedTier === 6 ? "border-purple-400 bg-purple-400/5" : "border-white/5 bg-[#16161a]/60 hover:border-zinc-700",
      text: "text-purple-300",
      tagline: "text-zinc-400"
    }
  };

  return (
    <div ref={pageTopRef} className="bg-zinc-950 text-white min-h-screen pt-28 pb-24 px-4 sm:px-6 select-none relative overflow-hidden">
      <SEO 
        title="Custom Package Builder | Bespoke Pricing Calculator"
        description="Design your dream wedding photography & cinematography collection. Fully customisable - choose your events, crew setup, albums, and video options in Kochi, Trivandrum, Kerala."
      />

      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#d1a852]/5 rounded-full blur-[140px] pointer-events-none -mr-48 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-red-950/5 rounded-full blur-[140px] pointer-events-none -ml-48 -mb-20"></div>

      <div className="max-w-2xl mx-auto space-y-12 relative z-10">
        
        {/* Top Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#d1a852]"></span>
            <span className="text-[10px] text-[#d1a852] uppercase tracking-[0.35em] font-bold">Dreamwed Stories</span>
            <span className="h-px w-8 bg-[#d1a852]"></span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl sm:text-5xl text-white font-light tracking-tight leading-none">
            Bespoke <span className="italic font-serif text-[#d1a852]">Package Builder</span>
          </h1>
          <p className="text-zinc-400 text-sm font-light leading-relaxed max-w-md mx-auto">
            Specify your wedding requirements and build a tailored photography/film package with real-time estimates.
          </p>
        </div>

        {/* Step Indicator Tracker */}
        <div className="flex items-center justify-between pt-2">
          {STEPS.map((step, idx) => (
            <div key={idx} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  idx < currentStep 
                    ? "bg-[#d1a852] text-black" 
                    : idx === currentStep 
                      ? "bg-[#d1a852] text-black ring-4 ring-[#d1a852]/20 font-black" 
                      : "bg-[#1c1c24] text-zinc-500"
                }`}>
                  {idx < currentStep ? <Check className="h-4.5 w-4.5 stroke-[2.5]" /> : idx + 1}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider hidden sm:block ${
                  idx === currentStep ? "text-[#d1a852]" : "text-zinc-600"
                }`}>
                  {step}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-grow h-[1px] mx-3 ${
                  idx < currentStep ? "bg-[#d1a852]" : "bg-white/5"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* STEP 0: SELECT EVENTS */}
        {currentStep === 0 && (
          <div className="space-y-7">
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-white tracking-wide">Which celebrations do we cover?</h2>
              <p className="text-zinc-500 text-xs font-light">Select all the wedding events that will require our coverage crew.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {config.eventTypes.map((evt) => {
                const isSelected = selectedEvents.includes(evt.id);
                return (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => toggleEventSelection(evt.id)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-300 ${
                      isSelected
                        ? "border-[#d1a852] bg-[#d1a852]/5"
                        : "border-white/5 bg-[#16161a]/60 hover:border-white/10 hover:bg-[#16161a]"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? "bg-[#d1a852]/20 text-[#d1a852]" : "bg-zinc-800 text-zinc-400"
                    }`}>
                      <EventIcon name={evt.icon} className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white tracking-wide">{evt.name}</p>
                      <p className="text-[10px] text-zinc-500 mt-1 leading-snug line-clamp-1">{evt.description}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#d1a852] flex items-center justify-center text-black shrink-0">
                        <Check className="h-3 w-3 stroke-[2.5]" />
                      </div>
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setIsOtherSelected(!isOtherSelected)}
                className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-300 ${
                  isOtherSelected
                    ? "border-[#d1a852] bg-[#d1a852]/5"
                    : "border-white/5 bg-[#16161a]/60 hover:border-white/10 hover:bg-[#16161a]"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isOtherSelected ? "bg-[#d1a852]/20 text-[#d1a852]" : "bg-zinc-800 text-zinc-400"
                }`}>
                  <Settings2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white tracking-wide">Other Ceremonies</p>
                  <p className="text-[10px] text-zinc-500 mt-1 leading-snug line-clamp-1">Baptism, Music Night, Sangeet, Mehendi, family dinner</p>
                </div>
                {isOtherSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#d1a852] flex items-center justify-center text-black shrink-0">
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  </div>
                )}
              </button>
            </div>

            {isOtherSelected && (
              <div className="rounded-2xl border border-white/5 bg-[#121215] p-5 space-y-2.5">
                <label className="text-[10px] text-[#d1a852] font-bold uppercase tracking-wider">Describe your other functions</label>
                <textarea
                  value={otherEventsText}
                  onChange={(e) => setOtherEventsText(e.target.value)}
                  rows={3}
                  placeholder="e.g. Haldi ceremony on Dec 17th at home, Sangeet ceremony on Dec 16th evening at Ramada Resort..."
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-zinc-700 text-xs focus:outline-none focus:border-[#d1a852]/50 resize-none transition-colors"
                />
              </div>
            )}

            <div id="step0-nav-btn" className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                disabled={selectedEvents.length === 0 && (!isOtherSelected || !otherEventsText.trim())}
                className="flex items-center gap-2 bg-[#d1a852] text-black px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#b4975a] transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Event Details <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: EVENT DETAILS (DATES & VENUES) */}
        {currentStep === 1 && (
          <div className="space-y-7">
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-white tracking-wide">Enter timeline & location details</h2>
              <p className="text-zinc-500 text-xs font-light">Input scheduled dates and venues for selected events to check photographer availability.</p>
            </div>

            <div className="space-y-4">
              {selectedEvents.map((evtId) => {
                const event = config.eventTypes.find(e => e.id === evtId);
                return (
                  <EventDetailCard
                    key={evtId}
                    event={event}
                    dateVal={eventDetails[evtId]?.date || ""}
                    venueVal={eventDetails[evtId]?.venue || ""}
                    onDateChange={(val) => setEventDetails(prev => ({
                      ...prev,
                      [evtId]: { ...prev[evtId], date: val }
                    }))}
                    onVenueChange={(val) => setEventDetails(prev => ({
                      ...prev,
                      [evtId]: { ...prev[evtId], venue: val }
                    }))}
                  />
                );
              })}

              {isOtherSelected && otherEventsText.trim() && (
                <div className="bg-[#16161a] border border-[#d1a852]/20 rounded-2xl p-5 md:p-6 space-y-3">
                  <div className="flex items-center gap-2.5 border-b border-white/5 pb-2">
                    <Settings2 className="h-4.5 w-4.5 text-[#d1a852]" />
                    <h4 className="text-xs font-bold text-white tracking-wide uppercase">Other Custom Celebrations</h4>
                  </div>
                  <p className="text-xs text-zinc-400 font-light leading-relaxed whitespace-pre-line bg-zinc-950/40 p-3 rounded-xl border border-white/5">
                    {otherEventsText}
                  </p>
                  <button 
                    type="button" 
                    onClick={() => setCurrentStep(0)}
                    className="text-[10px] text-[#d1a852]/75 hover:text-[#d1a852] transition-colors underline underline-offset-4"
                  >
                    Edit custom text
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs text-zinc-300 font-bold uppercase tracking-wider block">Approximate Guest Count</label>
              <input
                type="text"
                placeholder="e.g. 300 - 500 guests"
                value={guestCount}
                onChange={e => setGuestCount(e.target.value)}
                className="w-full bg-[#16161a] border border-white/5 rounded-xl px-4 py-3 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-[#d1a852]/50 transition-colors"
              />
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(0)}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white uppercase tracking-widest font-bold transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              
              <button
                type="button"
                onClick={() => {
                  // If no package has been selected yet, assign intermediate gold package defaults
                  if (!selectedTier) {
                    const midIndex = Math.floor(config.tiers.length / 2);
                    handleTierSelect(config.tiers[midIndex]);
                  }
                  setCurrentStep(2);
                }}
                className="flex items-center gap-2 bg-[#d1a852] text-black px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#b4975a] transition-all hover:scale-105"
              >
                Select Tier <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SELECT TIER */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-white tracking-wide">Choose starting package tier</h2>
              <p className="text-zinc-500 text-xs font-light">Select a base framework for standard deliverables. Everything remains customizable after.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {config.tiers.map((tier) => {
                const isSelected = selectedTier === tier.id;
                const styleObj = tierColorMap[tier.color] || tierColorMap.gold;
                
                // Calculate estimated base cost (sum of event-covered options + deliverables in tier)
                const baseCrewCosts = {};
                selectedEvents.forEach(evtId => {
                  const items = tier.eventCoverageMap[String(evtId)] || config.eventTypes.find(e => e.id === evtId)?.minimumCoverage.map(c => c.coverageOptionId) || [];
                  items.forEach(id => {
                    baseCrewCosts[id] = (baseCrewCosts[id] || 0) + 1;
                  });
                });
                tier.coverageIds.forEach(id => {
                  if (!baseCrewCosts[id]) baseCrewCosts[id] = 1;
                });

                const crewPriceSum = Object.keys(baseCrewCosts).reduce((sum, keyId) => {
                  const item = config.coverage.find(c => c.id === Number(keyId));
                  return sum + (item ? item.price * baseCrewCosts[keyId] : 0);
                }, 0);

                const deliverablesPriceSum = tier.deliverableIds.reduce((sum, delId) => {
                  const item = config.deliverables.find(d => d.id === delId);
                  if (!item) return sum;
                  const mult = item.scope === "PER_EVENT" ? Math.max(1, selectedEvents.length) : 1;
                  return sum + (item.price * mult);
                }, 0);

                const estTierPrice = crewPriceSum + deliverablesPriceSum;

                return (
                  <div key={tier.id} className="relative">
                    {tier.badge && (
                      <div className="absolute -top-3 inset-x-0 flex justify-center z-10">
                        <span className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-[#d1a852] text-black text-[9px] font-black px-3.5 py-0.5 rounded-full shadow-lg tracking-wider uppercase select-none">
                          <Sparkles className="h-2.5 w-2.5" /> {tier.badge}
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleTierSelect(tier)}
                      className={`w-full flex flex-col text-left rounded-2xl border p-5 transition-all duration-300 ${
                        tier.badge ? "pt-6" : ""
                      } ${styleObj.border} relative`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#d1a852] flex items-center justify-center text-black">
                          <Check className="h-3 w-3 stroke-[2.5]" />
                        </div>
                      )}

                      <h4 className="text-sm font-bold text-white tracking-wide">{tier.name}</h4>
                      <p className={`text-[10px] ${styleObj.tagline} mt-1 leading-snug h-8 overflow-hidden`}>
                        {tier.tagline}
                      </p>
                      
                      <div className="mt-4 pt-3 border-t border-white/5 w-full">
                        <p className="text-xl font-extrabold text-[#d1a852] tracking-tight">
                          {formatPrice(estTierPrice)}
                        </p>
                        <p className="text-[9px] text-zinc-500 mt-0.5">Est. Base Price</p>
                      </div>

                      <div className="mt-4 space-y-1.5 w-full text-[10px] text-zinc-400">
                        <span className="block text-zinc-500 font-bold uppercase tracking-wider text-[8px]">Key Inclusions:</span>
                        {tier.coverageIds.slice(0, 3).map((covId) => {
                          const item = config.coverage.find(c => c.id === covId);
                          return item ? (
                            <div key={covId} className="flex items-center gap-1.5 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#d1a852]" />
                              <span>{item.name}</span>
                            </div>
                          ) : null;
                        })}
                        {tier.deliverableIds.slice(0, 3).map((delId) => {
                          const item = config.deliverables.find(d => d.id === delId);
                          return item ? (
                            <div key={delId} className="flex items-center gap-1.5 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                              <span>{item.name}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            {selectedTier && (
              <div className="bg-[#16161a] border border-[#d1a852]/20 rounded-2xl p-5 md:p-6 space-y-4">
                <p className="text-xs text-zinc-300 font-semibold uppercase tracking-wider">
                  Tier Coverage breakdown:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {selectedEvents.map(evtId => {
                    const evt = config.eventTypes.find(e => e.id === evtId);
                    const tier = config.tiers.find(t => t.id === selectedTier);
                    const specificCoverages = tier.eventCoverageMap[String(evtId)] || evt.minimumCoverage.map(c => c.coverageOptionId);
                    const items = config.coverage.filter(c => specificCoverages.includes(c.id));
                    
                    return (
                      <div key={evtId} className="bg-[#121215] border border-white/5 p-4 rounded-xl space-y-2.5">
                        <div className="flex items-center gap-2">
                          <EventIcon name={evt.icon} className="h-3.5 w-3.5 text-[#d1a852]" />
                          <span className="text-xs font-bold text-white">{evt.name}</span>
                        </div>
                        <div className="space-y-1">
                          {items.map(item => (
                            <div key={item.id} className="flex items-center gap-1 text-[10px] text-zinc-400">
                              <Check className="h-3 w-3 text-[#d1a852]" />
                              <span>{item.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-[#d1a852]/10 border border-[#d1a852]/20 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5">Real-time Package Estimate</p>
                <p className="text-3xl font-extrabold text-[#d1a852]">{formatPrice(calculateGrandTotal())}</p>
              </div>
              <div className="text-right hidden sm:block text-xs text-zinc-400">
                <p>{selectedCoverage.length} crew elements</p>
                <p>{selectedDeliverables.length} delivery items</p>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white uppercase tracking-widest font-bold transition-colors focus:outline-none"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              
              <button
                id="tier-confirm-btn"
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 bg-[#d1a852] text-black px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#b4975a] transition-all hover:scale-105"
              >
                Refine options <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CUSTOMIZE DETAILED OPTIONS */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-white tracking-wide">Refine crew & deliverables</h2>
              <p className="text-zinc-500 text-xs font-light">Customise the exact number of shooters, drones, albums, and video reels to suit your style.</p>
            </div>

            <div className="bg-[#16161a] border border-white/5 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5">Calculated Estimate So Far</p>
                <p className="text-2xl font-extrabold text-[#d1a852]">{formatPrice(calculateGrandTotal())}</p>
              </div>
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full font-bold">
                {selectedCoverage.length + selectedDeliverables.length} items added
              </span>
            </div>

            {/* Accords for custom crew shooters */}
            <div className="space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-extrabold block">1. Photographic & Videography Crew:</span>
                
                {Object.entries(coverageCats).map(([catName, options]) => (
                  <div key={catName} className="space-y-2">
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider pl-1">{catName}</span>
                    <div className="space-y-2.5">
                      {options.map((opt) => (
                        <OptionCard
                          key={opt.id}
                          name={opt.name}
                          description={opt.description}
                          price={opt.price}
                          selected={selectedCoverage.includes(opt.id)}
                          required={recommendedCoverageIds.includes(opt.id)}
                          count={coverageCounts[opt.id] || 1}
                          onToggle={() => toggleCoverage(opt.id)}
                          onCountChange={(val) => setCoverageCounts(prev => ({ ...prev, [opt.id]: val }))}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Accords for deliverables */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-extrabold block">2. Album & Film Deliverables:</span>
                
                {Object.entries(deliverableCats).map(([catName, options]) => (
                  <div key={catName} className="space-y-2">
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider pl-1">{catName}</span>
                    <div className="space-y-2.5">
                      {options.map((opt) => (
                        <OptionCard
                          key={opt.id}
                          name={opt.name}
                          description={opt.description}
                          price={opt.price}
                          selected={selectedDeliverables.includes(opt.id)}
                          required={recommendedDeliverableIds.includes(opt.id)}
                          compact={true}
                          onToggle={() => toggleDeliverable(opt.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#121215] border border-white/5 rounded-2xl p-5 flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-semibold">Updated estimated sum</span>
              <span className="text-lg font-black text-[#d1a852]">{formatPrice(calculateGrandTotal())}</span>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white uppercase tracking-widest font-bold transition-colors focus:outline-none"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="flex items-center gap-2 bg-[#d1a852] text-black px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#b4975a] transition-all hover:scale-105"
              >
                Summary & Quote <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUMMARY & FORM SUBMISSION */}
        {currentStep === 4 && (
          <div className="space-y-8">
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-white tracking-wide">Review & lock bespoke quotation</h2>
              <p className="text-zinc-500 text-xs font-light">Confirm your wedding schedule and selected assets, and submit to finalize booking.</p>
            </div>

            {/* Estimated Total Card */}
            <div className="bg-gradient-to-br from-[#d1a852]/10 to-transparent border border-[#d1a852]/20 rounded-2xl p-6 text-center space-y-1.5">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Estimated Grand Total</p>
              <p className="text-4xl md:text-5xl font-black text-[#d1a852] tracking-tight">{formatPrice(calculateGrandTotal())}</p>
              <p className="text-[10px] text-zinc-500 font-light">Confirmations on final custom pricing will be completed over phone consultation.</p>
            </div>

            {/* Receipt Summary Itemization */}
            <div className="bg-[#16161a] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-[#1a1a20]">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <Receipt className="h-4.5 w-4.5 text-[#d1a852]" />
                  <span>Your Selected Assets Summary</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-[10px] text-[#d1a852] hover:text-[#b4975a] transition-colors font-bold uppercase tracking-wider"
                >
                  Edit
                </button>
              </div>

              <div className="divide-y divide-white/5 max-h-72 overflow-y-auto scrollbar-thin">
                {/* Events list */}
                {selectedEvents.map(evtId => {
                  const evt = config.eventTypes.find(e => e.id === evtId);
                  const dt = eventDetails[evtId]?.date || "Date: TBD";
                  const vn = eventDetails[evtId]?.venue || "Venue: TBD";
                  return (
                    <div key={evtId} className="flex items-start gap-3 px-5 py-3.5 bg-zinc-950/20">
                      <div className="w-6.5 h-6.5 rounded bg-[#d1a852]/10 flex items-center justify-center shrink-0 mt-0.5 text-[#d1a852]">
                        <EventIcon name={evt.icon} className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-white block">{evt.name}</span>
                        <span className="text-[10px] text-zinc-500 truncate block mt-0.5">{dt} | {vn}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Coverages list */}
                {selectedCoverage.map(covId => {
                  const item = config.coverage.find(c => c.id === covId);
                  const count = coverageCounts[covId] || 1;
                  const mult = coverageMultipliers[covId] || 1;
                  const price = item.price * count * mult;
                  return (
                    <div key={covId} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Check className="h-3.5 w-3.5 text-[#d1a852] shrink-0" />
                        <span className="text-xs text-zinc-300 truncate">{item.name}</span>
                        {count > 1 && (
                          <span className="text-[9px] bg-[#d1a852]/10 text-[#d1a852] px-1.5 py-0.5 rounded-full font-bold">
                            x{count}
                          </span>
                        )}
                        {mult > 1 && (
                          <span className="text-[9px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-full font-bold">
                            {mult} events
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-white shrink-0 ml-4">{formatPrice(price)}</span>
                    </div>
                  );
                })}

                {/* Deliverables list */}
                {selectedDeliverables.map(delId => {
                  const item = config.deliverables.find(d => d.id === delId);
                  const mult = item.scope === "PER_EVENT" ? Math.max(1, selectedEvents.length) : 1;
                  const price = item.price * mult;
                  return (
                    <div key={delId} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Check className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                        <span className="text-xs text-zinc-300 truncate">{item.name}</span>
                        {mult > 1 && (
                          <span className="text-[9px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-full font-bold">
                            x{mult} events
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-white shrink-0 ml-4">{formatPrice(price)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Subtotals footer */}
              <div className="bg-[#121215] px-5 py-3.5 border-t border-white/5 flex justify-between items-center text-xs">
                <span className="text-zinc-500">Subtotal breakups</span>
                <div className="flex gap-4 font-semibold">
                  <span className="text-zinc-400">Crew: {formatPrice(calculateCoverageTotal())}</span>
                  <span className="text-zinc-400">Items: {formatPrice(calculateDeliverablesTotal())}</span>
                </div>
              </div>
            </div>

            {/* Contact Form Details */}
            <div className="bg-[#16161a] border border-white/5 rounded-2xl p-5 md:p-6 space-y-4">
              <div className="border-b border-white/5 pb-2.5 flex items-center gap-2">
                <Send className="h-4.5 w-4.5 text-[#d1a852]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Your Contact Details</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Anandha Krishnan"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-[#1c1c22] border border-white/5 rounded-xl px-4 py-3 text-white placeholder-zinc-700 text-xs focus:outline-none focus:border-[#d1a852]/50 transition-colors"
                    />
                    {errors.name && <p className="text-[10px] text-red-400">{errors.name}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 94462 88811"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      onBlur={() => checkPhoneNumber(phone)}
                      className="w-full bg-[#1c1c22] border border-white/5 rounded-xl px-4 py-3 text-white placeholder-zinc-700 text-xs focus:outline-none focus:border-[#d1a852]/50 transition-colors"
                    />
                    {phoneChecking && <span className="text-[9px] text-zinc-500">Verifying phone context...</span>}
                    {phoneWarning && <p className="text-[10px] text-amber-400 leading-snug">{phoneWarning}</p>}
                    {errors.phone && <p className="text-[10px] text-red-400">{errors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">Email Address *</label>
                  <input
                    type="email"
                    placeholder="e.g. anandhu@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#1c1c22] border border-white/5 rounded-xl px-4 py-3 text-white placeholder-zinc-700 text-xs focus:outline-none focus:border-[#d1a852]/50 transition-colors"
                  />
                  {errors.email && <p className="text-[10px] text-red-400">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">Message or Special requests</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Describe any special details, location preferences, additional functions or design inputs..."
                    className="w-full bg-[#1c1c22] border border-white/5 rounded-xl px-4 py-3 text-white placeholder-zinc-700 text-xs focus:outline-none focus:border-[#d1a852]/50 resize-none transition-colors"
                  />
                </div>
              </div>

              {errors.submit && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl">
                  {errors.submit}
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white uppercase tracking-widest font-bold transition-colors focus:outline-none"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              
              <button
                type="button"
                onClick={submitEnquiry}
                disabled={submitting}
                className="flex items-center gap-2 bg-[#d1a852] text-black px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#b4975a] transition-all hover:scale-105 shadow-[0_0_25px_rgba(209,168,82,0.3)] disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing Request...
                  </>
                ) : (
                  <>
                    Confirm Quote & Request <Send className="h-3.5 w-3.5 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
