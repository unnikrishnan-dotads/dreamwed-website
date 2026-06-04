import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, LogIn, LogOut, Calendar, Clock, Send, ExternalLink, RefreshCw, Camera, Plus, Trash2, Copy, Play, Upload, Check } from "lucide-react";
import SEO from "../components/SEO";

const API_BASE = typeof window !== "undefined"
  ? (localStorage.getItem("dreamwed_api_base") || import.meta.env.VITE_API_BASE_URL || (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? window.location.origin : "https://dreamwed-backend.onrender.com"))
  : "http://localhost:3000";

const EditorPortal = () => {
  // Auth state — supports multiple editor accounts via backend API
  const [authed, setAuthed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // { id, username, display_name, role, assigned_projects }
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Projects & workspace
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [msgText, setMsgText] = useState("");
  const [videoTeaserUrl, setVideoTeaserUrl] = useState("");
  const [videoHighlightUrl, setVideoHighlightUrl] = useState("");
  const [videoFullUrl, setVideoFullUrl] = useState("");
  const [weddingReels, setWeddingReels] = useState([]);
  const [newReelTitle, setNewReelTitle] = useState("");
  const [newReelUrl, setNewReelUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingTeaser, setUploadingTeaser] = useState(false);
  const [uploadingHighlight, setUploadingHighlight] = useState(false);
  const [uploadingFull, setUploadingFull] = useState(false);
  const [uploadingReel, setUploadingReel] = useState(false);
  const chatPollRef = useRef(null);

  // Check saved session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("dreamwed_editor_user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setAuthed(true);
      } catch (e) {
        localStorage.removeItem("dreamwed_editor_user");
      }
    }
  }, []);

  // Fetch projects when authenticated
  useEffect(() => {
    if (authed && currentUser) {
      fetchProjects();
    }
  }, [authed, currentUser]);

  // Load chat and video URLs when project is selected
  useEffect(() => {
    if (selected) {
      fetchChat();
      setVideoTeaserUrl(selected.deliveries?.video_teaser_url || "");
      setVideoHighlightUrl(selected.deliveries?.video_highlight_url || "");
      setVideoFullUrl(selected.deliveries?.video_full_url || "");
      setWeddingReels(selected.deliveries?.wedding_reels || []);
    }
    // Start polling chat
    if (chatPollRef.current) clearInterval(chatPollRef.current);
    if (selected) {
      chatPollRef.current = setInterval(fetchChat, 8000);
    }
    return () => {
      if (chatPollRef.current) clearInterval(chatPollRef.current);
    };
  }, [selected?.id]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/projects`);
      if (res.ok) {
        const data = await res.json();
        // Filter projects assigned to this editor
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
      console.error("Error fetching projects, falling back locally:", e);
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
      const res = await fetch(`${API_BASE}/api/projects/${selected.id}/chats/client-editor`);
      if (res.ok) setChatMessages(await res.json());
    } catch (e) {}
  };

  const sendMsg = async (e) => {
    e.preventDefault();
    if (!msgText.trim() || !selected) return;
    try {
      const res = await fetch(`${API_BASE}/api/projects/${selected.id}/chats/client-editor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "editor", text: msgText.trim() })
      });
      if (res.ok) { setChatMessages(await res.json()); setMsgText(""); }
    } catch (e) {}
  };

  const saveVideoLinks = async () => {
    if (!selected) return;
    setSaving(true);
    const updatedDeliveries = {
      ...selected.deliveries,
      video_teaser_url: videoTeaserUrl.trim(),
      video_highlight_url: videoHighlightUrl.trim(),
      video_full_url: videoFullUrl.trim(),
      wedding_reels: weddingReels
    };
    try {
      const res = await fetch(`${API_BASE}/api/projects/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveries: updatedDeliveries })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelected(updated);
        setProjects(ps => ps.map(p => p.id === updated.id ? updated : p));
        
        // Sync locally
        const localProjects = JSON.parse(localStorage.getItem("dreamwed_projects") || "[]");
        const updatedLocal = localProjects.map(p => p.id === updated.id ? updated : p);
        localStorage.setItem("dreamwed_projects", JSON.stringify(updatedLocal));
        
        alert("✅ All video links saved and client notified!");
      } else {
        throw new Error("API error");
      }
    } catch (e) {
      console.error("Saving video links locally:", e);
      const updatedSelected = {
        ...selected,
        deliveries: updatedDeliveries
      };
      setSelected(updatedSelected);
      setProjects(ps => ps.map(p => p.id === updatedSelected.id ? updatedSelected : p));
      
      const localProjects = JSON.parse(localStorage.getItem("dreamwed_projects") || "[]");
      const updatedLocal = localProjects.map(p => p.id === updatedSelected.id ? updatedSelected : p);
      localStorage.setItem("dreamwed_projects", JSON.stringify(updatedLocal));
      
      alert("✅ All video links saved locally (Offline Sync Active)!");
    } finally { setSaving(false); }
  };

  const handleAddReel = () => {
    if (!newReelTitle.trim() || !newReelUrl.trim()) {
      alert("Please fill in both the Reel title and URL.");
      return;
    }
    const newReel = {
      id: Date.now(),
      title: newReelTitle.trim(),
      url: newReelUrl.trim()
    };
    const updatedReels = [...weddingReels, newReel];
    setWeddingReels(updatedReels);
    setNewReelTitle("");
    setNewReelUrl("");
    saveUpdatedReels(updatedReels);
  };

  const handleDeleteReel = (id) => {
    const updatedReels = weddingReels.filter(r => r.id !== id);
    setWeddingReels(updatedReels);
    saveUpdatedReels(updatedReels);
  };

  const saveUpdatedReels = async (updatedReels) => {
    if (!selected) return;
    try {
      const updatedDeliveries = {
        ...selected.deliveries,
        wedding_reels: updatedReels
      };
      const res = await fetch(`${API_BASE}/api/projects/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveries: updatedDeliveries })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelected(updated);
        setProjects(ps => ps.map(p => p.id === updated.id ? updated : p));
      }
    } catch (e) {
      console.error("Error saving reels list:", e);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 100 * 1024 * 1024) {
      alert("File size exceeds 100MB limit.");
      return;
    }

    if (type === "teaser") setUploadingTeaser(true);
    else if (type === "highlight") setUploadingHighlight(true);
    else if (type === "full") setUploadingFull(true);
    else if (type === "reel") setUploadingReel(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const fileData = reader.result;
      try {
        const res = await fetch(`${API_BASE}/api/upload-file`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileData: fileData
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (type === "teaser") {
            setVideoTeaserUrl(data.url);
            alert("✅ Teaser file uploaded successfully! Click 'Save All Links' to persist changes.");
          } else if (type === "highlight") {
            setVideoHighlightUrl(data.url);
            alert("✅ Highlight file uploaded successfully! Click 'Save All Links' to persist changes.");
          } else if (type === "full") {
            setVideoFullUrl(data.url);
            alert("✅ Full Wedding Film uploaded successfully! Click 'Save All Links' to persist changes.");
          } else if (type === "reel") {
            setNewReelUrl(data.url);
            if (!newReelTitle.trim()) {
              setNewReelTitle(file.name.replace(/\.[^/.]+$/, ""));
            }
            alert("✅ Reel file uploaded successfully! Click 'Add Reel' to add it to the list.");
          }
        } else {
          alert("❌ File upload failed.");
        }
      } catch (err) {
        console.error(err);
        alert("❌ Error uploading file.");
      } finally {
        if (type === "teaser") setUploadingTeaser(false);
        else if (type === "highlight") setUploadingHighlight(false);
        else if (type === "full") setUploadingFull(false);
        else if (type === "reel") setUploadingReel(false);
      }
    };
    reader.onerror = () => {
      alert("❌ Error reading file.");
      if (type === "teaser") setUploadingTeaser(false);
      else if (type === "highlight") setUploadingHighlight(false);
      else if (type === "full") setUploadingFull(false);
      else if (type === "reel") setUploadingReel(false);
    };
    reader.readAsDataURL(file);
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
        if (user.role !== "editor") {
          setLoginErr("This portal is for Video Editors only. Please use the Designer Portal for album design access.");
          setLoginLoading(false);
          return;
        }
        setCurrentUser(user);
        setAuthed(true);
        localStorage.setItem("dreamwed_editor_user", JSON.stringify(user));
      } else {
        throw new Error("Auth failed");
      }
    } catch (err) {
      console.log("Server auth failed, checking local credentials fallback");
      if (usernameInput.trim().toLowerCase() === "editor" && passwordInput === "edit123") {
        const localUser = {
          id: 2,
          username: "editor",
          display_name: "Lead Video Editor",
          role: "editor",
          assigned_projects: [2, 3] // pre-filled Adarsh & Anjali / Rahul & Sneha project IDs
        };
        setCurrentUser(localUser);
        setAuthed(true);
        localStorage.setItem("dreamwed_editor_user", JSON.stringify(localUser));
      } else {
        setLoginErr("Invalid username or password. Please contact admin.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthed(false);
    setCurrentUser(null);
    setSelected(null);
    setProjects([]);
    setChatMessages([]);
    localStorage.removeItem("dreamwed_editor_user");
  };

  const formatDate = (d) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return d; }
  };

  // LOGIN GATE
  if (!authed) return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-6 relative">
      {/* Floating Back to Home button */}
      <a 
        href="/" 
        className="absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-xs font-semibold text-zinc-300 hover:text-white uppercase tracking-wider backdrop-blur-sm shadow-md active:scale-95 group cursor-pointer"
      >
        <span>←</span> Back to Home
      </a>
      <SEO title="Video Editor Portal | Dreamwed Stories" description="Dreamwed Stories internal video editor workspace." />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[28px] p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#b4975a]/10 border border-[#b4975a]/20 flex items-center justify-center mx-auto">
            <Video size={24} className="text-[#b4975a]" />
          </div>
          <h1 className="text-xl font-light text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Video <span className="italic text-[#b4975a]">Editor</span> Portal
          </h1>
          <p className="text-zinc-500 text-xs font-light">Login with your editor account credentials.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Username</label>
            <input type="text" placeholder="Your editor username" required
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

  // AUTHENTICATED WORKSPACE
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white pt-20 pb-16">
      <SEO title="Video Editor Portal | Dreamwed Stories" description="Editor workspace." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-5 border-b border-zinc-800">
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Internal Portal</p>
            <h1 className="text-2xl font-light text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Video <span className="italic text-[#b4975a]">Editor</span> Workspace
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
            <button onClick={fetchProjects}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-xs uppercase tracking-wider cursor-pointer bg-transparent border-none transition-colors">
              <RefreshCw size={13} /> Refresh
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs uppercase tracking-wider cursor-pointer rounded-xl border border-zinc-700 transition-colors">
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-[24px] text-zinc-600">
            <Video size={32} className="mx-auto mb-4 opacity-40" />
            <p className="text-sm font-light">No projects assigned to your account yet.</p>
            <p className="text-xs mt-1 opacity-60">Ask the admin to assign wedding projects to your editor account.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar: Project List */}
            <div className="space-y-2">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-3">My Projects ({projects.length})</p>
              {projects.map(p => (
                <button key={p.id} onClick={() => setSelected(p)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                    selected?.id === p.id ? "bg-zinc-800 border-[#b4975a]/40" : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                  }`}>
                  <div className="text-sm font-semibold text-white truncate">
                    {p.couple_name} <span className="text-zinc-500 text-xs font-light">(Project #{p.id})</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-1">
                    <Calendar size={9} /> {formatDate(p.wedding_date)}
                  </div>
                  <div className={`mt-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block ${
                    p.deliveries?.video_status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                    p.deliveries?.video_status === "changes_requested" ? "bg-red-500/10 text-red-400" :
                    "bg-amber-500/10 text-amber-400"
                  }`}>
                    {p.deliveries?.video_status === "approved" ? "✓ Approved" :
                     p.deliveries?.video_status === "changes_requested" ? "⚠ Changes Requested" : "Pending Review"}
                  </div>
                </button>
              ))}
            </div>

            {/* Main workspace panel */}
            {selected && (
              <div className="lg:col-span-3 space-y-5">
                {/* Project info bar */}
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
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Video Package</p>
                    <p className="text-zinc-300 text-xs font-light max-w-[200px]">{selected.package_details?.video || "—"}</p>
                  </div>
                  {selected.deliveries?.raw_photos_url && (
                    <div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Photo Drive</p>
                      <a href={selected.deliveries.raw_photos_url} target="_blank" rel="noopener noreferrer"
                        className="text-[#b4975a] text-xs hover:underline flex items-center gap-1">
                        <Camera size={11} /> Open Full Gallery ↗
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
                        <p className="text-zinc-400 text-[10px] font-light leading-snug truncate">
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
                        <p className="text-zinc-400 text-[10px] font-light leading-snug">
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
                        <p className="text-zinc-400 text-[10px] font-light leading-snug">
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

                {/* Admin Assigned Raw Footage (Up to 4 Google Drive Links) */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-left space-y-4">
                  <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <span className="text-[#b4975a]">🎥</span> Raw Video Footage Streams (Admin Assigned)
                      </h3>
                      <p className="text-zinc-500 text-[10px] font-light mt-0.5">
                        Access raw footage folders and multi-camera streams assigned by the coordinator for editing.
                      </p>
                    </div>
                    <span className="bg-[#b4975a]/10 border border-[#b4975a]/20 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-[#b4975a]">
                      Up to 4 links
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { num: 1, label: "Drive Link 1 (Cam A / Event 1)", url: selected.deliveries?.raw_video_drive_url_1 },
                      { num: 2, label: "Drive Link 2 (Cam B / Event 2)", url: selected.deliveries?.raw_video_drive_url_2 },
                      { num: 3, label: "Drive Link 3 (Cam C / Event 3)", url: selected.deliveries?.raw_video_drive_url_3 },
                      { num: 4, label: "Drive Link 4 (Raw Audio / Drone)", url: selected.deliveries?.raw_video_drive_url_4 }
                    ].map((drive, idx) => {
                      const isAssigned = !!drive.url;
                      return (
                        <div key={idx} className={`p-4 rounded-xl border flex flex-col justify-between h-32 transition-all ${
                          isAssigned 
                            ? "bg-zinc-950/40 border-zinc-800/60 hover:border-[#b4975a]/30" 
                            : "bg-zinc-950/20 border-dashed border-zinc-800/40 opacity-50"
                        }`}>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#b4975a] block mb-1">
                              📂 {drive.label}
                            </span>
                            <p className="text-zinc-500 text-[9px] font-light leading-snug">
                              {isAssigned ? "Google Drive folder containing raw footage streams." : "Not assigned by administrator yet."}
                            </p>
                          </div>
                          {isAssigned ? (
                            <a href={drive.url} target="_blank" rel="noopener noreferrer"
                              className="w-full text-center py-2 bg-[#b4975a]/10 hover:bg-[#b4975a]/25 border border-[#b4975a]/20 hover:border-[#b4975a]/40 rounded-lg text-[9px] font-bold uppercase tracking-widest text-[#b4975a] transition-all flex items-center justify-center gap-1">
                              Open Drive <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span className="w-full text-center py-2 bg-zinc-905 border border-zinc-800/50 rounded-lg text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                              Unassigned
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Video deliverables workspace */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
                  {/* Section Title */}
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#b4975a]/10 border border-[#b4975a]/20 flex items-center justify-center">
                        <Video className="text-[#b4975a]" size={20} />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-white">Cinematic Film Deliverables</h2>
                        <p className="text-zinc-500 text-xs font-light mt-0.5">Manage and curate high-resolution wedding film assets.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {selected.deliveries?.video_status === "approved" && (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                          <Check size={11} /> Approved
                        </span>
                      )}
                      {selected.deliveries?.video_status === "changes_requested" && (
                        <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          ⚠ Revision Requested
                        </span>
                      )}
                      <button 
                        onClick={saveVideoLinks} 
                        disabled={saving}
                        className="px-5 py-2 bg-[#b4975a] hover:bg-[#c5a86b] disabled:opacity-50 text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer hover:shadow-lg active:scale-95 flex items-center gap-1.5"
                      >
                        {saving ? "Saving Links..." : "Save All Links"}
                      </button>
                    </div>
                  </div>

                  {/* 3-Column Cinematic Film Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Teaser Film */}
                    <div className="space-y-3 text-left bg-zinc-950/40 p-5 rounded-2xl border border-zinc-800/80 hover:border-zinc-700/50 transition-colors flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                          🎬 Teaser / Trailer (1-2 Min)
                        </span>
                        <p className="text-zinc-500 text-[10px] font-light mb-2 leading-relaxed">
                          Provide a YouTube/Vimeo/Drive URL or upload a high-quality video file directly.
                        </p>
                        <input 
                          type="url" 
                          placeholder="Paste video link here..."
                          value={videoTeaserUrl} 
                          onChange={e => setVideoTeaserUrl(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white text-xs font-light focus:border-[#b4975a] focus:outline-none transition-colors" 
                        />
                        <div className="mt-2.5">
                          <label className={`w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-[11px] font-medium rounded-xl border border-dashed border-[#b4975a]/30 hover:border-[#b4975a]/60 text-[#b4975a] transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none ${uploadingTeaser ? "opacity-60 pointer-events-none" : ""}`}>
                            {uploadingTeaser ? (
                              <RefreshCw size={12} className="animate-spin text-[#b4975a]" />
                            ) : (
                              <Upload size={12} />
                            )}
                            <span>{uploadingTeaser ? "Uploading Teaser..." : "Upload from Computer"}</span>
                            <input 
                              type="file" 
                              onChange={(e) => handleFileUpload(e, "teaser")} 
                              className="hidden" 
                              accept="video/*" 
                              disabled={uploadingTeaser}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-800/50">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">
                          {videoTeaserUrl ? (videoTeaserUrl.startsWith('/uploads/') ? "💻 Local Upload" : "🔗 External Link") : "⚠️ Empty"}
                        </span>
                        {videoTeaserUrl && (
                          <a 
                            href={videoTeaserUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#b4975a] hover:text-[#c5a86b] text-[10px] uppercase font-bold tracking-wider transition-colors"
                          >
                            Preview <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Highlights Film */}
                    <div className="space-y-3 text-left bg-zinc-950/40 p-5 rounded-2xl border border-zinc-800/80 hover:border-zinc-700/50 transition-colors flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                          🍿 Highlights Film (5-10 Min)
                        </span>
                        <p className="text-zinc-500 text-[10px] font-light mb-2 leading-relaxed">
                          Provide a YouTube/Vimeo/Drive URL or upload a high-quality video file directly.
                        </p>
                        <input 
                          type="url" 
                          placeholder="Paste video link here..."
                          value={videoHighlightUrl} 
                          onChange={e => setVideoHighlightUrl(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white text-xs font-light focus:border-[#b4975a] focus:outline-none transition-colors" 
                        />
                        <div className="mt-2.5">
                          <label className={`w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-[11px] font-medium rounded-xl border border-dashed border-[#b4975a]/30 hover:border-[#b4975a]/60 text-[#b4975a] transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none ${uploadingHighlight ? "opacity-60 pointer-events-none" : ""}`}>
                            {uploadingHighlight ? (
                              <RefreshCw size={12} className="animate-spin text-[#b4975a]" />
                            ) : (
                              <Upload size={12} />
                            )}
                            <span>{uploadingHighlight ? "Uploading Highlight..." : "Upload from Computer"}</span>
                            <input 
                              type="file" 
                              onChange={(e) => handleFileUpload(e, "highlight")} 
                              className="hidden" 
                              accept="video/*" 
                              disabled={uploadingHighlight}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-800/50">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">
                          {videoHighlightUrl ? (videoHighlightUrl.startsWith('/uploads/') ? "💻 Local Upload" : "🔗 External Link") : "⚠️ Empty"}
                        </span>
                        {videoHighlightUrl && (
                          <a 
                            href={videoHighlightUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#b4975a] hover:text-[#c5a86b] text-[10px] uppercase font-bold tracking-wider transition-colors"
                          >
                            Preview <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Full Film */}
                    <div className="space-y-3 text-left bg-zinc-950/40 p-5 rounded-2xl border border-zinc-800/80 hover:border-zinc-700/50 transition-colors flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                          🎞️ Full Wedding Film (30-60 Min)
                        </span>
                        <p className="text-zinc-500 text-[10px] font-light mb-2 leading-relaxed">
                          Provide a YouTube/Vimeo/Drive URL or upload a high-quality video file directly.
                        </p>
                        <input 
                          type="url" 
                          placeholder="Paste video link here..."
                          value={videoFullUrl} 
                          onChange={e => setVideoFullUrl(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white text-xs font-light focus:border-[#b4975a] focus:outline-none transition-colors" 
                        />
                        <div className="mt-2.5">
                          <label className={`w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-[11px] font-medium rounded-xl border border-dashed border-[#b4975a]/30 hover:border-[#b4975a]/60 text-[#b4975a] transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none ${uploadingFull ? "opacity-60 pointer-events-none" : ""}`}>
                            {uploadingFull ? (
                              <RefreshCw size={12} className="animate-spin text-[#b4975a]" />
                            ) : (
                              <Upload size={12} />
                            )}
                            <span>{uploadingFull ? "Uploading Full Film..." : "Upload from Computer"}</span>
                            <input 
                              type="file" 
                              onChange={(e) => handleFileUpload(e, "full")} 
                              className="hidden" 
                              accept="video/*" 
                              disabled={uploadingFull}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-800/50">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">
                          {videoFullUrl ? (videoFullUrl.startsWith('/uploads/') ? "💻 Local Upload" : "🔗 External Link") : "⚠️ Empty"}
                        </span>
                        {videoFullUrl && (
                          <a 
                            href={videoFullUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#b4975a] hover:text-[#c5a86b] text-[10px] uppercase font-bold tracking-wider transition-colors"
                          >
                            Preview <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Wedding Reels / Shorts Section */}
                  <div className="border-t border-zinc-800/60 pt-6 space-y-4">
                    <div className="text-left">
                      <h3 className="text-sm font-semibold text-white">Curated Wedding Reels & Shorts</h3>
                      <p className="text-zinc-500 text-xs font-light mt-0.5">Add, preview, and manage short-form vertical Instagram/YouTube reels for social sharing.</p>
                    </div>

                    {/* Reel Addition Inputs */}
                    <div className="flex flex-col gap-4 bg-zinc-950/20 p-4 rounded-2xl border border-zinc-800/50 text-left">
                      <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 space-y-1">
                          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Reel Title</label>
                          <input 
                            type="text" 
                            placeholder="e.g., Bride's Royal Entry"
                            value={newReelTitle} 
                            onChange={e => setNewReelTitle(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs font-light focus:border-[#b4975a] focus:outline-none transition-colors" 
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Instagram/YouTube Reel or Video Link</label>
                          <div className="flex gap-2">
                            <input 
                              type="url" 
                              placeholder="Paste link or upload file..."
                              value={newReelUrl} 
                              onChange={e => setNewReelUrl(e.target.value)}
                              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs font-light focus:border-[#b4975a] focus:outline-none transition-colors" 
                            />
                            <label className={`px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-[#b4975a] border border-[#b4975a]/20 hover:border-[#b4975a]/40 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none active:scale-[0.98] ${uploadingReel ? "opacity-60 pointer-events-none" : ""}`}>
                              {uploadingReel ? (
                                <RefreshCw size={12} className="animate-spin text-[#b4975a]" />
                              ) : (
                                <Upload size={12} />
                              )}
                              <span>{uploadingReel ? "Uploading..." : "Upload File"}</span>
                              <input 
                                type="file" 
                                onChange={(e) => handleFileUpload(e, "reel")} 
                                className="hidden" 
                                accept="video/*" 
                                disabled={uploadingReel}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-zinc-800/40">
                        <span className="text-[9px] text-zinc-500 font-medium">
                          {newReelUrl ? (newReelUrl.startsWith('/uploads/') ? "💻 Uploaded File ready to add" : "🔗 External Link ready to add") : "Provide title & video source above"}
                        </span>
                        <button 
                          onClick={handleAddReel}
                          className="px-6 py-2.5 bg-[#b4975a] hover:bg-[#c5a86b] text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Plus size={14} /> Add Reel to Gallery
                        </button>
                      </div>
                    </div>

                    {/* Curated Reels Grid */}
                    {weddingReels.length === 0 ? (
                      <div className="text-center py-8 bg-zinc-950/20 border border-dashed border-zinc-800/80 rounded-2xl text-zinc-500">
                        <Video size={24} className="mx-auto mb-2 opacity-30 text-[#b4975a]" />
                        <p className="text-xs font-light">No wedding reels uploaded yet.</p>
                        <p className="text-[10px] mt-0.5 opacity-60">Add a title and video URL above to curate vertical shorts.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {weddingReels.map((reel) => (
                          <div 
                            key={reel.id} 
                            className="bg-zinc-950/60 border border-zinc-800/60 p-4 rounded-xl flex items-center justify-between gap-3 hover:border-zinc-700/50 hover:shadow-lg transition-all"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-[#b4975a]/5 border border-[#b4975a]/10 flex items-center justify-center shrink-0">
                                <Play size={12} className="text-[#b4975a]" />
                              </div>
                              <div className="text-left min-w-0">
                                <p className="text-xs font-semibold text-white truncate">{reel.title}</p>
                                <a 
                                  href={reel.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[9px] text-[#b4975a] hover:underline truncate block mt-0.5"
                                >
                                  {reel.url}
                                </a>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleDeleteReel(reel.id)}
                              className="p-2 text-zinc-500 hover:text-red-400 bg-zinc-900 border border-zinc-800 hover:border-red-500/20 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="Delete Reel"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Client Chat */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                  <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">Client Chat</p>
                      <p className="text-zinc-500 text-[10px] font-light mt-0.5">Direct channel with {selected.couple_name}</p>
                    </div>
                    <button onClick={fetchChat} className="text-zinc-500 hover:text-white cursor-pointer">
                      <RefreshCw size={13} />
                    </button>
                  </div>
                  <div className="h-52 overflow-y-auto flex flex-col gap-2.5 bg-zinc-950 rounded-xl p-3">
                    {chatMessages.length === 0 ? (
                      <div className="my-auto text-center text-zinc-600 text-xs">No messages yet.</div>
                    ) : chatMessages.map(m => {
                      const isMe = m.sender === "editor";
                      return (
                        <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%] ${isMe ? "self-end" : "self-start"}`}>
                          <span className="text-[8px] text-zinc-600 mb-0.5 px-1">{isMe ? "You" : (m.sender === "client" ? selected.couple_name : m.sender)}</span>
                          <div className={`p-2.5 rounded-xl text-xs ${isMe ? "bg-[#b4975a]/20 border border-[#b4975a]/30 text-white" : "bg-zinc-800 border border-zinc-700 text-zinc-300"}`}>
                            {m.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <form onSubmit={sendMsg} className="flex gap-2">
                    <input type="text" placeholder="Reply to client..." value={msgText} onChange={e => setMsgText(e.target.value)}
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-xs focus:border-[#b4975a] focus:outline-none" required />
                    <button type="submit"
                      className="px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors">
                      <Send size={12} /> Send
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorPortal;
