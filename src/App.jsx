import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Policies from './pages/Policies';
import Admin from './pages/Admin';
import ClientPortal from './pages/ClientPortal';
import EditorPortal from './pages/EditorPortal';
import DesignerPortal from './pages/DesignerPortal';
import MyBooking from './pages/MyBooking';
import AiSearch from './pages/AiSearch';
import GroomBrideSignup from './pages/GroomBrideSignup';
import NotFound from './pages/NotFound';
import CustomCursor from './components/ui/CustomCursor';
import TrivandrumOffer from './pages/TrivandrumOffer';
import CustomPackage from './pages/CustomPackage';
import Packages from './pages/Packages';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/services" element={<PageWrapper><Services /></PageWrapper>} />
        <Route path="/blog" element={<PageWrapper><Blog /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/policies" element={<PageWrapper><Policies /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><Admin /></PageWrapper>} />
        <Route path="/my-booking" element={<PageWrapper><ClientPortal /></PageWrapper>} />
        <Route path="/booking" element={<PageWrapper><MyBooking /></PageWrapper>} />
        <Route path="/groom/bride" element={<PageWrapper><GroomBrideSignup /></PageWrapper>} />
        <Route path="/grrom/bride" element={<PageWrapper><GroomBrideSignup /></PageWrapper>} />
        <Route path="/groom-bride" element={<PageWrapper><GroomBrideSignup /></PageWrapper>} />
        <Route path="/editor" element={<PageWrapper><EditorPortal /></PageWrapper>} />
        <Route path="/designer" element={<PageWrapper><DesignerPortal /></PageWrapper>} />
        <Route path="/ai-search" element={<PageWrapper><AiSearch /></PageWrapper>} />
        <Route path="/trivandrum-offer" element={<PageWrapper><TrivandrumOffer /></PageWrapper>} />
        <Route path="/custom-package" element={<PageWrapper><CustomPackage /></PageWrapper>} />
        <Route path="/packages" element={<PageWrapper><Packages /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

const AppContent = () => {
  const location = useLocation();
  const isPortalPath = ["/my-booking", "/admin", "/editor", "/designer", "/ai-search", "/groom/bride", "/grrom/bride", "/groom-bride"].some(path => 
    location.pathname.startsWith(path)
  );

  return (
    <div className="flex flex-col min-h-screen">
      {!isPortalPath && <Header />}
      <main className="flex-grow">
        <AnimatedRoutes />
      </main>
      {!isPortalPath && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <CustomCursor />
      <AppContent />
    </Router>
  );
}

export default App;
