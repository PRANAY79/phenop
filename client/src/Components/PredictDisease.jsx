// src/Components/PredictDisease.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import bg from "../assets/bg.jpg";
import { FaFileImage, FaPlay, FaServer, FaTerminal } from "react-icons/fa6";
import { useLanguage } from "../LanguageContext";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ⛔️ NO MORE EXTERNAL TRANSLATION CALLS FROM FRONTEND
// Just return the same text (backend / local maps handle language)
async function translate(text, language) {
  return text || "";
}

// UI_TEXT, DISEASE_TRANSLATIONS, getLocalPredictionName
const UI_TEXT = {
  title: {
    en: "DISEASE PREDICTOR",
    te: "వ్యాధి గుర్తింపు వ్యవస్థ",
    hi: "रोग पहचान प्रणाली",
  },
  subtitle: {
    en: "Upload a leaf image and get predictions.",
    te: "ఆకు చిత్రాన్ని అప్‌లోడ్ చేసి ఫలితాలు పొందండి.",
    hi: "पत्ते की छवि अपलोड करें और परिणाम प्राप्त करें।",
  },
  uploadLabel: {
    en: "DRAG & DROP IMAGE",
    te: "చిత్రాన్ని ఇక్కడ పడేయండి",
    hi: "छवि यहाँ डालें",
  },
  runPrediction: {
    en: "RUN PREDICTION",
    te: "అంచనా అమలు చేయండి",
    hi: "पूर्वानुमान चलाएँ",
  },
  detection: { en: "DETECTION", te: "గుర్తింపు", hi: "पता लगाना" },
  suggestionsTitle: { en: "SUGGESTIONS", te: "సూచనలు", hi: "सुझाव" },
};

const DISEASE_TRANSLATIONS = {
  Tungro: {
    en: "Tungro",
    te: "వరి తుంగ్రో వైరస్",
    hi: "धान टुंग्रो वायरस",
  },
  Bacterialblight: {
    en: "Bacterial Blight",
    te: "బాక్టీరియా ముడత",
    hi: "जीवाणु झुलसा",
  },
  Blast: { en: "Blast", te: "బ్లాస్ట్", hi: "ब्लास्ट रोग" },
  Brownspot: {
    en: "Brown Spot",
    te: "బ్రౌన్ స్పాట్",
    hi: "ब्राउन स्पॉट",
  },
  Healthy: { en: "Healthy", te: "ఆరోగ్యంగా", hi: "स्वस्थ" },
};

function getLocalPredictionName(pred, lang) {
  const entry = DISEASE_TRANSLATIONS[pred];
  if (!entry) return pred;
  return entry[lang] || pred;
}

