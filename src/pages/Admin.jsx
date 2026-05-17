import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, Users, IndianRupee, PieChart, BarChart2, 
  LogIn, LogOut, CheckCircle, Clock, AlertCircle, Plus, Trash2 
} from "lucide-react";
import Button from "../components/ui/Button";
import SEO from "../components/SEO";

// Initial mock leads data
const initialLeads = [
  { id: 1, name: "Sarah & Leo", email: "sarah.leo@gmail.com", phone: "+91 98456 12345", budget: 150000, service: "Cinematic Wedding Films", status: "High", date: "2026-11-20" },
  { id: 2, name: "Rahul & Priya", email: "rahul.priya@yahoo.com", phone: "+91 99001 22334", budget: 85000, service: "Wedding Photography", status: "High", date: "2026-12-05" },
  { id: 3, name: "Anjali & Vikram", email: "anjali.v@gmail.com", phone: "+91 98888 77665", budget: 45000, service: "Pre-Wedding Shoots", status: "Medium", date: "2026-10-15" },
  { id: 4, name: "Deepak & Neha", email: "deepak.neha@outlook.com", phone: "+91 97766 55443", budget: 110000, service: "Engagement / Reception", status: "Medium", date: "2027-01-10" },
  { id: 5, name: "Meera & Arjun", email: "meera.arjun@gmail.com", phone: "+91 96655 44332", budget: 60000, service: "Drone Coverage", status: "Low", date: "2026-09-28" },
  { id: 6, name: "Suresh & Divya", email: "suresh.divya@gmail.com", phone: "+91 95544 33221", budget: 35000, service: "Albums & Prints", status: "Medium", date: "2026-10-02" }
];

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [leads, setLeads] = useState(initialLeads);
  
  // New Lead form state
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadBudget, setNewLeadBudget] = useState("85000");
  const [newLeadService, setNewLeadService] = useState("Wedding Photography");
  const [newLeadStatus, setNewLeadStatus] = useState("High");
  const [newLeadDate, setNewLeadDate] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Check login on mount
  useEffect(() => {
    const authStatus = localStorage.getItem("dreamwed_admin_auth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.toLowerCase() === "admin" && password === "dreamwed2026") {
      setIsAuthenticated(true);
      setLoginError("");
      localStorage.setItem("dreamwed_admin_auth", "true");
    } else {
      setLoginError("Invalid username or password. (Hint: admin / dreamwed2026)");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("dreamwed_admin_auth");
  };

  const handleAddLead = (e) => {
    e.preventDefault();
    if (!newLeadName || !newLeadEmail || !newLeadPhone || !newLeadDate) {
      alert("Please fill all required fields");
      return;
    }

    const newLead = {
      id: Date.now(),
      name: newLeadName,
      email: newLeadEmail,
      phone: newLeadPhone,
      budget: Number(newLeadBudget),
      service: newLeadService,
      status: newLeadStatus,
      date: newLeadDate
    };

    setLeads([newLead, ...leads]);
    
    // Reset form
    setNewLeadName("");
    setNewLeadEmail("");
    setNewLeadPhone("");
    setNewLeadBudget("85000");
    setNewLeadService("Wedding Photography");
    setNewLeadStatus("High");
    setNewLeadDate("");
    setShowAddForm(false);
  };

  const handleDeleteLead = (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      setLeads(leads.filter(lead => lead.id !== id));
    }
  };

  // Calculations for Sales Metrics
  const totalRevenue = leads.reduce((acc, lead) => acc + lead.budget, 0);
  const averageBudget = leads.length ? Math.round(totalRevenue / leads.length) : 0;
  const highInterestCount = leads.filter(lead => lead.status === "High").length;
  const highInterestPercentage = leads.length ? Math.round((highInterestCount / leads.length) * 100) : 0;

  // Chart data calculations
  // 1. Service distribution (User Interest)
  const serviceCounts = leads.reduce((acc, lead) => {
    acc[lead.service] = (acc[lead.service] || 0) + 1;
    return acc;
  }, {});

  const serviceChartData = [
    { name: "Wedding Photo", count: serviceCounts["Wedding Photography"] || 0, color: "#b4975a" },
    { name: "Pre-Wed Shoot", count: serviceCounts["Pre-Wedding Shoots"] || 0, color: "#8a9289" },
    { name: "Engagement", count: serviceCounts["Engagement / Reception"] || 0, color: "#4f5f56" },
    { name: "Cinematic Film", count: serviceCounts["Cinematic Wedding Films"] || 0, color: "#1a1a1a" },
    { name: "Drone", count: serviceCounts["Drone Coverage"] || 0, color: "#d1a852" },
    { name: "Albums", count: serviceCounts["Albums & Prints"] || 0, color: "#706d69" }
  ];

  const maxServiceCount = Math.max(...serviceChartData.map(d => d.count), 1);

  // 2. Budget brackets counts
  const budgetBrackets = {
    "Under ₹50k": leads.filter(l => l.budget < 50000).length,
    "₹50k - ₹1L": leads.filter(l => l.budget >= 50000 && l.budget < 100000).length,
    "₹1L - ₹1.5L": leads.filter(l => l.budget >= 100000 && l.budget < 150000).length,
    "Above ₹1.5L": leads.filter(l => l.budget >= 150000).length
  };

  const budgetChartData = Object.keys(budgetBrackets).map(key => ({
    label: key,
    value: budgetBrackets[key]
  }));

  const maxBudgetValue = Math.max(...budgetChartData.map(d => d.value), 1);

  return (
    <div className="min-h-screen bg-[#f5f5f3] pt-28 pb-20 select-none">
      <SEO 
        title="Admin Portal"
        description="Dreamwed Stories secure management portal. Monitor sales, customer inquiries, budget distribution, and hot interest pipelines."
      />
      <AnimatePresence mode="wait">
        
        {/* LOGIN SCREEN */}
        {!isAuthenticated ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md mx-auto px-6 py-12 bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-zinc-100 mt-10 md:mt-16"
          >
            <div className="text-center mb-8">
              <span className="text-[#b4975a] font-semibold text-xs tracking-[0.3em] uppercase block mb-2">
                Secure Portal
              </span>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl text-zinc-900 font-light">
                Dreamwed Admin
              </h2>
              <p className="text-zinc-400 text-sm mt-2">Enter credentials to access Sales Dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium block mb-2">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full px-5 py-4 border border-zinc-200 rounded-[16px] text-zinc-800 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b4975a]/20 focus:border-[#b4975a] transition-all duration-300"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium block mb-2">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 border border-zinc-200 rounded-[16px] text-zinc-800 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b4975a]/20 focus:border-[#b4975a] transition-all duration-300"
                />
              </div>

              {loginError && (
                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-[14px] text-xs font-medium">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-4 mt-2 bg-zinc-950 text-white rounded-[16px] hover:bg-black font-semibold tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl hover:shadow-zinc-950/10 active:scale-[0.98] transition-all duration-300"
              >
                <LogIn size={18} />
                Access Dashboard
              </button>
            </form>
          </motion.div>
        ) : (
          
          /* ADMIN DASHBOARD SCREEN */
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-7xl mx-auto px-6 md:px-8"
          >
            {/* DASHBOARD HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div>
                <span className="text-[#b4975a] font-semibold text-xs tracking-[0.3em] uppercase block mb-1">
                  Management Console
                </span>
                <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl sm:text-5xl text-zinc-900 font-light tracking-tight">
                  Sales & Inquiries Dashboard
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-5 py-3 rounded-full bg-zinc-900 text-white text-sm font-semibold flex items-center gap-2 shadow-md hover:bg-black hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                >
                  <Plus size={16} />
                  Add Inquiry
                </button>
                <button
                  onClick={handleLogout}
                  className="px-5 py-3 rounded-full bg-white border border-zinc-200 text-zinc-700 text-sm font-semibold flex items-center gap-2 shadow-sm hover:border-zinc-900 hover:text-zinc-900 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            </div>

            {/* SLIDE-DOWN ADD INQUIRY FORM */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <form onSubmit={handleAddLead} className="p-8 bg-white rounded-[24px] border border-zinc-200/60 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-3 pb-3 border-b border-zinc-100 flex justify-between items-center">
                      <h3 className="font-semibold text-zinc-800">Add New Client Inquiry</h3>
                      <span className="text-xs text-zinc-400">All fields are required</span>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-500 block mb-2">Client Name(s)</label>
                      <input 
                        type="text" 
                        value={newLeadName}
                        onChange={(e) => setNewLeadName(e.target.value)}
                        placeholder="e.g. Priya & Anil"
                        className="w-full px-4 py-3 border border-zinc-200 rounded-[12px] text-sm focus:outline-none focus:border-[#b4975a] focus:ring-1 focus:ring-[#b4975a]/10"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-500 block mb-2">Email Address</label>
                      <input 
                        type="email" 
                        value={newLeadEmail}
                        onChange={(e) => setNewLeadEmail(e.target.value)}
                        placeholder="priya.anil@gmail.com"
                        className="w-full px-4 py-3 border border-zinc-200 rounded-[12px] text-sm focus:outline-none focus:border-[#b4975a] focus:ring-1 focus:ring-[#b4975a]/10"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-500 block mb-2">Phone Number</label>
                      <input 
                        type="text" 
                        value={newLeadPhone}
                        onChange={(e) => setNewLeadPhone(e.target.value)}
                        placeholder="+91 90000 00000"
                        className="w-full px-4 py-3 border border-zinc-200 rounded-[12px] text-sm focus:outline-none focus:border-[#b4975a] focus:ring-1 focus:ring-[#b4975a]/10"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-500 block mb-2">Inquiry Service</label>
                      <select 
                        value={newLeadService}
                        onChange={(e) => setNewLeadService(e.target.value)}
                        className="w-full px-4 py-3 border border-zinc-200 rounded-[12px] text-sm focus:outline-none focus:border-[#b4975a]"
                      >
                        <option value="Wedding Photography">Wedding Photography</option>
                        <option value="Pre-Wedding Shoots">Pre-Wedding Shoots</option>
                        <option value="Engagement / Reception">Engagement / Reception</option>
                        <option value="Cinematic Wedding Films">Cinematic Wedding Films</option>
                        <option value="Drone Coverage">Drone Coverage</option>
                        <option value="Albums & Prints">Albums & Prints</option>
                        <option value="Gold Lite Package">Gold Lite Package</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-500 block mb-2">Estimated Budget (₹)</label>
                      <select 
                        value={newLeadBudget}
                        onChange={(e) => setNewLeadBudget(e.target.value)}
                        className="w-full px-4 py-3 border border-zinc-200 rounded-[12px] text-sm focus:outline-none focus:border-[#b4975a]"
                      >
                        <option value="35000">₹35,000 (Basic/Albums)</option>
                        <option value="45000">₹45,000 (Pre-Wedding)</option>
                        <option value="59999">₹59,999 (Gold Lite Package)</option>
                        <option value="60000">₹60,000 (Drone/Standard)</option>
                        <option value="85000">₹85,000 (Standard Photo)</option>
                        <option value="110000">₹1,10,000 (Premium/Engagement)</option>
                        <option value="150000">₹1,50,000 (Cinematic Film/Full Combo)</option>
                        <option value="200000">₹2,00,000 (Luxury Package)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-500 block mb-2">Wedding Date</label>
                      <input 
                        type="date" 
                        value={newLeadDate}
                        onChange={(e) => setNewLeadDate(e.target.value)}
                        className="w-full px-4 py-3 border border-zinc-200 rounded-[12px] text-sm focus:outline-none focus:border-[#b4975a]"
                      />
                    </div>

                    <div className="md:col-span-3 flex justify-end gap-3 mt-2 pt-4 border-t border-zinc-50">
                      <button 
                        type="button" 
                        onClick={() => setShowAddForm(false)}
                        className="px-5 py-2.5 rounded-full border border-zinc-200 text-zinc-500 text-xs font-semibold hover:border-zinc-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-6 py-2.5 rounded-full bg-zinc-950 hover:bg-black text-white text-xs font-semibold shadow-sm transition-all"
                      >
                        Submit Lead
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* KEY METRICS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              
              {/* METRIC CARD 1 */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-white rounded-[24px] p-6 border border-zinc-200/40 shadow-sm flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block mb-1">Total Inquiries</span>
                  <h3 className="text-3xl font-semibold text-zinc-950 font-sans">{leads.length}</h3>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1">
                    <TrendingUp size={12} /> Active Pipeline
                  </span>
                </div>
                <div className="p-4 rounded-[20px] bg-amber-500/10 text-[#b4975a]">
                  <Users size={24} />
                </div>
              </motion.div>

              {/* METRIC CARD 2 */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-white rounded-[24px] p-6 border border-zinc-200/40 shadow-sm flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block mb-1">Projected Revenue</span>
                  <h3 className="text-3xl font-semibold text-zinc-950 font-sans">₹{(totalRevenue / 100000).toFixed(2)}L</h3>
                  <span className="text-[11px] text-[#b4975a] font-semibold flex items-center gap-0.5 mt-1">
                    Estimated Booking value
                  </span>
                </div>
                <div className="p-4 rounded-[20px] bg-zinc-900/10 text-zinc-900">
                  <IndianRupee size={24} />
                </div>
              </motion.div>

              {/* METRIC CARD 3 */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-white rounded-[24px] p-6 border border-zinc-200/40 shadow-sm flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block mb-1">Average Budget</span>
                  <h3 className="text-3xl font-semibold text-zinc-950 font-sans">₹{(averageBudget / 1000).toFixed(0)}k</h3>
                  <span className="text-[11px] text-[#b4975a] font-semibold flex items-center gap-0.5 mt-1">
                    Per package/client
                  </span>
                </div>
                <div className="p-4 rounded-[20px] bg-[#8a9289]/15 text-[#8a9289]">
                  <BarChart2 size={24} />
                </div>
              </motion.div>

              {/* METRIC CARD 4 */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-white rounded-[24px] p-6 border border-zinc-200/40 shadow-sm flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block mb-1">Hot Interest Rate</span>
                  <h3 className="text-3xl font-semibold text-zinc-950 font-sans">{highInterestPercentage}%</h3>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1">
                    {highInterestCount} High-priority leads
                  </span>
                </div>
                <div className="p-4 rounded-[20px] bg-emerald-500/10 text-emerald-700">
                  <PieChart size={24} />
                </div>
              </motion.div>

            </div>

            {/* CHARTS CONTAINER SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              
              {/* CHART 1: USER INTEREST BY PACKAGE */}
              <div className="bg-white rounded-[28px] p-8 border border-zinc-200/40 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-800">User Interest by Package</h3>
                    <p className="text-xs text-zinc-400">Total inquiries divided by photography/cinematography services</p>
                  </div>
                  <span className="text-[11px] uppercase tracking-wider bg-amber-500/10 text-[#b4975a] font-bold px-3 py-1 rounded-full">
                    Services
                  </span>
                </div>

                {/* Animated Horizontal Bar Chart */}
                <div className="space-y-5">
                  {serviceChartData.map((data, i) => {
                    const widthPercent = (data.count / maxServiceCount) * 100;
                    return (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-zinc-700">
                          <span>{data.name}</span>
                          <span className="text-zinc-400">{data.count} {data.count === 1 ? 'Inquiry' : 'Inquiries'}</span>
                        </div>
                        <div className="w-full h-7 bg-zinc-100 rounded-full overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${widthPercent}%` }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                            style={{ backgroundColor: data.color }}
                            className="h-full rounded-full flex items-center justify-end pr-3 min-w-[28px]"
                          >
                            {data.count > 0 && (
                              <span className="text-[10px] font-bold text-white font-sans">
                                {Math.round(widthPercent)}%
                              </span>
                            )}
                          </motion.div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CHART 2: BUDGET DISTRIBUTION OF INQUIRIES */}
              <div className="bg-white rounded-[28px] p-8 border border-zinc-200/40 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-800">Inquiry Budget Distribution</h3>
                      <p className="text-xs text-zinc-400">Analysis of client budgets for wedding packages</p>
                    </div>
                    <span className="text-[11px] uppercase tracking-wider bg-zinc-900/10 text-zinc-900 font-bold px-3 py-1 rounded-full">
                      Budgets
                    </span>
                  </div>

                  {/* Custom Vertical Bar Chart */}
                  <div className="flex justify-between items-end h-[240px] pt-4 px-4 border-b border-zinc-100 relative">
                    {budgetChartData.map((data, i) => {
                      const heightPercent = (data.value / maxBudgetValue) * 160; // Max height in px
                      return (
                        <div key={i} className="flex flex-col items-center gap-3 shrink-0" style={{ width: "20%" }}>
                          <div className="h-[180px] flex items-end justify-center w-full">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${heightPercent}px` }}
                              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
                              className="w-8 md:w-12 rounded-t-[10px] bg-gradient-to-t from-zinc-900 to-[#b4975a] relative group cursor-pointer flex items-center justify-center text-white"
                            >
                              <div className="absolute -top-7 px-2 py-0.5 rounded bg-zinc-950 text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                {data.value} Leads
                              </div>
                              {data.value > 0 && (
                                <span className="text-[10px] font-bold mb-1">{data.value}</span>
                              )}
                            </motion.div>
                          </div>
                          
                          <span className="text-[10px] font-semibold text-zinc-500 text-center uppercase tracking-wide block max-w-full leading-tight truncate">
                            {data.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-[16px] bg-amber-500/5 border border-amber-500/10 flex items-center gap-3">
                  <AlertCircle size={20} className="text-[#b4975a]" />
                  <p className="text-[11px] leading-relaxed text-[#b4975a] font-medium">
                    Budget distribution indicates high popularity in <strong>₹50k - ₹1L</strong> packages. Projected conversions for these packages are currently 82% higher.
                  </p>
                </div>
              </div>

            </div>

            {/* LEADS & INQUIRIES DATA TABLE */}
            <div className="bg-white rounded-[28px] p-6 md:p-8 border border-zinc-200/40 shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-800">Recent Customer Inquiries</h3>
                  <p className="text-xs text-zinc-400">Real-time pipeline from website forms and admin adds</p>
                </div>
                <div className="text-xs font-semibold text-zinc-500">
                  Showing <strong className="text-zinc-900">{leads.length}</strong> inquiries
                </div>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100">
                      <th className="py-4 px-3 text-xs uppercase tracking-wider text-zinc-400 font-semibold">Client</th>
                      <th className="py-4 px-3 text-xs uppercase tracking-wider text-zinc-400 font-semibold">Service Interested</th>
                      <th className="py-4 px-3 text-xs uppercase tracking-wider text-zinc-400 font-semibold">Budget</th>
                      <th className="py-4 px-3 text-xs uppercase tracking-wider text-zinc-400 font-semibold">Interest Level</th>
                      <th className="py-4 px-3 text-xs uppercase tracking-wider text-zinc-400 font-semibold">Wedding Date</th>
                      <th className="py-4 px-3 text-xs uppercase tracking-wider text-zinc-400 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence initial={false}>
                      {leads.map((lead) => (
                        <motion.tr
                          key={lead.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, x: -30 }}
                          transition={{ duration: 0.4 }}
                          className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors"
                        >
                          <td className="py-4 px-3">
                            <div className="font-semibold text-zinc-900 text-sm">{lead.name}</div>
                            <div className="text-xs text-zinc-400 mt-0.5">{lead.email} | {lead.phone}</div>
                          </td>
                          <td className="py-4 px-3">
                            <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium border border-zinc-200/20">
                              {lead.service}
                            </span>
                          </td>
                          <td className="py-4 px-3 font-semibold text-zinc-800 text-sm">
                            ₹{lead.budget.toLocaleString("en-IN")}
                          </td>
                          <td className="py-4 px-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              lead.status === "High" 
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/20" 
                                : lead.status === "Medium"
                                ? "bg-amber-50 text-amber-700 border border-amber-200/20"
                                : "bg-zinc-100 text-zinc-600"
                            }`}>
                              {lead.status === "High" && <CheckCircle size={12} className="fill-emerald-700 stroke-emerald-50" />}
                              {lead.status === "Medium" && <Clock size={12} className="fill-amber-700 stroke-amber-50" />}
                              {lead.status === "Low" && <AlertCircle size={12} />}
                              {lead.status}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-xs text-zinc-500 font-medium">
                            {new Date(lead.date).toLocaleDateString("en-IN", {
                              year: "numeric", month: "short", day: "numeric"
                            })}
                          </td>
                          <td className="py-4 px-3 text-right">
                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              className="p-2 rounded-full text-zinc-400 hover:text-red-500 hover:bg-red-50 active:scale-95 transition-all duration-300 cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>

                {leads.length === 0 && (
                  <div className="py-12 text-center text-zinc-400 text-sm">
                    No leads active in pipeline. Click "Add Inquiry" above to create one.
                  </div>
                )}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
