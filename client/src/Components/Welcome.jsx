import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import bg from "../assets/bg.jpg";

import { 
  FaDna, 
  FaChartPie, 
  FaClockRotateLeft, 
  FaUserAstronaut, 
  FaArrowRight, 
  FaMicrochip
} from "react-icons/fa6";

// IMPORT THE HOOK
import { useLanguage } from "../LanguageContext"; 

const Welcome = () => {
  const navigate = useNavigate();
  const { t } = useLanguage(); // Only translation (NO language selector)
  const [user, setUser] = useState(null);
  const [particles, setParticles] = useState([]);

  // --- Load User + Particles ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const newParticles = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 80 } },
  };

  // Dashboard cards (translatable)
  const dashboardOptions = [
    {
      title: t.options.trait.title,
      desc: t.options.trait.desc,
      route: "/trait-predict",
      icon: <FaDna className="text-3xl" />,
      color: "text-green-400",
      border: "group-hover:border-green-500/50",
      bg: "group-hover:bg-green-500/10"
    },
    {
      title: t.options.analytics.title,
      desc: t.options.analytics.desc,
      route: "/Charts",
      icon: <FaChartPie className="text-3xl" />,
      color: "text-blue-400",
      border: "group-hover:border-blue-500/50",
      bg: "group-hover:bg-blue-500/10"
    },
    {
      title: t.options.history.title,
      desc: t.options.history.desc,
      route: "/visualize",
      icon: <FaClockRotateLeft className="text-3xl" />,
      color: "text-purple-400",
      border: "group-hover:border-purple-500/50",
      bg: "group-hover:bg-purple-500/10"
    },
  ];

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans bg-black">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${bg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/70 to-emerald-950/80" />

        <div 
          className="absolute inset-0 opacity-10"
          style={{ 
            backgroundImage:
              'linear-gradient(rgba(16,185,129,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.2) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* PARTICLES */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-green-500/30"
            style={{ left: `${p.left}%`, width: `${p.size}px`, height: `${p.size}px`, bottom: "-10px" }}
            animate={{ y: [0, -1000], opacity: [0, 0.6, 0] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
          />
        ))}
      </div>

      {/* MAIN CONTENT */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center"
      >
        
        {/* USER SECTION */}
        <motion.div variants={cardVariants} className="flex flex-col items-center text-center mb-16">
          
          {/* Avatar */}
          <div className="relative mb-6 group">
            <div className="absolute inset-0 bg-green-500 rounded-full blur-[20px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
            
            <div className="w-24 h-24 rounded-full bg-black/40 border-2 border-green-500/30 
                            flex items-center justify-center relative z-10 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <FaUserAstronaut className="text-4xl text-green-100" />
            </div>

            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-900/80 border border-green-500/50 px-3 py-0.5 rounded-full backdrop-blur-md">
              <span className="text-[10px] font-mono text-green-400 tracking-widest uppercase">
                {t.operator}
              </span>
            </div>
          </div>

          {/* Welcome text */}
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            {t.welcome},{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              {user?.name?.split(" ")[0] || "Researcher"}
            </span>
          </h1>

          <p className="text-gray-400 max-w-2xl text-lg">
            {t.selectModule}
          </p>

        </motion.div>

        {/* OPTIONS GRID */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
          {dashboardOptions.map((option, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              onClick={() => navigate(option.route)}
              className="group relative cursor-pointer"
            >
              <div className={`h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 
                              transition-all duration-300 ${option.border} hover:shadow-[0_0_30px_-5px_rgba(0,0,0,0.5)] overflow-hidden`}>
                
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${option.bg}`} />

                <div className={`w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-6 
                                transition-transform duration-300 group-hover:scale-110 ${option.color} relative z-10`}>
                  {option.icon}
                </div>

                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    {option.title}
                    <FaArrowRight className="text-xs opacity-0 -translate-x-2 
                                             group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                  </h3>

                  <p className="text-white/60 text-sm leading-relaxed">
                    {option.desc}
                  </p>
                </div>

                <div className="absolute top-0 right-0 p-3 opacity-20">
                  <FaMicrochip className="text-4xl text-white rotate-90" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* FOOTER STATUS */}
        <motion.div 
          variants={cardVariants} 
          className="w-full max-w-2xl bg-black/40 border border-green-900/30 rounded-xl p-4 
                     flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-500/60 font-mono text-xs uppercase tracking-widest">
              {t.serverStatus}
            </span>
          </div>

          <button 
            onClick={() => navigate('/trait-predict')}
            className="px-6 py-2 rounded-lg bg-green-600/20 text-green-400 border border-green-500/30 
                       text-xs font-bold uppercase tracking-wider hover:bg-green-500 hover:text-white transition-all"
          >
            {t.quickLaunch}
          </button>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default Welcome;
