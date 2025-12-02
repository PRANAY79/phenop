// src/Components/Charts.jsx
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend
} from "recharts";
import { motion } from "framer-motion";
import bg from "../assets/bg.jpg";
import {
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaDatabase,
  FaTriangleExclamation
} from "react-icons/fa6";

import { useLanguage } from "../LanguageContext";

// =======================
//  TEXT TRANSLATIONS
// =======================
const uiText = {
  accessDenied: {
    en: "ACCESS DENIED: LOGIN REQUIRED",
    te: "యాక్సెస్ నిరాకరించబడింది: లాగిన్ అవసరం",
    hi: "एक्सेस अस्वीकृत: लॉगिन आवश्यक"
  },
  loadingModule: {
    en: "LOADING ANALYTICS MODULE...",
    te: "విశ్లేషణ మాడ్యూల్ లోడ్ అవుతోంది...",
    hi: "एनालिटिक्स मॉड्यूल लोड हो रहा है..."
  },
  noDataTitle: {
    en: "No Data Found",
    te: "డేటా కనబడలేదు",
    hi: "कोई डेटा नहीं मिला"
  },
  noDataSubtitle: {
    en: "Run a prediction in the \"Trait Predictor\" first.",
    te: "మొదట \"Trait Predictor\" లో ఒక అంచనాను అమలు చేయండి.",
    hi: "पहले \"Trait Predictor\" में एक भविष्यवाणी चलाएँ।"
  },
  analyticsTitle: {
    en: "ANALYTICS CORE",
    te: "విశ్లేషణ కోర్",
    hi: "एनालिटिक्स कोर"
  },
  analyticsSubtitle: {
    en: "Visualizing Phenotype Vectors & Probability Distributions",
    te: "ఫీనోటైప్ వెక్టర్‌లు & అవకాశ పంపిణీల విజువలైజేషన్",
    hi: "फीनोटाइप वेक्टर और प्रायिकता वितरण का दृश्यांकन"
  },
  meanPredictionTitle: {
    en: "Mean Prediction",
    te: "సగటు అంచనా",
    hi: "औसत भविष्यवाणी"
  },
  confidenceRangeTitle: {
    en: "Confidence Range",
    te: "నమ్మక పరిధి",
    hi: "विश्वास सीमा"
  },
  radarTitle: {
    en: "Multivariate Trait Comparison",
    te: "బహుళ లక్షణాల పోలిక",
    hi: "बहु-लक्षण तुलना"
  },
  maxBound: {
    en: "Max Bound",
    te: "గరిష్ట పరిమితి",
    hi: "अधिकतम सीमा"
  },
  minBound: {
    en: "Min Bound",
    te: "కనిష్ట పరిమితి",
    hi: "न्यूनतम सीमा"
  },
  phenotypeMean: {
    en: "Phenotype Mean",
    te: "ఫీనోటైప్ సగటు",
    hi: "फीनोटाइप औसत"
  },
  tooltipMean: {
    en: "Mean",
    te: "సగటు",
    hi: "औसत"
  },
  tooltipMax: {
    en: "Max",
    te: "గరిష్టం",
    hi: "अधिकतम"
  },
  tooltipMin: {
    en: "Min",
    te: "కనిష్టం",
    hi: "न्यूनतम"
  }
};

// Metric label map for tooltip
const metricLabelKeyByDataKey = {
  mean: "tooltipMean",
  max: "tooltipMax",
  min: "tooltipMin"
};