const PredictDisease = () => {
  const { language } = useLanguage();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [originalResult, setOriginalResult] = useState(null);
  const cachedTranslations = useRef({});
  const [particles, setParticles] = useState([]);
  const [loadingText, setLoadingText] = useState("Initializing...");

  const loadingMessages = [
    "Loading model...",
    "Preprocessing image...",
    "Running inference...",
    "Finalizing result...",
  ];

  // 🧠 Only local disease name translation; suggestions stay English for prediction screen
  const runTranslation = useCallback(async (data, lang) => {
    const translatedPrediction = getLocalPredictionName(data.prediction, lang);

    // suggestions: just keep what model returned (English)
    const displayedSuggestions = data.suggestions || [];

    return {
      ...data,
      prediction: translatedPrediction,
      suggestions: displayedSuggestions,
    };
  }, []);

  useEffect(() => {
    if (originalResult) {
      runTranslation(originalResult, language).then(setResult);
    }
  }, [language, originalResult, runTranslation]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5,
      }))
    );
  }, []);

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

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!/\.(jpg|jpeg|png)$/i.test(f.name)) {
      toast.error("Upload JPG/PNG only.");
      return;
    }
    setFile(f);
    setResult(null);
    setOriginalResult(null);
    cachedTranslations.current = {};
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async () => {
    if (!file) return toast.error("Please upload an image.");
    setIsLoading(true);
    setResult(null);
    setOriginalResult(null);
    cachedTranslations.current = {};

    try {
      const form = new FormData();
      form.append("file", file);
      const username =
        JSON.parse(localStorage.getItem("user"))?.name || "anonymous";
      form.append("username", username);

      // 1️⃣ Call ML service
      const resp = await fetch("http://localhost:8002/predict_with_hf", {
        method: "POST",
        body: form,
      });

      const data = await resp.json();
      if (!resp.ok) {
        toast.error(data.error || "Prediction failed.");
        setIsLoading(false);
        return;
      }

      // Save original english model output
      setOriginalResult(data);

      // Translate only disease name for UI (local map)
      const translatedData = await runTranslation(data, language);
      setResult(translatedData);
      toast.success("Inference complete.");

      // 2️⃣ Save history to Node backend (English suggestions only)
      const saveResp = await fetch("http://localhost:5000/api/disease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          prediction: data.prediction,
          confidence: data.confidence,
          caption: data.caption,
          suggestions: Array.isArray(data.suggestions)
            ? data.suggestions
            : data.suggestions
            ? [data.suggestions]
            : [],
          filename: file.name,
          image_base64: data.image_base64,
        }),
      });

      const saveJson = await saveResp.json();
      if (!saveResp.ok) {
        console.error("save error", saveJson);
        toast.error(saveJson.error || "Failed to save history.");
      } else {
        console.log("Saved history response:", saveJson);
      }
    } catch (err) {
      console.error(err);
      toast.error("Connection error.");
    } finally {
      setIsLoading(false);
    }
  };

  // -------------- UI --------------
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-black font-sans">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${bg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-emerald-950/90" />
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
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-20">
        <h1 className="text-center text-white text-4xl font-bold">
          {UI_TEXT.title[language]}
        </h1>
        <p className="text-center text-green-100/60 font-mono mt-2">
          {UI_TEXT.subtitle[language]}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          {/* Left panel */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">
              <FaServer className="inline mr-2 text-green-400" />
              Image Ingestion
            </h2>

            <label
              className={`w-full flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer duration-300 ${
                file
                  ? "border-green-500 bg-green-500/10"
                  : "border-white/20 hover:border-green-400/50 hover:bg-white/5"
              }`}
              style={{ minHeight: "14rem" }}
            >
              <input
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
              <FaFileImage
                className={`text-4xl mb-3 ${
                  file ? "text-green-400" : "text-gray-400"
                }`}
              />
              <span className="text-sm font-mono text-gray-300">
                {file ? file.name : UI_TEXT.uploadLabel[language]}
              </span>
            </label>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="mt-6 py-4 w-full rounded-xl bg-gradient-to-r from-green-600 to-teal-700 text-white font-bold"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2" />
                  PROCESSING...
                </>
              ) : (
                <>
                  {UI_TEXT.runPrediction[language]}{" "}
                  <FaPlay className="inline ml-2" />
                </>
              )}
            </button>
          </div>

          {/* Right panel */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 font-mono text-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="text-green-400 font-bold flex items-center gap-2">
                <FaTerminal /> SYSTEM LOG
              </div>
              <div
                className={`w-3 h-3 rounded-full ${
                  isLoading ? "bg-green-500 animate-pulse" : "bg-green-900"
                }`}
              />
            </div>

            {!result && !isLoading && (
              <div className="text-center text-gray-400 py-8">
                Awaiting image upload...
              </div>
            )}
            {isLoading && (
              <div className="text-center text-green-300 py-8">
                {loadingText}
              </div>
            )}

            {result && !isLoading && (
              <div className="space-y-4">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex gap-4">
                  <div className="w-32 h-32 rounded-lg overflow-hidden border border-white/10">
                    <img
                      src={originalResult?.image_base64 || preview}
                      alt="leaf"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="text-xs text-gray-300 uppercase">
                      {UI_TEXT.detection[language]}
                    </div>
                    <div className="text-lg font-bold text-white mt-1">
                      {result.caption || result.prediction}
                    </div>

                    <div className="text-[12px] text-gray-300 mt-1">
                      <strong>
                        {language === "te"
                          ? "వ్యాధి"
                          : language === "hi"
                          ? "रोग"
                          : "Disease"}
                        :
                      </strong>{" "}
                      <span className="text-white">{result.prediction}</span>
                      <strong className="ml-3">
                        {language === "te"
                          ? "నమ్మకం"
                          : language === "hi"
                          ? "विश्वास"
                          : "Confidence"}
                        :
                      </strong>{" "}
                      <span className="text-green-400">
                        {(originalResult?.confidence * 100 || 0).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="text-xs text-gray-300 uppercase">
                    {UI_TEXT.suggestionsTitle[language]}
                  </div>
                  <div className="mt-2 text-sm text-gray-200 space-y-2">
                    {result.suggestions?.map((s, i) => (
                      <div key={i}>
                        <strong>{i + 1}.</strong> {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default PredictDisease;
