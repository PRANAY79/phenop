// =========================================================
//  UPDATED VISUALIZE.JSX — with Welcome.jsx Animations
// =========================================================

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import bg from "../assets/bg.jpg";
import {
  FaClockRotateLeft,
  FaDatabase,
  FaCalendarDays,
  FaTerminal,
  FaXmark,
} from "react-icons/fa6";
import { useLanguage } from "../LanguageContext";

// =========================================================
// TRANSLATION
// =========================================================

const traitTranslations = {
  CUDI_REPRO: { en: "Shoot Diameter", te: "తాడు వ్యాసం", hi: "तना व्यास" },
  CULT_REPRO: { en: "Culm Thickness", te: "కలమ్ మందం", hi: "कुल्म मोटाई" },
  CUNO_REPRO: { en: "Tiller Number", te: "టిల్లర్ల సంఖ్య", hi: "टिलर संख्या" },
  GRLT: { en: "Grain Length", te: "ధాన్యం పొడవు", hi: "दाना लंबाई" },
  GRWD: { en: "Grain Width", te: "ధాన్యం వెడల్పు", hi: "दाना चौड़ाई" },
  GRWT100: { en: "100 Grain Weight", te: "100 గింజల బరువు", hi: "100 दाना वजन" },
  HDG_80HEAD: { en: "Heading 80%", te: "తలకారం 80%", hi: "हेडिंग 80%" },
  LIGLT: { en: "Ligule Length", te: "లిగ్యుల్ పొడవు", hi: "लिग्यूल लंबाई" },
  LLT: { en: "Leaf Length", te: "ఆకు పొడవు", hi: "पत्ती लंबाई" },
  LWD: { en: "Leaf Width", te: "ఆకు వెడల్పు", hi: "पत्ती चौड़ाई" },
  PLT_POST: { en: "Plant Posture", te: "మొక్క ఆకారం", hi: "पौधों की आकृति" },
  SDHT: { en: "Stem Height", te: "కాడ ఎత్తు", hi: "तने की ऊँचाई" },
};

const uiText = {
  historyTitle: { en: "DATA HISTORY", te: "డేటా చరిత్ర", hi: "डेटा इतिहास" },
  subtitle: {
    en: "ARCHIVED PHENOTYPE PREDICTION LOGS",
    te: "భద్రపరిచిన ఫీనోటైప్ అంచనా లాగ్స్",
    hi: "संग्रहीत फीनोटाइप भविष्यवाणी लॉग",
  },
  noRecords: {
    en: "NO RECORDS FOUND IN DATABASE",
    te: "డేటాబేస్‌లో రికార్డులు లేవు",
    hi: "डेटाबेस में कोई रिकॉर्ड नहीं मिला",
  },
  meanVal: { en: "Mean", te: "సగటు", hi: "औसत" },
  samples: { en: "Samples", te: "నమూనాలు", hi: "नमूने" },
  confidence: { en: "Range", te: "పరిధి", hi: "सीमा" },
  sampleOutput: { en: "Sample Output", te: "నమూనా విలువలు", hi: "नमूना" },
  decrypting: {
    en: "DECRYPTING ARCHIVES...",
    te: "ఆర్కైవ్‌లను డిక్రిప్ట్ చేస్తోంది...",
    hi: "डिक्रिप्ट किया जा रहा है...",
  },
};

// =========================================================
// ANIMATION VARIANTS (Taken From Welcome.jsx)
// =========================================================

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { y: 30, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 80 },
  },
};

