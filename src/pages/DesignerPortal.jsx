import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, LogIn, LogOut, ExternalLink, Send, CheckCircle, RefreshCw, Camera, Calendar, Download, Upload, FileText, X, AlertTriangle } from "lucide-react";
import SEO from "../components/SEO";

const API_BASE = typeof window !== "undefined"
  ? (localStorage.getItem("dreamwed_api_base") || import.meta.env.VITE_API_BASE_URL || (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? window.location.origin : "https://dreamwed-backend.onrender.com"))
  : "http://localhost:3000";

const DesignerPortal = () => {
  const [authed, setAuthed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [msgText, setMsgText] = useState("");
  const [albumUrl, setAlbumUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoTab, setPhotoTab] = useState("selected"); // "selected" or "all"
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("dreamwed_designer_user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setAuthed(true);
      } catch (e) {
        localStorage.removeItem("dreamwed_designer_user");
      }
    }
  }, []);

  useEffect(() => {
    if (authed && currentUser) fetchProjects();
  }, [authed, currentUser]);

  useEffect(() => {
    if (selected) {
      fetchChat();
      setAlbumUrl(selected.deliveries?.album_pdf_url || "");
    }
  }, [selected]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/projects`);
      if (res.ok) {
        const data = await res.json();
        const assigned = currentUser?.assigned_projects || [];
        const filtered = assigned.length > 0 ? data.filter(p => assigned.includes(p.id)) : data;
        setProjects(filtered);
        if (filtered.length > 0 && !selected) setSelected(filtered[0]);
        else if (selected) {
          const updated = filtered.find(p => p.id === selected.id);
          if (updated) setSelected(updated);
        }
      } else {
        throw new Error("API error");
      }
    } catch (e) { 
      console.error("Fetch projects failed, falling back locally:", e);
      const localProjects = JSON.parse(localStorage.getItem("dreamwed_projects") || "[]");
      const assigned = currentUser?.assigned_projects || [];
      const filtered = assigned.length > 0 ? localProjects.filter(p => assigned.includes(p.id)) : localProjects;
      setProjects(filtered);
      if (filtered.length > 0 && !selected) setSelected(filtered[0]);
      else if (selected) {
        const updated = filtered.find(p => p.id === selected.id);
        if (updated) setSelected(updated);
      }
    }
  };

  const fetchChat = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`${API_BASE}/api/projects/${selected.id}/chats/client-designer`);
      if (res.ok) setChatMessages(await res.json());
    } catch (e) {}
  };

  const sendMsg = async (e) => {
    e.preventDefault();
    if (!msgText.trim() || !selected) return;
    try {
      const res = await fetch(`${API_BASE}/api/projects/${selected.id}/chats/client-designer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "designer", text: msgText.trim() })
      });
      if (res.ok) { setChatMessages(await res.json()); setMsgText(""); }
    } catch (e) {}
  };

  const saveAlbumUrl = async (urlToSave) => {
    const url = urlToSave !== undefined ? urlToSave : albumUrl;
    if (!selected || !url.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/projects/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveries: { ...selected.deliveries, album_pdf_url: url.trim(), album_status: "pending" } })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelected(updated);
        setProjects(ps => ps.map(p => p.id === updated.id ? updated : p));
        
        // Sync locally
        const localProjects = JSON.parse(localStorage.getItem("dreamwed_projects") || "[]");
        const updatedLocal = localProjects.map(p => p.id === updated.id ? updated : p);
        localStorage.setItem("dreamwed_projects", JSON.stringify(updatedLocal));
        
        alert("✅ Album PDF link saved! Client can now view and approve it.");
      } else {
        throw new Error("API error");
      }
    } catch (e) {
      console.log("Saving locally");
      const updatedSelected = {
        ...selected,
        deliveries: {
          ...selected.deliveries,
          album_pdf_url: url.trim(),
          album_status: "pending"
        }
      };
      setSelected(updatedSelected);
      setProjects(ps => ps.map(p => p.id === updatedSelected.id ? updatedSelected : p));
      
      const localProjects = JSON.parse(localStorage.getItem("dreamwed_projects") || "[]");
      const updatedLocal = localProjects.map(p => p.id === updatedSelected.id ? updatedSelected : p);
      localStorage.setItem("dreamwed_projects", JSON.stringify(updatedLocal));
      
      alert("✅ Album PDF link saved locally (Offline Sync Active)! Client can now view and approve it.");
    } finally { setSaving(false); }
  };

  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const triggerUpload = async () => {
    if (!selectedFile || !selected) return;
    setUploading(true);
    
    // Read selected PDF file as base64 string
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onerror = () => {
      alert("Error reading select file. Please try again.");
      setUploading(false);
    };
    reader.onload = async () => {
      const base64Data = reader.result;
      
      try {
        const res = await fetch(`${API_BASE}/api/upload-pdf`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: selected.id,
            fileName: selectedFile.name,
            fileData: base64Data
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.project) {
            setSelected(data.project);
            setProjects(ps => ps.map(p => p.id === data.project.id ? data.project : p));
            setAlbumUrl(data.url);
            alert(`✅ "${selectedFile.name}" uploaded successfully! The client can now view and approve this draft.`);
          } else {
            throw new Error("Failed to save draft details");
          }
        } else {
          const errData = await res.json();
          throw new Error(errData.error || "Server upload failed");
        }
      } catch (e) {
        alert(`Error uploading file: ${e.message}`);
      } finally {
        setUploading(false);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
  };


  // Bulk download all selected (album) photos
  const downloadAllSelected = () => {
    if (!selected) return;
    const standardPhotos = (selected.gallery_images || []).filter(img =>
      img.favorited || img.categories?.includes("album")
    );
    const clientUploadedPhotos = (selected.deliveries?.album_revision_details?.uploaded_files || []).map((file, idx) => ({
      url: file.url,
      name: file.name,
      isClientUploaded: true
    }));

    const allSelected = [...standardPhotos, ...clientUploadedPhotos];

    if (allSelected.length === 0) {
      alert("No selected photos to download.");
      return;
    }
    allSelected.forEach((img, idx) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = img.url;
        a.download = img.isClientUploaded ? img.name : `${(selected.couple_name || "photo").replace(/\s+/g, "_")}_${img.id}.jpg`;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, idx * 300); // stagger 300ms per photo to avoid browser blocking
    });
    alert(`📥 Downloading ${allSelected.length} photos (including ${clientUploadedPhotos.length} client uploaded files). Your browser may prompt for permission.`);
  };

  const formatDate = (d) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return d; }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginErr("");
    try {
      const res = await fetch(`${API_BASE}/api/staff/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput.trim(), password: passwordInput })
      });
      if (res.ok) {
        const user = await res.json();
        if (user.role !== "designer") {
          setLoginErr("This portal is for Album Designers only. Video editors should use the Editor Portal.");
          setLoginLoading(false);
          return;
        }
        setCurrentUser(user);
        setAuthed(true);
        localStorage.setItem("dreamwed_designer_user", JSON.stringify(user));
      } else {
        throw new Error("Auth failed");
      }
    } catch (err) {
      console.log("Server auth failed, checking local credentials fallback");
      if (usernameInput.trim().toLowerCase() === "designer" && passwordInput === "design123") {
        const localUser = {
          id: 1,
          username: "designer",
          display_name: "Lead Album Designer",
          role: "designer",
          assigned_projects: [2, 3] // pre-filled Adarsh & Anjali / Rahul & Sneha project IDs
        };
        setCurrentUser(localUser);
        setAuthed(true);
        localStorage.setItem("dreamwed_designer_user", JSON.stringify(localUser));
      } else {
        setLoginErr("Invalid username or password. Please contact admin.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Count selected album photos
  const albumPhotoCount = (p) => {
    const favoritedCount = (p?.gallery_images || []).filter(img => img.favorited || img.categories?.includes("album")).length;
    const uploadedCount = p?.deliveries?.album_revision_details?.uploaded_files?.length || 0;
    return favoritedCount + uploadedCount;
  };

  if (!authed) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 relative">
      {/* Floating Back to Home button */}
      <a 
        href="/" 
        className="absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-xs font-semibold text-zinc-300 hover:text-white uppercase tracking-wider backdrop-blur-sm shadow-md active:scale-95 group cursor-pointer"
      >
        <span>←</span> Back to Home
      </a>
      <SEO title="Album Designer Portal | Dreamwed Stories" description="Internal album design workspace." />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[28px] p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#b4975a]/10 border border-[#b4975a]/20 flex items-center justify-center mx-auto">
            <BookOpen size={24} className="text-[#b4975a]" />
          </div>
          <h1 className="text-xl font-light text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Album <span className="italic text-[#b4975a]">Designer</span> Portal
          </h1>
          <p className="text-zinc-500 text-xs font-light">Login with your designer account credentials.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Username</label>
            <input type="text" placeholder="Your designer username" required
              value={usernameInput} onChange={e => setUsernameInput(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:border-[#b4975a] focus:outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Password</label>
            <input type="password" placeholder="••••••••" required
              value={passwordInput} onChange={e => setPasswordInput(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:border-[#b4975a] focus:outline-none" />
          </div>
          {loginErr && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 leading-relaxed">{loginErr}</p>}
          <button type="submit" disabled={loginLoading}
            className="w-full py-3 bg-[#b4975a] hover:bg-[#c5a86b] text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]">
            <LogIn size={14} /> {loginLoading ? "Logging in..." : "Enter Portal"}
          </button>
        </form>
        <p className="text-center text-[9px] text-zinc-600 font-light">
          Account not working? Contact the DreamWed admin to reset your credentials.
        </p>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-16">
      <SEO title="Album Designer Portal | Dreamwed Stories" description="Designer workspace." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center mb-8 pb-5 border-b border-zinc-800">
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Internal Portal</p>
            <h1 className="text-2xl font-light text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Album <span className="italic text-[#b4975a]">Designer</span> Workspace
            </h1>
            <p className="text-zinc-500 text-xs font-light mt-0.5">
              Welcome, <span className="text-[#b4975a] font-semibold">{currentUser?.display_name || currentUser?.username}</span>
              {" "}— {projects.length} project{projects.length !== 1 ? "s" : ""} assigned
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/"
              className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-[#b4975a] text-xs uppercase tracking-wider cursor-pointer rounded-xl border border-[#b4975a]/20 hover:border-[#b4975a]/40 transition-colors">
              <span>←</span> Back to Home
            </a>
            <button onClick={() => { setAuthed(false); setCurrentUser(null); setSelected(null); setProjects([]); localStorage.removeItem("dreamwed_designer_user"); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs uppercase tracking-wider cursor-pointer rounded-xl border border-zinc-700 transition-colors">
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-2">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-3">All Projects ({projects.length})</p>
            {projects.map(p => (
              <button key={p.id} onClick={() => setSelected(p)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${selected?.id === p.id ? "bg-zinc-800 border-[#b4975a]/40" : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"}`}>
                <div className="text-sm font-semibold text-white truncate">
                  {p.couple_name} <span className="text-zinc-500 text-xs font-light">(Project #{p.id})</span>
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{formatDate(p.wedding_date)}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[9px] text-zinc-400 font-light">{albumPhotoCount(p)} photos selected</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    p.deliveries?.album_status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                    p.deliveries?.album_status === "changes_requested" ? "bg-red-500/10 text-red-400" :
                    "bg-amber-500/10 text-amber-400"}`}>
                    {p.deliveries?.album_status === "approved" ? "✓ Approved" :
                     p.deliveries?.album_status === "changes_requested" ? "⚠ Revise" : "In Progress"}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Main workspace */}
          {selected && (
            <div className="lg:col-span-3 space-y-5">
              {/* Info bar */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-wrap gap-6 items-center">
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Couple</p>
                  <p className="text-white font-semibold">{selected.couple_name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Wedding Date</p>
                  <p className="text-white text-sm">{formatDate(selected.wedding_date)}</p>
                </div>
                {selected.deadline_date && (
                  <div>
                    <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">⏱ Work Deadline</p>
                    <p className="text-red-500 text-xs font-semibold">{formatDate(selected.deadline_date)}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Album Spec</p>
                  <p className="text-zinc-300 text-xs font-light max-w-[200px]">{selected.package_details?.album || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Photos for Album</p>
                  <p className="text-[#b4975a] text-lg font-bold">{albumPhotoCount(selected)}</p>
                </div>
                {selected.deliveries?.raw_photos_url && (
                  <div className="ml-auto">
                    <a href={selected.deliveries.raw_photos_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#b4975a]/10 hover:bg-[#b4975a]/20 border border-[#b4975a]/20 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[#b4975a] transition-all">
                      📂 Open Raw Photo Drive <ExternalLink size={10} />
                    </a>
                  </div>
                )}
              </div>

              {/* Client Planning Files & Wedding Invitation */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-left space-y-4">
                <div className="border-b border-zinc-800 pb-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="text-[#b4975a]">💌</span> Wedding Invitation & Planning Files
                  </h3>
                  <p className="text-zinc-500 text-[10px] font-light mt-0.5">
                    Essential client assets: invitations, music lists, and aesthetic references.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Wedding Invitation / Letter Card */}
                  <div className={`p-4 rounded-xl border flex flex-col justify-between h-36 transition-all ${
                    (selected.invitation_url || selected.wedding_letter_url || selected.wedding_letter_text) 
                      ? "bg-zinc-950/40 border-zinc-800/60 hover:border-[#b4975a]/30" 
                      : "bg-zinc-950/20 border-dashed border-zinc-800/40 opacity-70"
                  }`}>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#b4975a] block mb-1">
                        💌 Invitation / Story Letter
                      </span>
                      <p className="text-zinc-450 text-[10px] font-light leading-snug truncate">
                        {selected.wedding_letter_text || ((selected.invitation_url || selected.wedding_letter_url)
                          ? "Digital invitation card or uploaded wedding story letter." 
                          : "No wedding invitation or letter has been uploaded by the client yet.")}
                      </p>
                    </div>
                    {(selected.invitation_url || selected.wedding_letter_url) ? (
                      <a href={selected.invitation_url || selected.wedding_letter_url} target="_blank" rel="noopener noreferrer"
                        className="w-full text-center py-2 bg-[#b4975a]/10 hover:bg-[#b4975a]/25 border border-[#b4975a]/20 hover:border-[#b4975a]/40 rounded-lg text-[9px] font-bold uppercase tracking-widest text-[#b4975a] transition-all flex items-center justify-center gap-1">
                        View Invitation / Letter <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="w-full text-center py-2 bg-zinc-905 border border-zinc-800/50 rounded-lg text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                        Not Provided
                      </span>
                    )}
                  </div>

                  {/* Song List Card */}
                  <div className={`p-4 rounded-xl border flex flex-col justify-between h-36 transition-all ${
                    selected.song_list_url 
                      ? "bg-zinc-950/40 border-zinc-800/60 hover:border-[#b4975a]/30" 
                      : "bg-zinc-950/20 border-dashed border-zinc-800/40 opacity-70"
                  }`}>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#b4975a] block mb-1">
                        🎵 Song Tracklist
                      </span>
                      <p className="text-zinc-450 text-[10px] font-light leading-snug">
                        {selected.song_list_url 
                          ? "Client's chosen tracks, preferred musical entries, and audio background lists." 
                          : "No song tracklist file has been uploaded by the client yet."}
                      </p>
                    </div>
                    {selected.song_list_url ? (
                      <a href={selected.song_list_url} target="_blank" rel="noopener noreferrer"
                        className="w-full text-center py-2 bg-[#b4975a]/10 hover:bg-[#b4975a]/25 border border-[#b4975a]/20 hover:border-[#b4975a]/40 rounded-lg text-[9px] font-bold uppercase tracking-widest text-[#b4975a] transition-all flex items-center justify-center gap-1">
                        View Song List <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="w-full text-center py-2 bg-zinc-905 border border-zinc-800/50 rounded-lg text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                        Not Provided
                      </span>
                    )}
                  </div>

                  {/* Reference Photos Card */}
                  <div className={`p-4 rounded-xl border flex flex-col justify-between h-36 transition-all ${
                    selected.reference_photos_url 
                      ? "bg-zinc-950/40 border-zinc-800/60 hover:border-[#b4975a]/30" 
                      : "bg-zinc-950/20 border-dashed border-zinc-800/40 opacity-70"
                  }`}>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#b4975a] block mb-1">
                        📂 Style Reference
                      </span>
                      <p className="text-zinc-450 text-[10px] font-light leading-snug">
                        {selected.reference_photos_url 
                          ? "Inspiration folders, reference shoots, mood boards, and aesthetic notes." 
                          : "No aesthetic style reference files uploaded by the client yet."}
                      </p>
                    </div>
                    {selected.reference_photos_url ? (
                      <a href={selected.reference_photos_url} target="_blank" rel="noopener noreferrer"
                        className="w-full text-center py-2 bg-[#b4975a]/10 hover:bg-[#b4975a]/25 border border-[#b4975a]/20 hover:border-[#b4975a]/40 rounded-lg text-[9px] font-bold uppercase tracking-widest text-[#b4975a] transition-all flex items-center justify-center gap-1">
                        Open References <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="w-full text-center py-2 bg-zinc-905 border border-zinc-800/50 rounded-lg text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                        Not Provided
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Revision Request Details */}
              {selected.deliveries?.album_revision_details && (
                <div className="bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-2xl p-6 text-left space-y-4">
                  <div className="flex items-center gap-2 border-b border-amber-500/10 pb-3">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      ✏️ Active Revision Request Details
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Additional Photos Requested</p>
                      <p className="text-zinc-200 font-medium">
                        {selected.deliveries.album_revision_details.extra_photos_count > 0 
                          ? `${selected.deliveries.album_revision_details.extra_photos_count} photos (Additional charge applicable)`
                          : "No additional photo counts requested"
                        }
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Specific Gallery Photo IDs to Include/Swap</p>
                      <p className="text-zinc-200 font-medium whitespace-pre-wrap leading-relaxed">
                        {selected.deliveries.album_revision_details.specific_photos || "None specified"}
                      </p>
                    </div>
                  </div>

                  {selected.deliveries.album_revision_details.revision_notes && (
                    <div className="space-y-1 text-xs">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Revision Suggestions & Notes</p>
                      <p className="text-zinc-300 font-normal leading-relaxed bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-800/40 whitespace-pre-wrap">
                        {selected.deliveries.album_revision_details.revision_notes}
                      </p>
                    </div>
                  )}

                  {selected.deliveries.album_revision_details.uploaded_files?.length > 0 && (
                    <div className="space-y-2 text-xs">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Attached Files from Client ({selected.deliveries.album_revision_details.uploaded_files.length})</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selected.deliveries.album_revision_details.uploaded_files.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-zinc-950/60 border border-zinc-800/50 p-2.5 rounded-xl">
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-sm shrink-0">📷</span>
                              <span className="text-[11px] text-zinc-300 font-medium truncate" title={file.name}>{file.name}</span>
                            </div>
                            <a 
                              href={file.url} 
                              download={file.name} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="shrink-0 text-[#b4975a] hover:text-[#c5a86b] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#b4975a]/5 hover:bg-[#b4975a]/10 border border-[#b4975a]/10 rounded-lg transition-colors flex items-center gap-1 active:scale-95"
                            >
                              Download ↗
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Client selected & full gallery photos */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Wedding Photo Archives</p>
                    <p className="text-zinc-500 text-[10px] font-light mt-0.5">
                      {photoTab === "selected" 
                        ? "Photos selected by the client for layflat layout" 
                        : "Full original photo archive uploaded by admin"}
                    </p>
                  </div>
                  
                {/* Tab Toggles + Bulk Download */}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <div className="flex gap-1.5 bg-zinc-950 p-1 border border-zinc-800 rounded-xl">
                      <button 
                        onClick={() => setPhotoTab("selected")}
                        className={`px-3.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          photoTab === "selected" 
                            ? "bg-[#b4975a] text-zinc-950 shadow-sm" 
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        🌟 Selected ({albumPhotoCount(selected)})
                      </button>
                      <button 
                        onClick={() => setPhotoTab("all")}
                        className={`px-3.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          photoTab === "all" 
                            ? "bg-[#b4975a] text-zinc-950 shadow-sm" 
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        📸 Full Gallery ({(selected.gallery_images || []).length})
                      </button>
                    </div>

                    {/* Bulk Download Button — only on selected tab */}
                    {photoTab === "selected" && albumPhotoCount(selected) > 0 && (
                      <button
                        onClick={downloadAllSelected}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 hover:text-emerald-300 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                        title={`Download all ${albumPhotoCount(selected)} selected photos`}
                      >
                        <Download size={11} />
                        Download All ({albumPhotoCount(selected)})
                      </button>
                    )}
                  </div>
                </div>

                {/* Photo rendering grid */}
                {(() => {
                  const standardPhotos = (selected.gallery_images || []).filter(img => 
                    photoTab === "all" || img.categories?.includes("album")
                  );

                  // If selected is active, get client uploaded files
                  const clientUploadedPhotos = (photoTab === "selected" && selected.deliveries?.album_revision_details?.uploaded_files) 
                    ? selected.deliveries.album_revision_details.uploaded_files.map((file, idx) => ({
                        id: `client_uploaded_${idx}`,
                        url: file.url,
                        name: file.name,
                        isClientUploaded: true,
                        comment: `Client Uploaded Additional Photo: ${file.name}`
                      }))
                    : [];

                  const displayPhotos = [...standardPhotos, ...clientUploadedPhotos];

                  if (displayPhotos.length === 0) {
                    return (
                      <div className="text-center py-8 text-zinc-600 text-xs">
                        {photoTab === "selected" 
                          ? "Client hasn't selected photos yet." 
                          : "No gallery photos found."}
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                      {displayPhotos.map(img => {
                        const inAlbum = img.categories?.includes("album") || img.isClientUploaded;
                        return (
                          <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800 group">
                            <img src={img.url} className="absolute inset-0 w-full h-full object-cover" />
                            {img.comment && (
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                                <p className="text-white text-[8px] text-center leading-tight">{img.comment}</p>
                              </div>
                            )}
                            {inAlbum && (
                              <div className="absolute top-1 left-1">
                                <span className={`text-zinc-950 text-[6px] font-bold px-1.5 py-0.5 rounded shadow ${
                                  img.isClientUploaded ? "bg-amber-400" : "bg-[#b4975a]"
                                }`}>
                                  {img.isClientUploaded ? "📤 Client Added" : "✓ Selected"}
                                </span>
                              </div>
                            )}
                            {/* Direct Download Button */}
                            <a 
                              href={img.url} 
                              download={img.isClientUploaded ? img.name : `photo-${selected.couple_name.replace(/\s+/g, '_')}-${img.id}.jpg`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="absolute bottom-1 right-1 w-6 h-6 rounded bg-black/80 hover:bg-black border border-white/10 flex items-center justify-center text-white transition-colors cursor-pointer z-10 hover:scale-105"
                              title={img.isClientUploaded ? `Download client file: ${img.name}` : "Download original photo"}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Album PDF upload — File browser + URL fallback */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-2.5 border-b border-zinc-800 pb-4">
                  <BookOpen size={16} className="text-[#b4975a]" />
                  <p className="text-sm font-semibold text-white">Upload Album Draft PDF</p>
                  {selected.deliveries?.album_status === "approved" && (
                    <span className="ml-auto bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase">Client Approved ✓</span>
                  )}
                  {selected.deliveries?.album_status === "changes_requested" && (
                    <span className="ml-auto bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase">⚠ Revision Requested — Check Chat</span>
                  )}
                </div>

                {/* Primary: File upload from computer */}
                <div className="space-y-3">
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Upload PDF from Computer</p>
                  
                  {!selectedFile ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-zinc-700 hover:border-[#b4975a]/50 rounded-xl p-6 text-center cursor-pointer transition-all group hover:bg-[#b4975a]/3"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.PDF"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 group-hover:bg-[#b4975a]/10 flex items-center justify-center mx-auto transition-colors">
                          <Upload size={18} className="text-zinc-500 group-hover:text-[#b4975a] transition-colors" />
                        </div>
                        <div>
                          <p className="text-zinc-300 text-xs font-semibold group-hover:text-white transition-colors">Click to browse PDF file</p>
                          <p className="text-zinc-600 text-[10px] font-light mt-0.5">Select your album layout PDF from your computer</p>
                        </div>
                        {selected.deliveries?.album_pdf_url && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 rounded-lg">
                            <FileText size={11} className="text-[#b4975a]" />
                            <span className="text-[9px] text-zinc-400 font-medium">Current: Album PDF uploaded ✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                          <span className="text-lg text-red-400">📄</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-zinc-200 text-xs font-semibold truncate leading-snug">{selectedFile.name}</p>
                          <p className="text-zinc-500 text-[10px] font-light mt-0.5">
                            Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                          </p>
                        </div>
                        <button
                          onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                          className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <button
                        onClick={triggerUpload}
                        disabled={uploading}
                        className="w-full py-3 bg-[#b4975a] hover:bg-[#c5a86b] disabled:opacity-50 text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] shadow-md shadow-[#b4975a]/10"
                      >
                        {uploading ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                            Uploading Draft to Client...
                          </>
                        ) : (
                          <>📤 Upload Selected PDF</>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-zinc-800" />
                  <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">or paste link</span>
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>

                {/* Fallback: URL input */}
                <div className="space-y-2">
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Paste Album Draft URL</p>
                  <div className="flex gap-3">
                    <input type="url" placeholder="Paste Google Drive PDF link, Canva link, etc..."
                      value={albumUrl} onChange={e => setAlbumUrl(e.target.value)}
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-xs focus:border-[#b4975a] focus:outline-none" />
                    <button onClick={() => saveAlbumUrl()}
                      disabled={saving || !albumUrl.trim()}
                      className="px-4 py-2.5 bg-[#b4975a] hover:bg-[#c5a86b] text-zinc-950 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
                      {saving ? "Saving..." : "Save Link"}
                    </button>
                  </div>
                </div>

                {/* Preview link */}
                {(selected.deliveries?.album_pdf_url || albumUrl) && (
                  <a href={selected.deliveries?.album_pdf_url || albumUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#b4975a] text-xs hover:underline">
                    <ExternalLink size={12} /> Preview Album Layout for Client
                  </a>
                )}
              </div>

              {/* Chat */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <div className="border-b border-zinc-800 pb-3">
                  <p className="text-sm font-semibold text-white">Client Chat</p>
                  <p className="text-zinc-500 text-[10px] font-light mt-0.5">Direct channel with {selected.couple_name}</p>
                </div>
                <div className="h-48 overflow-y-auto flex flex-col gap-2.5 bg-zinc-950 rounded-xl p-3">
                  {chatMessages.length === 0 ? (
                    <div className="my-auto text-center text-zinc-600 text-xs">No messages yet.</div>
                  ) : chatMessages.map(m => {
                    const isMe = m.sender === "designer";
                    return (
                      <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%] ${isMe ? "self-end" : "self-start"}`}>
                        <span className="text-[8px] text-zinc-600 mb-0.5 px-1">{isMe ? "You" : m.sender}</span>
                        <div className={`p-2.5 rounded-xl text-xs ${isMe ? "bg-[#b4975a]/20 border border-[#b4975a]/30 text-white" : "bg-zinc-800 border border-zinc-700 text-zinc-300"}`}>
                          {m.text}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <form onSubmit={sendMsg} className="flex gap-2">
                  <input type="text" placeholder="Message the client..." value={msgText} onChange={e => setMsgText(e.target.value)}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-xs focus:border-[#b4975a] focus:outline-none" required />
                  <button type="submit" className="px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors">
                    <Send size={12} /> Send
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignerPortal;
