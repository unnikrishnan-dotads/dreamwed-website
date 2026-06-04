import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn, LogOut, ShieldCheck, AlertCircle, Link2, Calendar, CheckCircle2,
  ChevronRight, FileText, Package, Users, MessageSquare, Plus, Trash2, Edit3,
  Eye, EyeOff, Save, X, Camera, Video, BookOpen, RefreshCw, Search, Share2,
  Download, Heart
} from "lucide-react";
import SEO from "../components/SEO";

const ADMIN_PASS = "dreamwed2026";
const API_BASE = typeof window !== "undefined"
  ? (localStorage.getItem("dreamwed_api_base") || import.meta.env.VITE_API_BASE_URL || (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? window.location.origin : "https://dreamwed-backend.onrender.com"))
  : "http://localhost:3000";

const INITIAL_GALLERIES = [
  {
    id: "wedding-aarav-meera",
    name: "Aarav & Meera's Royal Wedding",
    gdriveLink: "https://drive.google.com/drive/folders/1AaravMeeraRoyalWeddingDreamwedDemo",
    type: "After Event Gallery",
    coverUrl: "/ai_search_banner.png",
    photos: [
      { id: "am-1", url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800" },
      { id: "am-2", url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800" },
      { id: "am-3", url: "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?q=80&w=800" },
      { id: "am-4", url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800" },
      { id: "am-5", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800" }
    ]
  },
  {
    id: "wedding-rohan-dia",
    name: "Rohan & Dia's Mumbai Sangeet",
    gdriveLink: "https://drive.google.com/drive/folders/2RohanDiaMumbaiSangeetDreamwedDemo",
    type: "Live Gallery",
    coverUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800",
    photos: [
      { id: "rd-1", url: "https://images.unsplash.com/photo-1507504038482-76210f5c0be6?q=80&w=800" },
      { id: "rd-2", url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800" },
      { id: "rd-3", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800" },
      { id: "rd-4", url: "https://images.unsplash.com/photo-1519225495810-7517cbdb222d?q=80&w=800" },
      { id: "rd-5", url: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=800" }
    ]
  }
];

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("projects"); // projects | staff | chats

  // Projects tab state
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [driveLink, setDriveLink] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [videoDrive1, setVideoDrive1] = useState("");
  const [videoDrive2, setVideoDrive2] = useState("");
  const [videoDrive3, setVideoDrive3] = useState("");
  const [videoDrive4, setVideoDrive4] = useState("");
  const [bookings, setBookings] = useState([]);

  // Staff tab state
  const [staffUsers, setStaffUsers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newStaff, setNewStaff] = useState({ username: "", password: "", role: "editor", display_name: "" });
  const [staffSaving, setStaffSaving] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null); // staff user being edited
  const [showPassId, setShowPassId] = useState(null); // id of staff whose password is visible
  const [assigningStaffId, setAssigningStaffId] = useState(null); // staff id being assigned

  // Client management tab state
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSearch, setClientSearch] = useState("");
  const [editBridePassword, setEditBridePassword] = useState("");
  const [editGroomPassword, setEditGroomPassword] = useState("");
  const [activeInvoiceBooking, setActiveInvoiceBooking] = useState(null);
  const [activeClientPhotoTab, setActiveClientPhotoTab] = useState("bride"); // bride | groom | matches

  // Chats tab state
  const [chatProject, setChatProject] = useState(null);
  const [chatChannel, setChatChannel] = useState("client-admin");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // AI Galleries & Orders state
  const [aiGalleries, setAiGalleries] = useState([]);
  const [aiOrders, setAiOrders] = useState([]);
  const [newGalName, setNewGalName] = useState("");
  const [newGalDrive, setNewGalDrive] = useState("");
  const [newGalType, setNewGalType] = useState("After Event Gallery");
  const [newGalCover, setNewGalCover] = useState("https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800");
  const [selectedGalForPhotos, setSelectedGalForPhotos] = useState(null);
  const [bulkPhotoUrls, setBulkPhotoUrls] = useState("");

  // Check auth on mount
  useEffect(() => {
    if (localStorage.getItem("dreamwed_admin_auth") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
      fetchStaff();
      fetchBookings();

      // Load AI galleries & orders
      if (!localStorage.getItem("dreamwed_galleries")) {
        localStorage.setItem("dreamwed_galleries", JSON.stringify(INITIAL_GALLERIES));
      }
      const storedGals = JSON.parse(localStorage.getItem("dreamwed_galleries") || "[]");
      const storedOrds = JSON.parse(localStorage.getItem("dreamwed_orders") || "[]");
      setAiGalleries(storedGals);
      setAiOrders(storedOrds);
    }
  }, [isAuthenticated]);

  // Sync editor fields when project is selected
  useEffect(() => {
    if (selectedProject) {
      setDriveLink(selectedProject.deliveries?.raw_photos_url || "");
      setDeadlineDate(selectedProject.deadline_date || "");
      setVideoDrive1(selectedProject.deliveries?.raw_video_drive_url_1 || "");
      setVideoDrive2(selectedProject.deliveries?.raw_video_drive_url_2 || "");
      setVideoDrive3(selectedProject.deliveries?.raw_video_drive_url_3 || "");
      setVideoDrive4(selectedProject.deliveries?.raw_video_drive_url_4 || "");
    }
  }, [selectedProject]);

  // Load chats when chatProject or chatChannel changes
  useEffect(() => {
    if (chatProject && isAuthenticated) {
      loadChats();
    }
  }, [chatProject, chatChannel]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/projects`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        if (data.length > 0 && !selectedProject) {
          setSelectedProject(data[0]);
        } else if (selectedProject) {
          const updatedSelected = data.find(p => p.id === selectedProject.id);
          if (updatedSelected) setSelectedProject(updatedSelected);
        }
        if (!chatProject && data.length > 0) {
          setChatProject(data[0]);
        }
      } else {
        throw new Error("Server error");
      }
    } catch (e) {
      console.error("Error fetching projects, falling back locally:", e);
      const localProjects = JSON.parse(localStorage.getItem("dreamwed_projects") || "[]");
      setProjects(localProjects);
      if (localProjects.length > 0 && !selectedProject) {
        setSelectedProject(localProjects[0]);
      } else if (selectedProject) {
        const updatedSelected = localProjects.find(p => p.id === selectedProject.id);
        if (updatedSelected) setSelectedProject(updatedSelected);
      }
      if (!chatProject && localProjects.length > 0) {
        setChatProject(localProjects[0]);
      }
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/staff`);
      if (res.ok) {
        setStaffUsers(await res.json());
      } else {
        throw new Error("Server error");
      }
    } catch (e) {
      console.error("Error fetching staff, falling back locally:", e);
      const localStaff = JSON.parse(localStorage.getItem("dreamwed_staff") || JSON.stringify([
        { id: 1, username: "designer", display_name: "Lead Album Designer", role: "designer", assigned_projects: [2, 3] },
        { id: 2, username: "editor", display_name: "Lead Video Editor", role: "editor", assigned_projects: [2, 3] }
      ]));
      if (!localStorage.getItem("dreamwed_staff")) {
        localStorage.setItem("dreamwed_staff", JSON.stringify(localStaff));
      }
      setStaffUsers(localStaff);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings`);
      if (res.ok) {
        setBookings(await res.json());
      } else {
        throw new Error("Server error");
      }
    } catch (e) {
      console.error("Error fetching bookings, falling back locally:", e);
      const localBookings = JSON.parse(localStorage.getItem("dreamwed_bookings") || "[]");
      setBookings(localBookings);
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/confirm`, {
        method: "POST"
      });
      if (res.ok) {
        alert("✅ Booking approved successfully! The couple can now access their wedding workspace.");
        await fetchBookings();
        await fetchProjects();
      } else {
        throw new Error("Server confirm failed");
      }
    } catch (e) {
      console.error("Approval error, falling back locally:", e);
      
      const localBookings = JSON.parse(localStorage.getItem("dreamwed_bookings") || "[]");
      const localProjects = JSON.parse(localStorage.getItem("dreamwed_projects") || "[]");
      
      const bookingToConfirm = localBookings.find(b => b.id === Number(bookingId));
      if (bookingToConfirm) {
        bookingToConfirm.status = "confirmed";
        bookingToConfirm.updated_at = new Date().toISOString();
        
        // Spawn project
        let projectMatch = localProjects.find(p => p.booking_id === bookingToConfirm.id);
        if (!projectMatch) {
          projectMatch = {
            id: bookingToConfirm.id,
            booking_id: bookingToConfirm.id,
            couple_name: bookingToConfirm.customer_name,
            wedding_date: bookingToConfirm.event_date,
            current_step: 3, // start at step 3
            timeline_steps: [
              { name: "Photos Uploaded", completed: true, updated_at: new Date().toISOString() },
              { name: "Client Selected Photos", completed: false, updated_at: null },
              { name: "Video Editing Completed", completed: false, updated_at: null },
              { name: "Album Design Pending Approval", completed: false, updated_at: null },
              { name: "Final Delivery Completed", completed: false, updated_at: null }
            ],
            package_details: {
              photography: "Traditional + Candid (4-Camera coverage)",
              video: "Cinematic Pre-Wedding Video + Teaser Reel + Highlight Film",
              album: "One 80-Page Premium Couture Leather Layflat Album",
              edited_photos: "120 color-corrected high-res photos included",
              delivery_items: "Premium Signature bag, custom photo calendar & USB drive"
            },
            gallery_images: [
              { id: 1, url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600", favorited: false, categories: [], comment: "" },
              { id: 2, url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600", favorited: false, categories: [], comment: "" }
            ],
            deliveries: {
              video_teaser_url: "https://www.youtube.com/embed/S9-SrdnKsMs",
              video_status: "pending",
              album_pdf_url: "https://dreamwedstories.co.in/draft-album.pdf",
              album_status: "pending",
              final_download_url: ""
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          localProjects.push(projectMatch);
        }
        
        localStorage.setItem("dreamwed_bookings", JSON.stringify(localBookings));
        localStorage.setItem("dreamwed_projects", JSON.stringify(localProjects));
        
        alert("✅ Booking approved successfully (Local Offline Sync Active)! The couple can now access their wedding workspace.");
        
        // Refresh local views
        setBookings(localBookings);
        setProjects(localProjects);
        if (localProjects.length > 0 && !selectedProject) setSelectedProject(localProjects[0]);
      } else {
        alert("Booking not found locally.");
      }
    }
  };

  const loadChats = async () => {
    if (!chatProject) return;
    setChatLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/projects/${chatProject.id}/chats/${chatChannel}`);
      if (res.ok) {
        setChatMessages(await res.json());
      }
    } catch (e) {
      console.error("Error loading chats:", e);
    } finally {
      setChatLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.toLowerCase() === "admin" && password === ADMIN_PASS) {
      setIsAuthenticated(true);
      setLoginError("");
      localStorage.setItem("dreamwed_admin_auth", "true");
    } else {
      setLoginError("Invalid username or password credentials.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("dreamwed_admin_auth");
    setUsername("");
    setPassword("");
    setSelectedProject(null);
  };

  const handleUpdateProject = async () => {
    if (!selectedProject) return;
    setSaving(true);
    try {
      const payload = {
        deadline_date: deadlineDate,
        deliveries: { 
          ...selectedProject.deliveries, 
          raw_photos_url: driveLink.trim(),
          raw_video_drive_url_1: videoDrive1.trim(),
          raw_video_drive_url_2: videoDrive2.trim(),
          raw_video_drive_url_3: videoDrive3.trim(),
          raw_video_drive_url_4: videoDrive4.trim()
        }
      };
      const res = await fetch(`${API_BASE}/api/projects/${selectedProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("✅ Project deliverables link & deadline saved successfully!");
        await fetchProjects();
      } else {
        alert("Error saving updates to project.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error updating project.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePasswords = async (bookingId, newBridePass, newGroomPass) => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bride_password: newBridePass,
          groom_password: newGroomPass
        })
      });
      if (res.ok) {
        alert("🎉 Client access passwords updated successfully!");
        fetchBookings();
        setSelectedClient(prev => prev ? { ...prev, bride_password: newBridePass, groom_password: newGroomPass } : null);
      } else {
        throw new Error();
      }
    } catch (e) {
      console.warn("Error updating password in database, syncing locally:", e);
      const localBookings = JSON.parse(localStorage.getItem("dreamwed_bookings") || "[]");
      const match = localBookings.find(b => b.id === Number(bookingId));
      if (match) {
        match.bride_password = newBridePass;
        match.groom_password = newGroomPass;
        localStorage.setItem("dreamwed_bookings", JSON.stringify(localBookings));
        setBookings(localBookings);
        setSelectedClient({ ...match });
        alert("🎉 Client access passwords updated successfully (Offline Sync Active)!");
      } else {
        alert("Failed to save changes. Client booking not found.");
      }
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.username || !newStaff.password) return;
    setStaffSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newStaff, display_name: newStaff.display_name || newStaff.username })
      });
      if (res.ok) {
        await fetchStaff();
        setNewStaff({ username: "", password: "", role: "editor", display_name: "" });
        setShowCreateForm(false);
        alert("✅ Staff account created successfully!");
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (e) {
      alert("Network error creating staff account.");
    } finally {
      setStaffSaving(false);
    }
  };

  const handleDeleteStaff = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/staff/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchStaff();
      }
    } catch (e) {
      alert("Error deleting staff account.");
    }
  };

  const handleAssignProject = async (staffId, projectId, assign) => {
    const staff = staffUsers.find(u => u.id === staffId);
    if (!staff) return;
    const current = staff.assigned_projects || [];
    const updated = assign
      ? [...new Set([...current, Number(projectId)])]
      : current.filter(id => id !== Number(projectId));
    try {
      const res = await fetch(`${API_BASE}/api/staff/${staffId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigned_projects: updated })
      });
      if (res.ok) {
        await fetchStaff();
      }
    } catch (e) {
      alert("Error updating assignment.");
    }
  };

  const formatDateString = (d) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return d; }
  };

  const getProgressPct = (p) => {
    if (!p || !p.timeline_steps) return 0;
    return Math.round((p.current_step / p.timeline_steps.length) * 100);
  };

  const getSelectedPhotosCount = (p) => {
    if (!p || !p.gallery_images) return 0;
    return p.gallery_images.filter(img => img.favorited || img.categories?.includes("album")).length;
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    try { return new Date(ts.includes("T") ? ts : ts.replace(" ", "T") + "Z").toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); }
    catch { return ts; }
  };

  const handleCreateAiGallery = (e) => {
    e.preventDefault();
    if (!newGalName || !newGalDrive) return;
    const newId = `wedding-${newGalName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const newGal = {
      id: newId,
      name: newGalName,
      gdriveLink: newGalDrive,
      type: newGalType,
      coverUrl: newGalCover,
      photos: []
    };
    const updated = [newGal, ...aiGalleries];
    setAiGalleries(updated);
    localStorage.setItem("dreamwed_galleries", JSON.stringify(updated));
    setNewGalName("");
    setNewGalDrive("");
    alert("💍 AI Photo Gallery created successfully!");
  };


  const handleDeleteAiGallery = (id) => {
    if (aiGalleries.length <= 1) {
      alert("Cannot delete the last remaining AI gallery!");
      return;
    }
    if (!confirm("Are you sure you want to delete this gallery?")) return;
    const updated = aiGalleries.filter(g => g.id !== id);
    setAiGalleries(updated);
    localStorage.setItem("dreamwed_galleries", JSON.stringify(updated));
  };

  const convertGoogleDriveUrl = (url) => {
    const matchd = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (matchd && matchd[1]) return `https://lh3.googleusercontent.com/d/${matchd[1]}`;
    
    const matchid = url.match(/id=([a-zA-Z0-9_-]+)/);
    if (matchid && matchid[1]) return `https://lh3.googleusercontent.com/d/${matchid[1]}`;
    
    return url;
  };

  const handleAddBulkPhotos = (e) => {
    e.preventDefault();
    if (!selectedGalForPhotos || !bulkPhotoUrls.trim()) return;

    const urls = bulkPhotoUrls
      .split(/[,\n]/)
      .map(url => url.trim())
      .filter(url => url.length > 0 && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/") || url.startsWith("data:image")));

    if (urls.length === 0) {
      alert("Please enter at least one valid image URL starting with http://, https://, or data:image");
      return;
    }

    const processedUrls = urls.map(url => convertGoogleDriveUrl(url));

    const currentPhotos = selectedGalForPhotos.photos || [];
    const newPhotos = processedUrls.map((url, index) => ({
      id: `photo-${Date.now()}-${index}-${Math.floor(Math.random() * 1050)}`,
      url: url
    }));

    const updatedGal = {
      ...selectedGalForPhotos,
      photos: [...currentPhotos, ...newPhotos]
    };

    const updatedGalleries = aiGalleries.map(g => g.id === selectedGalForPhotos.id ? updatedGal : g);
    setAiGalleries(updatedGalleries);
    localStorage.setItem("dreamwed_galleries", JSON.stringify(updatedGalleries));
    
    setSelectedGalForPhotos(updatedGal);
    setBulkPhotoUrls("");
  };

  const handleDeletePhotoFromGal = (photoId) => {
    if (!selectedGalForPhotos) return;

    const currentPhotos = selectedGalForPhotos.photos || [];
    const updatedPhotos = currentPhotos.filter(p => p.id !== photoId);

    const updatedGal = {
      ...selectedGalForPhotos,
      photos: updatedPhotos
    };

    const updatedGalleries = aiGalleries.map(g => g.id === selectedGalForPhotos.id ? updatedGal : g);
    setAiGalleries(updatedGalleries);
    localStorage.setItem("dreamwed_galleries", JSON.stringify(updatedGalleries));

    setSelectedGalForPhotos(updatedGal);
  };

  const handleUpdateAiOrderStatus = (orderId, newStatus) => {
    const updated = aiOrders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    setAiOrders(updated);
    localStorage.setItem("dreamwed_orders", JSON.stringify(updated));
  };

  const getRoleIcon = (role) => {
    if (role === "designer") return <BookOpen size={14} className="text-purple-400" />;
    return <Video size={14} className="text-blue-400" />;
  };

  const CHANNELS = [
    { id: "client-admin", label: "👥 Client ↔ Coordinator" },
    { id: "client-editor", label: "🎥 Client ↔ Video Editor" },
    { id: "client-designer", label: "📖 Client ↔ Album Designer" }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-[#f5f5f3] flex items-center justify-center relative">
        {/* Floating Back to Home button */}
        <a 
          href="/" 
          className="absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2 rounded-xl bg-black/5 hover:bg-black/10 border border-black/10 hover:border-black/20 transition-all text-xs font-semibold text-zinc-700 hover:text-zinc-950 uppercase tracking-wider backdrop-blur-sm shadow-md active:scale-95 group cursor-pointer"
        >
          <span>←</span> Back to Home
        </a>
        <SEO title="Admin Control Center" description="Dreamwed Stories secure management portal." />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full mx-auto px-6 py-12 bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-zinc-100 text-zinc-800"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#b4975a]/10 border border-[#b4975a]/20 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={28} className="text-[#b4975a]" />
            </div>
            <span className="text-[#b4975a] font-bold text-[10px] tracking-[0.3em] uppercase block mb-1">Secure Portal</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl text-zinc-900 font-light">Dreamwed Admin</h2>
            <p className="text-zinc-400 text-xs font-light mt-2">Enter credentials to manage wedding projects</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block mb-2">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="admin" required
                className="w-full px-5 py-3.5 border border-zinc-200 rounded-xl text-zinc-800 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b4975a]/20 focus:border-[#b4975a] transition-all" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full px-5 py-3.5 border border-zinc-200 rounded-xl text-zinc-800 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b4975a]/20 focus:border-[#b4975a] transition-all" />
            </div>
            {loginError && (
              <div className="flex items-center gap-2.5 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-medium">
                <AlertCircle size={16} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}
            <button type="submit"
              className="w-full py-4 bg-zinc-950 hover:bg-black text-white rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.98]">
              <LogIn size={16} /> Access Control
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] pt-20 pb-16">
      <SEO title="Admin Control Center" description="Dreamwed Stories secure management portal." />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 text-white"
      >
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-5 border-b border-zinc-800">
          <div>
            <span className="text-[#b4975a] font-bold text-[10px] tracking-[0.3em] uppercase block mb-1">Wedding Hub Console</span>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl sm:text-4xl text-white font-light tracking-tight">
              Admin <span className="italic font-serif text-[#b4975a]">Control Panel</span>
            </h1>
          </div>
          <div className="flex gap-2.5">
            <a href="/"
              className="px-4 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-[#b4975a] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-[#b4975a]/20 hover:border-[#b4975a]/40 transition-all cursor-pointer active:scale-95">
              <span>←</span> Back to Home
            </a>
            <button onClick={handleLogout}
              className="px-4 py-2.5 rounded-full bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-zinc-100 transition-all cursor-pointer active:scale-95">
              <LogOut size={13} /> Log Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 mb-8 w-fit">
          {[
            { id: "projects", label: "🗂 Projects", icon: Package },
            { id: "bookings", label: "📖 Booking Approvals", icon: CheckCircle2 },
            { id: "clients", label: "👑 Client Management", icon: Users },
            { id: "staff", label: "👥 Staff Management", icon: Users },
            { id: "chats", label: "💬 Chat Viewer", icon: MessageSquare },
            { id: "ai-galleries", label: "💍 AI Galleries", icon: Camera },
            { id: "ai-orders", label: "🧾 AI Print Orders", icon: Package }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab.id ? "bg-[#b4975a] text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-white"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* =============================== PROJECTS TAB ================================ */}
        {activeTab === "projects" && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
            {/* Left: Project list */}
            <div className="md:col-span-2 space-y-4 text-left">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-2">Projects ({projects.length})</span>
              {projects.map((p) => {
                const isSelected = selectedProject?.id === p.id;
                const progress = getProgressPct(p);
                const currentStepName = p.timeline_steps[p.current_step - 1]?.name || "Pending";
                return (
                  <button key={p.id} onClick={() => setSelectedProject(p)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3.5 relative overflow-hidden ${
                      isSelected ? "bg-zinc-900 border-[#b4975a]/45 shadow-[0_10px_30px_rgba(180,151,90,0.05)]" : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                    }`}>
                    {isSelected && <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl" />}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-white truncate">{p.couple_name}</h4>
                        <span className="text-[9px] text-zinc-500 font-light flex items-center gap-1 mt-0.5">
                          <Calendar size={10} className="text-[#b4975a]" /> {formatDateString(p.wedding_date)}
                        </span>
                      </div>
                      <ChevronRight size={16} className={`text-zinc-500 transition-transform ${isSelected ? "translate-x-1 text-[#b4975a]" : ""}`} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-zinc-400 font-bold uppercase tracking-wider">{currentStepName}</span>
                        <span className="text-[#b4975a] font-bold">{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-[#b4975a] rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: project details editor */}
            <div className="md:col-span-3">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-4 text-left">Project Details & Link Editor</span>
              {selectedProject ? (
                <div className="bg-zinc-950 border border-zinc-800 rounded-[32px] p-6 sm:p-8 space-y-6 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="border-b border-zinc-800 pb-4">
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-2xl text-white font-light">
                      {selectedProject.couple_name}'s <span className="italic font-serif text-[#b4975a]">Wedding Portal</span>
                    </h3>
                    <p className="text-zinc-500 text-[10px] font-light mt-1 flex items-center gap-1.5">
                      <span>Wedding: {formatDateString(selectedProject.wedding_date)}</span>
                      <span>•</span>
                      <span>Stage: {selectedProject.timeline_steps[selectedProject.current_step - 1]?.name}</span>
                    </p>
                  </div>

                  {/* Photo Drive link */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Link2 size={16} className="text-[#b4975a]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Google Drive / High-Res Photo Link</h4>
                    </div>
                    <input type="url" placeholder="Paste full Google Drive folder link here..."
                      value={driveLink} onChange={(e) => setDriveLink(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs focus:border-[#b4975a] focus:outline-none transition-colors" />
                  </div>

                  {/* Raw Video Footage Drive Links (up to 4) */}
                  <div className="space-y-4 bg-zinc-900/50 p-4 border border-zinc-800 rounded-2xl">
                    <div className="flex items-center gap-2 border-b border-zinc-800 pb-2.5">
                      <Video size={16} className="text-[#b4975a]" />
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Raw Video Footage Drive Links (Up to 4)</h4>
                        <p className="text-[9px] text-zinc-500 font-light mt-0.5">Assign raw video streams (e.g. multi-cams, events, folders) for editing.</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Drive Link 1 (e.g., Event 1 / Cam A)</label>
                        <input type="url" placeholder="Paste Google Drive link 1..."
                          value={videoDrive1} onChange={(e) => setVideoDrive1(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:border-[#b4975a] focus:outline-none transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Drive Link 2 (e.g., Event 2 / Cam B)</label>
                        <input type="url" placeholder="Paste Google Drive link 2..."
                          value={videoDrive2} onChange={(e) => setVideoDrive2(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:border-[#b4975a] focus:outline-none transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Drive Link 3 (e.g., Event 3 / Cam C)</label>
                        <input type="url" placeholder="Paste Google Drive link 3..."
                          value={videoDrive3} onChange={(e) => setVideoDrive3(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:border-[#b4975a] focus:outline-none transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Drive Link 4 (e.g., Raw Audio / drone)</label>
                        <input type="url" placeholder="Paste Google Drive link 4..."
                          value={videoDrive4} onChange={(e) => setVideoDrive4(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:border-[#b4975a] focus:outline-none transition-colors" />
                      </div>
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-[#b4975a]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Work Deadline Date</h4>
                    </div>
                    <input type="date" value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)}
                      style={{ colorScheme: "dark" }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs focus:border-[#b4975a] focus:outline-none transition-colors" />
                  </div>

                  <button onClick={handleUpdateProject} disabled={saving}
                    className="w-full py-3.5 bg-[#b4975a] hover:bg-[#c5a86b] text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_20px_rgba(180,151,90,0.15)] active:scale-[0.98]">
                    {saving ? "Saving Updates..." : "Save Link & Deadline"}
                  </button>

                  {selectedProject.deliveries?.raw_photos_url && (
                    <div className="p-3.5 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between text-[10px]">
                      <span className="text-zinc-400">Current Saved Link:</span>
                      <a href={selectedProject.deliveries.raw_photos_url} target="_blank" rel="noopener noreferrer"
                        className="text-[#b4975a] hover:underline font-bold uppercase flex items-center gap-1">
                        View Drive Folder ↗
                      </a>
                    </div>
                  )}

                  {/* Client letter */}
                  {(selectedProject.wedding_letter_url || selectedProject.wedding_letter_text) && (
                    <div className="pt-4 border-t border-zinc-800 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText size={15} className="text-[#b4975a]" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Client Letter & Story Wishes</h4>
                        </div>
                        {selectedProject.wedding_letter_url && (
                          <a href={selectedProject.wedding_letter_url} target="_blank" rel="noopener noreferrer"
                            className="text-[9px] text-[#b4975a] font-bold uppercase hover:underline">
                            Open PDF ↗
                          </a>
                        )}
                      </div>
                      {selectedProject.wedding_letter_text && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-zinc-300 text-xs font-light leading-relaxed whitespace-pre-wrap">
                          {selectedProject.wedding_letter_text}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Nudge */}
                  <div className="pt-4 border-t border-zinc-800 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400 font-bold uppercase tracking-wider">Client Selection Action</span>
                      <span className="text-[10px] text-zinc-500">{getSelectedPhotosCount(selectedProject)} photos hearted</span>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`${API_BASE}/api/projects/${selectedProject.id}/whatsapp-reminder`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ type: "photo_selection" })
                          });
                          if (res.ok) {
                            const data = await res.json();
                            alert(`💬 WhatsApp nudge simulated:\n"${data.reminder}"`);
                          }
                        } catch (e) {
                          alert("Connection error sending reminder.");
                        }
                      }}
                      className="w-full py-3 bg-zinc-900 border border-zinc-800 hover:bg-[#b4975a] hover:text-zinc-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer">
                      💬 Nudge Selection Process
                    </button>
                  </div>

                  <div className="pt-4 border-t border-zinc-800 flex justify-between items-center text-[10px] text-zinc-500 font-light">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      Client Marked: <strong>{getSelectedPhotosCount(selectedProject)} Album Photos</strong>
                    </span>
                    <span>Booking: #{selectedProject.booking_id}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-950 border border-zinc-800 rounded-[32px] p-8 text-center text-zinc-500 text-xs font-light">
                  Select a wedding project from the list to update details.
                </div>
              )}
            </div>
          </div>
        )}

        {/* =============================== BOOKINGS APPROVAL TAB ================================ */}
        {activeTab === "bookings" && (
          <div className="space-y-6 text-left">
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl text-white font-light">
                Booking <span className="italic font-serif text-[#b4975a]">Approvals</span>
              </h2>
              <p className="text-zinc-500 text-[11px] font-light mt-1">Review new client registration requests and approve invoices to unlock workspaces.</p>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-zinc-800 rounded-[24px] text-zinc-500 text-xs">
                No booking requests found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {bookings.map((b) => (
                  <div key={b.id} className="bg-zinc-950 border border-zinc-800 p-6 rounded-[24px] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="text-base font-bold text-white">{b.customer_name}</h4>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          b.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {b.status === "confirmed" ? "Approved" : "Pending Approval"}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-light leading-relaxed">
                        Event Venue: <strong className="text-white">{b.event_venue}</strong> • Date: <strong className="text-white">{formatDateString(b.event_date)}</strong>
                      </p>
                      <p className="text-[10px] text-zinc-500 leading-normal">
                        {b.coverage_type === "both" ? (
                          <span>
                            🤵 Groom: <strong className="text-zinc-300">{b.customer_phone}</strong> {b.customer_email && `(${b.customer_email})`} • 
                            👰 Bride: <strong className="text-zinc-300">{b.customer_phone_2}</strong> {b.customer_email_2 && `(${b.customer_email_2})`}
                          </span>
                        ) : (
                          <span>
                            Phone: {b.customer_phone} • Email: {b.customer_email || "—"}
                          </span>
                        )}
                        {" "}• Package: {b.package_name} (₹{Number(b.package_price).toLocaleString("en-IN")})
                      </p>
                    </div>

                    <div className="flex gap-3 shrink-0 w-full md:w-auto">
                      {b.status !== "confirmed" ? (
                        <button 
                          onClick={() => handleApproveBooking(b.id)}
                          className="w-full md:w-auto px-5 py-3 bg-[#b4975a] hover:bg-[#c5a86b] text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer hover:shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 size={13} /> Approve Booking
                        </button>
                      ) : (
                        <span className="text-zinc-500 text-xs font-semibold px-4 py-2 border border-zinc-800 rounded-xl inline-block bg-zinc-900/30 font-bold uppercase tracking-wider">
                          Workspace Unlocked ✓
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =============================== CLIENT MANAGEMENT TAB ================================ */}
        {activeTab === "clients" && (
          <div className="space-y-6 text-left">
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl text-white font-light">
                Client <span className="italic font-serif text-[#b4975a]">Management</span>
              </h2>
              <p className="text-zinc-500 text-[11px] font-light mt-1">Manage client passwords, access details, invoice receipts, and review photo selections.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
              {/* Left Panel: Search & List */}
              <div className="md:col-span-2 space-y-4">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                    <Search size={14} />
                  </span>
                  <input 
                    type="text" 
                    placeholder="Search client by name or phone..." 
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-3 text-white text-xs focus:border-[#b4975a] focus:outline-none"
                  />
                </div>

                <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
                  {bookings
                    .filter(b => {
                      const query = clientSearch.toLowerCase();
                      return b.customer_name?.toLowerCase().includes(query) || 
                             b.customer_phone?.includes(query) || 
                             (b.customer_phone_2 && b.customer_phone_2.includes(query));
                    })
                    .map(b => {
                      const isSelected = selectedClient?.id === b.id;
                      return (
                        <button 
                          key={b.id}
                          onClick={() => {
                            setSelectedClient(b);
                            setEditBridePassword(b.bride_password || "");
                            setEditGroomPassword(b.groom_password || "");
                          }}
                          className={`w-full text-left p-4.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 relative overflow-hidden ${
                            isSelected ? "bg-zinc-900 border-[#b4975a]/45 shadow-sm" : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          <div className="flex justify-between items-center gap-2">
                            <h4 className="text-sm font-bold text-white truncate">{b.customer_name}</h4>
                            <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              b.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                            }`}>
                              {b.status === "confirmed" ? "Active" : "Pending"}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 truncate leading-normal">
                            Date: {formatDateString(b.event_date)} • Phone: {b.customer_phone}
                          </p>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Right Panel: Client Workspace Details, Passwords, Selections, Invoices */}
              <div className="md:col-span-3">
                {selectedClient ? (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-[32px] p-6 sm:p-8 space-y-6 text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

                    {/* Top Info */}
                    <div className="border-b border-zinc-800 pb-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-xl font-bold text-white truncate">{selectedClient.customer_name}</h3>
                        <span className="text-[9px] text-[#b4975a] font-mono tracking-wider bg-[#b4975a]/10 border border-[#b4975a]/20 px-2.5 py-1 rounded-full uppercase">
                          {selectedClient.invoice_number || `INV-${selectedClient.id}`}
                        </span>
                      </div>
                      <p className="text-zinc-500 text-[10px] font-light mt-1 flex flex-wrap gap-2">
                        <span>Date: {formatDateString(selectedClient.event_date)}</span>
                        <span>•</span>
                        <span>Venue: {selectedClient.event_venue || "TBA"}</span>
                        <span>•</span>
                        <span>Pkg: {selectedClient.package_name}</span>
                      </p>
                    </div>

                    {/* Password management */}
                    <div className="space-y-4 bg-zinc-900/40 p-5 border border-zinc-800 rounded-2xl">
                      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                        <ShieldCheck size={16} className="text-[#b4975a]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Client Access Passwords</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">👰 Bride Password</label>
                          <input 
                            type="text" 
                            placeholder="Assign password..."
                            value={editBridePassword} 
                            onChange={(e) => setEditBridePassword(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:border-[#b4975a] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">🤵 Groom Password</label>
                          <input 
                            type="text" 
                            placeholder="Assign password..."
                            value={editGroomPassword} 
                            onChange={(e) => setEditGroomPassword(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:border-[#b4975a] focus:outline-none"
                          />
                        </div>
                      </div>

                      <button 
                        onClick={() => handleSavePasswords(selectedClient.id, editBridePassword, editGroomPassword)}
                        className="px-4 py-2 bg-[#b4975a] hover:bg-[#c5a86b] text-zinc-950 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                      >
                        Save Passwords
                      </button>
                    </div>

                    {/* Selected Photos Inspection Section */}
                    <div className="space-y-4 bg-zinc-900/40 p-5 border border-zinc-800 rounded-2xl">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <div className="flex items-center gap-2">
                          <Camera size={16} className="text-[#b4975a]" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Client Selected Photos</h4>
                        </div>
                        
                        {/* Quick toggles */}
                        {(() => {
                          const p = projects.find(proj => proj.booking_id === selectedClient.id || proj.couple_name === selectedClient.customer_name);
                          if (!p) return null;
                          return (
                            <div className="flex gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                              {["bride", "groom", "matches"].map(tab => (
                                <button 
                                  key={tab}
                                  onClick={() => setActiveClientPhotoTab(tab)}
                                  className={`px-2 py-1 rounded text-[8px] font-bold uppercase tracking-wide transition-all cursor-pointer ${
                                    activeClientPhotoTab === tab ? "bg-[#b4975a] text-zinc-950" : "text-zinc-500 hover:text-white"
                                  }`}
                                >
                                  {tab}
                                </button>
                              ))}
                            </div>
                          );
                        })()}
                      </div>

                      {(() => {
                        const p = projects.find(proj => proj.booking_id === selectedClient.id || proj.couple_name === selectedClient.customer_name);
                        if (!p) {
                          return (
                            <p className="text-[10px] text-zinc-500 italic py-2">
                              No active wedding project spawned yet. Approval unlocks workspace gallery.
                            </p>
                          );
                        }

                        let list = [];
                        if (activeClientPhotoTab === "bride") {
                          list = (p.gallery_images || []).filter(img => img.selected_by_bride !== undefined ? img.selected_by_bride : img.favorited);
                        } else if (activeClientPhotoTab === "groom") {
                          list = (p.gallery_images || []).filter(img => img.selected_by_groom !== undefined ? img.selected_by_groom : img.favorited);
                        } else {
                          list = (p.gallery_images || []).filter(img => {
                            const b = img.selected_by_bride !== undefined ? img.selected_by_bride : img.favorited;
                            const g = img.selected_by_groom !== undefined ? img.selected_by_groom : img.favorited;
                            return b && g;
                          });
                        }

                        return (
                          <div className="space-y-2">
                            <p className="text-[10px] text-zinc-400">
                              Total items: <strong>{list.length} photos</strong> found in {activeClientPhotoTab} list.
                            </p>
                            {list.length === 0 ? (
                              <div className="py-8 text-center text-[10px] text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
                                No hearted photos found for this filter.
                              </div>
                            ) : (
                              <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1 bg-zinc-950/45 rounded-xl border border-zinc-850">
                                {list.map(img => (
                                  <a key={img.id} href={img.url} target="_blank" rel="noreferrer" className="block relative aspect-square group overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800">
                                    <img src={img.url} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300" alt="" />
                                    <span className="absolute bottom-1 right-1 bg-black/75 px-1 py-0.5 text-[7px] font-mono text-zinc-400 rounded">
                                      #{img.id}
                                    </span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Invoice Actions */}
                    <div className="space-y-4 bg-zinc-900/40 p-5 border border-zinc-800 rounded-2xl">
                      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                        <FileText size={16} className="text-[#b4975a]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Invoice Billing & Actions</h4>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Net balance due</span>
                          <p className="text-base font-bold text-white">
                            ₹ {Number((selectedClient.total_price || selectedClient.package_price) - (selectedClient.advance_paid || 5000)).toLocaleString("en-IN")}/-
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button 
                            onClick={() => setActiveInvoiceBooking(selectedClient)}
                            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <FileText size={11} /> Invoice Receipt
                          </button>
                          
                          <button 
                            onClick={() => {
                              const includesPrewedding = (parseInt(selectedClient.package_price || selectedClient.total_price) === 49999 || parseInt(selectedClient.package_price || selectedClient.total_price) === 99999 || parseInt(selectedClient.package_price || selectedClient.total_price) === 110000);
                              const surpriseBonusText = includesPrewedding ? `🎁 SURPRISE BONUS: Free Save the Date Photoshoot (worth ₹9,999/-) included!\n` : '';
                              const message = `Hi ${selectedClient.customer_name}! Here is your Digital Invoice Receipt for locking in your Wedding Package slot:\n\n` +
                                              `👤 Name: ${selectedClient.customer_name}\n` +
                                              `📞 Phone: ${selectedClient.customer_phone}\n` +
                                              `📍 Pincode: ${selectedClient.pincode || ''}\n` +
                                              `📦 Plan: ${selectedClient.package_name}\n` +
                                              `💰 Quote: ₹${parseInt(selectedClient.package_price || selectedClient.total_price).toLocaleString()}/- Net\n` +
                                              surpriseBonusText + `\n` +
                                              `UPI: dreamwedstories@okaxis\n` +
                                              `Passwords Assigned:\n` +
                                              `Bride: ${selectedClient.bride_password}\n` +
                                              `Groom: ${selectedClient.groom_password}`;
                              window.open(`https://wa.me/91${selectedClient.customer_phone}?text=${encodeURIComponent(message)}`, '_blank');
                            }}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Share2 size={11} /> Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-96 rounded-[32px] border border-dashed border-zinc-800 bg-zinc-950/20 flex items-center justify-center text-zinc-500 text-xs">
                    Select a client workspace from the left pane to manage access, receipts, and co-selections.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =============================== STAFF TAB ================================ */}
        {activeTab === "staff" && (
          <div className="space-y-8 text-left">
            <div className="flex justify-between items-center">
              <div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl text-white font-light">
                  Staff <span className="italic font-serif text-[#b4975a]">Accounts</span>
                </h2>
                <p className="text-zinc-500 text-[11px] font-light mt-1">Create, manage, and assign editor & designer accounts to wedding projects.</p>
              </div>
              <button onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#b4975a] hover:bg-[#c5a86b] text-zinc-950 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95">
                <Plus size={14} /> New Staff Account
              </button>
            </div>

            {/* Create Staff Form */}
            <AnimatePresence>
              {showCreateForm && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-[24px] p-6 space-y-5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Create New Staff Account</h3>
                    <button onClick={() => setShowCreateForm(false)} className="text-zinc-500 hover:text-white cursor-pointer">
                      <X size={16} />
                    </button>
                  </div>
                  <form onSubmit={handleCreateStaff} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Display Name</label>
                      <input type="text" placeholder="e.g. Rahul Editor"
                        value={newStaff.display_name}
                        onChange={(e) => setNewStaff({ ...newStaff, display_name: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-xs focus:border-[#b4975a] focus:outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Role</label>
                      <select value={newStaff.role} onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-xs focus:border-[#b4975a] focus:outline-none">
                        <option value="editor">🎥 Video Editor</option>
                        <option value="designer">📖 Album Designer</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Username *</label>
                      <input type="text" placeholder="e.g. rahul_editor" required
                        value={newStaff.username}
                        onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-xs focus:border-[#b4975a] focus:outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Password *</label>
                      <input type="text" placeholder="Set a secure password" required
                        value={newStaff.password}
                        onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-xs focus:border-[#b4975a] focus:outline-none" />
                    </div>
                    <div className="sm:col-span-2">
                      <button type="submit" disabled={staffSaving}
                        className="w-full py-3 bg-[#b4975a] hover:bg-[#c5a86b] text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2">
                        <Save size={14} /> {staffSaving ? "Creating..." : "Create Account"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Staff List */}
            {staffUsers.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-zinc-800 rounded-[24px] text-zinc-500 text-xs">
                No staff accounts created yet. Click "New Staff Account" to add editors and designers.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {staffUsers.map((staff) => (
                  <div key={staff.id} className="bg-zinc-900 border border-zinc-800 rounded-[24px] p-5 space-y-4 text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/3 rounded-full blur-2xl pointer-events-none" />

                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm uppercase border ${
                          staff.role === "designer" ? "bg-purple-500/10 border-purple-500/20 text-purple-300" : "bg-blue-500/10 border-blue-500/20 text-blue-300"
                        }`}>
                          {staff.display_name?.charAt(0) || staff.username?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{staff.display_name || staff.username}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {getRoleIcon(staff.role)}
                            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                              {staff.role === "designer" ? "Album Designer" : "Video Editor"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteStaff(staff.id, staff.display_name || staff.username)}
                        className="p-1.5 text-zinc-600 hover:text-red-500 transition-colors cursor-pointer">
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Credentials display */}
                    <div className="bg-zinc-800 rounded-xl p-3 space-y-2">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-zinc-500 font-bold uppercase tracking-wider">Login Username</span>
                        <span className="text-zinc-200 font-mono">{staff.username}</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-zinc-500 font-bold uppercase tracking-wider">Password</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-200 font-mono">
                            {showPassId === staff.id ? staff.password : "••••••••"}
                          </span>
                          <button onClick={() => setShowPassId(showPassId === staff.id ? null : staff.id)}
                            className="text-zinc-500 hover:text-[#b4975a] transition-colors cursor-pointer">
                            {showPassId === staff.id ? <EyeOff size={11} /> : <Eye size={11} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Project assignment */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Assigned Projects</span>
                        <button onClick={() => setAssigningStaffId(assigningStaffId === staff.id ? null : staff.id)}
                          className="text-[9px] text-[#b4975a] font-bold uppercase tracking-wider hover:underline cursor-pointer">
                          {assigningStaffId === staff.id ? "Done" : "Manage"}
                        </button>
                      </div>

                      {assigningStaffId === staff.id ? (
                        <div className="space-y-1.5 max-h-36 overflow-y-auto">
                          {projects.map((p) => {
                            const isAssigned = (staff.assigned_projects || []).includes(p.id);
                            return (
                              <label key={p.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-750 cursor-pointer">
                                <input type="checkbox" checked={isAssigned}
                                  onChange={(e) => handleAssignProject(staff.id, p.id, e.target.checked)}
                                  className="accent-[#b4975a] w-3.5 h-3.5 cursor-pointer" />
                                <span className="text-[10px] text-zinc-300 font-medium">{p.couple_name}</span>
                                <span className="text-[9px] text-zinc-500 ml-auto">{formatDateString(p.wedding_date)}</span>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {(staff.assigned_projects || []).length === 0 ? (
                            <span className="text-[9px] text-zinc-600 italic">No projects assigned yet</span>
                          ) : (
                            (staff.assigned_projects || []).map((pId) => {
                              const proj = projects.find(p => p.id === pId);
                              return proj ? (
                                <span key={pId} className="text-[9px] bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full border border-zinc-700 font-medium">
                                  {proj.couple_name}
                                </span>
                              ) : null;
                            })
                          )}
                        </div>
                      )}
                    </div>

                    {/* Portal link hint */}
                    <div className="pt-2 border-t border-zinc-800 text-[9px] text-zinc-500 font-light">
                      Login at: <span className="text-[#b4975a] font-bold">
                        {staff.role === "designer" ? "/designer" : "/editor"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =============================== CHATS TAB ================================ */}
        {activeTab === "chats" && (
          <div className="space-y-6 text-left">
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl text-white font-light">
                Chat <span className="italic font-serif text-[#b4975a]">Viewer</span>
              </h2>
              <p className="text-zinc-500 text-[11px] font-light mt-1">Monitor all project communication channels in real-time.</p>
            </div>

            {/* Project selector + channel selector */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-1.5 flex-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Select Project</label>
                <select value={chatProject?.id || ""}
                  onChange={(e) => {
                    const p = projects.find(proj => proj.id === Number(e.target.value));
                    setChatProject(p || null);
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs focus:border-[#b4975a] focus:outline-none">
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.couple_name} — {formatDateString(p.wedding_date)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5 flex-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Select Channel</label>
                <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                  {CHANNELS.map((ch) => (
                    <button key={ch.id} onClick={() => setChatChannel(ch.id)}
                      className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wide transition-all cursor-pointer text-center whitespace-nowrap ${
                        chatChannel === ch.id ? "bg-zinc-950 text-white shadow-sm border border-zinc-700" : "text-zinc-500 hover:text-white"
                      }`}>
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-end">
                <button onClick={loadChats}
                  className="flex items-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer">
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>
            </div>

            {/* Chat feed */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-[24px] overflow-hidden">
              {/* Chat header */}
              <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white">{chatProject?.couple_name || "—"}</span>
                  <span className="text-zinc-500 text-[10px] font-light ml-2">
                    {CHANNELS.find(c => c.id === chatChannel)?.label}
                  </span>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                  {chatMessages.length} message{chatMessages.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Messages */}
              <div className="p-6 min-h-[300px] max-h-[500px] overflow-y-auto bg-[#1a1a1a] flex flex-col gap-3.5">
                {chatLoading ? (
                  <div className="my-auto text-center text-zinc-500 text-xs">Loading messages...</div>
                ) : chatMessages.length === 0 ? (
                  <div className="my-auto text-center text-zinc-600 text-xs font-light">
                    No messages in this channel yet.
                  </div>
                ) : (
                  chatMessages.map((m) => {
                    const isClient = m.sender === "client";
                    const senderLabel = isClient ? "Client" :
                      m.sender === "admin" ? "Admin" :
                      m.sender === "editor" ? "Video Editor" :
                      m.sender === "designer" ? "Album Designer" : m.sender;
                    return (
                      <div key={m.id} className={`flex flex-col ${isClient ? "items-end" : "items-start"} max-w-[80%] ${isClient ? "self-end" : "self-start"}`}>
                        <span className="text-[8px] text-zinc-500 mb-0.5 px-1">{senderLabel} • {formatTime(m.timestamp)}</span>
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm border ${
                          isClient
                            ? "bg-[#d9fdd3] border-[#d9fdd3] text-zinc-800 rounded-br-sm"
                            : m.sender === "admin"
                            ? "bg-amber-500/15 border-amber-500/20 text-amber-100 rounded-bl-sm"
                            : "bg-zinc-800 border-zinc-700 text-zinc-200 rounded-bl-sm"
                        }`}>
                          {m.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* =============================== AI GALLERIES TAB ================================ */}
        {activeTab === "ai-galleries" && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start text-left">
            {/* Gallery Creation Sidebar */}
            <div className="md:col-span-2 bg-zinc-950 border border-zinc-800 rounded-[28px] p-6 space-y-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-zinc-800">
                <Camera size={16} className="text-[#b4975a]" /> Create AI Photo Gallery
              </h3>
              
              <form onSubmit={handleCreateAiGallery} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Wedding Name</label>
                  <input type="text" placeholder="e.g., Kabir & Ananya's Royal Vows" required
                    value={newGalName} onChange={(e) => setNewGalName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs focus:border-[#b4975a] focus:outline-none" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Google Drive Link</label>
                  <input type="url" placeholder="https://drive.google.com/..." required
                    value={newGalDrive} onChange={(e) => setNewGalDrive(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs focus:border-[#b4975a] focus:outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Gallery Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setNewGalType("After Event Gallery")}
                      className={`py-2 px-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider text-center transition-all ${
                        newGalType === "After Event Gallery" ? "bg-zinc-800 text-[#b4975a] border-[#b4975a]/30" : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700"
                      }`}>
                      After Event
                    </button>
                    <button type="button" onClick={() => setNewGalType("Live Gallery")}
                      className={`py-2 px-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider text-center transition-all ${
                        newGalType === "Live Gallery" ? "bg-zinc-800 text-[#b4975a] border-[#b4975a]/30" : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700"
                      }`}>
                      Live Gallery
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Client Cover Photo Preset</label>
                  <select value={newGalCover} onChange={(e) => setNewGalCover(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs focus:border-[#b4975a] focus:outline-none">
                    <option value="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800">Wedding Altar & Florals (Warm Rose)</option>
                    <option value="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800">Couple Walkout Celebration</option>
                    <option value="https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800">Traditional Golden Mandap</option>
                    <option value="https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=800">Bridal Luxury Details</option>
                  </select>
                </div>

                <button type="submit"
                  className="w-full py-3 bg-[#b4975a] hover:bg-[#c5a86b] text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2">
                  <Plus size={14} /> Create AI Gallery
                </button>
              </form>
            </div>

            {/* Galleries list */}
            <div className="md:col-span-3 bg-zinc-950 border border-zinc-800 rounded-[28px] p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-zinc-800">
                💍 Active AI Galleries ({aiGalleries.length})
              </h3>
              
              {aiGalleries.length === 0 ? (
                <div className="text-center py-16 text-zinc-600 text-xs font-light">No active AI galleries found.</div>
              ) : (
                <div className="space-y-3.5">
                  {aiGalleries.map((g) => (
                    <div key={g.id} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex justify-between items-center gap-4">
                      <div className="flex items-center gap-3">
                        <img src={g.coverUrl} className="w-12 h-12 rounded-lg object-cover border border-zinc-750" alt="Wedding Cover" />
                        <div>
                          <span className="font-bold text-white text-sm block">{g.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[8px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${
                              g.type === "Live Gallery" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                            }`}>
                              {g.type}
                            </span>
                            <span className="text-[9px] text-zinc-500">ID: {g.id}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3.5 shrink-0">
                        <button 
                          onClick={() => setSelectedGalForPhotos(g)}
                          className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-[#b4975a] hover:text-zinc-950 text-white text-[10px] font-bold uppercase tracking-wider border border-zinc-750 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Camera size={12} /> Manage Photos ({g.photos ? g.photos.length : 0})
                        </button>
                        <a href={g.gdriveLink} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] text-[#b4975a] font-bold uppercase tracking-wider hover:underline">
                          Drive Folder ↗
                        </a>
                        <button onClick={() => handleDeleteAiGallery(g.id)}
                          className="p-1.5 text-zinc-650 hover:text-red-500 transition-colors cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =============================== AI ORDERS TAB ================================ */}
        {activeTab === "ai-orders" && (
          <div className="space-y-6 text-left">
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl text-white font-light">
                AI Photo <span className="italic font-serif text-[#b4975a]">Print Orders</span>
              </h2>
              <p className="text-zinc-500 text-[11px] font-light mt-1">Fulfill physical frame print orders submitted by wedding guests.</p>
            </div>

            {aiOrders.length === 0 ? (
              <div className="text-center py-16 border border-zinc-800 rounded-[28px] text-zinc-500 text-xs font-light">
                No print orders found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {aiOrders.map((o) => (
                  <div key={o.id} className="bg-zinc-950 border border-zinc-800 p-6 rounded-[24px] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/3 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row gap-5">
                      <img src={o.photoUrl} className="w-16 h-20 rounded-lg object-cover border border-zinc-850" alt="Order Thumbnail" />
                      <div className="space-y-2 text-left">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h4 className="text-sm font-bold text-white">{o.customerName}</h4>
                          <span className="text-[10px] text-zinc-500">ID: {o.id}</span>
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{o.printSize} Frame (₹{o.price})</span>
                        </div>
                        <p className="text-xs text-zinc-400 font-light leading-relaxed">
                          📞 Mobile: <strong className="text-zinc-300">{o.phone}</strong> • Ordered: <strong className="text-zinc-300">{formatDateString(o.date)}</strong>
                        </p>
                        <p className="text-xs text-zinc-500 font-light">
                          🏠 Dispatch Address: {o.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                      <select value={o.status} onChange={(e) => handleUpdateAiOrderStatus(o.id, e.target.value)}
                        style={{ colorScheme: "dark" }}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white text-xs focus:border-[#b4975a] focus:outline-none w-full md:w-40 cursor-pointer">
                        <option value="New Order">New Order</option>
                        <option value="Processing">Processing</option>
                        <option value="Couriered">Couriered</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      {/* 4. AI Gallery Photos Manager Modal */}
      <AnimatePresence>
        {selectedGalForPhotos && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedGalForPhotos(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-zinc-950 border border-zinc-800 max-w-2xl w-full rounded-[32px] p-6 sm:p-8 space-y-6 text-zinc-300 relative shadow-2xl overflow-y-auto max-h-[90vh] text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedGalForPhotos(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white text-white hover:text-black border border-white/5 flex items-center justify-center transition-all cursor-pointer z-10"
              >
                <X size={15} />
              </button>

              <div className="space-y-1 select-none border-b border-zinc-850 pb-4">
                <span className="text-[#b4975a] font-bold text-[9px] tracking-[0.2em] uppercase block">Biometric Repository</span>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-2xl text-white font-light">
                  Manage <span className="italic font-serif text-[#b4975a]">{selectedGalForPhotos.name}</span> Photos
                </h3>
                <p className="text-zinc-500 text-[10px] font-light">Add custom direct photo URLs for guests to query via AI face recognition.</p>
              </div>

              {/* Bulk add textarea */}
              <form onSubmit={handleAddBulkPhotos} className="space-y-3.5 bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                    📸 Bulk Import Direct Photo URLs
                  </label>
                  <textarea 
                    rows="3"
                    value={bulkPhotoUrls}
                    onChange={(e) => setBulkPhotoUrls(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&#10;https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800&#10;(Separate multiple URLs with commas or new lines)"
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-white text-xs font-mono focus:border-[#b4975a] focus:outline-none leading-relaxed"
                  />
                  <p className="text-[9px] text-zinc-500 leading-relaxed mt-1 select-none">
                    💡 <strong>Google Drive Auto-Sync</strong>: Paste standard Google Drive share links directly! The portal converts them instantly into high-res rendering URLs.
                  </p>
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 bg-[#b4975a] hover:bg-[#c5a86b] text-zinc-950 text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} /> Add Direct Photo URLs
                </button>
              </form>

              {/* Photos list count */}
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-zinc-400 font-bold uppercase tracking-wider">Cataloged Photos ({selectedGalForPhotos.photos ? selectedGalForPhotos.photos.length : 0})</span>
                <span className="text-[10px] text-zinc-500 font-light">Guests see these matches upon biometric search</span>
              </div>

              {/* Photos grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[30vh] overflow-y-auto p-1 bg-zinc-900/20 border border-zinc-850 rounded-2xl">
                {!selectedGalForPhotos.photos || selectedGalForPhotos.photos.length === 0 ? (
                  <div className="col-span-full py-10 text-center text-zinc-600 text-xs font-light italic">
                    No custom photos added yet. Paste direct URLs above to begin!
                  </div>
                ) : (
                  selectedGalForPhotos.photos.map(p => (
                    <div key={p.id} className="relative aspect-[3/4] rounded-xl overflow-hidden group border border-zinc-800 shadow-sm bg-zinc-950">
                      <img src={p.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Gallery item" />
                      
                      {/* Delete Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button 
                          onClick={() => handleDeletePhotoFromGal(p.id)}
                          className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer"
                          title="Delete photo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4 border-t border-zinc-850">
                <button 
                  onClick={() => setSelectedGalForPhotos(null)}
                  className="w-full py-4.5 bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-bold uppercase tracking-widest rounded-xl border border-zinc-800 transition-all cursor-pointer text-center"
                >
                  Save & Finish Management
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Client Invoice Modal */}
      <AnimatePresence>
        {activeInvoiceBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setActiveInvoiceBooking(null)}
          >
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                body * {
                  visibility: hidden !important;
                }
                .invoice-print-container, .invoice-print-container * {
                  visibility: visible !important;
                }
                .invoice-print-container {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 24px !important;
                  background: white !important;
                  color: black !important;
                  box-shadow: none !important;
                  border: none !important;
                }
                .no-print {
                  display: none !important;
                }
                .print-gold-text {
                  color: #947a46 !important;
                }
                .print-gray-bg {
                  background-color: #f4f4f5 !important;
                }
                .print-border-zinc {
                  border-color: #e4e4e7 !important;
                }
              }
            `}} />
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="invoice-print-container bg-zinc-950 border border-zinc-800 max-w-3xl w-full rounded-[32px] p-6 sm:p-8 space-y-6 text-zinc-300 relative shadow-2xl overflow-y-auto max-h-[90vh] text-left print:bg-white print:text-black print:max-h-none print:overflow-visible"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setActiveInvoiceBooking(null)}
                className="no-print absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white text-white hover:text-black border border-white/5 flex items-center justify-center transition-all cursor-pointer z-10"
              >
                <X size={15} />
              </button>

              {/* Logo / Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-5 print:border-zinc-200">
                <div className="text-left">
                  <span className="text-[#b4975a] print-gold-text font-bold text-[10px] tracking-[0.3em] uppercase block mb-1">Tax Invoice & Receipt</span>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl text-white font-light tracking-tight print:text-black">
                    Dreamwed <span className="italic font-serif text-[#b4975a] print-gold-text">Stories</span>
                  </h2>
                  <p className="text-zinc-500 text-[10px] font-light print:text-zinc-700">Kochi & Trivandrum, India | contact@dreamwedstories.co.in</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-zinc-500 text-[9px] uppercase tracking-wider block print:text-zinc-700">Invoice Number</span>
                  <span className="text-[#b4975a] print-gold-text font-mono font-bold text-sm block">
                    {activeInvoiceBooking.invoice_number || `DW-2026-${String(activeInvoiceBooking.id).padStart(3, '0')}`}
                  </span>
                  <span className="text-zinc-500 text-[9px] uppercase tracking-wider block mt-1.5 print:text-zinc-700">Invoice Date</span>
                  <span className="text-white print:text-black font-semibold text-xs block">
                    {formatDateString(activeInvoiceBooking.invoice_date || activeInvoiceBooking.created_at)}
                  </span>
                </div>
              </div>

              {/* Bill Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-zinc-900/40 p-5 border border-zinc-850 rounded-2xl print:bg-zinc-50 print:border-zinc-200 print:text-black">
                <div className="space-y-1.5 text-left">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block print:text-zinc-650">Billed To (Client):</span>
                  <h4 className="text-sm font-bold text-white print:text-black">{activeInvoiceBooking.customer_name}</h4>
                  <p className="text-xs text-zinc-400 print:text-zinc-700">📞 Phone: {activeInvoiceBooking.customer_phone}</p>
                  {activeInvoiceBooking.customer_email && (
                    <p className="text-xs text-zinc-400 print:text-zinc-700">✉ Email: {activeInvoiceBooking.customer_email}</p>
                  )}
                  {activeInvoiceBooking.pincode && (
                    <p className="text-xs text-zinc-400 print:text-zinc-700">📍 Pincode: {activeInvoiceBooking.pincode}</p>
                  )}
                </div>
                <div className="space-y-1.5 text-left sm:text-right sm:border-l sm:border-zinc-800 print:sm:border-zinc-200 sm:pl-6">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block print:text-zinc-650">Event Details:</span>
                  <p className="text-xs text-zinc-400 print:text-zinc-700">
                    Venue: <strong className="text-white print:text-black">{activeInvoiceBooking.event_venue || "TBA"}</strong>
                  </p>
                  <p className="text-xs text-zinc-400 print:text-zinc-700">
                    Date: <strong className="text-white print:text-black">{formatDateString(activeInvoiceBooking.event_date)}</strong>
                  </p>
                  <p className="text-xs text-zinc-400 print:text-zinc-700">
                    Scope: <span className="uppercase text-[#b4975a] print-gold-text font-bold text-[10px]">
                      {activeInvoiceBooking.coverage_scope === "both" ? "Bride & Groom Coverage" : `${activeInvoiceBooking.coverage_scope || 'Single'} Side`}
                    </span>
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-zinc-850 rounded-2xl overflow-hidden print:border-zinc-200">
                <table className="w-full text-left text-xs leading-normal">
                  <thead>
                    <tr className="bg-zinc-900/60 text-[#b4975a] print-gold-text font-bold uppercase tracking-wider border-b border-zinc-850 print:border-zinc-200 print:bg-zinc-100">
                      <th className="px-5 py-3">Description & Service Items</th>
                      <th className="px-5 py-3 text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850 print:divide-zinc-200">
                    <tr>
                      <td className="px-5 py-4">
                        <span className="font-bold text-white print:text-black block">{activeInvoiceBooking.package_name}</span>
                        <span className="text-[10px] text-zinc-500 print:text-zinc-700 block mt-0.5">
                          Includes signature coverage, high-res editing workflows, and online photo/video portal hosting.
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-white print:text-black font-semibold font-mono">
                        ₹ {Number(activeInvoiceBooking.package_price || activeInvoiceBooking.total_price || 0).toLocaleString("en-IN")}/-
                      </td>
                    </tr>
                    {activeInvoiceBooking.add_ons && activeInvoiceBooking.add_ons.map((addon, index) => (
                      <tr key={index}>
                        <td className="px-5 py-3 font-medium text-zinc-300 print:text-black">
                          ➕ {addon.name || addon}
                        </td>
                        <td className="px-5 py-3 text-right text-zinc-300 print:text-black font-mono">
                          ₹ {Number(addon.price || 0).toLocaleString("en-IN")}/-
                        </td>
                      </tr>
                    ))}
                    {/* Calculation rows */}
                    <tr className="bg-zinc-900/20 print:bg-zinc-50/50">
                      <td className="px-5 py-3 text-zinc-400 print:text-zinc-700 font-medium">Subtotal Amount:</td>
                      <td className="px-5 py-3 text-right text-zinc-300 print:text-black font-semibold font-mono">
                        ₹ {Number(activeInvoiceBooking.total_price || activeInvoiceBooking.package_price || 0).toLocaleString("en-IN")}/-
                      </td>
                    </tr>
                    <tr className="bg-zinc-900/20 print:bg-zinc-50/50">
                      <td className="px-5 py-3 text-zinc-400 print:text-zinc-700 font-medium">Advance Booking Paid:</td>
                      <td className="px-5 py-3 text-right text-emerald-400 font-bold font-mono">
                        - ₹ {Number(activeInvoiceBooking.advance_paid || 0).toLocaleString("en-IN")}/-
                      </td>
                    </tr>
                    <tr className="bg-zinc-900/40 text-sm print:bg-zinc-100">
                      <td className="px-5 py-4 text-[#b4975a] print-gold-text font-bold uppercase tracking-wider">Net Balance Due:</td>
                      <td className="px-5 py-4 text-right text-white print:text-black font-extrabold text-base font-mono">
                        ₹ {Number((activeInvoiceBooking.total_price || activeInvoiceBooking.package_price || 0) - (activeInvoiceBooking.advance_paid || 0)).toLocaleString("en-IN")}/-
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Payment Milestones */}
              {activeInvoiceBooking.payment_milestones && activeInvoiceBooking.payment_milestones.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 print:text-zinc-800">Scheduled Payment Milestones</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {activeInvoiceBooking.payment_milestones.map((m, idx) => (
                      <div key={idx} className="bg-zinc-900/35 border border-zinc-850 p-3 rounded-xl flex flex-col justify-between gap-2 print:border-zinc-200 print:bg-zinc-50">
                        <div>
                          <span className="text-[10px] text-zinc-400 print:text-zinc-700 block font-semibold leading-snug">{m.label}</span>
                          <span className="text-xs text-white print:text-black font-bold block mt-1 font-mono">₹ {Number(m.amount).toLocaleString("en-IN")}/-</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[8px] text-zinc-500 font-mono">{m.date ? formatDateString(m.date) : 'Upon Delivery'}</span>
                          <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            m.status === "Paid" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-zinc-800 text-zinc-500 border border-zinc-700 print:border-zinc-300"
                          }`}>
                            {m.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Credentials Section */}
              <div className="bg-zinc-900/30 border border-[#b4975a]/20 p-5 rounded-2xl space-y-3.5 print:border-zinc-200 print:bg-zinc-50">
                <div className="flex items-center gap-2 border-b border-zinc-850 pb-2 print:border-zinc-200">
                  <ShieldCheck size={16} className="text-[#b4975a] print-gold-text" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#b4975a] print-gold-text">Couple Wedding Hub Access Credentials</h4>
                </div>
                <p className="text-[10px] text-zinc-500 print:text-zinc-650 leading-relaxed mt-0.5">
                  Share these credentials with the bride and groom so they can access their private selection lounge at the client portal page.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-zinc-950 p-3 border border-zinc-850 rounded-xl flex justify-between items-center print:bg-white print:border-zinc-200">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block">👰 Bride Password:</span>
                    <span className="text-white print:text-black font-mono font-bold text-xs">{activeInvoiceBooking.bride_password || "—"}</span>
                  </div>
                  <div className="bg-zinc-950 p-3 border border-zinc-850 rounded-xl flex justify-between items-center print:bg-white print:border-zinc-200">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block">🤵 Groom Password:</span>
                    <span className="text-white print:text-black font-mono font-bold text-xs">{activeInvoiceBooking.groom_password || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Terms / Footer */}
              <div className="border-t border-zinc-900 pt-4 text-center select-none print:border-zinc-200">
                <p style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-lg text-[#b4975a] print-gold-text font-light italic">
                  Thank you for letting us capture your forever stories! 💛
                </p>
                <p className="text-[8px] text-zinc-650 print:text-zinc-500 uppercase tracking-widest mt-1.5 leading-normal">
                  All rights reserved © Dreamwed Stories Private Limited. Payments are subject to contract terms.
                </p>
              </div>

              {/* Action Buttons (no-print) */}
              <div className="no-print pt-4 border-t border-zinc-850 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    const includesPrewedding = (parseInt(activeInvoiceBooking.package_price || activeInvoiceBooking.total_price) === 49999 || parseInt(activeInvoiceBooking.package_price || activeInvoiceBooking.total_price) === 99999 || parseInt(activeInvoiceBooking.package_price || activeInvoiceBooking.total_price) === 110000);
                    const surpriseBonusText = includesPrewedding ? `🎁 SURPRISE BONUS: Free Save the Date Photoshoot (worth ₹9,999/-) included!\n` : '';
                    const message = `Hi ${activeInvoiceBooking.customer_name}! Here is your Digital Invoice Receipt for locking in your Wedding Package slot:\n\n` +
                                    `Invoice Number: ${activeInvoiceBooking.invoice_number || `DW-2026-${String(activeInvoiceBooking.id).padStart(3, '0')}`}\n` +
                                    `Plan: ${activeInvoiceBooking.package_name}\n` +
                                    `Quote: ₹${parseInt(activeInvoiceBooking.package_price || activeInvoiceBooking.total_price).toLocaleString()}/- Net\n` +
                                    `Advance Paid: ₹${(activeInvoiceBooking.advance_paid || 0).toLocaleString()}/-\n` +
                                    surpriseBonusText + `\n` +
                                    `Your Private Access Credentials:\n` +
                                    `👰 Bride Password: ${activeInvoiceBooking.bride_password || '—'}\n` +
                                    `🤵 Groom Password: ${activeInvoiceBooking.groom_password || '—'}\n` +
                                    `Link to selections: ${window.location.origin}/`;
                    window.open(`https://wa.me/91${activeInvoiceBooking.customer_phone}?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Share2 size={13} /> Share Details
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-3.5 bg-[#b4975a] hover:bg-[#c5a86b] text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
                >
                  <Download size={13} /> Download & Print Invoice
                </button>
                <button
                  onClick={() => setActiveInvoiceBooking(null)}
                  className="px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 border border-zinc-800"
                >
                  Close Receipt
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      </motion.div>
    </div>
  );
};

export default Admin;