export default function Visualize({ username }) {
  const { language } = useLanguage();
  const t = (k) => uiText[k][language];
  const tr = (trait) => traitTranslations[trait]?.[language] || trait;

  const [history, setHistory] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [particles, setParticles] = useState([]);
  const [error, setError] = useState("");

  // PARTICLES
  useEffect(() => {
    const parts = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(parts);
  }, []);

  // FETCH DATA
  useEffect(() => {
    if (!username) return;

    fetch(`http://localhost:5000/api/predictions/${username}`)
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .catch((err) => setError(err.message));
  }, [username]);

  // BASIC STATES
  if (!username)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 bg-black">
        SESSION EXPIRED — LOGIN
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 bg-black">
        ERROR: {error}
      </div>
    );

  if (!history)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="w-10 h-10 animate-spin border-2 border-green-500 border-t-transparent rounded-full"></div>
        <p className="text-green-400 mt-3 font-mono">{t("decrypting")}</p>
      </div>
    );

  // =========================================================
  // MAIN RENDER
  // =========================================================
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-black text-white">

      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${bg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-emerald-950/90" />
      </div>

      {/* PARTICLES */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-green-500/30"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              bottom: "-10px",
            }}
            animate={{ y: [0, -1200], opacity: [0, 0.6, 0] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
          />
        ))}
      </div>

      {/* MAIN CONTENT WITH ANIMATIONS */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-6 pt-28 pb-20"
      >
        {/* HEADER */}
        <motion.div variants={cardVariants} className="text-center mb-12">
          <h1 className="text-5xl font-bold">{t("historyTitle")}</h1>
          <p className="text-green-100/60 mt-2 font-mono text-sm">{t("subtitle")}</p>
        </motion.div>

        {/* EMPTY */}
        {history.predictions.length === 0 && (
          <motion.div
            variants={cardVariants}
            className="flex flex-col items-center py-20 text-gray-400"
          >
            <FaDatabase className="text-6xl opacity-40 mb-3" />
            <p className="font-mono text-lg">{t("noRecords")}</p>
          </motion.div>
        )}

        {/* GRID — 4 columns animated */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {history.predictions
            .slice()
            .reverse()
            .map((prediction, index) => {
              const shortTraits = Object.entries(prediction.traits).slice(0, 3);

              return (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  className="bg-black/40 border border-white/10 rounded-2xl p-4 backdrop-blur-lg hover:border-green-500/40 transition-all"
                >
                  {/* Log Header */}
                  <div className="mb-3">
                    <h2 className="text-white font-bold">
                      LOG #{history.predictions.length - index}
                    </h2>
                    <p className="text-gray-400 text-xs flex items-center gap-1 font-mono">
                      <FaCalendarDays />
                      {new Date(prediction.date).toLocaleString()}
                    </p>
                  </div>

                  {/* Short Traits */}
                  <div className="space-y-2">
                    {shortTraits.map(([trait, data]) => (
                      <div key={trait} className="bg-white/5 p-2 rounded border border-white/5">
                        <p className="text-green-300 text-xs font-bold">{tr(trait)}</p>
                        <p className="text-xs text-gray-300">
                          {t("meanVal")}:
                          <span className="text-white font-bold">
                            {" "}
                            {data.mean_prediction.toFixed(3)}
                          </span>
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {t("samples")}: {data.num_samples}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* View More */}
                  <button
                    onClick={() => setModalData(prediction)}
                    className="mt-4 w-full bg-green-600/70 hover:bg-green-600 text-white py-2 text-sm rounded-xl font-bold transition"
                  >
                    VIEW MORE
                  </button>
                </motion.div>
              );
            })}
        </motion.div>
      </motion.div>

      {/* MODAL */}
      <AnimatePresence>
        {modalData && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalData(null)}
          >
            <motion.div
              className="bg-black/80 border border-white/10 rounded-3xl max-w-3xl w-full p-6 relative overflow-y-auto max-h-[85vh]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 rounded-full"
                onClick={() => setModalData(null)}
              >
                <FaXmark className="text-white" />
              </button>

              <h2 className="text-2xl font-bold mb-1">LOG DETAILS</h2>
              <p className="text-gray-400 text-xs mb-4 font-mono">
                <FaCalendarDays className="inline mr-1" />
                {new Date(modalData.date).toLocaleString()}
              </p>

              <div className="space-y-4">
                {Object.entries(modalData.traits).map(([trait, data]) => (
                  <div
                    key={trait}
                    className="bg-white/5 border border-white/10 rounded-xl p-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-green-400 font-bold">{tr(trait)}</p>
                      <p className="text-xs text-gray-300">{trait}</p>
                    </div>

                    {"error" in data ? (
                      <div className="text-red-400 text-xs">
                        ERROR: {data.error}
                      </div>
                    ) : (
                      <>
                        <p className="text-sm">
                          {t("meanVal")}:
                          <span className="text-white font-bold">
                            {" "}
                            {data.mean_prediction.toFixed(4)}
                          </span>
                        </p>
                        <p className="text-sm">
                          {t("samples")}:
                          <span className="text-white"> {data.num_samples}</span>
                        </p>
                        <p className="text-sm text-blue-300">
                          {t("confidence")}:
                          {" "}
                          {data.min_prediction.toFixed(3)} –{" "}
                          {data.max_prediction.toFixed(3)}
                        </p>

                        {data.sample_predictions && (
                          <div className="mt-2 text-[11px] font-mono text-gray-300">
                            <p className="mb-1 flex gap-1 items-center text-gray-500">
                              <FaTerminal /> {t("sampleOutput")}
                            </p>
                            <div className="bg-black/60 border border-white/10 p-2 rounded max-h-20 overflow-y-auto">
                              <div className="grid grid-cols-4 gap-2">
                                {data.sample_predictions
                                  .slice(0, 12)
                                  .map((v, i) => (
                                    <span key={i} className="text-green-400/90">
                                      {v.toFixed(2)}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
