// src/Components/TraitPredict.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import bg from "../assets/bg.jpg";
import {
  FaCloudArrowUp,
  FaMicrochip,
  FaList,
  FaFileCsv,
  FaPlay,
  FaServer,
  FaTerminal,
} from "react-icons/fa6";

import { useLanguage, translateTrait } from "../LanguageContext";
import { traitPredict, pollTask } from "../api";

// --- Custom Scrollbar Styles ---
const customScrollbarStyle = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(34, 197, 94, 0.5);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(34, 197, 94, 0.8);
  }
`;

// --- Units mapping (language-independent) ---
const TRAIT_UNITS = {
  CUDI_REPRO: "score",
  CULT_REPRO: "mm",
  CUNO_REPRO: "count",
  GRLT: "mm",
  GRWD: "mm",
  GRWT100: "g",
  HDG_80HEAD: "days",
  LIGLT: "mm",
  LLT: "cm",
  LWD: "cm",
  PLT_POST: "score",
  SDHT: "cm",
};

const TraitPredict = () => {
  const { language } = useLanguage();

  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [particles, setParticles] = useState([]);

  const [loadingText, setLoadingText] = useState("Initializing...");
  const loadingMessages = [
    "Parsing CSV Structure...",
    "Validating SNP Markers...",
    "Normalizing Vector Space...",
    "Loading Neural Weights...",
    "Running Inference Engine...",
    "Aggregating Phenotype Data...",
    "Finalizing Output...",
  ];

  // --- 1. Particle System ---
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  // --- 2. Computing Animation Loop ---
  useEffect(() => {
    let interval;
    if (isLoading) {
      let i = 0;
      setLoadingText(loadingMessages[0]);
      interval = setInterval(() => {
        i = (i + 1) % loadingMessages.length;
        setLoadingText(loadingMessages[i]);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // --- 3. File Upload ---
  const handleFileUpload = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".csv")) {
      toast.error("Invalid format. Please upload a .CSV file.");
      return;
    }
    setFile(f);
  };

  // --- 4. Submit Logic (gateway + polling) ---
  const handleSubmit = async () => {
    if (!file) {
      toast.error("Awaiting Genotype CSV upload.");
      return;
    }
    setIsLoading(true);
    setResults(null);

    try {
      const username = JSON.parse(localStorage.getItem("user"))?.name || "anonymous";

      const res = await traitPredict(file, username);

      if (!res || !res.task_id) {
        toast.error("Gateway error");
        setIsLoading(false);
        return;
      }

      const MAX_ATTEMPTS = 120; // allow longer for heavy ML (120 * 1000ms = 2 minutes)
      let attempts = 0;
      let final = null;
      while (attempts < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, 1000));
        const poll = await pollTask(res.task_id);
        attempts += 1;

        if (poll.status === "SUCCESS") {
          final = poll.result;
          break;
        }
        if (poll.status === "FAILURE") {
          toast.error("Prediction task failed");
          setIsLoading(false);
          return;
        }
      }

      if (!final) {
        toast.error("Prediction timed out. Try again later.");
        setIsLoading(false);
        return;
      }

      // final expected shape: { ok: True/False, ml: {traits: ...}, stored: {...} }
      if (!final.ok) {
        toast.error(final.error || "Prediction failed");
        setIsLoading(false);
        return;
      }

      const ml = final.ml || {};
      const traits = ml.traits || ml.traits || {};

      setResults(traits);
      toast.success("Analysis Complete.");

      // Try to archive in Node if not already (trait task saved it, but keep defensive fallback)
      try {
        await fetch("http://localhost:5000/api/predictions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, traits }),
        });
      } catch (err) {
        // ignore
      }
    } catch (err) {
      console.error(err);
      toast.error("Connection Error: ML middleware unreachable.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans bg-black">
      <style>{customScrollbarStyle}</style>

      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${bg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-emerald-950/90" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(16, 185, 129, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.2) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-green-500/30"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              bottom: "-10px",
            }}
            animate={{ y: [0, -1000], opacity: [0, 0.6, 0] }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-20 flex flex-col items-center"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
            TRAIT{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              PREDICTOR
            </span>
          </h1>
          <p className="text-green-100/60 font-mono text-sm tracking-wider">
            MULTI-VARIATE PHENOTYPE ANALYSIS ENGINE
          </p>
        </motion.div>

        {/* Steps Pipeline */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-3xl flex justify-between items-center relative mb-12"
        >
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/10 -z-10"></div>
          {[
            { icon: <FaFileCsv />, label: "Upload Data" },
            { icon: <FaMicrochip />, label: "Process ML" },
            { icon: <FaList />, label: "View Report" },
          ].map((step, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center bg-black/60 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-sm"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-2 shadow-lg transition-all duration-300 ${
                  (idx === 0 && !file) ||
                  (idx === 1 && isLoading) ||
                  (idx === 2 && results)
                    ? "bg-green-500 text-white shadow-green-500/30 scale-110"
                    : "bg-white/10 text-gray-400"
                }`}
              >
                {step.icon}
              </div>
              <span className="text-xs text-gray-300 font-mono uppercase tracking-wide">
                {step.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* --- MAIN GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-12 items-start">
          {/* LEFT: Upload Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden group h-[450px] flex flex-col"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FaCloudArrowUp className="text-6xl text-green-400" />
            </div>

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FaServer className="text-green-400" /> Data Ingestion
            </h2>

            <label
              className={`w-full flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                file
                  ? "border-green-500/50 bg-green-500/10"
                  : "border-white/20 hover:border-green-400/50 hover:bg-white/5"
              }`}
            >
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".csv"
              />
              <FaCloudArrowUp
                className={`text-4xl mb-3 ${
                  file ? "text-green-400" : "text-gray-400"
                }`}
              />
              <span
                className={`text-sm font-mono ${
                  file ? "text-green-300" : "text-gray-400"
                }`}
              >
                {file ? file.name : "DRAG & DROP CSV MATRIX"}
              </span>
              {!file && (
                <span className="text-xs text-gray-500 mt-2">
                  SNP Format Required
                </span>
              )}
            </label>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-green-600 to-teal-700 text-white font-bold tracking-widest shadow-lg shadow-green-900/40 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>PROCESSING...</span>
                </>
              ) : (
                <>
                  <span>INITIATE SEQUENCE</span>
                  <FaPlay className="text-xs" />
                </>
              )}
            </motion.button>
          </motion.div>

          {/* RIGHT: System Log */}
          <motion.div
            variants={itemVariants}
            className={`bg-black/40 backdrop-blur-xl border rounded-2xl p-0 font-mono text-sm relative h-[450px] flex flex-col overflow-hidden transition-all duration-500 ${
              isLoading
                ? "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]"
                : "border-green-500/20"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-4 bg-white/5">
              <span className="text-green-400 font-bold flex items-center gap-2">
                <FaTerminal /> SYSTEM LOG
              </span>
              <div className="flex gap-2">
                <div
                  className={`w-3 h-3 rounded-full border ${
                    isLoading
                      ? "bg-green-500 border-green-300 animate-pulse"
                      : "bg-green-900/40 border-green-900"
                  }`}
                ></div>
              </div>
            </div>

            {/* Log Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 relative space-y-2">
              {!results && !isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2 opacity-60">
                  <FaList className="text-4xl mb-2" />
                  <p>Awaiting Data Stream...</p>
                </div>
              )}

              {/* COMPUTING OVERLAY */}
              {isLoading && (
                <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-[2px] flex flex-col items-center justify-center text-green-400">
                  <motion.div
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 w-full h-[2px] bg-green-500 shadow-[0_0_20px_#22c55e]"
                  />

                  <div className="flex flex-col items-center gap-3">
                    <FaMicrochip className="text-4xl animate-pulse" />
                    <p className="font-mono text-sm tracking-widest">
                      {loadingText}
                    </p>
                    <div className="w-48 h-1 bg-green-900 rounded-full overflow-hidden mt-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-full bg-green-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Results List in Log */}
              {!isLoading &&
                results &&
                Object.entries(results).map(([trait, info], idx) => {
                  const readable = translateTrait(trait, language);
                  const unit = TRAIT_UNITS[trait.toUpperCase()];
                  const labelWithUnit = unit ? `${readable} (${unit})` : readable;
                  const mean = info.mean_prediction ?? null;
                  const samples = info.num_samples ?? (info.predictions ? info.predictions.length : 0);

                  return (
                    <motion.div
                      key={trait}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-l-2 border-green-500/50 bg-green-500/5 p-3 rounded-r-lg hover:bg-green-500/10 transition-colors flex flex-col"
                      style={{ minHeight: 78 }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                          <div className="text-white font-bold text-lg leading-tight">
                            {readable}{" "}
                            <span className="text-xs text-green-200/60 ml-1 align-top">({trait})</span>
                          </div>
                        </div>

                        <div className="text-right">
                          {mean !== null ? (
                            <div className="text-3xl font-extrabold text-white leading-none">
                              {Number(mean).toFixed(2)}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-300">—</div>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-gray-200/80">
                        <span className="font-mono">Samples: </span>
                        <span className="font-bold">{samples}</span>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </motion.div>
        </div>

        {/* Detailed Results Grid (Bottom) */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <div className="flex items-center gap-2 mb-6 text-white/80">
                <FaList className="text-green-400" />
                <h3 className="text-xl font-bold">Comprehensive Analysis</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(results).map(([trait, info], idx) => {
                  const readable = translateTrait(trait, language);
                  const unit = TRAIT_UNITS[trait.toUpperCase()];
                  const labelWithUnit = unit ? `${readable} (${unit})` : readable;
                  const mean = info.mean_prediction ?? null;

                  return (
                    <motion.div
                      key={trait}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-green-500/40 rounded-xl p-5 transition-all hover:bg-white/10 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col">
                          <div className="text-lg font-bold text-white leading-tight">
                            {labelWithUnit}
                          </div>

                          <div className="text-xs text-green-300/70 mt-1 uppercase tracking-wide">
                            {trait}
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end">
                          <div className="text-3xl font-extrabold text-white leading-none">
                            {mean !== null ? Number(mean).toFixed(2) : "—"}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/10 mt-4 pt-4">
                        {"error" in info ? (
                          <div className="text-sm text-red-300 bg-red-500/10 p-2 rounded">
                            {info.error}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="bg-black/30 p-2 rounded">
                                <div className="text-gray-500 uppercase">Mean</div>
                                <div className="text-green-400 font-mono text-base">
                                  {mean !== null ? Number(mean).toFixed(2) : "—"}
                                </div>
                              </div>
                              <div className="bg-black/30 p-2 rounded">
                                <div className="text-gray-500 uppercase">Range</div>
                                <div className="text-blue-400 font-mono text-xs mt-1">
                                  {(info.min_prediction !== undefined && info.max_prediction !== undefined) ?
                                    `${Number(info.min_prediction).toFixed(2)} - ${Number(info.max_prediction).toFixed(2)}` :
                                    "—"
                                  }
                                </div>
                              </div>
                            </div>

                            <div>
                              <div className="text-xs text-gray-500 mb-1 uppercase">
                                Sample Data Stream
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {info.sample_predictions &&
                                  info.sample_predictions
                                    .slice(0, 5)
                                    .map((v, i) => (
                                      <span
                                        key={i}
                                        className="px-2 py-1 bg-white/5 rounded text-[10px] font-mono text-gray-300 border border-white/5"
                                      >
                                        {Number(v).toFixed(2)}
                                      </span>
                                    ))}
                                <span className="text-[10px] text-gray-500 self-center">...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default TraitPredict;
