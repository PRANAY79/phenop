// src/Components/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { login, pollTask } from "../api";
import { toast } from "react-toastify";
import bg from "../assets/bg.jpg";
import { FaLeaf, FaDna, FaFingerprint } from "react-icons/fa6";
import { useLanguage } from "../LanguageContext";

const uiText = {
  systemLogin: {
    en: "System Login",
    te: "సిస్టమ్ లాగిన్",
    hi: "सिस्टम लॉगिन"
  },
  researcherID: {
    en: "Researcher ID",
    te: "రిసెర్చర్ ID",
    hi: "अनुसंधान उपयोगकर्ता ID"
  },
  accessKey: {
    en: "Access Key",
    te: "యాక్సెస్ కీ",
    hi: "एक्सेस की"
  },
  initSystem: {
    en: "INITIATE SYSTEM",
    te: "సిస్టమ్ ప్రారంభించండి",
    hi: "सिस्टम प्रारंभ करें"
  },
  registerNewUnit: {
    en: "Register New Farm Unit",
    te: "కొత్త ఫార్మ్ యూనిట్ నమోదు",
    hi: "नई फ़ार्म यूनिट पंजीकृत करें"
  },
  biometricsVerified: {
    en: "Biometrics Verified.",
    te: "బయోమెట్రిక్స్ ధృవీకరించబడింది.",
    hi: "बायोमेट्रिक्स सत्यापित।"
  }
};

const autofillStyles = `
  input:-webkit-autofill,
  input:-webkit-autofill:hover, 
  input:-webkit-autofill:focus, 
  input:-webkit-autofill:active{
      -webkit-background-clip: text;
      -webkit-text-fill-color: #ffffff;
      transition: background-color 5000s ease-in-out 0s;
      box-shadow: inset 0 0 20px 20px rgba(0,0,0,0);
  }
`;

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key) => uiText[key][language];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState([]);

  // particle background
  useEffect(() => {
    const newParticles = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 5,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  // ---------------------------------------
  // FIXED LOGIN HANDLER (NO INFINITE LOOPS)
  // ---------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await login(email, password);

      if (!res || !res.task_id) {
        toast.error("Gateway error");
        setIsLoading(false);
        return;
      }

      const MAX_ATTEMPTS = 40;
      let attempts = 0;
      let final = null;

      while (attempts < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, 700));

        const poll = await pollTask(res.task_id); // FIXED: single fetch only

        if (poll.status === "SUCCESS") {
          final = poll.result; // Celery returns { ok, data }
          break;
        }

        if (poll.status === "FAILURE") {
          toast.error("Login failed");
          setIsLoading(false);
          return;
        }

        attempts++;
      }

      if (!final) {
        toast.error("Login timed out. Try again.");
        setIsLoading(false);
        return;
      }

      if (final.ok === false) {
        toast.error(final.error || "Login failed");
        setIsLoading(false);
        return;
      }

      const loginData = final.data;
      if (!loginData?.token) {
        toast.error(loginData?.error || "Login failed");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("token", loginData.token);
      localStorage.setItem("user", JSON.stringify(loginData.user));
      setUser && setUser(loginData.user);

      toast.success(t("biometricsVerified"));
      navigate("/welcome");

    } catch (err) {
      console.error(err);
      toast.error("Unexpected error during login");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden font-sans bg-black">
      <style>{autofillStyles}</style>

      {/* background */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="absolute inset-0 bg-black/70 z-0" />
      </div>

      {/* Particles */}
      <div className="fixed inset-0 z-10 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              bottom: "-10px"
            }}
            animate={{ y: [0, -1000], opacity: [0, 1, 0] }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Login Card */}
      <div className="relative z-20 w-full max-w-md p-6 pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="relative w-full"
        >
          {/* Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-green-500/20 blur-[80px] rounded-full -z-10" />

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl relative ring-1 ring-white/5">

            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-2xl flex items-center justify-center border border-green-500/30">
                <FaLeaf className="text-green-400 text-4xl" />
              </div>
              <h2 className="text-4xl font-bold text-white tracking-tight">PhenoPredict</h2>
              <div className="flex items-center justify-center gap-2 mt-2 opacity-70">
                <span className="h-[1px] w-8 bg-green-500"></span>
                <p className="text-emerald-300 text-xs font-mono uppercase tracking-[0.2em]">
                  {t("systemLogin")}
                </p>
                <span className="h-[1px] w-8 bg-green-500"></span>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Email */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaFingerprint className="text-gray-400 group-focus-within:text-green-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("researcherID")}
                  autoComplete="email"
                  className="block w-full pl-11 pr-4 py-4 rounded-xl bg-black/30 
                             border border-white/10 text-white placeholder-gray-500 
                             focus:outline-none focus:ring-1 focus:ring-green-400 
                             transition-all duration-300 backdrop-blur-sm"
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaDna className="text-gray-400 group-focus-within:text-green-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("accessKey")}
                  autoComplete="current-password"
                  className="block w-full pl-11 pr-4 py-4 rounded-xl bg-black/30 
                             border border-white/10 text-white placeholder-gray-500 
                             focus:outline-none focus:ring-1 focus:ring-green-400 
                             transition-all duration-300 backdrop-blur-sm"
                />
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(16,185,129,0.4)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-4 mt-6 rounded-xl font-bold text-white 
                           bg-gradient-to-r from-green-600 to-teal-700 
                           hover:from-green-500 hover:to-teal-600 
                           disabled:opacity-70 shadow-lg shadow-green-900/40 
                           border border-white/10 transition-all relative overflow-hidden"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                ) : (
                  t("initSystem")
                )}
              </motion.button>
            </form>

            {/* Register */}
            <div className="mt-8 text-center">
              <Link
                to="/signup"
                className="text-white/40 text-xs hover:text-green-300 transition-colors border-b border-transparent hover:border-green-300 pb-0.5"
              >
                {t("registerNewUnit")}
              </Link>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
