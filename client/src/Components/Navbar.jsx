import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaLeaf, FaBars, FaXmark, FaPowerOff, FaUserAstronaut, FaGlobe } from "react-icons/fa6";
import { useLanguage } from "../LanguageContext";

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setIsOpen(false), [location]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;
  const homeLink = user ? "/welcome" : "/";

  const NavLink = ({ to, label }) => (
    <Link
      to={to}
      className={`relative text-sm font-semibold tracking-wide transition-all duration-300 ${
        isActive(to) ? "text-green-400" : "text-gray-300 hover:text-white"
      }`}
    >
      {label}
      <span
        className={`absolute -bottom-1 left-0 h-[2px] bg-green-500 rounded-full transition-all duration-300 ${
          isActive(to) ? "w-full" : "w-0 group-hover:w-full"
        }`}
      ></span>
    </Link>
  );

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b ${
        scrolled
          ? "bg-[#050505]/60 backdrop-blur-md border-white/5 py-3 shadow-lg"
          : "bg-transparent border-transparent py-6"
      }`}
    >
      <div className="w-full max-w-[95%] ml-auto mr-4 flex items-center justify-between pl-4 md:pl-12 pr-4">

        {/* LOGO */}
        <Link to={homeLink} className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-green-600 to-green-400 rounded-xl rotate-45 opacity-20 group-hover:rotate-90 group-hover:opacity-40 transition-all duration-500"></div>
            <FaLeaf className="text-green-400 text-xl relative z-10 drop-shadow-md" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-white tracking-tight">
              PHENO<span className="font-light text-green-100/80">PREDICT</span>
            </span>
          </div>
        </Link>

        {/* DESKTOP RIGHT SIDE */}
        <div className="hidden md:flex items-center gap-8 ml-auto">

          <NavLink to={homeLink} label="Home" />

          {user && (
            <>
              <NavLink to="/Charts" label="Analytics" />
              <NavLink to="/visualize" label="History" />

              {/* ⭐ NEW LINKS ADDED ⭐ */}
              <NavLink to="/predict-disease" label="Predict Disease" />
              <NavLink to="/disease-history" label="Disease History" />
            </>
          )}

          {/* Divider */}
          <div className="h-5 w-[1px] bg-white/10 mx-2"></div>

          {/* 🌐 LANGUAGE SELECTOR */}
          <div className="relative group">
            <FaGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400/80 z-10" />

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="
                pl-9 pr-6 py-1.5 rounded-full text-sm 
                text-gray-100 bg-black/40 backdrop-blur-xl
                border border-white/10 
                focus:outline-none focus:border-green-400/60 
                hover:bg-black/60 transition-all cursor-pointer 
                appearance-none
              "
            >
              <option value="en" className="bg-black text-white">English</option>
              <option value="te" className="bg-black text-white">తెలుగు</option>
              <option value="hi" className="bg-black text-white">हिन्दी</option>
            </select>
          </div>

          {/* USER & LOGOUT */}
          {user ? (
            <div className="flex items-center gap-4 pl-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-500/20">
                <FaUserAstronaut className="text-green-400" />
                <span className="text-sm text-green-100 font-medium">
                  {user.name.split(" ")[0]}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold hover:bg-red-500 hover:text-white transition-all duration-300"
              >
                <FaPowerOff /> Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link to="/login" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2 rounded-full bg-gradient-to-r from-green-600 to-emerald-500 
                           text-white text-sm font-bold shadow-lg shadow-green-900/20 
                           hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-300 hover:text-green-400 transition-colors p-2"
        >
          {isOpen ? <FaXmark size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10"
          >
            <div className="flex flex-col p-6 space-y-4">
              <Link to={homeLink} className="text-lg font-medium text-gray-300 hover:text-green-400">Home</Link>

              {user && (
                <>
                  <Link to="/Charts" className="text-lg font-medium text-gray-300 hover:text-green-400">Analytics</Link>
                  <Link to="/visualize" className="text-lg font-medium text-gray-300 hover:text-green-400">History</Link>

                  {/* ⭐ NEW MOBILE LINKS ADDED ⭐ */}
                  <Link
                    to="/predict-disease"
                    className="text-lg font-medium text-gray-300 hover:text-green-400"
                  >
                    Predict Disease
                  </Link>

                  <Link
                    to="/disease-history"
                    className="text-lg font-medium text-gray-300 hover:text-green-400"
                  >
                    Disease History
                  </Link>
                </>
              )}

              <div className="h-[1px] bg-white/10 my-2"></div>

              {/* MOBILE LANGUAGE SELECTOR */}
              <div className="flex items-center gap-3 bg-black/30 backdrop-blur-xl p-3 rounded-lg border border-white/10">
                <FaGlobe className="text-green-400" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-black/40 text-gray-100 rounded-lg py-2 px-3 w-full outline-none"
                >
                  <option value="en" className="bg-black text-white">English</option>
                  <option value="te" className="bg-black text-white">తెలుగు</option>
                  <option value="hi" className="bg-black text-white">हिन्दी</option>
                </select>
              </div>

              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full py-3 mt-2 rounded-xl bg-red-500/10 text-red-400 font-bold border border-red-500/20 flex items-center justify-center gap-2"
                >
                  <FaPowerOff /> Logout
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Link to="/login" className="py-3 rounded-xl bg-white/5 text-center text-white font-semibold">Login</Link>
                  <Link to="/signup" className="py-3 rounded-xl bg-green-600 text-center text-white font-bold">Sign Up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
