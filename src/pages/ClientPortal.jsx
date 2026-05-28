import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, Calendar, MapPin, Search, Download, CheckCircle, 
  Clock, AlertCircle, X, Printer, Mail, Gift, Heart, BookOpen, 
  Video, MessageSquare, Send, ArrowRight, ArrowDownCircle 
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import SEO from "../components/SEO";

const ClientPortal = () => {
  const [phoneQuery, setPhoneQuery] = useState("");
  const [project, setProject] = useState(null);
  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, loading, success, error, not_found
  const [errorMessage, setErrorMessage] = useState("");
  
  // Interactive workspace states
  const [activeTab, setActiveTab] = useState("gallery"); // gallery, approval, chat, invoice
  const [activeChatChannel, setActiveChatChannel] = useState("client-admin"); // client-admin, client-editor, client-designer
  const [chatMessages, setChatMessages] = useState([]);
  const [newMsgText, setNewMsgText] = useState("");
  const [galleryFilter, setGalleryFilter] = useState("all");
  const [isInvoicePrintOpen, setIsInvoicePrintOpen] = useState(false);
  const [photoComments, setPhotoComments] = useState({}); // photoId -> comment text
  const [activeCommentPhotoId, setActiveCommentPhotoId] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const chatInterval = useRef(null);

  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    if (!phoneQuery.trim()) return;

    if (status !== "success") setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/client/project?phone=${encodeURIComponent(phoneQuery.trim())}`);
      
      if (res.status === 404) {
        setStatus("not_found");
        return;
      }
      
      if (!res.ok) {
        throw new Error("Unable to contact backend server");
      }

      const data = await res.json();
      setProject(data.project);
      setBooking(data.booking);
      setStatus("success");
    } catch (err) {
      console.error("Lookup error:", err);
      setStatus("error");
      setErrorMessage("Could not connect to the booking server. Please verify your phone number and try again.");
    }
  };

  // Poll chats when client is on chat tab
  useEffect(() => {
    if (status === "success" && project && activeTab === "chat") {
      loadChatMessages();
      chatInterval.current = setInterval(loadChatMessages, 5000);
    } else {
      if (chatInterval.current) clearInterval(chatInterval.current);
    }
    return () => {
      if (chatInterval.current) clearInterval(chatInterval.current);
    };
  }, [status, project, activeTab, activeChatChannel]);

  const loadChatMessages = async () => {
    if (!project) return;
    try {
      const res = await fetch(`${API_BASE}/api/projects/${project.id}/chats/${activeChatChannel}`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
      }
    } catch (e) {
      console.log("Chat fetch error ignored");
    }
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!newMsgText.trim() || !project) return;

    try {
      const res = await fetch(`${API_BASE}/api/projects/${project.id}/chats/${activeChatChannel}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "client", text: newMsgText.trim() })
      });
      if (res.ok) {
        setNewMsgText("");
        const data = await res.json();
        setChatMessages(data);
        // Refresh project list and activities
        handleLookup();
      }
    } catch (err) {
      console.error("Send message error", err);
    }
  };

  // PHOTO SELECTION CONTROLLERS
  const togglePhotoFavorite = async (photoId) => {
    if (!project) return;
    const gallery = project.gallery_images.map(img => {
      if (img.id === photoId) {
        return { ...img, favorited: !img.favorited };
      }
      return img;
    });
    updateProjectGallery(gallery);
  };

  const togglePhotoCategory = async (photoId, cat) => {
    if (!project) return;
    const gallery = project.gallery_images.map(img => {
      if (img.id === photoId) {
        const cats = img.categories || [];
        if (cats.includes(cat)) {
          return { ...img, categories: cats.filter(c => c !== cat) };
        } else {
          return { ...img, categories: [...cats, cat] };
        }
      }
      return img;
    });
    updateProjectGallery(gallery);
  };

  const savePhotoComment = async (photoId, commentText) => {
    if (!project) return;
    const gallery = project.gallery_images.map(img => {
      if (img.id === photoId) {
        return { ...img, comment: commentText };
      }
      return img;
    });
    updateProjectGallery(gallery);
    setActiveCommentPhotoId(null);
  };

  const updateProjectGallery = async (galleryImages) => {
    try {
      const res = await fetch(`${API_BASE}/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gallery_images: galleryImages })
      });
      if (res.ok) {
        const updated = await res.json();
        setProject(updated);
      }
    } catch (e) {
      console.error("Gallery update error", e);
    }
  };

  const submitPhotoSelectionLock = async () => {
    if (!project) return;
    
    // Change timeline step to completed (Step 2: Client Selected Photos)
    const steps = [...project.timeline_steps];
    steps[1].completed = true;
    steps[1].updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const payload = {
      current_step: 3, // Move to step 3 (Video Editing)
      timeline_steps: steps
    };

    try {
      const res = await fetch(`${API_BASE}/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        setProject(updated);
        
        // Log custom activity on server
        await fetch(`${API_BASE}/api/projects/${project.id}/logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: "Client", action: "Locked photo selection folders and submitted to Album Designer" })
        });
        
        alert("📖 Selection locked successfully! Our Album Designer is now notified.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ASSET APPROVAL SYSTEMS
  const handleAssetApproval = async (type, statusValue) => {
    if (!project) return;
    
    const deliveries = { ...project.deliveries };
    let logMsg = "";
    let nextStepIndex = project.current_step;

    if (type === "video") {
      deliveries.video_status = statusValue;
      logMsg = statusValue === "approved" 
        ? "Approved draft cinematic teaser video" 
        : "Requested corrections for cinematic video teaser";
        
      if (statusValue === "approved") {
        // Mark Step 3 complete
        project.timeline_steps[2].completed = true;
        project.timeline_steps[2].updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
        nextStepIndex = 4; // Album Design
      }
    } else if (type === "album") {
      deliveries.album_status = statusValue;
      logMsg = statusValue === "approved" 
        ? "Approved layflat album draft layout design" 
        : "Requested corrections for album layout design pages";
        
      if (statusValue === "approved") {
        // Mark Step 4 complete
        project.timeline_steps[3].completed = true;
        project.timeline_steps[3].updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
        nextStepIndex = 5; // Final Delivery
      }
    }

    const payload = {
      deliveries,
      current_step: nextStepIndex,
      timeline_steps: project.timeline_steps
    };

    try {
      const res = await fetch(`${API_BASE}/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        setProject(updated);
        
        await fetch(`${API_BASE}/api/projects/${project.id}/logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: "Client", action: logMsg })
        });

        alert(`✅ Draft status updated: ${statusValue.toUpperCase()}`);
        if (statusValue === "changes_requested") {
          setActiveTab("chat");
          setActiveChatChannel(type === "video" ? "client-editor" : "client-designer");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getFilteredPhotos = () => {
    if (!project) return [];
    let photos = project.gallery_images || [];
    if (galleryFilter === "album") {
      return photos.filter(img => img.categories && img.categories.includes("album"));
    }
    if (galleryFilter === "reel") {
      return photos.filter(img => img.categories && img.categories.includes("reel"));
    }
    if (galleryFilter === "fav") {
      return photos.filter(img => img.favorited);
    }
    return photos;
  };

  // CURRENCY & FORMATS
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const normalized = dateStr.includes("T") ? dateStr : dateStr.replace(" ", "T") + "Z";
    return new Date(normalized).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateString = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).replace(/\//g, "-");
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] pt-28 pb-24 text-zinc-800 font-sans select-none overflow-x-hidden">
      <SEO 
        title="Luxury Workspace & Client Portal | Dreamwed Stories"
        description="Interact with your premium wedding project timeline, favorite layflat album selections, comment on retouches, and download finalized high-res wedding files."
      />

      <div className="max-w-6xl mx-auto px-6 space-y-12">
        
        {/* Lookup / Search Bar if not loaded */}
        {status !== "success" ? (
          <div className="max-w-md mx-auto space-y-10 py-10">
            <div className="text-center space-y-3">
              <span className="text-[#b4975a] text-xs font-semibold tracking-[0.25em] uppercase block">Dreamwed Stories</span>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl sm:text-5xl text-zinc-900 font-light tracking-tight">
                Client <span className="italic font-serif text-[#b4975a]">Workspace</span>
              </h1>
              <p className="text-zinc-500 text-xs sm:text-sm font-light leading-relaxed max-w-sm mx-auto">
                Access your luxury wedding project timeline, select layflat album photos, chat with retouches, and download final deliveries.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200 shadow-[0_15px_40px_rgba(0,0,0,0.02)] space-y-6">
              <form onSubmit={handleLookup} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase">Registered Phone Number</label>
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
                  {status === "loading" ? "Entering Workspace..." : "Access My Workspace"}
                </button>
              </form>

              <AnimatePresence mode="wait">
                {status === "not_found" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-2xl text-xs space-y-3"
                  >
                    <div className="flex items-center gap-2 font-bold text-amber-900">
                      <AlertCircle size={16} className="shrink-0 text-amber-600" />
                      <span>Workspace Not Active</span>
                    </div>
                    <p className="font-light leading-relaxed">
                      We couldn't locate a wedding project linked to <strong>{phoneQuery}</strong>. Contact our coordinator to instantly activate your portal.
                    </p>
                  </motion.div>
                )}
                {status === "error" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-2xl text-xs"
                  >
                    {errorMessage}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          
          // SUCCESS STATE: LUXURY WORKSPACE
          <div className="space-y-10">
            
            {/* Header Welcome Board */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>Live Wedding Workspace</span>
                </div>
                <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl sm:text-4xl text-zinc-900 font-light tracking-tight">
                  {project.couple_name}'s <span className="italic font-serif text-[#b4975a]">Celebration</span>
                </h1>
                <p className="text-zinc-500 text-xs font-light flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#b4975a]" /> {formatDateString(project.wedding_date)}
                  <span className="text-zinc-300">|</span>
                  <MapPin size={13} className="text-[#b4975a] shrink-0" /> <span className="line-clamp-1">{project.event_venue}</span>
                </p>
              </div>

              {/* Topbar Tab Switches */}
              <div className="flex flex-wrap gap-2.5 bg-zinc-50 p-2 rounded-full border border-zinc-150 shrink-0">
                <button 
                  onClick={() => setActiveTab("gallery")}
                  className={`px-4.5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === "gallery" ? "bg-[#b4975a] text-zinc-950 shadow-md" : "text-zinc-500 hover:text-zinc-800"}`}
                >
                  📸 Select Photos
                </button>
                <button 
                  onClick={() => setActiveTab("approval")}
                  className={`px-4.5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === "approval" ? "bg-[#b4975a] text-zinc-950 shadow-md" : "text-zinc-500 hover:text-zinc-800"}`}
                >
                  📖 Draft Approvals
                </button>
                <button 
                  onClick={() => setActiveTab("chat")}
                  className={`px-4.5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === "chat" ? "bg-[#b4975a] text-zinc-950 shadow-md" : "text-zinc-500 hover:text-zinc-800"}`}
                >
                  💬 Chat Rooms
                </button>
                <button 
                  onClick={() => setActiveTab("invoice")}
                  className={`px-4.5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === "invoice" ? "bg-[#b4975a] text-zinc-950 shadow-md" : "text-zinc-500 hover:text-zinc-800"}`}
                >
                  📄 Invoice
                </button>
              </div>
            </div>

            {/* VISUAL WORKFLOW PROGRESS TIMELINE */}
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.02)] space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Wedding Project Timeline</span>
                <span className="text-xs font-semibold text-[#b4975a]">
                  Step {project.current_step} of {project.timeline_steps.length} • {Math.round((project.current_step / project.timeline_steps.length) * 100)}%
                </span>
              </div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4 relative pt-2">
                {/* Horizontal line background */}
                <div className="absolute top-[21px] left-8 right-8 h-0.5 bg-zinc-100 hidden md:block z-0"></div>
                
                {project.timeline_steps.map((step, idx) => {
                  const stepNum = idx + 1;
                  const isCompleted = step.completed || stepNum <= project.current_step;
                  const isCurrent = stepNum === project.current_step;
                  
                  return (
                    <div key={idx} className="flex md:flex-col items-center gap-4 md:gap-3 text-left md:text-center flex-1 relative z-10 w-full md:w-auto">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                        isCompleted 
                          ? "bg-[#b4975a] border-[#b4975a] text-zinc-950 shadow-lg shadow-amber-500/10" 
                          : isCurrent 
                          ? "bg-white border-[#b4975a] text-[#b4975a] ring-4 ring-[#b4975a]/10" 
                          : "bg-white border-zinc-200 text-zinc-400"
                      }`}>
                        {isCompleted ? "✓" : stepNum}
                      </div>
                      <div className="space-y-0.5">
                        <div className={`text-xs font-bold ${isCompleted || isCurrent ? "text-zinc-900" : "text-zinc-400"}`}>{step.name}</div>
                        {isCompleted && step.updated_at && (
                          <div className="text-[9px] text-zinc-400">{formatDateString(step.updated_at)}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TAB PANELS LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* PRIMARY CONTENT: LEFT 2 COLS */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* TAB 1: EASY SMART PHOTO SELECTION */}
                {activeTab === "gallery" && (
                  <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)] space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 pb-5">
                      <div>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-2xl text-zinc-900 font-light">
                          Select Your <span className="italic font-serif text-[#b4975a]">Wedding Albums</span>
                        </h2>
                        <p className="text-zinc-400 text-[11px] font-light mt-0.5">Filter by categories and heart your favorites.</p>
                      </div>

                      {/* Photo folders switch */}
                      <div className="flex gap-1 bg-zinc-50 p-1 rounded-lg border border-zinc-150">
                        <button 
                          onClick={() => setGalleryFilter("all")}
                          className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${galleryFilter === "all" ? "bg-white text-zinc-950 shadow-sm border border-zinc-200/50" : "text-zinc-500 hover:text-zinc-800"}`}
                        >
                          All
                        </button>
                        <button 
                          onClick={() => setGalleryFilter("album")}
                          className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${galleryFilter === "album" ? "bg-white text-zinc-950 shadow-sm border border-zinc-200/50" : "text-zinc-500 hover:text-zinc-800"}`}
                        >
                          📖 Album
                        </button>
                        <button 
                          onClick={() => setGalleryFilter("reel")}
                          className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${galleryFilter === "reel" ? "bg-white text-zinc-950 shadow-sm border border-zinc-200/50" : "text-zinc-500 hover:text-zinc-800"}`}
                        >
                          🎥 Reels
                        </button>
                        <button 
                          onClick={() => setGalleryFilter("fav")}
                          className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${galleryFilter === "fav" ? "bg-white text-zinc-950 shadow-sm border border-zinc-200/50" : "text-zinc-500 hover:text-zinc-800"}`}
                        >
                          ❤️ Favs
                        </button>
                      </div>
                    </div>

                    {/* Image Grid with full action features */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                      {getFilteredPhotos().map((img) => {
                        const inAlbum = img.categories && img.categories.includes("album");
                        const inReel = img.categories && img.categories.includes("reel");
                        
                        return (
                          <div key={img.id} className="group relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 aspect-square flex flex-col justify-end shadow-sm hover:shadow-md transition-all">
                            <img src={img.url} className="absolute inset-0 w-full h-full object-fit-cover transition-transform duration-300 group-hover:scale-105" />
                            
                            {/* Hover overlay triggers */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 z-10">
                              {/* Top row - Favorite and comment triggers */}
                              <div className="flex justify-between items-center">
                                <button 
                                  onClick={() => togglePhotoFavorite(img.id)}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer backdrop-blur-md border ${
                                    img.favorited 
                                      ? "bg-red-500 border-red-500 text-white" 
                                      : "bg-black/50 border-white/20 text-white"
                                  }`}
                                >
                                  <Heart size={14} className={img.favorited ? "fill-current" : ""} />
                                </button>
                                
                                <button 
                                  onClick={() => {
                                    setActiveCommentPhotoId(activeCommentPhotoId === img.id ? null : img.id);
                                    setPhotoComments({ ...photoComments, [img.id]: img.comment || "" });
                                  }}
                                  className={`w-8 h-8 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white transition-transform hover:scale-110 cursor-pointer backdrop-blur-md ${
                                    img.comment ? "bg-amber-500/80 border-amber-500 text-zinc-950 font-bold" : ""
                                  }`}
                                >
                                  <MessageSquare size={14} />
                                </button>
                              </div>

                              {/* Bottom row - Folder allocations */}
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => togglePhotoCategory(img.id, "album")}
                                  className={`flex-1 py-1.5 rounded text-[8px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                                    inAlbum 
                                      ? "bg-[#b4975a] border-[#b4975a] text-zinc-950" 
                                      : "bg-black/60 border-white/20 text-white hover:bg-black/80"
                                  }`}
                                >
                                  📖 Album
                                </button>
                                <button 
                                  onClick={() => togglePhotoCategory(img.id, "reel")}
                                  className={`flex-1 py-1.5 rounded text-[8px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                                    inReel 
                                      ? "bg-[#b4975a] border-[#b4975a] text-zinc-950" 
                                      : "bg-black/60 border-white/20 text-white hover:bg-black/80"
                                  }`}
                                >
                                  🎥 Reel
                                </button>
                              </div>
                            </div>

                            {/* Default permanent badges for unhovered visual states */}
                            <div className="absolute top-2.5 right-2.5 flex gap-1.5 z-0 group-hover:opacity-0 transition-opacity duration-200">
                              {img.favorited && <span className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">❤️</span>}
                              {inAlbum && <span className="bg-black/70 text-[#b4975a] px-2 py-0.5 rounded text-[8px] font-bold uppercase border border-zinc-800">📖 Album</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Inline comment drawer */}
                    <AnimatePresence>
                      {activeCommentPhotoId && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl space-y-3 mt-4"
                        >
                          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Add Retouching Instructions for Designer</label>
                          <textarea 
                            rows="2"
                            value={photoComments[activeCommentPhotoId] || ""}
                            onChange={(e) => setPhotoComments({ ...photoComments, [activeCommentPhotoId]: e.target.value })}
                            placeholder="e.g. 'Use this for album cover', 'Remove glare from background', 'Make this black and white'"
                            className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-zinc-800 text-xs focus:border-[#b4975a] focus:outline-none resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setActiveCommentPhotoId(null)}
                              className="px-3.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-500 text-xs font-semibold hover:border-zinc-300 transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => savePhotoComment(activeCommentPhotoId, photoComments[activeCommentPhotoId] || "")}
                              className="px-4 py-1.5 bg-zinc-950 hover:bg-black text-white text-xs font-bold rounded-lg shadow-sm"
                            >
                              Save Notes
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Photo selection counter & Submission CTA block */}
                    {project.current_step === 1 && (
                      <div className="bg-[#1a231b] border border-emerald-500/10 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                        <div className="text-xs text-zinc-300 space-y-1 text-center sm:text-left">
                          <strong className="text-white text-sm block">Submit Your Album Folders</strong>
                          <span>You have filtered and selected <strong>{project.gallery_images.filter(img => img.categories && img.categories.includes("album")).length}</strong> layout photos. Ready to notify designer?</span>
                        </div>
                        <button 
                          onClick={submitPhotoSelectionLock}
                          className="px-6 py-3 bg-[#b4975a] hover:bg-[#c5a86b] text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shrink-0 cursor-pointer"
                        >
                          Lock & Submit Folders
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: IMMERSIVE DRAFT APPROVAL SYSTEM */}
                {activeTab === "approval" && (
                  <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)] space-y-8">
                    <div>
                      <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-2xl text-zinc-900 font-light">
                        Draft previews & <span className="italic font-serif text-[#b4975a]">Approvals</span>
                      </h2>
                      <p className="text-zinc-400 text-[11px] font-light mt-0.5">Directly preview custom drafts and submit immediate workflow approvals.</p>
                    </div>

                    {/* DRAFT 1: CINEMATIC TEASER FILM */}
                    <div className="border border-zinc-200/60 rounded-[24px] overflow-hidden bg-zinc-50">
                      <div className="bg-zinc-100 p-4 border-b border-zinc-200/60 flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                          <Video size={18} className="text-[#b4975a]" />
                          <strong className="text-sm text-zinc-900">Cinematic Wedding Trailer / Teaser</strong>
                        </div>
                        {project.deliveries.video_status === "approved" ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/25 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">Approved</span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200/25 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">Awaiting Review</span>
                        )}
                      </div>
                      
                      <div className="p-5 space-y-4">
                        {/* Embed Trailer Player directly */}
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-inner">
                          <iframe 
                            src={project.deliveries.video_teaser_url}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>

                        {project.deliveries.video_status !== "approved" && (
                          <div className="flex justify-end gap-3 pt-2">
                            <button 
                              onClick={() => handleAssetApproval("video", "changes_requested")}
                              className="px-5 py-2.5 border border-zinc-200 text-zinc-500 rounded-xl text-xs font-semibold hover:border-red-200 hover:text-red-500 transition-all cursor-pointer"
                            >
                              ❌ Request Changes
                            </button>
                            <button 
                              onClick={() => handleAssetApproval("video", "approved")}
                              className="px-6 py-2.5 bg-zinc-950 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                            >
                              ✅ Approve Teaser
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* DRAFT 2: LAYFLAT ALBUM DRAFT */}
                    <div className="border border-zinc-200/60 rounded-[24px] overflow-hidden bg-zinc-50">
                      <div className="bg-zinc-100 p-4 border-b border-zinc-200/60 flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                          <BookOpen size={18} className="text-[#b4975a]" />
                          <strong className="text-sm text-zinc-900">Custom Layflat Album Layout draft</strong>
                        </div>
                        {project.deliveries.album_status === "approved" ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/25 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">Approved</span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200/25 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">Awaiting Review</span>
                        )}
                      </div>
                      
                      <div className="p-5 space-y-4">
                        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-zinc-900">Layflat Album Draft Pages Layout (v1.2)</h4>
                            <p className="text-[10px] text-zinc-400 font-light">View album pages design layout on online book previewer</p>
                          </div>
                          <a 
                            href={project.deliveries.album_pdf_url}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-4 py-2 border border-zinc-200 rounded-lg text-xs font-semibold text-[#b4975a] hover:border-[#b4975a] transition-all flex items-center gap-1.5 uppercase tracking-wider"
                          >
                            <BookOpen size={12} /> Open Layout Previewer
                          </a>
                        </div>

                        {project.deliveries.album_status !== "approved" && (
                          <div className="flex justify-end gap-3 pt-2">
                            <button 
                              onClick={() => handleAssetApproval("album", "changes_requested")}
                              className="px-5 py-2.5 border border-zinc-200 text-zinc-500 rounded-xl text-xs font-semibold hover:border-red-200 hover:text-red-500 transition-all cursor-pointer"
                            >
                              ❌ Request Changes
                            </button>
                            <button 
                              onClick={() => handleAssetApproval("album", "approved")}
                              className="px-6 py-2.5 bg-zinc-950 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                            >
                              ✅ Approve Album Design
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 3: REAL-TIME SUPPORT CHATS */}
                {activeTab === "chat" && (
                  <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)] flex flex-col h-[520px] overflow-hidden">
                    <div className="border-b border-zinc-100 pb-4 mb-4">
                      <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-2xl text-zinc-900 font-light">
                        Client <span className="italic font-serif text-[#b4975a]">Communication Hub</span>
                      </h2>
                      <p className="text-zinc-400 text-[10px] font-light mt-0.5">Secure, real-time channels with your admin, video editor, and designer.</p>
                    </div>

                    {/* Chat room channels switcher */}
                    <div className="flex gap-1.5 bg-zinc-50 p-1.5 border border-zinc-150 rounded-xl mb-4">
                      <button 
                        onClick={() => setActiveChatChannel("client-admin")}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${activeChatChannel === "client-admin" ? "bg-zinc-950 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}
                      >
                        👥 Admin
                      </button>
                      <button 
                        onClick={() => setActiveChatChannel("client-editor")}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${activeChatChannel === "client-editor" ? "bg-zinc-950 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}
                      >
                        🎥 Video Editor
                      </button>
                      <button 
                        onClick={() => setActiveChatChannel("client-designer")}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${activeChatChannel === "client-designer" ? "bg-zinc-950 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}
                      >
                        📖 Album Designer
                      </button>
                    </div>

                    {/* Chat Feed */}
                    <div className="flex-1 overflow-y-auto bg-zinc-50 p-4 border border-zinc-150 rounded-2xl flex flex-col gap-3 min-h-0">
                      {chatMessages.length === 0 ? (
                        <div className="my-auto text-center text-zinc-400 text-xs font-light">
                          No messages yet in this support channel. Ask a question to begin!
                        </div>
                      ) : (
                        chatMessages.map((m) => {
                          const isClient = m.sender === "client";
                          const senderLabel = isClient ? "You" : m.sender.toUpperCase();
                          return (
                            <div key={m.id} className={`flex flex-col ${isClient ? "items-end" : "items-start"} max-w-[80%] ${isClient ? "self-end" : "self-start"}`}>
                              <span className="text-[8px] text-zinc-400 mb-0.5 px-1">{senderLabel} • {formatTime(m.timestamp)}</span>
                              <div className={`p-3 rounded-2xl text-xs line-height-1.4 shadow-sm border ${
                                isClient 
                                  ? "bg-zinc-900 border-zinc-900 text-white rounded-br-sm" 
                                  : "bg-white border-zinc-200 text-zinc-800 rounded-bl-sm"
                              }`}>
                                {m.text}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Message input */}
                    <form onSubmit={sendChatMessage} className="flex gap-2.5 mt-4 pt-2 border-t border-zinc-100">
                      <input 
                        type="text" 
                        placeholder="Write support request or correction notes..."
                        value={newMsgText}
                        onChange={(e) => setNewMsgText(e.target.value)}
                        className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-800 text-xs focus:border-[#b4975a] focus:outline-none"
                        required
                      />
                      <button 
                        type="submit"
                        className="px-5 py-3 bg-[#b4975a] hover:bg-[#c5a86b] text-zinc-950 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Send size={12} />
                        <span className="text-[10px] uppercase tracking-wider hidden sm:inline">Send</span>
                      </button>
                    </form>
                  </div>
                )}

                {/* TAB 4: BRAND INVOICE DOWNLOAD & PRINTING */}
                {activeTab === "invoice" && (
                  <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)] space-y-6">
                    <div>
                      <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-2xl text-zinc-900 font-light">
                        Printable Brand <span className="italic font-serif text-[#b4975a]">Invoice</span>
                      </h2>
                      <p className="text-zinc-400 text-[11px] font-light mt-0.5">Verify booking payments and export your high-resolution A4 tax invoice.</p>
                    </div>

                    <div className="bg-zinc-900 text-zinc-100 p-6 rounded-[24px] space-y-4">
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Financial Summary</span>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">Approved</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-6 text-center sm:text-left py-2">
                        <div className="space-y-1">
                          <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Base Price</span>
                          <div className="text-xl font-bold text-white">₹ {formatCurrency(booking.total_price)}</div>
                        </div>
                        <div className="space-y-1 border-l border-zinc-800 pl-6">
                          <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Advance Paid</span>
                          <div className="text-xl font-bold text-emerald-400">₹ {formatCurrency(booking.advance_paid)}</div>
                        </div>
                        <div className="space-y-1 border-l border-zinc-800 pl-6">
                          <span className="text-[9px] text-[#b4975a] uppercase tracking-wider font-bold">Remaining Balance</span>
                          <div className="text-xl font-bold text-[#b4975a]">₹ {formatCurrency(booking.total_price - booking.advance_paid)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl flex items-center justify-between">
                      <div className="space-y-1">
                        <strong className="text-xs text-zinc-800 font-bold">Branded A4 Tax Invoice (Invoice ID: {booking.invoice_number})</strong>
                        <p className="text-[10px] text-zinc-400 font-light">Generate layout optimized for perfect A4 printer output and local PDF saving.</p>
                      </div>
                      <button 
                        onClick={() => setIsInvoicePrintOpen(true)}
                        className="px-5 py-2.5 bg-zinc-950 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
                      >
                        <Printer size={13} /> Print Invoice
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* SECONDARY SIDEBAR: RIGHT 1 COL */}
              <div className="space-y-8">
                
                {/* DELIVERABLES CHECKLIST VAULT */}
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)] space-y-5">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest block">Purchased Deliverables</span>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-2xl text-zinc-950 font-light">
                    Package <span className="italic font-serif text-[#b4975a]">Items</span>
                  </h3>
                  
                  <div className="space-y-4 pt-1 font-light text-xs text-zinc-600 leading-relaxed">
                    <div className="bg-zinc-50 border border-zinc-150 p-4 rounded-xl space-y-1">
                      <strong className="text-zinc-800 text-[10px] font-bold uppercase tracking-wide">📸 Photography Deliverables</strong>
                      <p>{project.package_details.photography}</p>
                    </div>
                    <div className="bg-zinc-50 border border-zinc-150 p-4 rounded-xl space-y-1">
                      <strong className="text-zinc-800 text-[10px] font-bold uppercase tracking-wide">🎥 Video Deliverables</strong>
                      <p>{project.package_details.video}</p>
                    </div>
                    <div className="bg-zinc-50 border border-zinc-150 p-4 rounded-xl space-y-1">
                      <strong className="text-zinc-800 text-[10px] font-bold uppercase tracking-wide">📖 Album Specifications</strong>
                      <p>{project.package_details.album}</p>
                    </div>
                  </div>
                </div>

                {/* FINAL DIGITAL DELIVERIES VAULT (Unlocks at Step 5) */}
                <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)] space-y-5 relative overflow-hidden">
                  {project.current_step < 5 && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center space-y-2">
                      <Clock size={32} className="text-[#b4975a] animate-pulse" />
                      <strong className="text-zinc-900 text-sm font-bold block">Deliveries Vault Locked</strong>
                      <p className="text-zinc-500 text-[10px] leading-relaxed max-w-xs font-light">
                        Final high-resolution folders unlock here once all layout selections, album printing, and final cinematic film edits reach 100% workflow completion.
                      </p>
                    </div>
                  )}

                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest block">Final Downloads</span>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-2xl text-zinc-950 font-light">
                    Deliveries <span className="italic font-serif text-[#b4975a]">Vault</span>
                  </h3>
                  
                  <div className="space-y-4 pt-1">
                    <a 
                      href={project.deliveries.final_download_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full py-4 bg-[#234e23] hover:bg-[#1f451f] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs tracking-wider uppercase"
                    >
                      <ArrowDownCircle size={14} /> Download Wedding Files
                    </a>
                    <p className="text-[9px] text-zinc-400 text-center font-light leading-normal">
                      Access high-resolution candid shoots, cinematic trailers, highlights, and your print layflat album sheets anytime.
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}
      </div>

      {/* RENDER STUNNING BRAND A4 PRINT INVOICE MODAL */}
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
                        <td className="val">{formatDateString(booking.invoice_date || booking.created_at.split(" ")[0])}</td>
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
                    <th className="amount-col" style={{ width: "140px" }}>Total</th>
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
                      <td style={{ paddingLeft: "20px" }}>{m.date ? formatDateString(m.date) : "TBD"}</td>
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
                      <td className="lbl">Total Payable Amount:</td>
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

export default ClientPortal;
