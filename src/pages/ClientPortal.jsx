import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, Calendar, MapPin, Search, Download, CheckCircle, 
  Clock, AlertCircle, X, Printer, Mail, Gift, Heart, BookOpen, 
  Video, MessageSquare, Send, ArrowRight, ArrowDownCircle, User, Lock,
  Upload, Share2, Copy, ExternalLink, Bell, FileText, Check, Home, Trash2, Camera, LogOut,
  ChevronLeft, ChevronRight, Maximize2, Minimize2, ZoomIn, ZoomOut, Expand, Eye, EyeOff, RefreshCw
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import SEO from "../components/SEO";

// =================== DEDICATED PDF BOOK FLIPBOOK VIEWER ===================
const PDFBookViewer = ({ pdfUrl, isGoogleDrive, embedUrl, API_BASE }) => {
  const [pdfjsLoaded, setPdfjsLoaded] = useState(false);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCache, setPageCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("double"); // "double" (side-by-side) | "single" (full width sheet)
  const [zoomScale, setZoomScale] = useState(1.0);
  const [showCreaseGuide, setShowCreaseGuide] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileRotated, setIsMobileRotated] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = prev
  const [renderProgress, setRenderProgress] = useState(0);

  const containerRef = useRef(null);
  const renderInProgressRef = useRef(new Set());

  // 1. Dynamically Load PDF.js from CDN
  useEffect(() => {
    if (window.pdfjsLib) {
      setPdfjsLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
      setPdfjsLoaded(true);
    };
    script.onerror = () => {
      setError("Failed to load PDF engine. Please verify connection or refresh.");
    };
    document.body.appendChild(script);
  }, []);

  // 2. Load PDF Document Object
  useEffect(() => {
    if (!pdfjsLoaded || !pdfUrl || isGoogleDrive) return;
    let isMounted = true;
    setLoading(true);
    setError(null);
    setRenderProgress(0);

    let objectUrl = null;

    const loadPDF = async () => {
      try {
        let finalUrl = pdfUrl;

        // Fetch external or relative PDFs as blob to avoid canvas tainting
        if (pdfUrl.startsWith("http") || pdfUrl.startsWith("/")) {
          try {
            let fetchUrl = pdfUrl;
            
            const response = await fetch(fetchUrl);
            if (response.ok) {
              const blob = await response.blob();
              objectUrl = URL.createObjectURL(blob);
              finalUrl = objectUrl;
            } else if (pdfUrl.startsWith("/") && API_BASE) {
              const fallbackUrl = `${API_BASE}${pdfUrl}`;
              const fallbackResponse = await fetch(fallbackUrl);
              if (fallbackResponse.ok) {
                const blob = await fallbackResponse.blob();
                objectUrl = URL.createObjectURL(blob);
                finalUrl = objectUrl;
              }
            }
          } catch (fetchErr) {
            console.warn("Failed to fetch PDF as blob, attempting direct load:", fetchErr);
            if (pdfUrl.startsWith("/") && API_BASE) {
              finalUrl = `${API_BASE}${pdfUrl}`;
            }
          }
        }

        const loadingTask = window.pdfjsLib.getDocument(finalUrl);
        const pdf = await loadingTask.promise;
        if (!isMounted) return;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setLoading(false);
        setPageCache({});
        setCurrentPage(1);
        renderInProgressRef.current.clear();
      } catch (err) {
        console.error("PDF loading error:", err);
        if (isMounted) {
          setError("Failed to parse the PDF structure. You can view the original layout using the preview below.");
          setLoading(false);
        }
      }
    };

    loadPDF();
    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [pdfjsLoaded, pdfUrl, isGoogleDrive, API_BASE]);

  // 3. Page Pre-rendering Engine
  const renderPage = async (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    if (!pdfDoc || pageCache[pageNum] || renderInProgressRef.current.has(pageNum)) return;
    renderInProgressRef.current.add(pageNum);

    try {
      const page = await pdfDoc.getPage(pageNum);
      const initialViewport = page.getViewport({ scale: 1.0 });
      
      // Auto-detect wide horizontal layflat spreads vs vertical pages
      const isWideLayout = initialViewport.width > initialViewport.height * 1.25;
      
      // Render in high DPI for absolute crisp wedding photo fidelity
      const scale = isWideLayout ? 1.5 : 2.2;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Draw background color to avoid canvas transparency bleed
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      const dataUrl = canvas.toDataURL("image/jpeg", 0.90); // 90% quality for premium clarity

      setPageCache(prev => ({
        ...prev,
        [pageNum]: {
          url: dataUrl,
          width: viewport.width,
          height: viewport.height,
          isWide: isWideLayout
        }
      }));
    } catch (err) {
      console.error(`Page ${pageNum} render error:`, err);
    } finally {
      renderInProgressRef.current.delete(pageNum);
    }
  };

  // 4. Background Preloader (Active & Adjacent Pages)
  useEffect(() => {
    if (!pdfDoc) return;

    const loadSpread = async () => {
      const activePages = [];
      if (viewMode === "double") {
        if (currentPage === 1) {
          activePages.push(1);
        } else {
          activePages.push(currentPage);
          if (currentPage + 1 <= totalPages) activePages.push(currentPage + 1);
        }
      } else {
        activePages.push(currentPage);
      }

      // Render active spread pages sequentially first
      for (const pageNum of activePages) {
        await renderPage(pageNum);
      }

      // Pre-render adjacent pages in the background for butter-smooth swiping
      const prefetchPages = [];
      if (viewMode === "double") {
        const nextSpread = currentPage === 1 ? 2 : currentPage + 2;
        if (nextSpread <= totalPages) {
          prefetchPages.push(nextSpread);
          if (nextSpread + 1 <= totalPages) prefetchPages.push(nextSpread + 1);
        }
        const prevSpread = currentPage === 2 ? 1 : currentPage - 2;
        if (prevSpread >= 1) {
          prefetchPages.push(prevSpread);
          if (prevSpread + 1 <= totalPages && prevSpread > 1) prefetchPages.push(prevSpread + 1);
        }
      } else {
        if (currentPage + 1 <= totalPages) prefetchPages.push(currentPage + 1);
        if (currentPage - 1 >= 1) prefetchPages.push(currentPage - 1);
      }

      for (const pageNum of prefetchPages) {
        renderPage(pageNum);
      }
    };

    loadSpread();
  }, [currentPage, pdfDoc, viewMode, totalPages]);

  // 5. Intelligent Page Staggering Detect
  useEffect(() => {
    if (pdfDoc && totalPages > 0) {
      if (totalPages === 1) {
        setViewMode("single");
        return;
      }
      
      // On narrow mobile screens, default to single page layout for optimal reading fit
      if (window.innerWidth < 768) {
        setViewMode("single");
        return;
      }

      // Fetch page 1 dimensions to guess initial layout preference
      pdfDoc.getPage(1).then(page => {
        const vp = page.getViewport({ scale: 1.0 });
        if (vp.width > vp.height * 1.25) {
          setViewMode("single"); // If wide layflat is detected, use single sheet wide mode
        } else {
          setViewMode("double"); // Otherwise use gorgeous open-book side-by-side mode
        }
      }).catch(() => {});
    }
  }, [pdfDoc, totalPages]);

  // Fullscreen toggle event listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleNext = () => {
    if (viewMode === "double") {
      if (currentPage === 1) {
        if (totalPages >= 2) setCurrentPage(2);
      } else if (currentPage + 2 <= totalPages) {
        setCurrentPage(currentPage + 2);
      }
    } else {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    }
    setDirection(1);
    setZoomScale(1.0); // Reset zoom on page flip
  };

  const handlePrev = () => {
    if (viewMode === "double") {
      if (currentPage === 2) {
        setCurrentPage(1);
      } else if (currentPage - 2 >= 2) {
        setCurrentPage(currentPage - 2);
      }
    } else {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
    setDirection(-1);
    setZoomScale(1.0); // Reset zoom on page flip
  };

  const isPageReady = (pageNum) => !!pageCache[pageNum];

  // Return formatted display page numbers
  const getSpreadLabel = () => {
    if (viewMode === "double") {
      if (currentPage === 1) return "Front Cover (Page 1)";
      const nextP = currentPage + 1;
      return nextP <= totalPages 
        ? `Pages ${currentPage} - ${nextP} (Spread ${Math.floor(currentPage / 2) + 1})`
        : `Page ${currentPage} - Back Cover (Spread ${Math.floor(currentPage / 2) + 1})`;
    } else {
      return `Page ${currentPage} of ${totalPages} (Spread ${currentPage})`;
    }
  };

  // Google Drive URL or unsupported CORS URLs fallback
  if (isGoogleDrive || error) {
    return (
      <div className="bg-zinc-950/95 border border-zinc-800 rounded-[24px] p-8 text-center space-y-5 flex flex-col justify-center items-center" style={{ height: "540px" }}>
        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
          <AlertCircle size={24} />
        </div>
        <div className="max-w-md space-y-2">
          <h4 className="text-white text-base font-semibold">External Sandbox Active</h4>
          <p className="text-zinc-400 text-xs font-light leading-relaxed">
            {error || "This album draft is hosted securely in an external repository (Google Drive / Dropbox). Our physical book previewer requires local access to flip pages. You can view the layout in the interactive embed below."}
          </p>
        </div>
        <div className="flex gap-3">
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" 
            className="flex items-center gap-1.5 px-4 py-2 bg-[#b4975a] hover:bg-[#a3864b] transition-all text-zinc-950 font-bold rounded-xl text-[11px] uppercase tracking-wider shadow-sm">
            Open Original PDF <ExternalLink size={12} />
          </a>
        </div>
        <div className="w-full max-w-xl h-[320px] rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-900 mt-4 relative">
          <iframe src={embedUrl} className="w-full h-full" allow="autoplay" title="Album Embed Preview" style={{ border: "none" }} />
        </div>
      </div>
    );
  }

  // Preloading & rendering progress indicators
  if (loading) {
    return (
      <div className="bg-zinc-950 rounded-[28px] flex flex-col items-center justify-center p-8 space-y-4 md:h-[540px] h-[400px]">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-zinc-800 border-t-[#b4975a] animate-spin" />
          <BookOpen size={16} className="text-[#b4975a] absolute" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-white text-xs font-medium tracking-wide">Opening Wedding Album Blueprint...</p>
          <p className="text-zinc-500 text-[10px] font-light">Loading layouts and preparing physical sheets</p>
        </div>
      </div>
    );
  }

  const leftPageNum = currentPage;
  const rightPageNum = viewMode === "double" && currentPage > 1 ? currentPage + 1 : null;
  const hasRightPage = rightPageNum && rightPageNum <= totalPages;

  const leftPageCache = pageCache[leftPageNum];
  const rightPageCache = hasRightPage ? pageCache[rightPageNum] : null;

  const isCurrentSpreadReady = viewMode === "double"
    ? (currentPage === 1 ? isPageReady(1) : (isPageReady(leftPageNum) && (!hasRightPage || isPageReady(rightPageNum))))
    : isPageReady(currentPage);

  const zoomFactor = zoomScale > 1.0;

  const rotatedStyles = isMobileRotated ? {
    position: "fixed",
    top: 0,
    left: "100vw",
    width: "100vh",
    height: "100vw",
    transform: "rotate(90deg)",
    transformOrigin: "top left",
    zIndex: 9999,
    padding: "16px",
  } : {};

  return (
    <div 
      ref={containerRef} 
      style={rotatedStyles}
      className={`bg-zinc-950 select-none overflow-hidden relative flex flex-col justify-between transition-all duration-300 ${isMobileRotated ? "" : (isFullscreen ? "fixed inset-0 z-50 p-4 sm:p-8 h-screen w-screen" : "border-y border-zinc-900 p-3 sm:p-6 md:h-[600px] h-[480px] w-full")}`}
    >
      
      {/* Mobile Rotation Nudge Overlay */}
      {!isMobileRotated && !isFullscreen && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-45 md:hidden bg-zinc-900/95 backdrop-blur-md border border-[#b4975a]/30 px-3.5 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <span className="text-[10px] text-[#b4975a] font-bold uppercase tracking-wider">🔄 Widescreen View</span>
          <button
            onClick={() => {
              setIsMobileRotated(true);
              setViewMode("double");
            }}
            className="bg-[#b4975a] text-zinc-950 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md active:scale-95 cursor-pointer"
          >
            Rotate
          </button>
        </div>
      )}

      {/* 1. Header Toolbar Control Center */}
      <div className="flex justify-between items-center bg-zinc-900/60 backdrop-blur border border-zinc-800/80 rounded-2xl px-3 py-2.5 sm:px-5 sm:py-3.5 z-30">
        
        {/* Left Side: Page Spread Label */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#b4975a]/10 border border-[#b4975a]/20 flex items-center justify-center flex-shrink-0">
            <BookOpen size={14} className="text-[#b4975a]" />
          </div>
          <div>
            <div className="text-white text-xs font-semibold tracking-wide">{getSpreadLabel()}</div>
            <div className="text-[9px] text-zinc-400 font-light mt-0.5 uppercase tracking-widest hidden sm:block">Layflat Album Blueprint</div>
          </div>
        </div>

        {/* Right Side: Interactive Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Fold Crease Guide Switcher */}
          <button 
            onClick={() => setShowCreaseGuide(!showCreaseGuide)}
            title="Toggle Bind Crease Guide"
            className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${showCreaseGuide ? "bg-[#b4975a]/10 border-[#b4975a]/40 text-[#b4975a]" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"}`}
          >
            <Eye size={14} />
          </button>

          {/* View Mode Switcher */}
          {totalPages > 1 && (
            <>
              <button
                onClick={() => setViewMode(viewMode === "double" ? "single" : "double")}
                title={viewMode === "double" ? "Switch to Single Sheet layout" : "Switch to Double Open Book layout"}
                className="h-8 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer w-8 sm:w-auto sm:px-2.5"
              >
                <BookOpen size={14} />
                <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider ml-1.5">
                  {viewMode === "double" ? "Double" : "Single"}
                </span>
              </button>
              <div className="hidden sm:block h-4 w-[1px] bg-zinc-800 mx-1" />
            </>
          )}

          {/* Zoom Slider */}
          <div className="hidden md:flex items-center gap-1.5">
            <button 
              disabled={zoomScale <= 1.0}
              onClick={() => setZoomScale(Math.max(1.0, zoomScale - 0.5))}
              className="w-7 h-7 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 disabled:pointer-events-none rounded-lg flex items-center justify-center cursor-pointer"
            >
              <ZoomOut size={12} />
            </button>
            <span className="text-[10px] text-zinc-400 w-8 text-center font-bold font-mono">{Math.round(zoomScale * 100)}%</span>
            <button 
              disabled={zoomScale >= 3.0}
              onClick={() => setZoomScale(Math.min(3.0, zoomScale + 0.5))}
              className="w-7 h-7 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 disabled:pointer-events-none rounded-lg flex items-center justify-center cursor-pointer"
            >
              <ZoomIn size={12} />
            </button>
          </div>

          <div className="hidden md:block h-4 w-[1px] bg-zinc-800 mx-1" />

          {/* Mobile Landscape Rotation Toggle */}
          <button
            onClick={() => {
              const nextState = !isMobileRotated;
              setIsMobileRotated(nextState);
              if (nextState) {
                setViewMode("double");
                setZoomScale(1.0);
              }
            }}
            title={isMobileRotated ? "Exit Widescreen View" : "Rotate Widescreen landscape"}
            className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${isMobileRotated ? "bg-[#b4975a]/10 border-[#b4975a]/40 text-[#b4975a]" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"}`}
          >
            <RefreshCw size={14} className={`transition-transform duration-500 ${isMobileRotated ? "rotate-90" : ""}`} />
          </button>

          <div className="hidden sm:block h-4 w-[1px] bg-zinc-800 mx-1" />

          {/* Fullscreen API Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Cinema Screen" : "Enter Cinema Screen"}
            className="w-8 h-8 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg flex items-center justify-center transition-all cursor-pointer"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* 2. Interactive Album Workspace Center (Drag to Flip & Pan-Zoom) */}
      <div className="flex-1 flex items-center justify-center relative py-4 px-6 overflow-hidden">
        
        {/* Floating Spread Page Turn Overlays */}
        {!zoomFactor && (
          <>
            {/* Previous Side Hover Panel */}
            {currentPage > 1 && (
              <button 
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-16 bg-zinc-900/40 hover:bg-[#b4975a]/10 border border-zinc-800/40 hover:border-[#b4975a]/30 text-zinc-400 hover:text-[#b4975a] rounded-2xl flex items-center justify-center transition-all z-20 cursor-pointer shadow-lg backdrop-blur-sm group"
              >
                <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Next Side Hover Panel */}
            {((viewMode === "double" && currentPage + 2 <= totalPages) || (viewMode === "single" && currentPage < totalPages) || (viewMode === "double" && currentPage === 1)) && (
              <button 
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-16 bg-zinc-900/40 hover:bg-[#b4975a]/10 border border-zinc-800/40 hover:border-[#b4975a]/30 text-zinc-400 hover:text-[#b4975a] rounded-2xl flex items-center justify-center transition-all z-20 cursor-pointer shadow-lg backdrop-blur-sm group"
              >
                <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </>
        )}

        {/* Dynamic Drag Flip Action Canvas */}
        <motion.div
          drag={!zoomFactor ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.25}
          onDragEnd={(e, info) => {
            if (zoomFactor) return;
            const swipeThreshold = 60;
            if (info.offset.x < -swipeThreshold) {
              // Next Page condition check
              if ((viewMode === "double" && currentPage + 2 <= totalPages) || (viewMode === "single" && currentPage < totalPages) || (viewMode === "double" && currentPage === 1)) {
                handleNext();
              }
            } else if (info.offset.x > swipeThreshold) {
              // Previous Page condition check
              if (currentPage > 1) {
                handlePrev();
              }
            }
          }}
          className="max-w-full max-h-full flex items-center justify-center"
        >
          {/* Elegant Skeleton Page turn Loader */}
          {!isCurrentSpreadReady ? (
            <div className="w-[90vw] max-w-[640px] aspect-[1.6] rounded-3xl bg-zinc-900 border border-zinc-800/50 flex flex-col justify-center items-center space-y-4">
              <RefreshCw size={24} className="text-[#b4975a] animate-spin opacity-80" />
              <p className="text-zinc-500 text-[10px] tracking-wide uppercase font-light">Loading spread details...</p>
            </div>
          ) : (
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentPage + "_" + viewMode}
                custom={direction}
                variants={{
                  enter: (dir) => ({
                    x: dir > 0 ? "50%" : "-50%",
                    rotateY: dir > 0 ? 35 : -35,
                    opacity: 0,
                    scale: 0.95
                  }),
                  center: {
                    x: 0,
                    rotateY: 0,
                    opacity: 1,
                    scale: 1,
                    transition: {
                      x: { type: "spring", stiffness: 180, damping: 22 },
                      opacity: { duration: 0.15 },
                      rotateY: { type: "spring", stiffness: 140, damping: 18 },
                      scale: { duration: 0.25 }
                    }
                  },
                  exit: (dir) => ({
                    x: dir > 0 ? "-50%" : "50%",
                    rotateY: dir > 0 ? -35 : 35,
                    opacity: 0,
                    scale: 0.95,
                    transition: {
                      x: { type: "spring", stiffness: 180, damping: 22 },
                      opacity: { duration: 0.15 },
                      rotateY: { type: "spring", stiffness: 140, damping: 18 }
                    }
                  })
                }}
                initial="enter"
                animate="center"
                exit="exit"
                style={{ perspective: 1500, transformStyle: "preserve-3d" }}
                className="w-full max-w-5xl h-full flex items-center justify-center relative"
              >
                
                {/* 3. Realistic Open Book Casing Stack */}
                <div className="relative flex items-center justify-center p-2 rounded-[28px] bg-zinc-900/40 border border-zinc-800/40 shadow-2xl">
                  
                  {/* Decorative Page Thickness Edges (Left & Right 3D stacks) */}
                  {!zoomFactor && viewMode === "double" && currentPage > 1 && (
                    <>
                      {/* Left Side Thickness Sheets */}
                      <div 
                        className="absolute left-[-2px] top-[14px] bottom-[14px] bg-zinc-200 border border-zinc-300 rounded-l shadow-sm pointer-events-none"
                        style={{ width: `${Math.min(8, Math.floor(currentPage / 2) * 1.5 + 2)}px` }}
                      />
                      <div 
                        className="absolute left-[-4px] top-[18px] bottom-[18px] bg-zinc-300 border border-zinc-400 rounded-l shadow-xs pointer-events-none"
                        style={{ width: `${Math.min(5, Math.floor(currentPage / 2) * 1.0 + 1)}px` }}
                      />
                    </>
                  )}

                  {!zoomFactor && viewMode === "double" && (
                    <>
                      {/* Right Side Thickness Sheets */}
                      <div 
                        className="absolute right-[-2px] top-[14px] bottom-[14px] bg-zinc-200 border border-zinc-300 rounded-r shadow-sm pointer-events-none"
                        style={{ width: `${Math.min(8, Math.floor((totalPages - currentPage) / 2) * 1.5 + 2)}px` }}
                      />
                      <div 
                        className="absolute right-[-4px] top-[18px] bottom-[18px] bg-zinc-300 border border-zinc-400 rounded-r shadow-xs pointer-events-none"
                        style={{ width: `${Math.min(5, Math.floor((totalPages - currentPage) / 2) * 1.0 + 1)}px` }}
                      />
                    </>
                  )}

                  {/* Panoramic Fold Crease Line / Guide */}
                  {showCreaseGuide && (
                    <div className="absolute top-[8px] bottom-[8px] left-1/2 -translate-x-1/2 w-[30px] z-20 pointer-events-none bg-gradient-to-r from-black/25 via-transparent to-black/25 opacity-80" />
                  )}

                  {/* Dynamic Pan Zoom Viewport Wrapper */}
                  <motion.div
                    drag={zoomFactor}
                    dragConstraints={zoomFactor ? { left: -500, right: 500, top: -500, bottom: 500 } : { left: 0, right: 0, top: 0, bottom: 0 }}
                    style={{ scale: zoomScale }}
                    className="flex max-w-full max-h-[460px] overflow-hidden rounded-[20px] shadow-lg relative bg-white transition-transform duration-200"
                  >
                    
                    {/* View rendering: Double Open-Book Layout */}
                    {viewMode === "double" ? (
                      currentPage === 1 ? (
                        // 1. Double view cover page centered (Book Closed Cover)
                        <div className="flex justify-center items-center bg-white w-[45vw] max-w-[360px] aspect-[0.8]" style={{ height: "auto" }}>
                          {leftPageCache ? (
                            <img src={leftPageCache.url} className="w-full h-full object-contain pointer-events-none" alt="Cover" />
                          ) : (
                            <div className="animate-pulse w-full h-full bg-zinc-100" />
                          )}
                          
                          {/* Book spine Crease detail on the left boundary of cover */}
                          <div className="absolute left-0 top-0 bottom-0 w-[8px] bg-gradient-to-r from-black/15 to-transparent pointer-events-none" />
                        </div>
                      ) : (
                        // 2. Open pages side-by-side joined in center
                        <div className="flex bg-white w-[90vw] max-w-[720px] aspect-[1.6]" style={{ height: "auto" }}>
                          {/* Left page rendering */}
                          <div className="w-1/2 h-full border-r border-zinc-100 relative">
                            {leftPageCache ? (
                              <img src={leftPageCache.url} className="w-full h-full object-contain pointer-events-none" alt="Left Page" />
                            ) : (
                              <div className="animate-pulse w-full h-full bg-zinc-50" />
                            )}
                            
                            {/* Spine crease shadow helper */}
                            <div className="absolute right-0 top-0 bottom-0 w-[12px] bg-gradient-to-l from-black/15 to-transparent pointer-events-none" />
                          </div>

                          {/* Right page rendering */}
                          <div className="w-1/2 h-full relative">
                            {rightPageCache ? (
                              <img src={rightPageCache.url} className="w-full h-full object-contain pointer-events-none" alt="Right Page" />
                            ) : (
                              hasRightPage ? (
                                <div className="animate-pulse w-full h-full bg-zinc-50" />
                              ) : (
                                // Back cover block
                                <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-400 font-light italic text-[10px]">
                                  End of Album
                                </div>
                              )
                            )}
                            
                            {/* Spine crease shadow helper */}
                            <div className="absolute left-0 top-0 bottom-0 w-[12px] bg-gradient-to-r from-black/15 to-transparent pointer-events-none" />
                          </div>
                        </div>
                      )
                    ) : (
                      // View rendering: Wide single landscape layflat spread sheet
                      <div className="bg-white flex justify-center items-center w-[90vw] max-w-[720px] aspect-[1.6]" style={{ height: "auto" }}>
                        {leftPageCache ? (
                          <img src={leftPageCache.url} className="w-full h-full object-contain pointer-events-none" alt="Layflat Sheet" />
                        ) : (
                          <div className="animate-pulse w-full h-full bg-zinc-50" />
                        )}
                        
                        {/* Fold line crease guide overlay */}
                        {showCreaseGuide && (
                          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[1px] border-l border-dashed border-[#b4975a] opacity-80 z-20 pointer-events-none" />
                        )}
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </div>

      {/* 4. Bottom Index Jump Progress Tracker Track */}
      <div className="flex items-center gap-4 bg-zinc-900/40 border border-zinc-800/60 rounded-xl px-5 py-2.5 z-20">
        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Spread Grid</span>
        <div className="flex-1 flex items-center gap-1.5 overflow-x-auto py-1">
          {Array.from({ length: viewMode === "double" ? Math.floor(totalPages / 2) + 1 : totalPages }).map((_, idx) => {
            const pageNum = viewMode === "double" 
              ? (idx === 0 ? 1 : idx * 2) 
              : idx + 1;
            
            const isActive = viewMode === "double"
              ? (currentPage === 1 ? pageNum === 1 : (pageNum >= currentPage && pageNum < currentPage + 2))
              : pageNum === currentPage;

            return (
              <button
                key={idx}
                onClick={() => {
                  setCurrentPage(pageNum);
                  setZoomScale(1.0);
                }}
                className={`h-2 rounded-full cursor-pointer flex-shrink-0 transition-all ${isActive ? "bg-[#b4975a] w-6" : "bg-zinc-800 hover:bg-zinc-700 w-3"}`}
                title={viewMode === "double" 
                  ? (idx === 0 ? "Cover (Page 1)" : `Spread ${idx} (Pages ${pageNum}-${pageNum+1})`)
                  : `Spread ${pageNum} (Page ${pageNum})`}
              />
            );
          })}
        </div>
        
        {/* Helper guide label */}
        <span className="text-[9px] text-[#b4975a] italic font-light">Swipe sheets to turn pages</span>
      </div>
    </div>
  );
};

// =================== ALBUM DRAFT APPROVAL COMPONENT ===================
const AlbumDraftApproval = ({ project, setProject, API_BASE }) => {
  const [showEditWarning, setShowEditWarning] = useState(false);
  const [extraPhotos, setExtraPhotos] = useState("");
  const [revisionNotes, setRevisionNotes] = useState("");
  const [photoNumbersToInclude, setPhotoNumbersToInclude] = useState("");
  const [uploadedPhotoFiles, setUploadedPhotoFiles] = useState([]);
  const [actionLoading, setActionLoading] = useState(null); // "print" | "edit"

  const pdfUrl = project.deliveries?.album_pdf_url;
  const isGoogleDrive = pdfUrl?.includes("drive.google.com") || pdfUrl?.includes("docs.google.com");
  // Convert Google Drive links to embeddable preview
  const embedUrl = isGoogleDrive
    ? pdfUrl.replace(/\/view.*$/, "/preview").replace(/\/pub.*$/, "/preview")
    : pdfUrl;

  const handlePrintApproval = async () => {
    setActionLoading("print");
    try {
      // Update album status to approved
      await fetch(`${API_BASE}/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveries: { ...project.deliveries, album_status: "approved" }
        })
      });
      // Post a message to designer channel
      await fetch(`${API_BASE}/api/projects/${project.id}/chats/client-designer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: "client",
          text: "✅ We have reviewed and approved the album layout. Please proceed with printing. Thank you!"
        })
      });
      setProject(prev => prev ? { ...prev, deliveries: { ...prev.deliveries, album_status: "approved" } } : prev);
      alert("🎉 Album approved! Your designer has been notified to proceed with printing.");
    } catch (e) {
      alert("Error sending approval. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditRequest = async () => {
    setActionLoading("edit");
    try {
      const extra = parseInt(extraPhotos) || 0;
      const extraCharge = extra > 0 ? `₹${extra * 400} additional charge` : "no additional charge";
      const notesPart = revisionNotes.trim() ? `\n\n💬 Client Suggestions:\n"${revisionNotes.trim()}"` : "";
      
      const photoNumbersPart = photoNumbersToInclude.trim() 
        ? `\n\n🎯 Specific Gallery Photos to Include/Swap:\n"${photoNumbersToInclude.trim()}"` 
        : "";
        
      const uploadedFilesPart = uploadedPhotoFiles.length > 0 
        ? `\n\n📤 Uploaded Additional Photos:\n${uploadedPhotoFiles.map(f => `- 📷 ${f.name}: ${f.url}`).join('\n')}` 
        : "";

      const msgText = `📝 We'd like to request changes to the album layout. ${extra > 0 ? `We want to add approximately ${extra} more photos (${extraCharge}).` : ""} Please review our suggestions below.${notesPart}${photoNumbersPart}${uploadedFilesPart}\n\nOur designer will contact you to discuss the revisions.`;

      const revisionDetails = {
        extra_photos_count: extra,
        specific_photos: photoNumbersToInclude.trim(),
        revision_notes: revisionNotes.trim(),
        uploaded_files: uploadedPhotoFiles.map(f => ({ name: f.name, url: f.url }))
      };

      await fetch(`${API_BASE}/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveries: { 
            ...project.deliveries, 
            album_status: "changes_requested",
            album_revision_details: revisionDetails
          }
        })
      });
      await fetch(`${API_BASE}/api/projects/${project.id}/chats/client-designer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "client", text: msgText })
      });
      setProject(prev => prev ? { 
        ...prev, 
        deliveries: { 
          ...prev.deliveries, 
          album_status: "changes_requested",
          album_revision_details: revisionDetails
        } 
      } : prev);
      setShowEditWarning(false);
      setExtraPhotos("");
      setRevisionNotes("");
      setPhotoNumbersToInclude("");
      setUploadedPhotoFiles([]);
      alert("📝 Revision request sent! Your designer will reach out to discuss your changes.");
    } catch (e) {
      alert("Error sending revision request. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const isApproved = project.deliveries?.album_status === "approved";
  const isRevisionRequested = project.deliveries?.album_status === "changes_requested";

  return (
    <div className="bg-white border border-zinc-200 rounded-[28px] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#b4975a]/10 border border-[#b4975a]/20 flex items-center justify-center">
            <BookOpen size={16} className="text-[#b4975a]" />
          </div>
          <div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-xl text-zinc-900 font-light">
              Your Album <span className="italic text-[#b4975a]">Draft Preview</span>
            </h3>
            <p className="text-[10px] text-zinc-500 font-light mt-0.5">Designed by your Dreamwed album specialist</p>
          </div>
        </div>
        {isApproved && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wide">
            ✓ Album Approved — Sent for Printing
          </span>
        )}
        {isRevisionRequested && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wide">
            ✏ Revisions Requested
          </span>
        )}
      </div>

      {/* PDF Flipbook Book Viewer */}
      <PDFBookViewer pdfUrl={pdfUrl} isGoogleDrive={isGoogleDrive} embedUrl={embedUrl} API_BASE={API_BASE} />

      {/* Action Buttons */}
      {!isApproved && (
        <div className="px-6 py-5 bg-white flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex-1">
            <p className="text-xs font-semibold text-zinc-800">Ready to decide?</p>
            <p className="text-[10px] text-zinc-500 font-light mt-0.5">Review every page carefully before approving. Changes can be made before final print.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Edit Button */}
            <button
              onClick={() => setShowEditWarning(true)}
              disabled={actionLoading !== null}
              className="flex-1 sm:flex-none px-5 py-3 border-2 border-zinc-800 hover:border-zinc-600 text-zinc-800 hover:bg-zinc-50 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              ✏ Edit This Album
            </button>
            {/* Print Button */}
            <button
              onClick={handlePrintApproval}
              disabled={actionLoading !== null}
              className="flex-1 sm:flex-none px-5 py-3 bg-[#b4975a] hover:bg-[#c5a86b] text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-[0.98] disabled:opacity-70"
            >
              {actionLoading === "print" ? (
                <span className="flex items-center gap-2"><span className="w-3 h-3 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" /> Sending...</span>
              ) : (
                <>🖨 Print This Album</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Already approved message */}
      {isApproved && (
        <div className="px-6 py-4 bg-emerald-50 flex items-center gap-3">
          <CheckCircle size={16} className="text-emerald-600 shrink-0" />
          <p className="text-xs text-emerald-700 font-medium">
            You have approved this album. Our team is preparing it for professional printing. You will receive a confirmation once it goes to press.
          </p>
        </div>
      )}

      {/* ============ EDIT WARNING MODAL ============ */}
      {showEditWarning && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditWarning(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[28px] p-7 max-w-md w-full shadow-2xl border border-zinc-100 space-y-5 max-h-[85vh] overflow-y-auto"
          >
            {/* Warning icon */}
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xl">⚠️</span>
              </div>
              <div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-2xl text-zinc-900 font-light leading-snug">
                  Request Album <span className="italic text-[#b4975a]">Changes</span>
                </h3>
                <p className="text-zinc-500 text-xs font-light mt-1">Please read carefully before requesting edits</p>
              </div>
            </div>

            {/* Warning box */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
              <p className="text-amber-800 text-xs font-bold uppercase tracking-wide">⚠ Important Pricing Notice</p>
              <p className="text-amber-900 text-sm font-light leading-relaxed">
                Your current album is designed to fit the photos you selected. Adding more photos means <strong>more pages</strong> are required in the album.
              </p>
              <div className="mt-2 bg-white border border-amber-200 rounded-xl p-3 space-y-1">
                <p className="text-amber-800 text-xs font-bold">Extra Page Pricing:</p>
                <p className="text-zinc-800 text-sm font-semibold">₹400 per additional leaf <span className="text-zinc-400 text-xs font-normal">(1 leaf = 2 pages)</span></p>
              </div>
            </div>

            {/* Extra photos input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block">
                How many extra photos do you want to add? (optional)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 10"
                value={extraPhotos}
                onChange={(e) => setExtraPhotos(e.target.value)}
                className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-zinc-800 text-sm focus:border-[#b4975a] focus:outline-none bg-zinc-50"
              />
              {extraPhotos && parseInt(extraPhotos) > 0 && (
                <div className="flex items-center gap-2 p-3 bg-[#b4975a]/8 border border-[#b4975a]/20 rounded-xl">
                  <span className="text-[#b4975a] text-xs">💰</span>
                  <p className="text-xs text-zinc-700 font-medium">
                    Estimated extra charge:{" "}
                    <strong className="text-zinc-900">₹{parseInt(extraPhotos) * 400}</strong>
                    <span className="text-zinc-500 font-light"> (approx. {parseInt(extraPhotos)} extra photos)</span>
                  </p>
                </div>
              )}
              <p className="text-zinc-400 text-[10px] font-light">
                Your designer will contact you to confirm exact changes and additional pricing before any changes are made.
              </p>
            </div>

            {/* Design Suggestions / Revision Notes */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block">
                Your Suggestions or Notes for the Designer
              </label>
              <textarea
                placeholder="e.g. Please swap the photo on page 3 with page 5, adjust the color tone on page 2, or make page 4 fullscreen..."
                rows="4"
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-zinc-800 text-sm focus:border-[#b4975a] focus:outline-none bg-zinc-50 resize-none"
              />
            </div>

            {/* Specific Photo Numbers to Include */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block">
                Specific Gallery Photo Numbers to Add/Swap
              </label>
              <input
                type="text"
                placeholder="e.g., Photos #4, #12, #38, or 'the group shot on stage'"
                value={photoNumbersToInclude}
                onChange={(e) => setPhotoNumbersToInclude(e.target.value)}
                className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-zinc-800 text-sm focus:border-[#b4975a] focus:outline-none bg-zinc-50"
              />
            </div>

            {/* Additional Photo Uploader */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block">
                Upload New Additional Photos for the Editor
              </label>
              
              <div 
                className="border-2 border-dashed border-zinc-200 hover:border-[#b4975a] rounded-xl p-4 bg-zinc-50 text-center transition-all cursor-pointer relative"
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = e.dataTransfer.files;
                  if (files.length > 0) {
                    const newFiles = Array.from(files).map(file => ({
                      name: file.name,
                      url: `https://dreamwedstories.co.in/uploads/${encodeURIComponent(file.name)}`
                    }));
                    setUploadedPhotoFiles(prev => [...prev, ...newFiles]);
                  }
                }}
              >
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      const newFiles = Array.from(files).map(file => ({
                        name: file.name,
                        url: `https://dreamwedstories.co.in/uploads/${encodeURIComponent(file.name)}`
                      }));
                      setUploadedPhotoFiles(prev => [...prev, ...newFiles]);
                    }
                  }}
                />
                <div className="space-y-1 select-none">
                  <p className="text-[#b4975a] text-xs font-semibold">📤 Click or Drag photos to upload</p>
                  <p className="text-zinc-400 text-[9px] font-light">PNG, JPG or JPEG supported (Max 15MB)</p>
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedPhotoFiles.length > 0 && (
                <div className="space-y-1.5 pt-1 max-h-[120px] overflow-y-auto pr-1">
                  {uploadedPhotoFiles.map((file, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white border border-zinc-150 rounded-lg px-3 py-2 text-[10px] text-zinc-700 shadow-xs">
                      <span className="truncate max-w-[200px] font-medium">📷 {file.name}</span>
                      <button 
                        onClick={() => setUploadedPhotoFiles(prev => prev.filter((_, i) => i !== idx))}
                        className="text-zinc-400 hover:text-red-500 transition-colors p-1 cursor-pointer bg-transparent border-none"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setShowEditWarning(false); setExtraPhotos(""); setRevisionNotes(""); }}
                className="flex-1 py-3 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleEditRequest}
                disabled={actionLoading !== null}
                className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98] disabled:opacity-70"
              >
                {actionLoading === "edit" ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  "Confirm Revision Request"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const ClientPortal = () => {

  const [project, setProject] = useState(null);
  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, loading, success, error, not_found
  const [errorMessage, setErrorMessage] = useState("");
  
  // Clean Redesigned Tabs (8 Sections)
  const [activeTab, setActiveTab] = useState("home"); // home, gallery, shared, album, messages, documents, account, notifications
  const [activeChatChannel, setActiveChatChannel] = useState("client-admin"); // client-admin, client-editor, client-designer
  const [chatMessages, setChatMessages] = useState([]);
  const [newMsgText, setNewMsgText] = useState("");
  const [galleryFilter, setGalleryFilter] = useState("all");
  const [isInvoicePrintOpen, setIsInvoicePrintOpen] = useState(false);
  const [photoComments, setPhotoComments] = useState({}); // photoId -> comment text
  const [activeLightboxPhotoId, setActiveLightboxPhotoId] = useState(null);
  
  // High-performance Infinite Scroll states for 3000+ photos
  const [visiblePhotosCount, setVisiblePhotosCount] = useState(24);
  const mainScrollRef = useRef(null);

  // High-performance image URL optimizer for Google Drive files
  const getOptimizedImageUrl = (url) => {
    if (!url) return "";
    return url; // Served from high-speed, direct-embedding Google CDN
  };

  // Login Gates
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [clientPassword, setClientPassword] = useState("");

  // Account Profile States
  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);

  // Wedding Documents States
  const [invitationUrl, setInvitationUrl] = useState("");
  const [referencePhotosUrl, setReferencePhotosUrl] = useState("");
  const [songListUrl, setSongListUrl] = useState("");
  const [savingDocs, setSavingDocs] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Activity logs for Home Dashboard
  const [activityLogs, setActivityLogs] = useState([]);

  const [showDevServer, setShowDevServer] = useState(false);
  const [serverInput, setServerInput] = useState(() => {
    return localStorage.getItem("dreamwed_api_base") || import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  });

  const API_BASE = serverInput;
  const chatInterval = useRef(null);

  const saveCustomServer = () => {
    let cleanUrl = serverInput.trim();
    if (cleanUrl.endsWith("/")) {
      cleanUrl = cleanUrl.slice(0, -1);
    }
    localStorage.setItem("dreamwed_api_base", cleanUrl);
    setServerInput(cleanUrl);
    setShowDevServer(false);
    alert(`Connected to server: ${cleanUrl}`);
  };

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

  const INITIAL_PROJECTS = [
    {
      id: 2,
      booking_id: 3,
      couple_name: "Adarsh & Anjali",
      wedding_date: "2026-12-18",
      current_step: 3,
      timeline_steps: [
        { name: "Photos Uploaded", completed: true, updated_at: "2026-05-28 19:04:54" },
        { name: "Client Selected Photos", completed: true, updated_at: "2026-05-30 13:14:48" },
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
        { id: 1, url: "https://lh3.googleusercontent.com/d/1t9NpD7bufB-EotQGhan3UX_zw9oqpCNE=w1000", favorited: true, categories: ["album"], comment: "" },
        { id: 2, url: "https://lh3.googleusercontent.com/d/1Qf7tqN14Oct0GdG2dn-jNBy_RdNO4tRh=w1000", favorited: true, categories: ["album"], comment: "" },
        { id: 3, url: "https://lh3.googleusercontent.com/d/1EJ9qWLLBqgT1woFFPduDimEDXBt-K5RS=w1000", favorited: true, categories: ["album"], comment: "" },
        { id: 4, url: "https://lh3.googleusercontent.com/d/1bWyGkkkzScDh2lyyZt0mfL7S2kdWzchU=w1000", favorited: false, categories: [], comment: "" },
        { id: 5, url: "https://lh3.googleusercontent.com/d/1lGbiiMD_OfYnvmwxiUoWY7dMyQyfwoPE=w1000", favorited: true, categories: ["album"], comment: "" }
      ],
      deliveries: {
        video_teaser_url: "https://www.youtube.com/embed/S9-SrdnKsMs",
        video_status: "pending",
        album_pdf_url: "/albums/1780120461186_JISMY_DEMO.pdf",
        album_status: "changes_requested",
        final_download_url: "",
        raw_photos_url: "https://drive.google.com/drive/folders/19mUd9IudALVI6Sa41Q2htmXkfJm0uSU4?usp=sharing",
        album_revision_details: {
          extra_photos_count: 0,
          specific_photos: "",
          revision_notes: "",
          uploaded_files: [
            { name: "IMG_9451.jpg.jpeg", url: "https://dreamwedstories.co.in/uploads/IMG_9451.jpg.jpeg" }
          ]
        }
      },
      created_at: "2026-05-28 18:26:08",
      updated_at: "2026-05-30 13:34:33",
      deadline_date: "",
      invitation_url: "",
      reference_photos_url: "https://dreamwedstories.co.in/uploads/JISMY%20DEMO.pdf",
      song_list_url: "",
      wedding_letter_url: "https://dreamwedstories.co.in/uploads/wfonts.com.txt",
      wedding_letter_text: "Uploaded file: wfonts.com.txt"
    },
    {
      id: 3,
      booking_id: 4,
      couple_name: "Rahul & Sneha",
      wedding_date: "2026-11-20",
      current_step: 3,
      timeline_steps: [
        { name: "Photos Uploaded", completed: true, updated_at: "2026-05-28 19:04:54" },
        { name: "Client Selected Photos", completed: true, updated_at: "2026-05-30 13:18:43" },
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
        { id: 1, url: "https://lh3.googleusercontent.com/d/1t9NpD7bufB-EotQGhan3UX_zw9oqpCNE=w1000", favorited: true, categories: ["album"], comment: "" },
        { id: 2, url: "https://lh3.googleusercontent.com/d/1Qf7tqN14Oct0GdG2dn-jNBy_RdNO4tRh=w1000", favorited: true, categories: ["album"], comment: "" }
      ],
      deliveries: {
        video_teaser_url: "https://www.youtube.com/embed/S9-SrdnKsMs",
        video_status: "pending",
        album_pdf_url: "https://dreamwedstories.co.in/draft-album.pdf",
        album_status: "pending",
        final_download_url: ""
      },
      created_at: "2026-05-28 18:26:08",
      updated_at: "2026-05-28 18:26:08"
    }
  ];

  const handleLookup = async (e, overridePhone = null) => {
    if (e && e.preventDefault) e.preventDefault();
    let query = overridePhone || usernameOrEmail.trim();
    if (!query) return;

    if (status !== "success") setStatus("loading");
    setErrorMessage("");

    try {
      let phone = query.replace(/\D/g, "");
      
      // If query does not look like a phone number (e.g. name or email)
      if (phone.length < 10 || isNaN(query.replace(/\+/g, ""))) {
        const bookingsRes = await fetch(`${API_BASE}/api/bookings`);
        if (bookingsRes.ok) {
          const bookings = await bookingsRes.json();
          const match = bookings.find(b => 
            b.customer_email?.toLowerCase() === query.toLowerCase() ||
            b.customer_name?.toLowerCase().includes(query.toLowerCase())
          );
          if (match) {
            phone = match.customer_phone;
          }
        } else {
          throw new Error("Unable to fetch bookings");
        }
      } else if (phone.length >= 10) {
        phone = phone.slice(-10);
      }

      if (!phone) {
        throw new Error("Phone not found");
      }

      const res = await fetch(`${API_BASE}/api/client/project?phone=${encodeURIComponent(phone)}`);
      
      if (res.status === 404) {
        throw new Error("Not found");
      }
      
      if (!res.ok) {
        throw new Error("Unable to contact backend server");
      }

      const data = await res.json();
      setProject(data.project);
      setBooking(data.booking);
      setStatus("success");
      
      // Load account profile states
      if (data.project) {
        const couple = data.project.couple_name || "";
        const parts = couple.split(" & ");
        setGroomName(parts[0] || "");
        setBrideName(parts[1] || "");
        setWeddingDate(data.project.wedding_date || "");
        setInvitationUrl(data.project.invitation_url || "");
        setReferencePhotosUrl(data.project.reference_photos_url || "");
        setSongListUrl(data.project.song_list_url || "");
        
        loadActivityLogs(data.project.id);
      }
      if (data.booking) {
        setCustomerPhone(data.booking.customer_phone || "");
        setCustomerEmail(data.booking.customer_email || "");
      }

      localStorage.setItem("dreamwed_logged_phone", query);
    } catch (err) {
      console.error("Lookup error, falling back locally:", err);
      
      // Local fallback lookup
      const localBookings = JSON.parse(localStorage.getItem("dreamwed_bookings") || "[]");
      const localProjects = JSON.parse(localStorage.getItem("dreamwed_projects") || "[]");
      
      let phone = query.replace(/\D/g, "");
      let bookingMatch = null;

      if (phone.length < 10 || isNaN(query.replace(/\+/g, ""))) {
        bookingMatch = localBookings.find(b => 
          b.customer_email?.toLowerCase() === query.toLowerCase() ||
          b.customer_name?.toLowerCase().includes(query.toLowerCase())
        );
      } else {
        const cleanPhone = phone.slice(-10);
        bookingMatch = localBookings.find(b => 
          (b.customer_phone || '').replace(/\D/g, '').endsWith(cleanPhone) ||
          (b.customer_phone_2 || '').replace(/\D/g, '').endsWith(cleanPhone)
        );
      }

      if (bookingMatch) {
        let projectMatch = localProjects.find(p => p.booking_id === bookingMatch.id);
        if (!projectMatch) {
          // Auto spawn project
          projectMatch = {
            id: bookingMatch.id,
            booking_id: bookingMatch.id,
            couple_name: bookingMatch.customer_name,
            wedding_date: bookingMatch.event_date,
            current_step: bookingMatch.status === "confirmed" ? 3 : 1,
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
          localStorage.setItem("dreamwed_projects", JSON.stringify(localProjects));
        }

        setProject(projectMatch);
        setBooking(bookingMatch);
        setStatus("success");

        const couple = projectMatch.couple_name || "";
        const parts = couple.split(" & ");
        setGroomName(parts[0] || "");
        setBrideName(parts[1] || "");
        setWeddingDate(projectMatch.wedding_date || "");
        setInvitationUrl(projectMatch.invitation_url || "");
        setReferencePhotosUrl(projectMatch.reference_photos_url || "");
        setSongListUrl(projectMatch.song_list_url || "");
        setCustomerPhone(bookingMatch.customer_phone || "");
        setCustomerEmail(bookingMatch.customer_email || "");

        localStorage.setItem("dreamwed_logged_phone", query);
      } else {
        setStatus("not_found");
        setErrorMessage("No active wedding workspace matching this username or email was found.");
      }
    }
  };

  // Auto-login on page load
  useEffect(() => {
    if (!localStorage.getItem("dreamwed_bookings")) {
      localStorage.setItem("dreamwed_bookings", JSON.stringify(INITIAL_BOOKINGS));
    }
    if (!localStorage.getItem("dreamwed_projects")) {
      localStorage.setItem("dreamwed_projects", JSON.stringify(INITIAL_PROJECTS));
    }

    const savedPhone = localStorage.getItem("dreamwed_logged_phone");
    if (savedPhone) {
      handleLookup(null, savedPhone);
    }
  }, []);

  // Real-time Background Polling (Checks database every 5 seconds for newly uploaded designs/messages)
  useEffect(() => {
    if (status !== "success" || !booking?.customer_phone) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/client/project?phone=${encodeURIComponent(booking.customer_phone)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.project) {
            // Silently update the project state to reflect new album_pdf_urls or chat logs in real-time
            setProject(data.project);
            
            // Sync locally
            const localProjects = JSON.parse(localStorage.getItem("dreamwed_projects") || "[]");
            const updatedProjects = localProjects.map(p => p.id === data.project.id ? data.project : p);
            localStorage.setItem("dreamwed_projects", JSON.stringify(updatedProjects));
          }
        }
      } catch (e) {
        console.log("Polling offline, using localStorage");
        const localProjects = JSON.parse(localStorage.getItem("dreamwed_projects") || "[]");
        const match = localProjects.find(p => p.booking_id === booking.id || p.couple_name === booking.customer_name);
        if (match) {
          setProject(match);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [status, booking?.customer_phone]);


  // Window scroll listener for mobile/tablet infinite scroll support
  useEffect(() => {
    const handleWindowScroll = () => {
      if (activeTab !== "gallery") return;
      // Only attach/run window scroll logic on mobile/smaller screens where main does not scroll
      if (window.innerWidth < 768) {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        if (docHeight - scrollTop - windowHeight <= 250) {
          setVisiblePhotosCount(prev => Math.min(prev + 12, getFilteredPhotos().length));
        }
      }
    };
    window.addEventListener("scroll", handleWindowScroll);
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, [activeTab, project]);

  const loadActivityLogs = async (projId) => {
    try {
      const res = await fetch(`${API_BASE}/api/projects/${projId}/logs`);
      if (res.ok) {
        const data = await res.json();
        setActivityLogs(data.reverse()); // Show most recent first
      }
    } catch (e) {
      console.log("Error loading logs:", e);
    }
  };

  // Save changes inside My Account
  const saveAccountChanges = async () => {
    if (!project || !booking) return;
    setSavingAccount(true);
    try {
      const updatedCouple = `${groomName.trim()} & ${brideName.trim()}`;
      
      // Update Project Couple Name & Wedding Date
      const projRes = await fetch(`${API_BASE}/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couple_name: updatedCouple,
          wedding_date: weddingDate
        })
      });

      // Update Booking Name, Email, Phone
      const bookRes = await fetch(`${API_BASE}/api/bookings/${booking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: updatedCouple,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          event_date: weddingDate
        })
      });

      if (projRes.ok && bookRes.ok) {
        const updatedProj = await projRes.json();
        const updatedBook = await bookRes.json();
        setProject(updatedProj);
        setBooking(updatedBook);

        await fetch(`${API_BASE}/api/projects/${project.id}/logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: "Client",
            action: `Updated account details: ${updatedCouple}`
          })
        });

        loadActivityLogs(project.id);
        alert("✅ Account profile updated successfully!");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving account details.");
    } finally {
      setSavingAccount(false);
    }
  };

  // Save Wedding Documents
  const saveWeddingDocuments = async () => {
    if (!project) return;
    setSavingDocs(true);
    try {
      const res = await fetch(`${API_BASE}/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitation_url: invitationUrl.trim(),
          reference_photos_url: referencePhotosUrl.trim(),
          song_list_url: songListUrl.trim()
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setProject(updated);
        
        await fetch(`${API_BASE}/api/projects/${project.id}/logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: "Client",
            action: "Uploaded wedding planning files / invitation references"
          })
        });

        loadActivityLogs(project.id);
        alert("✅ Wedding documents saved successfully!");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving documents.");
    } finally {
      setSavingDocs(false);
    }
  };

  // Poll chats when client is on chat tab
  useEffect(() => {
    if (status === "success" && project && activeTab === "messages") {
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
        loadActivityLogs(project.id);
      }
    } catch (err) {
      console.error("Send message error", err);
    }
  };

  // PHOTO SELECTION CONTROLLERS
  const togglePhotoFavorite = async (photoId) => {
    if (!project) return;
    if (project.timeline_steps[1].completed) {
      alert("🔒 Your selections are locked and sent to our designer. Please message our team in the Chat if you need any adjustments.");
      return;
    }
    const gallery = project.gallery_images.map(img => {
      if (img.id === photoId) {
        const cats = img.categories || [];
        const isFav = !img.favorited;
        return { 
          ...img, 
          favorited: isFav,
          categories: isFav ? [...new Set([...cats, "album"])] : cats.filter(c => c !== "album")
        };
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
    if (!project) {
      alert("❌ No project loaded in workspace!");
      return;
    }
    
    const steps = [...project.timeline_steps];
    if (!steps[1]) {
      alert("❌ Timeline steps structure is invalid or index 1 is missing!");
      return;
    }
    
    steps[1].completed = true;
    steps[1].updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const payload = {
      current_step: 3, 
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
        
        await fetch(`${API_BASE}/api/projects/${project.id}/logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: "Client", action: "Locked photo selection and submitted to Album Designer" })
        });
        
        loadActivityLogs(project.id);
        alert("📖 Photo selection locked successfully! Our Album Designer is now notified.");
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`❌ Server returned error (${res.status}): ${errData.error || "Unknown error"}`);
      }
    } catch (err) {
      alert(`❌ Network Error: ${err.message || err}. Please check if the server is running at ${API_BASE}`);
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
        project.timeline_steps[2].completed = true;
        project.timeline_steps[2].updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
        nextStepIndex = 4; 
      }
    } else if (type === "album") {
      deliveries.album_status = statusValue;
      logMsg = statusValue === "approved" 
        ? "Approved layflat album draft layout design" 
        : "Requested corrections for album layout design pages";
        
      if (statusValue === "approved") {
        project.timeline_steps[3].completed = true;
        project.timeline_steps[3].updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
        nextStepIndex = 5; 
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

        loadActivityLogs(project.id);
        alert(`✅ Draft status updated: ${statusValue.toUpperCase()}`);
        if (statusValue === "changes_requested") {
          setActiveTab("messages");
          setActiveChatChannel(type === "video" ? "client-editor" : "client-designer");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMainScroll = (e) => {
    if (activeTab !== "gallery") return;
    const target = e.currentTarget;
    // Scrolled near the bottom within 250px
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 250) {
      setVisiblePhotosCount(prev => Math.min(prev + 12, getFilteredPhotos().length));
    }
  };

  const getFilteredPhotos = () => {
    if (!project) return [];
    let photos = project.gallery_images || [];
    if (galleryFilter === "fav") {
      return photos.filter(img => img.favorited);
    }
    return photos;
  };

  const getSelectedPhotosCount = () => {
    if (!project) return 0;
    return (project.gallery_images || []).filter(img => img.favorited).length;
  };

  // CURRENCY & FORMATS
  const formatCurrency = (num) => {
    return Number(num).toLocaleString("en-IN", { style: "decimal", maximumFractionDigits: 0 });
  };

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

  // Mock Drop Uploader
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    // Simulate premium mock upload
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const mockUrl = `https://dreamwedstories.co.in/uploads/${encodeURIComponent(file.name)}`;
      
      if (file.name.toLowerCase().includes("invit")) {
        setInvitationUrl(mockUrl);
      } else if (file.name.toLowerCase().includes("song") || file.name.toLowerCase().includes("music")) {
        setSongListUrl(mockUrl);
      } else {
        setReferencePhotosUrl(mockUrl);
      }
      alert(`📎 Mock uploaded "${file.name}"! The document URL field was set.`);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 15 * 1024 * 1024) {
      alert("File size exceeds 15MB limit.");
      return;
    }

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
          if (type === "invitation") {
            setInvitationUrl(data.url);
            alert("✅ Invitation 1 uploaded successfully!");
          } else if (type === "invitation_2") {
            setInvitation2Url(data.url);
            alert("✅ Invitation 2 uploaded successfully!");
          } else if (type === "song_list") {
            setSongListUrl(data.url);
            alert("✅ Song list uploaded successfully!");
          } else if (type === "reference") {
            setReferencePhotosUrl(data.url);
            alert("✅ Reference visual uploaded successfully!");
          }
        } else {
          alert("❌ File upload failed.");
        }
      } catch (err) {
        console.error(err);
        alert("❌ Error uploading file.");
      }
    };
    reader.readAsDataURL(file);
  };

  // LOGIN RENDER (GATEWAY)
  if (status !== "success") {
    return (
      <div className="min-h-screen relative flex items-center justify-center pt-28 pb-16 bg-zinc-950 font-sans select-none overflow-y-auto text-white">
        {/* Floating Back to Home button */}
        <a 
          href="/" 
          className="absolute top-6 left-6 sm:top-8 sm:left-8 z-30 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-[10px] sm:text-xs font-semibold text-zinc-300 hover:text-white uppercase tracking-wider backdrop-blur-sm shadow-md active:scale-95 group cursor-pointer"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </a>
        <SEO 
          title="DreamWed Wedding Hub"
          description="Your personal wedding dashboard where you can track progress, download files, chat with us, and view wedding photos."
        />
        
        {/* Luxury Background Wedding Hero Image */}
        <img 
          src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1920" 
          alt="Wedding Backdrop"
          className="fixed inset-0 w-full h-full object-cover opacity-35 pointer-events-none z-0 filter brightness-[0.7] contrast-[1.05]"
        />
        {/* Luxury Vignette Dark Overlay */}
        <div className="fixed inset-0 bg-gradient-to-tr from-black/95 via-black/80 to-zinc-950/90 z-10 pointer-events-none"></div>

        {/* Center Glassmorphism Login Board Container */}
        <div className="relative z-20 w-full max-w-2xl mx-auto px-4 sm:px-6 my-auto">
          <div className="bg-zinc-950/45 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 sm:p-10 space-y-8 shadow-[0_30px_80px_rgba(0,0,0,0.85)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-600/5 rounded-full blur-3xl pointer-events-none"></div>

            {/* DreamWed Stories Logo at the Top */}
            <div className="flex flex-col items-center justify-center space-y-2 mb-4">
              <img 
                src="/appIcon.png" 
                alt="DreamWed Stories Logo" 
                className="w-14 h-14 object-contain filter drop-shadow-[0_2px_10px_rgba(180,151,90,0.3)] animate-pulse"
              />
              <span className="text-[#b4975a] text-[10px] font-bold tracking-[0.35em] uppercase">DreamWed Stories</span>
            </div>

            {/* Luxury Welcome Board */}
            <div className="space-y-6 text-center">
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl sm:text-4xl text-white font-light tracking-tight leading-tight">
                Welcome to <span className="italic font-serif text-[#b4975a]">DreamWed Wedding Hub</span> 💍
              </h1>
              
              <div className="space-y-4 text-zinc-200 text-xs sm:text-sm font-light leading-relaxed max-w-xl mx-auto">
                <p>
                  Your wedding memories are precious, and our team is working carefully to craft every photo, film, and album to perfection.
                </p>
                <p className="text-zinc-300">
                  This is your personal wedding dashboard where you can stay updated throughout the entire process.
                </p>
              </div>

              {/* Premium Gold Bullet Features List */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 sm:p-6 text-left max-w-md mx-auto space-y-3">
                <p className="text-[10px] text-[#b4975a] font-bold uppercase tracking-wider">Inside your Wedding Hub, you can:</p>
                <div className="space-y-2.5">
                  {[
                    "View wedding photos and videos",
                    "Select photos for your album design",
                    "Track project progress",
                    "Receive instant updates and notifications",
                    "Chat directly with the DreamWed team",
                    "Download completed files"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-[#b4975a] text-xs shrink-0 select-none">•</span>
                      <span className="text-zinc-200 text-xs sm:text-[13px] font-light leading-normal">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-zinc-350 text-xs sm:text-sm font-light tracking-wide leading-relaxed italic max-w-xl mx-auto pt-2 border-t border-white/5">
                "Thank you for choosing DreamWed Stories. We are honored to be part of your journey."
              </p>
            </div>

            {/* Subtle Divider */}
            <div className="relative py-2 max-w-md mx-auto">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#121214] px-4 text-[#b4975a] tracking-widest text-[9px] font-bold rounded-full border border-white/5">Gateway Access</span>
              </div>
            </div>

            {/* Login Section Below the Message */}
            <form onSubmit={handleLookup} className="space-y-5 max-w-md mx-auto text-left">
              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Username or Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input 
                    type="text" 
                    required
                    placeholder="Enter registered phone or email"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    className="w-full bg-zinc-900/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white text-xs focus:border-[#b4975a] focus:ring-1 focus:ring-[#b4975a] focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    value={clientPassword}
                    onChange={(e) => setClientPassword(e.target.value)}
                    className="w-full bg-zinc-900/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white text-xs focus:border-[#b4975a] focus:ring-1 focus:ring-[#b4975a] focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button 
                type="submit"
                disabled={status === "loading"}
                className="w-full py-4 mt-2 bg-[#b4975a] hover:bg-[#c5a86b] text-zinc-950 font-bold rounded-xl transition-all text-xs tracking-widest uppercase shadow-lg shadow-amber-500/5 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                {status === "loading" ? "Entering Workspace..." : "Login"}
              </button>
            </form>

            {/* Signup option for new customers (Highly Visible Luxury Callout) */}
            <div className="max-w-md mx-auto mt-6 pt-5 border-t border-white/10 text-center space-y-3">
              <div className="bg-[#b4975a]/10 border border-[#b4975a]/30 rounded-2xl p-4.5 space-y-2.5 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#b4975a]/5 rounded-full blur-xl -mr-6 -mt-6"></div>
                <div className="flex items-center justify-center gap-2 text-[#b4975a]">
                  <span className="animate-pulse">✨</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">New Customer? Sign Up Here</span>
                </div>
                <p className="text-zinc-300 text-xs font-light leading-relaxed max-w-xs mx-auto">
                  Create your custom Wedding Hub Workspace to access your cinematic films, photo approvals, and milestone trackers in real-time.
                </p>
                <a 
                  href="/booking" 
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 w-full bg-[#b4975a] hover:bg-[#c5a86b] text-zinc-950 font-bold rounded-xl text-[10px] tracking-widest uppercase shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign Up For Workspace &rarr;
                </a>
              </div>
            </div>

            {/* Status / Error Messages inside glass card */}
            <AnimatePresence mode="wait">
              {status === "not_found" && (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-4 rounded-2xl text-[10px] text-left space-y-1.5 max-w-md mx-auto"
                >
                  <div className="flex items-center gap-1.5 font-bold text-amber-200">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>Workspace Not Active</span>
                  </div>
                  <p className="font-light leading-relaxed">
                    {errorMessage || "We couldn't locate an active workspace matching your credentials. Please double-check your input or contact support."}
                  </p>
                </motion.div>
              )}
              {status === "error" && (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-2xl text-[10px] text-left max-w-md mx-auto"
                >
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Server connection configurations */}
            <div className="pt-2 border-t border-white/5 flex flex-col items-center">
              <button 
                type="button"
                onClick={() => setShowDevServer(!showDevServer)}
                className="text-[9px] text-zinc-500 hover:text-[#b4975a] transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none font-bold tracking-wider uppercase"
              >
                ⚙️ Connection Settings
              </button>
              
              {showDevServer && (
                <div className="w-full max-w-md mt-2.5 p-3.5 bg-zinc-900/90 rounded-2xl border border-white/5 space-y-2 text-[10px] text-left">
                  <input 
                    type="url" 
                    placeholder="http://localhost:3000"
                    value={serverInput}
                    onChange={(e) => setServerInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/5 rounded-lg p-2.5 text-zinc-200 text-xs focus:border-[#b4975a] focus:outline-none"
                  />
                  <div className="flex gap-1.5 w-full">
                    <button 
                      type="button"
                      onClick={saveCustomServer}
                      className="flex-grow py-2 bg-zinc-800 text-white font-bold rounded-lg text-[9px] uppercase tracking-wider hover:bg-zinc-700 transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        localStorage.removeItem("dreamwed_api_base");
                        setServerInput("http://localhost:3000");
                        alert("Reset to default local server successfully!");
                        setShowDevServer(false);
                      }}
                      className="px-2.5 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }

  // REDESIGNED SPACIOUS MULTI-TAB DASHBOARD (SUCCESS STATE)
  return (
    <div className="min-h-screen bg-[#faf9f6] text-zinc-800 font-sans select-none overflow-x-hidden flex flex-col md:grid md:grid-cols-[280px_1fr]">
      <SEO 
        title="DreamWed Wedding Hub"
        description="Interact with your premium wedding project timeline, favorite layflat album selections, comment on retouches, and download finalized high-res wedding files."
      />

      {/* 1. LEFT SIDEBAR (Ivory, elegant typography, icons) */}
      <aside className="bg-white border-b md:border-b-0 md:border-r border-[#b4975a]/15 flex flex-col justify-between p-6 md:p-8 z-30 shrink-0 md:h-screen md:sticky md:top-0">
        <div className="space-y-8">
          {/* Logo brand */}
          <div className="flex items-center gap-3 border-b border-[#b4975a]/10 pb-5">
            <img src="/appIcon.png" alt="Logo" className="w-10 h-10 object-contain filter drop-shadow-[0_2px_8px_rgba(180,151,90,0.15)]" />
            <div className="text-left">
              <span className="text-[#b4975a] text-[8px] font-bold tracking-[0.3em] uppercase block">DreamWed Hub</span>
              <span className="text-zinc-900 font-medium text-sm tracking-tight block leading-tight">Client Workspace</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-1 md:gap-1.5 scrollbar-hide max-w-full">
            {[
              { id: "home", label: "Dashboard Home", icon: Home },
              { id: "gallery", label: "Wedding Gallery", icon: Camera },
              { id: "shared", label: "Shared Files", icon: Share2 },
              { id: "album", label: "Album Selection", icon: Heart },
              { id: "your_album", label: "Your Album Draft", icon: BookOpen },
              { id: "messages", label: "Messages", icon: MessageSquare },
              { id: "documents", label: "Documents", icon: FileText },
              { id: "account", label: "My Account", icon: User },
              { id: "notifications", label: "Notifications", icon: Bell }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer select-none ${
                    isActive 
                      ? "bg-[#b4975a]/10 text-[#b4975a] border border-[#b4975a]/25 shadow-sm" 
                      : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 border border-transparent"
                  }`}
                >
                  <TabIcon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Exit Workspace / Server info bottom */}
        <div className="hidden md:block pt-5 border-t border-zinc-100 text-left space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] text-zinc-400 font-medium tracking-wide uppercase">Connected</span>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem("dreamwed_logged_phone");
              setProject(null);
              setBooking(null);
              setStatus("idle");
              setUsernameOrEmail("");
              setClientPassword("");
            }}
            className="text-[9px] text-zinc-500 hover:text-red-500 font-bold uppercase tracking-widest cursor-pointer bg-transparent border-none mt-1 transition-colors flex items-center gap-1.5"
          >
            <LogOut size={11} /> Log Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN AREA CONTAINER (Plenty of white space, soft shadows) */}
      <main ref={mainScrollRef} onScroll={handleMainScroll} className="flex-grow p-6 sm:p-10 md:p-14 space-y-10 md:h-screen md:overflow-y-auto bg-[#faf9f6]">
        
        {/* TOP COMPACT PROFILE NAV BAR */}
        <header className="flex justify-between items-center bg-white px-6 py-4.5 rounded-[24px] border border-[#b4975a]/10 shadow-[0_15px_40px_rgba(180,151,90,0.02)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#b4975a]/10 flex items-center justify-center font-bold text-xs text-[#b4975a] uppercase">
              {brideName.charAt(0) || "W"}
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-zinc-900 tracking-wide uppercase">{project.couple_name}</h4>
              <p className="text-[10px] text-zinc-400 font-light flex items-center gap-1">
                <Calendar size={11} className="text-[#b4975a]" /> {formatDateString(project.wedding_date)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Elegant Back to Home Button */}
            <a 
              href="/" 
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl text-zinc-700 hover:text-zinc-950 transition-all duration-300 cursor-pointer shadow-sm text-[10px] font-bold uppercase tracking-wider active:scale-95"
              title="Go back to home page"
            >
              <Home size={13} />
              <span>Back to Home</span>
            </a>

            {/* Elegant Logout Button */}
            <button 
              onClick={() => {
                localStorage.removeItem("dreamwed_logged_phone");
                setProject(null);
                setBooking(null);
                setStatus("idle");
                setUsernameOrEmail("");
                setClientPassword("");
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-red-50 border border-zinc-200 hover:border-red-100 rounded-xl text-zinc-700 hover:text-red-600 transition-all duration-300 cursor-pointer shadow-sm text-[10px] font-bold uppercase tracking-wider active:scale-95"
              title="Logout from Workspace"
            >
              <LogOut size={13} />
              <span>Log Out</span>
            </button>
          </div>
        </header>

        {/* ACTIVE TABS DISPATCHER */}
        <div className="animate-fade-in space-y-8">
          
          {/* ========================================================================= */}
          {/* TAB 1: DASHBOARD HOME */}
          {activeTab === "home" && (
            <div className="space-y-8">
              {/* Luxury Airy Welcome Header */}
              <div className="bg-white p-8 sm:p-12 rounded-[32px] border border-[#b4975a]/10 shadow-[0_20px_50px_rgba(180,151,90,0.03)] text-center sm:text-left space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="space-y-3">
                  <span className="text-[#b4975a] text-xs font-bold tracking-[0.25em] uppercase block">Timeless Memories</span>
                  <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl sm:text-5xl text-zinc-900 font-light tracking-tight">
                    Welcome, <span className="italic font-serif text-[#b4975a]">{brideName && groomName ? `${brideName} & ${groomName}` : project.couple_name}</span> ❤️
                  </h1>
                  <p className="text-zinc-500 text-xs sm:text-sm font-light leading-relaxed max-w-xl">
                    Your wedding memories are precious, and our team is working carefully to craft every photo, film, and album to perfection.
                  </p>
                </div>

                {/* Highly prominent CTA button for Selection Process */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
                  <button
                    onClick={() => setActiveTab("gallery")}
                    className="px-6 py-3.5 bg-[#b4975a] hover:bg-[#c5a86b] active:scale-95 text-zinc-950 font-bold rounded-xl text-[11px] uppercase tracking-widest transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>✦ Start Album Selection Process ✦</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("album")}
                    className="px-6 py-3.5 bg-zinc-50 hover:bg-zinc-150 border border-zinc-200 active:scale-95 text-zinc-800 font-bold rounded-xl text-[11px] uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>View Selections ({getSelectedPhotosCount()})</span>
                  </button>
                </div>

                {/* Gentle Wedding Letter Reminder Callout */}
                <div className={`p-4 sm:p-5 rounded-2xl text-left flex items-start gap-4 border transition-all ${
                  project.wedding_letter_text
                    ? "bg-emerald-50/40 border-emerald-200/50 text-emerald-800"
                    : "bg-[#b4975a]/5 border-[#b4975a]/15 text-zinc-800"
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm select-none shadow-sm ${
                    project.wedding_letter_text ? "bg-emerald-100 text-emerald-600" : "bg-[#b4975a]/10 text-[#b4975a]"
                  }`}>
                    ✉️
                  </div>
                  <div className="space-y-2.5 flex-grow">
                    <div className="space-y-0.5">
                      <h5 className={`text-xs font-bold ${project.wedding_letter_text ? "text-emerald-950" : "text-zinc-900"}`}>
                        {project.wedding_letter_text ? "✓ Wedding Letter Saved" : "Please remember to write or upload your wedding letter!"}
                      </h5>
                      <p className="text-zinc-500 text-[11px] font-light leading-normal">
                        {project.wedding_letter_text 
                          ? "Your lovely story and cover request details have been saved successfully. Our design crew is referencing it."
                          : "Share your beautiful story and design wishes so our designers can craft the perfect layflat cover."
                        }
                      </p>
                    </div>

                    {/* Action buttons inside the reminder banner */}
                    <div className="flex flex-wrap gap-2 pt-1 select-none">
                      <button 
                        onClick={() => setActiveTab("album")}
                        className="px-3.5 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                      >
                        ✍️ Write Story Letter
                      </button>
                      
                      <label className="px-3.5 py-1.5 bg-[#b4975a] hover:bg-[#c5a86b] text-zinc-950 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95">
                        📤 Upload PDF/Doc Letter
                        <input 
                          type="file" 
                          accept=".pdf,.doc,.docx,.txt"
                          className="hidden" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const mockUrl = `https://dreamwedstories.co.in/uploads/${encodeURIComponent(file.name)}`;
                              try {
                                const res = await fetch(`${API_BASE}/api/projects/${project.id}`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ 
                                    wedding_letter_url: mockUrl,
                                    wedding_letter_text: `Uploaded file: ${file.name}`
                                  })
                                });
                                if (res.ok) {
                                  const updated = await res.json();
                                  setProject(updated);
                                  
                                  // Log activity
                                  await fetch(`${API_BASE}/api/projects/${project.id}/logs`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      user: "Client",
                                      action: `Uploaded wedding letter file: ${file.name}`
                                    })
                                  });
                                  
                                  loadActivityLogs(project.id);
                                  alert(`✅ Successfully uploaded wedding letter file "${file.name}"!`);
                                }
                              } catch (err) {
                                console.error(err);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>

                  </div>
                </div>

                <div className="pt-4 border-t border-[#b4975a]/10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Wedding Date</span>
                    <span className="text-xs font-bold text-zinc-800">{formatDateString(project.wedding_date)}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block">Venue Location</span>
                    <span className="text-xs font-bold text-zinc-800 line-clamp-1">{project.event_venue || "Trivandrum"}</span>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest block">Project Work Deadline</span>
                    <span className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                      ⏱ {project.deadline_date ? formatDateString(project.deadline_date) : "Setting up shortly"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Tracker Widget */}
              <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200/80 shadow-sm space-y-6 text-left">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Wedding Project Timeline</span>
                  <span className="text-xs font-semibold text-[#b4975a]">
                    Stage {project.current_step} of {project.timeline_steps.length} • {Math.round((project.current_step / project.timeline_steps.length) * 100)}% Complete
                  </span>
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4 relative pt-2">
                  <div className="absolute top-[21px] left-8 right-8 h-[1px] bg-zinc-150 hidden md:block z-0"></div>
                  {project.timeline_steps.map((step, idx) => {
                    const stepNum = idx + 1;
                    const isCompleted = step.completed || stepNum <= project.current_step;
                    const isCurrent = stepNum === project.current_step;
                    
                    return (
                      <div key={idx} className="flex md:flex-col items-center gap-4 md:gap-3 text-left md:text-center flex-1 relative z-10 w-full md:w-auto">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                          isCompleted 
                            ? "bg-[#b4975a] border-[#b4975a] text-white shadow-md shadow-[#b4975a]/10" 
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

              {/* Recent Updates from DreamWed Stories */}
              <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200/80 shadow-sm space-y-6 text-left">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest block">Workflow Timeline Logs</span>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-2xl text-zinc-950 font-light">
                  Recent <span className="italic font-serif text-[#b4975a]">Updates</span>
                </h3>

                <div className="space-y-4">
                  {activityLogs.length === 0 ? (
                    <div className="text-center py-6 text-zinc-400 text-xs font-light">
                      No logs or timeline updates available yet.
                    </div>
                  ) : (
                    activityLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex gap-4 items-start border-l-2 border-[#b4975a]/20 pl-4 py-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#b4975a] mt-1.5 shrink-0"></div>
                        <div className="flex-grow space-y-0.5">
                          <p className="text-zinc-800 text-xs font-semibold leading-normal">{log.action}</p>
                          <p className="text-[9px] text-zinc-400">{formatDateString(log.timestamp.split(' ')[0])} • {log.timestamp.split(' ')[1] || ""}</p>
                        </div>
                        <span className="text-[9px] text-zinc-400 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          {log.user}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: WEDDING GALLERY (Main Feature) */}
          {activeTab === "gallery" && (
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-8 text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 pb-5">
                <div>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl text-zinc-900 font-light">
                    Wedding <span className="italic font-serif text-[#b4975a]">Photos & Moments</span>
                  </h2>
                  <p className="text-zinc-400 text-[11px] font-light mt-0.5">Heart photos to bookmark them for your luxury layflat wedding album.</p>
                </div>

                {/* Filter & Counter */}
                <div className="flex items-center gap-3.5 select-none shrink-0">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider bg-zinc-50 border border-zinc-200 px-3 py-1 rounded-full">
                    ❤️ {getSelectedPhotosCount()} Selected
                  </span>
                  
                  <div className="flex gap-1 bg-zinc-50 p-1 rounded-xl border border-zinc-200">
                    <button 
                      onClick={() => setGalleryFilter("all")}
                      className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${galleryFilter === "all" ? "bg-white text-zinc-950 shadow-sm border border-zinc-200/50" : "text-zinc-500 hover:text-zinc-800"}`}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => setGalleryFilter("fav")}
                      className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${galleryFilter === "fav" ? "bg-white text-zinc-950 shadow-sm border border-zinc-200/50" : "text-zinc-500 hover:text-zinc-800"}`}
                    >
                      Hearts Only
                    </button>
                  </div>
                </div>
              </div>

              {/* Google Drive Link Status Panel */}
              {project.deliveries?.raw_photos_url && (
                <div className="bg-[#b4975a]/5 border border-[#b4975a]/15 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0"></span>
                      <strong className="text-xs font-bold text-zinc-950 uppercase tracking-wide">Google Drive Stream Connected</strong>
                    </div>
                    <p className="text-zinc-500 text-[11px] font-light leading-normal max-w-lg">
                      Streaming high-resolution original visual deliverables dynamically from your shared folder link:
                      <a href={project.deliveries.raw_photos_url} target="_blank" rel="noopener noreferrer" className="text-[#b4975a] font-semibold hover:underline block break-all mt-0.5">{project.deliveries.raw_photos_url}</a>
                    </p>
                  </div>
                  
                  <div className="flex gap-2 shrink-0 select-none">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(project.deliveries.raw_photos_url);
                        alert("📋 Copied Google Drive link!");
                      }}
                      className="px-3.5 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      Copy Link
                    </button>
                    <a
                      href={project.deliveries.raw_photos_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-zinc-950 hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors"
                    >
                      Open Drive ↗
                    </a>
                  </div>
                </div>
              )}

              {/* Large Photo Gallery Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {getFilteredPhotos().slice(0, visiblePhotosCount).map((img) => (
                  <div 
                    key={img.id} 
                    onClick={() => setActiveLightboxPhotoId(img.id)}
                    className="group relative rounded-[20px] overflow-hidden border border-zinc-200 bg-zinc-50 aspect-[4/5] flex flex-col justify-end shadow-sm hover:shadow-lg transition-all cursor-pointer"
                  >
                    <img src={getOptimizedImageUrl(img.url)} loading="lazy" alt="Wedding shoot" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-end justify-center pb-4">
                      <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
                        Enlarge Preview
                      </span>
                    </div>

                    {/* Google Drive Source Badge */}
                    {project.deliveries?.raw_photos_url && (
                      <div className="absolute top-3.5 right-3.5 z-20 select-none">
                        <span className="bg-black/60 backdrop-blur-md text-zinc-300 text-[8px] font-medium uppercase tracking-wider px-2 py-0.5 rounded border border-white/10 flex items-center gap-1 shadow-sm">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping shrink-0"></span>
                          <span>Drive File #{img.id}</span>
                        </span>
                      </div>
                    )}

                    {/* Selection indicators */}
                    {img.favorited && (
                      <div className="absolute top-3.5 left-3.5 z-20">
                        <span className="bg-[#b4975a] text-white text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                          ❤️ Hearted
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination indicators and fallback load button */}
              <div className="pt-8 flex flex-col items-center gap-3">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  Showing {Math.min(visiblePhotosCount, getFilteredPhotos().length)} of {getFilteredPhotos().length} memories
                </span>
                {getFilteredPhotos().length > visiblePhotosCount && (
                  <button 
                    onClick={() => setVisiblePhotosCount(prev => Math.min(prev + 24, getFilteredPhotos().length))}
                    className="px-6 py-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    ✦ Load More Memories ✦
                  </button>
                )}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: SHARED FILES */}
          {activeTab === "shared" && (
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-10 text-left">
              <div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl text-zinc-900 font-light">
                  Shared <span className="italic font-serif text-[#b4975a]">Deliveries</span>
                </h2>
                <p className="text-zinc-400 text-[11px] font-light mt-0.5">Explore and download your high-resolution wedding assets, cinematic films, and curated reels.</p>
              </div>

              {/* SECTION 1: CINEMATIC WEDDING FILMS */}
              <div className="space-y-4">
                <div className="border-b border-zinc-100 pb-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b4975a] block shrink-0" />
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Cinematic Wedding Films</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Cinematic Teaser Card */}
                  <div className={`group relative p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-48 ${
                    project.deliveries?.video_teaser_url 
                      ? "bg-zinc-900 border-zinc-800 text-white hover:shadow-xl hover:scale-[1.01]" 
                      : "bg-zinc-50 border-zinc-200 text-zinc-400 opacity-60"
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#b4975a]">Teaser / Trailer</span>
                        <Video size={16} className={project.deliveries?.video_teaser_url ? "text-[#b4975a] group-hover:animate-bounce" : "text-zinc-400"} />
                      </div>
                      <h4 className={`text-sm font-semibold tracking-wide ${project.deliveries?.video_teaser_url ? "text-white" : "text-zinc-500"}`}>
                        Wedding Teaser Film
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-light mt-1.5 leading-relaxed">
                        A short cinematic trailer perfect for quick sharing on social handles.
                      </p>
                    </div>

                    {project.deliveries?.video_teaser_url ? (
                      <div className="flex gap-2 mt-4">
                        <a 
                          href={project.deliveries.video_teaser_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 py-2 bg-[#b4975a] hover:bg-[#c5a86b] text-zinc-950 font-bold rounded-lg text-[9px] uppercase tracking-wider text-center block transition-all"
                        >
                          Play Teaser ↗
                        </a>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(project.deliveries.video_teaser_url);
                            alert("📋 Teaser link copied!");
                          }}
                          className="p-2 bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-300 rounded-lg transition-colors cursor-pointer"
                          title="Copy Link"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    ) : (
                      <span className="w-full text-center py-2 bg-zinc-200/50 border border-zinc-300/30 rounded-lg text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                        Awaiting Upload
                      </span>
                    )}
                  </div>

                  {/* Cinematic Highlights Card */}
                  <div className={`group relative p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-48 ${
                    project.deliveries?.video_highlight_url 
                      ? "bg-zinc-900 border-zinc-800 text-white hover:shadow-xl hover:scale-[1.01]" 
                      : "bg-zinc-50 border-zinc-200 text-zinc-400 opacity-60"
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#b4975a]">Highlights Film</span>
                        <Video size={16} className={project.deliveries?.video_highlight_url ? "text-[#b4975a] group-hover:animate-bounce" : "text-zinc-400"} />
                      </div>
                      <h4 className={`text-sm font-semibold tracking-wide ${project.deliveries?.video_highlight_url ? "text-white" : "text-zinc-500"}`}>
                        Wedding Highlights Film
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-light mt-1.5 leading-relaxed">
                        A beautifully edited cinematic highlight capturing key moments of the grand day.
                      </p>
                    </div>

                    {project.deliveries?.video_highlight_url ? (
                      <div className="flex gap-2 mt-4">
                        <a 
                          href={project.deliveries.video_highlight_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 py-2 bg-[#b4975a] hover:bg-[#c5a86b] text-zinc-950 font-bold rounded-lg text-[9px] uppercase tracking-wider text-center block transition-all"
                        >
                          Play Film ↗
                        </a>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(project.deliveries.video_highlight_url);
                            alert("📋 Highlights film link copied!");
                          }}
                          className="p-2 bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-300 rounded-lg transition-colors cursor-pointer"
                          title="Copy Link"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    ) : (
                      <span className="w-full text-center py-2 bg-zinc-200/50 border border-zinc-300/30 rounded-lg text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                        Awaiting Upload
                      </span>
                    )}
                  </div>

                  {/* Cinematic Full Film Card */}
                  <div className={`group relative p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-48 ${
                    project.deliveries?.video_full_url 
                      ? "bg-zinc-900 border-zinc-800 text-white hover:shadow-xl hover:scale-[1.01]" 
                      : "bg-zinc-50 border-zinc-200 text-zinc-400 opacity-60"
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#b4975a]">Full Film</span>
                        <Video size={16} className={project.deliveries?.video_full_url ? "text-[#b4975a] group-hover:animate-bounce" : "text-zinc-400"} />
                      </div>
                      <h4 className={`text-sm font-semibold tracking-wide ${project.deliveries?.video_full_url ? "text-white" : "text-zinc-500"}`}>
                        Full Feature Film
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-light mt-1.5 leading-relaxed">
                        The complete documentary cut of your beautiful celebration and traditional ceremonies.
                      </p>
                    </div>

                    {project.deliveries?.video_full_url ? (
                      <div className="flex gap-2 mt-4">
                        <a 
                          href={project.deliveries.video_full_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 py-2 bg-[#b4975a] hover:bg-[#c5a86b] text-zinc-950 font-bold rounded-lg text-[9px] uppercase tracking-wider text-center block transition-all"
                        >
                          Play Full Film ↗
                        </a>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(project.deliveries.video_full_url);
                            alert("📋 Full film link copied!");
                          }}
                          className="p-2 bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-300 rounded-lg transition-colors cursor-pointer"
                          title="Copy Link"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    ) : (
                      <span className="w-full text-center py-2 bg-zinc-200/50 border border-zinc-300/30 rounded-lg text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                        Awaiting Upload
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2: INTERACTIVE WEDDING REELS */}
              {project.deliveries?.wedding_reels && project.deliveries.wedding_reels.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="border-b border-zinc-100 pb-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#b4975a] block shrink-0" />
                    <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Interactive Wedding Reels & Shorts</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.deliveries.wedding_reels.map((reel) => (
                      <div 
                        key={reel.id} 
                        className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl hover:border-[#b4975a]/30 transition-all flex flex-col justify-between h-36 hover:shadow-sm"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#b4975a]/5 border border-[#b4975a]/10 flex items-center justify-center shrink-0">
                            <span className="text-base text-[#b4975a]">✨</span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-zinc-900 truncate">{reel.title}</h4>
                            <p className="text-zinc-400 text-[9px] font-light mt-0.5">Vertical cinematic video deliverable</p>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <a 
                            href={reel.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 bg-zinc-950 hover:bg-black text-white rounded-lg text-[9px] font-bold uppercase tracking-wider text-center block transition-all"
                          >
                            Watch Reel ↗
                          </a>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(reel.url);
                              alert("📋 Reel link copied!");
                            }}
                            className="p-1.5 border border-zinc-200 rounded-lg text-zinc-600 hover:border-[#b4975a]/30 hover:text-zinc-900 transition-all cursor-pointer bg-white"
                            title="Copy Reel Link"
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 3: OTHER DELIVERABLES */}
              <div className="space-y-4 pt-2">
                <div className="border-b border-zinc-100 pb-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b4975a] block shrink-0" />
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Wedding Gallery & Layout Deliverables</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "Full Gallery Link", key: "raw_photos_url", url: project.deliveries?.raw_photos_url || "https://drive.google.com/drive/folders/demo", desc: "Access the full collection of retouched and original wedding photos." },
                    { label: "Album Design PDF", key: "album_pdf_url", url: project.deliveries?.album_pdf_url || "https://dreamwedstories.co.in/album-preview.pdf", desc: "Review layflat album layout design blueprint pages." },
                    { label: "Final Downloads Vault", key: "final_download_url", url: project.deliveries?.final_download_url || "https://dreamwedstories.co.in/deliveries/zip", desc: "Download high-resolution final deliverables in a secure zip archive." }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-zinc-50 border border-zinc-200 p-5 sm:p-6 rounded-2xl flex flex-col justify-between gap-4 hover:shadow-md hover:border-[#b4975a]/25 transition-all h-44">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-zinc-900 tracking-wide uppercase">{item.label}</h4>
                        <p className="text-zinc-500 text-[10px] font-light leading-normal">{item.desc}</p>
                      </div>

                      <div className="flex gap-2">
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 py-2 bg-zinc-950 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider text-center block transition-colors hover:bg-black"
                        >
                          Open Deliverable ↗
                        </a>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(item.url);
                            alert(`📋 Copied ${item.label} link successfully!`);
                          }}
                          className="p-2 border border-zinc-200 rounded-lg text-zinc-600 hover:border-zinc-400 transition-all cursor-pointer bg-white"
                          title="Copy Link"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ALBUM SELECTION */}
          {activeTab === "album" && (
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-6 text-left font-sans">
              {project.timeline_steps[1].completed ? (
                <div className="space-y-8">
                  {/* Luxury Locked Status Card */}
                  <div className="py-10 px-6 text-center space-y-5 max-w-xl mx-auto bg-zinc-50 border border-zinc-200/60 rounded-[24px] shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#b4975a]/5 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-sm animate-bounce">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-2.5">
                      <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl text-zinc-950 font-light leading-tight">
                        Photos are <span className="italic font-serif text-[#b4975a]">Sent to Designer!</span>
                      </h2>
                      <span className="text-xs font-bold text-[#b4975a] tracking-wider uppercase bg-[#b4975a]/10 border border-[#b4975a]/20 px-3.5 py-1 rounded-full select-none inline-block">
                        ✓ Curation Complete & Locked
                      </span>
                      <p className="text-zinc-500 text-xs font-light leading-relaxed max-w-md mx-auto">
                        Your chosen wedding photos and custom retouching instructions are officially locked and submitted. Our master designer is now layouting your premium layflat wedding album pages!
                      </p>
                    </div>
                    
                    <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => setActiveTab("your_album")}
                        className="px-5 py-2.5 bg-[#b4975a] hover:bg-[#c5a86b] active:scale-95 text-zinc-950 font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-1.5 animate-pulse"
                      >
                        <span>View Album Draft 📖</span>
                      </button>
                      <button
                        onClick={() => setActiveTab("home")}
                        className="px-5 py-2.5 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center"
                      >
                        Back to Dashboard
                      </button>
                    </div>
                  </div>

                  {/* Submitted retouch instructions (if any) */}
                  {project.wedding_letter_text && (
                    <div className="bg-zinc-50/50 border border-zinc-150 p-6 rounded-2xl space-y-2 max-w-2xl mx-auto text-left">
                      <h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Submitted Retouching Instructions</h4>
                      <p className="text-zinc-700 text-xs font-light leading-relaxed whitespace-pre-wrap">{project.wedding_letter_text}</p>
                    </div>
                  )}

                  {/* Read-only Curation Gallery */}
                  <div className="space-y-4 pt-6 border-t border-zinc-100">
                    <div className="flex justify-between items-center pb-2">
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                          📸 Confirmed Selections ({getSelectedPhotosCount()})
                        </h3>
                        <p className="text-zinc-500 text-[10px] font-normal mt-0.5">These favorited photographs are officially compiled for the album layout.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                      {project.gallery_images.filter(img => img.favorited).map((img) => (
                        <div key={img.id} className="group relative rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 aspect-square flex flex-col justify-end">
                          <img src={getOptimizedImageUrl(img.url)} alt="Confirmed selection" className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 z-10">
                            <span className="bg-[#b4975a] text-white text-[7px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                              ✓ Locked
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 pb-5">
                    <div>
                      <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl text-zinc-900 font-light">
                        Album <span className="italic font-serif text-[#b4975a]">Design selections</span>
                      </h2>
                      <p className="text-zinc-600 text-xs font-normal mt-0.5">Manage hearted wedding images, add retouch instructions, and submit layout bookmarks.</p>
                    </div>
                    
                    <span className="text-xs font-bold text-[#b4975a] tracking-wider uppercase bg-[#b4975a]/10 border border-[#b4975a]/20 px-3.5 py-1.5 rounded-full select-none shrink-0">
                      {getSelectedPhotosCount()} of 150 photos selected
                    </span>
                  </div>
                  {/* Premium Selection Options Instructions */}
                  <div className="bg-[#b4975a]/5 border border-[#b4975a]/15 p-6 rounded-[24px] space-y-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[#b4975a] text-sm">✨</span>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Layflat Album Selection Guidelines</h4>
                    </div>
                    <p className="text-zinc-700 text-xs sm:text-sm font-normal leading-normal">
                      To craft your custom couture leather wedding album, please choose one of our two convenient design options:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white border border-zinc-100 p-4.5 rounded-xl space-y-2 shadow-sm">
                        <span className="text-[#b4975a] text-xs font-bold uppercase tracking-wide block">Option 1: Complete Curation</span>
                        <p className="text-zinc-700 text-xs font-normal leading-relaxed">
                          You can heart and select up to <strong>150 photos</strong> of your choice from the gallery. Our designer will arrange them across layflat pages.
                        </p>
                      </div>
                      <div className="bg-white border border-zinc-100 p-4.5 rounded-xl space-y-2 shadow-sm">
                        <span className="text-[#b4975a] text-xs font-bold uppercase tracking-wide block">Option 2: Smart Curation</span>
                        <p className="text-zinc-700 text-xs font-normal leading-relaxed">
                          Heart exactly <strong>40 wedding group photos</strong> and <strong>40 reception group photos</strong>. Our expert team will carefully take care of selecting and layouting the rest of the cinematic moments!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Retouching Notes */}
                  <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl space-y-3.5">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wide">Design Story & Retouching Instructions</h4>
                      <p className="text-xs text-zinc-600 font-normal">Share requests or cover photo specifications here. This updates real-time for our designers.</p>
                    </div>
                    <textarea 
                      rows="3"
                      value={project.wedding_letter_text || ""}
                      onChange={(e) => {
                        const txt = e.target.value;
                        setProject(prev => prev ? { ...prev, wedding_letter_text: txt } : null);
                      }}
                      onBlur={() => {
                        fetch(`${API_BASE}/api/projects/${project.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ wedding_letter_text: project.wedding_letter_text })
                        });
                      }}
                      placeholder="e.g. 'Please make the cover photo black & white', 'Color-correct background glares on image #3'"
                      className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-zinc-800 text-xs focus:border-[#b4975a] focus:outline-none resize-none font-light leading-normal"
                    />
                  </div>

                  {/* Grid of selected photos */}
                  {getSelectedPhotosCount() === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 text-xs font-light">
                      No photos selected yet. Heart photos inside the "Wedding Gallery" tab to see them here!
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                        {project.gallery_images.filter(img => img.favorited).map((img) => (
                          <div key={img.id} className="group relative rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 aspect-square flex flex-col justify-end">
                            <img src={getOptimizedImageUrl(img.url)} alt="Selection thumbnail" className="absolute inset-0 w-full h-full object-cover" />
                            <button 
                              onClick={() => togglePhotoFavorite(img.id)}
                              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 rounded-lg text-white transition-colors cursor-pointer"
                              title="Remove selection"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="bg-zinc-950 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-zinc-800">
                        <div className="space-y-0.5 text-center sm:text-left">
                          <p className="text-zinc-200 text-xs font-semibold leading-tight">Ready to submit Selection?</p>
                          <p className="text-zinc-500 text-[10px] font-light">Once confirmed, our album designer is instantly notified to begin drafting layout pages.</p>
                        </div>

                        <button
                          onClick={submitPhotoSelectionLock}
                          className="w-full sm:w-auto px-5 py-2.5 bg-[#b4975a] hover:bg-[#c5a86b] active:scale-95 text-zinc-950 font-bold rounded-xl text-[11px] uppercase tracking-widest transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          ✓ Confirm Selections
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}


            </div>
          )}

          {/* ========================================================================= */}
          {/* DEDICATED TAB: YOUR ALBUM DRAFT */}
          {activeTab === "your_album" && (
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-6 text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 pb-5">
                <div>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl text-zinc-900 font-light">
                    Your Premium <span className="italic font-serif text-[#b4975a]">Wedding Album</span>
                  </h2>
                  <p className="text-zinc-600 text-xs font-normal mt-0.5">Review layout blueprint pages, zoom in on wedding photo details, and submit print approval.</p>
                </div>
              </div>

              {project.deliveries?.album_pdf_url ? (
                <AlbumDraftApproval
                  project={project}
                  setProject={setProject}
                  API_BASE={API_BASE}
                />
              ) : (
                <div className="bg-[#b4975a]/5 border border-[#b4975a]/15 p-8 rounded-[32px] text-center space-y-6 max-w-xl mx-auto my-10 shadow-sm py-12">
                  <div className="w-16 h-16 rounded-full bg-[#b4975a]/10 flex items-center justify-center mx-auto text-[#b4975a] border border-[#b4975a]/25 animate-pulse">
                    <BookOpen size={28} />
                  </div>
                  <div className="space-y-2">
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-2xl text-zinc-900 font-light">
                      Layout Draft <span className="italic text-[#b4975a]">Awaiting Design</span>
                    </h3>
                    <p className="text-zinc-500 text-xs sm:text-sm font-light max-w-md mx-auto leading-relaxed">
                      Our design team is currently hand-crafting your bespoke layflat wedding album blueprint sheets. 
                    </p>
                    <p className="text-zinc-400 text-[11px] font-light leading-relaxed max-w-xs mx-auto mt-2">
                      Once they upload the draft, your premium 3D digital book will be instantly unlocked here for review, page-flipping, and print approval. We will notify you instantly!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: MESSAGES */}
          {activeTab === "messages" && (
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200 shadow-sm flex flex-col h-[520px] overflow-hidden text-left">
              <div className="border-b border-zinc-100 pb-4 mb-4">
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl text-zinc-900 font-light">
                  Team <span className="italic font-serif text-[#b4975a]">Communication Desk</span>
                </h2>
                <p className="text-zinc-400 text-[10px] font-light mt-0.5">Secure, WhatsApp-styled chat channels with your designer, editor, and coordinator.</p>
              </div>

              {/* Chat channels switcher */}
              <div className="flex gap-1.5 bg-zinc-50 p-1.5 border border-zinc-200 rounded-xl mb-4 select-none">
                {[
                  { id: "client-admin", label: "👥 Coordinator" },
                  { id: "client-editor", label: "🎥 Video Editor" },
                  { id: "client-designer", label: "📖 Album Designer" }
                ].map((channel) => (
                  <button 
                    key={channel.id}
                    onClick={() => setActiveChatChannel(channel.id)}
                    className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${activeChatChannel === channel.id ? "bg-zinc-950 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}
                  >
                    {channel.label}
                  </button>
                ))}
              </div>

              {/* Chat Feed */}
              <div className="flex-1 overflow-y-auto bg-[#efeae2] p-4 border border-zinc-200 rounded-2xl flex flex-col gap-3.5 min-h-0">
                {chatMessages.length === 0 ? (
                  <div className="my-auto text-center text-zinc-400 text-xs font-light">
                    No messages in this chat room. Drop a brief request to start conversation!
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
                            ? "bg-[#d9fdd3] border-[#d9fdd3] text-zinc-800 rounded-br-sm" 
                            : "bg-white border-zinc-200 text-zinc-800 rounded-bl-sm"
                        }`}>
                          {m.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input row */}
              <form onSubmit={sendChatMessage} className="flex gap-2.5 mt-4 pt-2 border-t border-zinc-100">
                <input 
                  type="text" 
                  placeholder="Type a message to your coordinator, editor, or designer..."
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

          {/* ========================================================================= */}
          {/* TAB 6: WEDDING DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-6 text-left">
              <div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl text-zinc-900 font-light">
                  Wedding <span className="italic font-serif text-[#b4975a]">Documents & files</span>
                </h2>
                <p className="text-zinc-400 text-[11px] font-light mt-0.5">Upload invitation assets, reference visual folders, and song track lists for our creative crew.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pt-2">
                
                {/* Drag and drop mock zone */}
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center space-y-3.5 transition-all select-none ${
                    isDragOver 
                      ? "border-[#b4975a] bg-[#b4975a]/5 shadow-inner" 
                      : "border-zinc-200 hover:border-zinc-300 bg-zinc-50/50"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-[#b4975a]/10 flex items-center justify-center text-[#b4975a] mx-auto shadow-inner">
                    <Upload size={18} />
                  </div>
                  <div className="space-y-1">
                    <strong className="text-xs text-zinc-900 font-bold block">Drag & Drop visual files here</strong>
                    <p className="text-[10px] text-zinc-400 font-light">Supports wedding invitation PDFs, song lists (TXT/Excel), or inspiration images.</p>
                  </div>
                  <div className="text-[9px] text-[#b4975a] font-bold uppercase tracking-wider">Mock Uploader Active</div>
                </div>

                {/* Form fields */}
                <div className="space-y-6">
                  {/* Wedding Invitation */}
                  <div className="bg-zinc-50/50 border border-zinc-100 p-5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest block">Wedding Invitation</label>
                      <span className="text-[9px] text-[#b4975a] font-medium">Digital Card / PDF / Image / Video</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="url" 
                        placeholder="Paste PDF / Google Drive / Dropbox link..."
                        value={invitationUrl}
                        onChange={(e) => setInvitationUrl(e.target.value)}
                        className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-xs focus:border-[#b4975a] focus:outline-none font-light"
                      />
                      <label className="px-4 py-2.5 bg-zinc-950 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 select-none">
                        <Upload size={12} />
                        <span>Upload File</span>
                        <input 
                          type="file" 
                          onChange={(e) => handleFileUpload(e, "invitation")} 
                          className="hidden" 
                          accept=".pdf,.png,.jpg,.jpeg,.mp4"
                        />
                      </label>
                    </div>
                    {invitationUrl && (
                      <p className="text-[9px] text-zinc-400 truncate">Current: <span className="text-[#b4975a] font-medium">{invitationUrl}</span></p>
                    )}
                  </div>

                  {/* Reference Photos */}
                  <div className="bg-zinc-50/50 border border-zinc-100 p-5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest block">Reference Photos / Mood Board</label>
                      <span className="text-[9px] text-[#b4975a] font-medium">Inspirations</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="url" 
                        placeholder="Paste Pinterest / Drive folder link..."
                        value={referencePhotosUrl}
                        onChange={(e) => setReferencePhotosUrl(e.target.value)}
                        className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-xs focus:border-[#b4975a] focus:outline-none font-light"
                      />
                      <label className="px-4 py-2.5 bg-zinc-950 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 select-none">
                        <Upload size={12} />
                        <span>Upload File</span>
                        <input 
                          type="file" 
                          onChange={(e) => handleFileUpload(e, "reference")} 
                          className="hidden" 
                          accept=".pdf,.png,.jpg,.jpeg,.zip"
                        />
                      </label>
                    </div>
                    {referencePhotosUrl && (
                      <p className="text-[9px] text-zinc-400 truncate">Current: <span className="text-[#b4975a] font-medium">{referencePhotosUrl}</span></p>
                    )}
                  </div>

                  {/* Song List */}
                  <div className="bg-zinc-50/50 border border-zinc-100 p-5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest block">Song tracklist / Music entry</label>
                      <span className="text-[9px] text-[#b4975a] font-medium">Track selections</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="url" 
                        placeholder="Paste Spotify / text sheet link..."
                        value={songListUrl}
                        onChange={(e) => setSongListUrl(e.target.value)}
                        className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-xs focus:border-[#b4975a] focus:outline-none font-light"
                      />
                      <label className="px-4 py-2.5 bg-zinc-950 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 select-none">
                        <Upload size={12} />
                        <span>Upload File</span>
                        <input 
                          type="file" 
                          onChange={(e) => handleFileUpload(e, "song_list")} 
                          className="hidden" 
                          accept=".pdf,.txt,.doc,.docx,.xls,.xlsx"
                        />
                      </label>
                    </div>
                    {songListUrl && (
                      <p className="text-[9px] text-zinc-400 truncate">Current: <span className="text-[#b4975a] font-medium">{songListUrl}</span></p>
                    )}
                  </div>

                  <button 
                    onClick={saveWeddingDocuments}
                    disabled={savingDocs}
                    className="w-full py-4 bg-zinc-950 text-white font-bold rounded-xl hover:bg-black transition-colors cursor-pointer text-xs uppercase tracking-wider"
                  >
                    {savingDocs ? "Uploading & Saving..." : "Save Documents"}
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: MY ACCOUNT */}
          {activeTab === "account" && (
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-6 text-left">
              <div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl text-zinc-900 font-light">
                  My <span className="italic font-serif text-[#b4975a]">Account details</span>
                </h2>
                <p className="text-zinc-400 text-[11px] font-light mt-0.5">Manage your personal profile and registered wedding metadata values.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Bride Name</label>
                  <input 
                    type="text" 
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-zinc-800 text-xs focus:border-[#b4975a] focus:outline-none font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Groom Name</label>
                  <input 
                    type="text" 
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-zinc-800 text-xs focus:border-[#b4975a] focus:outline-none font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Wedding Date</label>
                  <input 
                    type="date" 
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-zinc-800 text-xs focus:border-[#b4975a] focus:outline-none font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Phone Number</label>
                  <input 
                    type="tel" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-zinc-800 text-xs focus:border-[#b4975a] focus:outline-none font-semibold"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Email Address</label>
                  <input 
                    type="email" 
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-zinc-800 text-xs focus:border-[#b4975a] focus:outline-none font-semibold"
                  />
                </div>

                <button 
                  onClick={saveAccountChanges}
                  disabled={savingAccount}
                  className="sm:col-span-2 py-4 bg-[#b4975a] hover:bg-[#c5a86b] text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {savingAccount ? "Saving Profile..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-6 text-left">
              <div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl text-zinc-900 font-light">
                  Portal <span className="italic font-serif text-[#b4975a]">Notifications</span>
                </h2>
                <p className="text-zinc-400 text-[11px] font-light mt-0.5">Stay updated on photo approvals, cinematic releases, and print timelines in real-time.</p>
              </div>

              <div className="space-y-4 pt-2">
                {[
                  { title: "Photo gallery ready", condition: true, msg: "Your original wedding photo gallery is compiled and unlocked for viewing.", time: "Timeline Stage 1 Complete" },
                  { title: "Album selection pending", condition: !project.timeline_steps[1].completed, msg: "Heart your favorite photographs for custom layflat page layouts.", time: "Awaiting Action" },
                  { title: "Video ready", condition: project.timeline_steps[2].completed, msg: "Your cinematic teaser and highlights are edited and ready for review.", time: "Timeline Stage 3 Complete" },
                  { title: "Album approved", condition: project.timeline_steps[3].completed, msg: "Layflat album draft layout confirmed! Sent to printing press.", time: "Timeline Stage 4 Complete" },
                  { title: "Project completed", condition: project.timeline_steps[4].completed, msg: "Signature bag, prints, and final high-res downloads unlocked.", time: "Final Stage Unlock" }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4.5 rounded-2xl border flex gap-4.5 items-start ${
                      item.condition 
                        ? "bg-[#b4975a]/5 border-[#b4975a]/15 text-zinc-800" 
                        : "bg-zinc-50/50 border-zinc-200 opacity-60"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-inner ${
                      item.condition ? "bg-[#b4975a]/10 text-[#b4975a]" : "bg-zinc-100 text-zinc-400"
                    }`}>
                      {item.condition ? <Check size={14} /> : <Clock size={14} />}
                    </div>
                    <div className="flex-grow space-y-0.5">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <strong className="text-xs font-bold leading-none">{item.title}</strong>
                        <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400">{item.time}</span>
                      </div>
                      <p className="text-zinc-500 text-[11px] font-light leading-normal">{item.msg}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

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
              {/* Branding header */}
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

              {/* Bold Title */}
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

              {/* Signature script footer */}
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

      {/* ENLARGED PHOTO LIGHTBOX MODAL */}
      <AnimatePresence>
        {activeLightboxPhotoId !== null && (
          (() => {
            const photos = getFilteredPhotos();
            const photoIndex = photos.findIndex(img => img.id === activeLightboxPhotoId);
            const activePhoto = photos[photoIndex] || (project && project.gallery_images.find(img => img.id === activeLightboxPhotoId));
            if (!activePhoto) return null;

            const handlePrev = (e) => {
              e.stopPropagation();
              if (photoIndex > 0) {
                setActiveLightboxPhotoId(photos[photoIndex - 1].id);
              } else {
                setActiveLightboxPhotoId(photos[photos.length - 1].id);
              }
            };

            const handleNext = (e) => {
              e.stopPropagation();
              if (photoIndex < photos.length - 1) {
                setActiveLightboxPhotoId(photos[photoIndex + 1].id);
              } else {
                setActiveLightboxPhotoId(photos[0].id);
              }
            };

            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
                onClick={() => setActiveLightboxPhotoId(null)}
              >
                <motion.div
                  initial={{ scale: 0.93, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.93, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 220 }}
                  className="relative w-full max-w-5xl rounded-[32px] bg-zinc-950 border border-zinc-800 overflow-y-auto md:overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.8)] grid grid-cols-1 md:grid-cols-3 max-h-[95vh] md:max-h-[90vh] text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setActiveLightboxPhotoId(null)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 flex items-center justify-center text-white transition-all hover:rotate-90 hover:scale-105 duration-300 z-50 cursor-pointer"
                    title="Close"
                  >
                    <X size={20} />
                  </button>

                  {/* Left 2 Columns: Image View */}
                  <div className="md:col-span-2 relative w-full h-[50vh] md:h-[75vh] bg-zinc-950 flex items-center justify-center select-none border-b md:border-b-0 md:border-r border-zinc-800">
                    <img 
                      src={getOptimizedImageUrl(activePhoto.url)} 
                      alt="Wedding" 
                      className="max-w-full max-h-full object-contain p-4"
                    />

                    {/* Navigation Arrows */}
                    <button
                      onClick={handlePrev}
                      className="absolute left-4 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/5 flex items-center justify-center text-white transition-colors cursor-pointer text-xl font-bold font-mono"
                    >
                      ‹
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-4 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/5 flex items-center justify-center text-white transition-colors cursor-pointer text-xl font-bold font-mono"
                    >
                      ›
                    </button>

                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 text-[10px] text-zinc-400 font-light">
                      Photo ID: #{activePhoto.id}
                    </div>
                  </div>

                  {/* Right Column: Premium Selection Sidebar */}
                  <div className="p-6 md:p-8 flex flex-col justify-between overflow-y-auto h-auto md:h-[75vh] bg-zinc-900/60 text-left">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Selection Panel</span>
                        <button
                          onClick={() => togglePhotoFavorite(activePhoto.id)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer backdrop-blur-md border ${
                            activePhoto.favorited 
                              ? "bg-red-500 border-red-500 text-white" 
                              : "bg-zinc-800 border-zinc-700 text-zinc-300"
                          }`}
                        >
                          <Heart size={16} className={activePhoto.favorited ? "fill-current" : ""} />
                        </button>
                      </div>

                      <h3 className="text-xl font-light text-white tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {project.couple_name}'s Photo
                      </h3>
                      <p className="text-zinc-500 text-xs font-light leading-relaxed">
                        Tap to bookmark this photo with a heart icon for your Wedding Album.
                      </p>
                    </div>

                    {/* Retouch Notes */}
                    <div className="space-y-3 mt-6 flex-grow flex flex-col justify-end">
                      <div className="w-full h-px bg-zinc-800 my-2" />
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Retouching Instructions</label>
                      <textarea
                        rows="3"
                        value={photoComments[activePhoto.id] !== undefined ? photoComments[activePhoto.id] : (activePhoto.comment || "")}
                        onChange={(e) => setPhotoComments({ ...photoComments, [activePhoto.id]: e.target.value })}
                        placeholder="e.g. 'Airbrush skin blemishes', 'Crop slightly to center us', 'Make this black & white'"
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-white text-xs focus:border-[#b4975a] focus:outline-none resize-none"
                      />
                      <button
                        onClick={() => {
                          savePhotoComment(activePhoto.id, photoComments[activePhoto.id] || "");
                          alert("✅ Saved retouch note for this photo!");
                        }}
                        className="w-full py-3 bg-zinc-200 hover:bg-white text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Save Retouch Notes
                      </button>
                    </div>

                  </div>
                </motion.div>
              </motion.div>
            );
          })()
        )}
      </AnimatePresence>

    </div>
  );
};

export default ClientPortal;