// --- Custom Tooltip Component (gets language from parent) ---
const CustomTooltip = ({ active, payload, label, language }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-green-500/50 p-4 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.3)] backdrop-blur-md">
        <p className="text-green-400 font-mono font-bold text-sm mb-2 border-b border-green-500/30 pb-1 uppercase tracking-wider">
          {label}
        </p>
        {payload.map((entry, index) => {
          const metricLabelKey = metricLabelKeyByDataKey[entry.dataKey];
          const metricLabel =
            metricLabelKey && uiText[metricLabelKey]
              ? uiText[metricLabelKey][language]
              : entry.name || entry.dataKey;

          return (
            <p
              key={index}
              className="text-gray-300 text-xs font-mono flex items-center gap-2"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="capitalize">{metricLabel}:</span>
              <span className="text-white font-bold">
                {Number(entry.value).toFixed(3)}
              </span>
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function Charts({ username }) {
  const { language } = useLanguage();
  const t = (key) => uiText[key][language];

  const [history, setHistory] = useState(null);
  const [latestTraits, setLatestTraits] = useState([]);
  const [particles, setParticles] = useState([]);

  // Particle System
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  // Fetch Data
  useEffect(() => {
    if (!username) return;

    fetch(`http://localhost:5000/api/predictions/${username}`)
      .then((res) => res.json())
      .then((data) => {
        setHistory(data);

        if (data.predictions?.length > 0) {
          const latest = data.predictions[data.predictions.length - 1].traits;

          const formatted = Object.entries(latest)
            .filter(([_, val]) => !val.error)
            .map(([key, val]) => ({
              trait: key, // raw key as label (per your choice)
              mean: val.mean_prediction,
              min: val.min_prediction,
              max: val.max_prediction
            }));

          setLatestTraits(formatted);
        }
      })
      .catch((err) => console.error("Failed to load charts", err));
  }, [username]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  // --- Loading / Empty States ---
  if (!username)
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center text-green-500 font-mono">
        <FaTriangleExclamation className="mr-2" /> {t("accessDenied")}
      </div>
    );

  if (!history)
    return (
      <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-green-500 font-mono text-sm tracking-widest">
          {t("loadingModule")}
        </div>
      </div>
    );

  if (!latestTraits.length)
    return (
      <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-green-900/10"></div>
        <FaDatabase className="text-6xl text-gray-600 mb-4" />
        <h2 className="text-2xl text-white font-bold">{t("noDataTitle")}</h2>
        <p className="text-gray-400">{t("noDataSubtitle")}</p>
      </div>
    );

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans bg-black">
      {/* BACKGROUND */}
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
            backgroundSize: "40px 40px"
          }}
        />
      </div>

      {/* PARTICLES */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-green-500/30"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              bottom: "-10px"
            }}
            animate={{ y: [0, -1000], opacity: [0, 0.6, 0] }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* MAIN CONTENT */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20"
      >
        {/* HEADER */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
            {t("analyticsTitle")}
          </h1>
          <p className="text-green-100/60 font-mono text-sm tracking-wider uppercase">
            {t("analyticsSubtitle")}
          </p>
        </motion.div>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
          {/* BAR CHART */}
          <motion.div
            variants={itemVariants}
            className="bg-black/40 backdrop-blur-xl border border-green-500/20 rounded-3xl p-6 shadow-xl relative group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
              <FaChartBar className="text-6xl text-green-400" />
            </div>

            <h2 className="text-xl text-white font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
              <FaChartBar className="text-green-400" /> {t("meanPredictionTitle")}
            </h2>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={latestTraits}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorMean" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#ffffff10"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="trait"
                    stroke="#9ca3af"
                    tick={{
                      fill: "#9ca3af",
                      fontSize: 12,
                      fontFamily: "monospace"
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{
                      fill: "#9ca3af",
                      fontSize: 12,
                      fontFamily: "monospace"
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={(props) => (
                      <CustomTooltip {...props} language={language} />
                    )}
                    cursor={{ fill: "#ffffff05" }}
                  />
                  <Bar
                    dataKey="mean"
                    fill="url(#colorMean)"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                    name={uiText.tooltipMean[language]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* AREA CHART (MIN/MAX RANGE) */}
          <motion.div
            variants={itemVariants}
            className="bg-black/40 backdrop-blur-xl border border-green-500/20 rounded-3xl p-6 shadow-xl relative group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
              <FaChartLine className="text-6xl text-blue-400" />
            </div>

            <h2 className="text-xl text-white font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
              <FaChartLine className="text-blue-400" /> {t("confidenceRangeTitle")}
            </h2>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={latestTraits}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#3b82f6"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor="#3b82f6"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#10b981"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#ffffff10"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="trait"
                    stroke="#9ca3af"
                    tick={{
                      fill: "#9ca3af",
                      fontSize: 12,
                      fontFamily: "monospace"
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{
                      fill: "#9ca3af",
                      fontSize: 12,
                      fontFamily: "monospace"
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={(props) => (
                      <CustomTooltip {...props} language={language} />
                    )}
                  />
                  <Area
                    type="monotone"
                    dataKey="max"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMax)"
                    name={t("maxBound")}
                  />
                  <Area
                    type="monotone"
                    dataKey="min"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMin)"
                    name={t("minBound")}
                  />
                  <Legend iconType="circle" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* RADAR CHART */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-black/40 backdrop-blur-xl border border-green-500/20 rounded-3xl p-6 shadow-xl relative group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
              <FaChartPie className="text-6xl text-purple-400" />
            </div>

            <h2 className="text-xl text-white font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
              <FaChartPie className="text-purple-400" /> {t("radarTitle")}
            </h2>

            <div className="h-[400px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  data={latestTraits}
                >
                  <PolarGrid stroke="#ffffff20" />
                  <PolarAngleAxis
                    dataKey="trait"
                    tick={{
                      fill: "#d1d5db",
                      fontSize: 12,
                      fontWeight: "bold"
                    }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, "auto"]}
                    stroke="#ffffff40"
                  />
                  <Radar
                    name={t("phenotypeMean")}
                    dataKey="mean"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="#22c55e"
                    fillOpacity={0.4}
                  />
                  <Tooltip
                    content={(props) => (
                      <CustomTooltip {...props} language={language} />
                    )}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
