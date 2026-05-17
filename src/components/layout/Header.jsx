import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import appIcon from "../../../public/appIcon.png";


const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  const [showNavbar, setShowNavbar] = useState(true);

  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // background effect
      setScrolled(currentScrollY > 50);

      // hide navbar when scrolling down
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNavbar(false);
      } else {
        // show navbar when scrolling up
        setShowNavbar(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Blog", path: "/blog" },
    { name: "Contact", path: "/contact" },
    { name: "Special Offer", path: "/offer", isSpecial: true },
  ];

  return (
    <header
      className={`
        fixed
        top-0
        left-0
        w-full
        z-50
        transition-all
        duration-500
        ${
          showNavbar
            ? "translate-y-0"
            : "-translate-y-full"
        }
        ${
          scrolled
            ? "bg-black/80 backdrop-blur-2xl border-b border-white/5 py-4"
            : "bg-transparent py-6"
        }
      `}
    >
      <div className="container flex justify-between items-center px-6 md:px-10">
        
        {/* LOGO */}
        <NavLink to="/" className="flex items-center gap-3">
          <img
            src={appIcon}
            alt="Logo"
            className="w-12 h-12 object-contain"
          />

          <h1 className="text-xl font-light tracking-tight text-white">
            Dreamwed Stories
          </h1>
        </NavLink>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                link.isSpecial
                  ? "text-[11px] font-bold uppercase tracking-[2px] px-5 py-2.5 bg-gradient-to-r from-amber-500 via-[#d1a852] to-[#b4975a] text-white rounded-full hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(180,151,90,0.3)] select-none"
                  : `
                text-sm
                font-medium
                uppercase
                tracking-[2px]
                transition-all
                duration-300
                hover:-translate-y-1
                text-white
                ${
                  isActive
                    ? "text-[#b4975a]"
                    : "text-zinc-300 hover:text-white"
                }
              `
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* MOBILE BUTTON */}
        <button
          className="md:hidden text-white hover:opacity-80 transition-opacity"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
            className="
              absolute
              top-full
              left-0
              w-full
              bg-zinc-950/95
              backdrop-blur-2xl
              p-8
              flex
              flex-col
              gap-6
              md:hidden
              items-center
              shadow-lg
              border-b
              border-white/5
            "
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  link.isSpecial
                    ? "text-sm font-bold uppercase tracking-widest px-8 py-3 bg-gradient-to-r from-amber-500 to-[#b4975a] text-white rounded-full text-center shadow-lg w-full max-w-[240px] block mt-2"
                    : `text-lg tracking-wide ${
                        isActive ? "text-[#b4975a]" : "text-zinc-300"
                      } hover:text-white transition-all`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;