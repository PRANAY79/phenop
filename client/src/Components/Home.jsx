import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../LanguageContext";

import bg from "../assets/bg.jpg";
import { 
  FaLeaf, 
  FaDna, 
  FaChartLine, 
  FaArrowRight, 
  FaMicrochip, 
  FaSeedling, 
  FaMagnifyingGlass, 
  FaLightbulb 
} from "react-icons/fa6";

const Home = () => {
  const { t } = useLanguage();   // <-- MULTI LANGUAGE

  const [particles, setParticles] = useState([]);

  // --- Particle System ---
  useEffect(() => {
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 50 } },
  };

  const scrollVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden font-sans bg-black">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <div 
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: `url(${bg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-black/95" />
        <div 
            className="absolute inset-0 opacity-10"
            style={{ 
                backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)', 
                backgroundSize: '40px 40px' 
            }} 
        />
      </div>

      {/* PARTICLES */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-green-400/30"
            style={{ left: `${p.left}%`, width: `${p.size}px`, height: `${p.size}px`, bottom: "-10px" }}
            animate={{ y: [0, -1000], opacity: [0, 0.8, 0] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
          />
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 pt-32 pb-20 px-6">

        {/* HERO SECTION */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto flex flex-col items-center text-center mb-32"
        >

          <motion.div variants={itemVariants} className="mb-8 relative group">
            <div className="absolute inset-0 bg-green-500 blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-500/10 to-emerald-900/20 border border-green-500/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.1)] relative z-10">
               <FaLeaf className="text-5xl text-green-400 drop-shadow-md" />
            </div>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-white leading-tight">
            {t.home_title_1} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
              {t.home_title_2}
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10">
            {t.home_subtitle}
          </motion.p>

          <motion.div variants={itemVariants}>
            <Link
              to="/signup"
              className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold text-lg tracking-wide shadow-lg shadow-green-900/40 overflow-hidden hover:scale-105 transition-transform duration-300"
            >
              <span className="relative z-10 flex items-center gap-2">
                {t.home_cta_button} <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out z-0" />
            </Link>
          </motion.div>
        </motion.div>


        {/* WHAT THIS DOES SECTION */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={scrollVariants}
          className="max-w-6xl mx-auto mb-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.home_what_title}</h2>
            <div className="h-1 w-20 bg-green-500 mx-auto rounded-full"></div>
            <p className="text-gray-400 mt-4">{t.home_what_subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl group hover:bg-white/10 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><FaDna className="text-8xl text-green-500" /></div>
              <div className="w-12 h-12 bg-green-500/20 rounded-full text-green-400 flex items-center justify-center text-xl mb-6">1</div>
              <h3 className="text-xl font-bold text-white mb-3">{t.home_step1_title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{t.home_step1_desc}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl group hover:bg-white/10 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><FaMicrochip className="text-8xl text-blue-500" /></div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-full text-blue-400 flex items-center justify-center text-xl mb-6">2</div>
              <h3 className="text-xl font-bold text-white mb-3">{t.home_step2_title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{t.home_step2_desc}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl group hover:bg-white/10 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><FaSeedling className="text-8xl text-teal-500" /></div>
              <div className="w-12 h-12 bg-teal-500/20 rounded-full text-teal-400 flex items-center justify-center text-xl mb-6">3</div>
              <h3 className="text-xl font-bold text-white mb-3">{t.home_step3_title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{t.home_step3_desc}</p>
            </div>

          </div>
        </motion.div>


        {/* JARGON BUSTER */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scrollVariants}
          className="max-w-5xl mx-auto mb-20"
        >
          <div className="bg-black/40 border border-green-500/20 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-green-500/5 z-0"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <FaLightbulb className="text-yellow-400 text-2xl" />
                  <h3 className="text-2xl font-bold text-white">{t.home_cheat_title}</h3>
                </div>

                <p className="text-gray-300 mb-6">{t.home_cheat_subtitle}</p>

                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 font-mono font-bold whitespace-nowrap">{t.home_genotype_label}</span>
                    <span className="text-gray-400 text-sm">{t.home_genotype_desc}</span>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="text-green-400 font-mono font-bold whitespace-nowrap">{t.home_phenotype_label}</span>
                    <span className="text-gray-400 text-sm">{t.home_phenotype_desc}</span>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="text-green-400 font-mono font-bold whitespace-nowrap">{t.home_snp_label}</span>
                    <span className="text-gray-400 text-sm">{t.home_snp_desc}</span>
                  </li>
                </ul>
              </div>

              <div className="flex-1 flex justify-center">
                 <div className="relative w-64 h-40 bg-black/50 rounded-xl border border-white/10 flex items-center justify-center">
                    <div className="absolute left-4 w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center border border-gray-600">
                      <FaDna className="text-gray-400" />
                    </div>

                    <div className="h-1 w-20 bg-gradient-to-r from-gray-600 to-green-500"></div>

                    <div className="absolute right-4 w-12 h-12 bg-green-900 rounded-full flex items-center justify-center border border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                      <FaSeedling className="text-green-400" />
                    </div>

                    <div className="absolute bottom-2 text-[10px] text-gray-500 font-mono">
                      {t.home_data_to_result}
                    </div>
                 </div>
              </div>

            </div>
          </div>
        </motion.div>

        {/* FINAL CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <p className="text-green-500/60 text-xs font-mono tracking-widest uppercase mb-4">
            {t.home_ready}
          </p>
          <Link 
            to="/signup" 
            className="text-white font-bold text-lg hover:text-green-400 transition-colors border-b-2 border-green-500 pb-1"
          >
            {t.home_ready_cta}
          </Link>
        </motion.div>

      </div>
    </div>
  );
};

export default Home;
