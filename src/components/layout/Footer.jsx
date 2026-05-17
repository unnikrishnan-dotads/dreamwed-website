import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="w-full bg-[#050505] rounded-t-[40px] text-white">
      <div className="max-w-7xl mx-auto px-8 lg:px-16 py-24">

        {/* TOP SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">

          {/* LEFT */}
          <div>

            {/* LOGO */}
            <div className="mb-10">
              <h1 className="text-[100px] leading-none tracking-[-0.06em] font-light font-serif">
                DW
              </h1>

              <p className=" -mt-4 ml-2 text-[12px] tracking-[0.6em] text-zinc-500 uppercase font-semibold">
                Dreamwed Stories
              </p>
            </div>

            {/* TEXT */}
            <p className="text-[32px] leading-[1.3] tracking-[-0.03em] text-zinc-200 max-w-md font-light">
              Timeless wedding photography for your big day.
            </p>

            {/* SOCIALS */}
            <div className="flex items-center gap-6 mt-12">
              <a 
                href="https://www.instagram.com/dreamwed_stories.co?igsh=MWxuOXZkcHZ2cWgwdw==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-500 text-lg"
              >
                <FaInstagram />
              </a>
              <a 
                href="https://www.facebook.com/dreamwedweddingphotography/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-500 text-lg"
              >
                <FaFacebook />
              </a>
              <a 
                href="#" 
                className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-500 text-lg"
              >
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* EMPTY CENTER */}
          <div />

          {/* RIGHT LINKS */}
          <div className="grid grid-cols-2 gap-16">

            {/* PAGES */}
            <div>
              <h3 className="text-[32px] md:text-[42px] tracking-[-0.04em] text-white font-normal mb-8">
                Pages
              </h3>

              <div className="space-y-4">
                {[
                  { name: "Home", path: "/" },
                  { name: "About", path: "/about" },
                  { name: "Services", path: "/services" }
                ].map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="block text-[20px] md:text-[24px] text-zinc-400 hover:text-white transition-colors font-light"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* INFORMATION */}
            <div>
              <h3 className="text-[32px] md:text-[42px] tracking-[-0.04em] text-white font-normal mb-8">
                Information
              </h3>

              <div className="space-y-4">
                {[
                  { name: "Contact", path: "/contact" },
                  { name: "Privacy policy", path: "/privacy" },
                  { name: "Terms", path: "/terms" }
                ].map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="block text-[20px] md:text-[24px] text-zinc-400 hover:text-white transition-colors font-light"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* DIVIDER */}
        <div className="w-full h-px bg-zinc-900 mt-24"></div>

        {/* BOTTOM */}
        <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[18px] md:text-[20px] text-zinc-500 font-light numbers-pro">
            © 2026 Dreamwed Stories. All rights reserved.
          </p>
          <Link to="/admin" className="text-[14px] text-zinc-500 hover:text-[#b4975a] tracking-widest uppercase font-semibold transition-colors duration-300">
            Admin Portal
          </Link>
          <p className="text-[14px] text-zinc-600 tracking-widest uppercase font-semibold">
            Trivandrum, Kerala
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;