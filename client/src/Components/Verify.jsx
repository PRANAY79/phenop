// src/Components/Verify.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { verifyOtp, pollTask } from "../api";
import { toast } from "react-toastify";
import bg from "../assets/bg.jpg";
import { FaShieldHalved, FaKey, FaUnlockKeyhole } from "react-icons/fa6";

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

const Verify = () => {
  const [particles, setParticles] = useState([]);

useEffect(() => {
  const newParticles = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 10 + 5,
    delay: Math.random() * 5,
  }));
  setParticles(newParticles);
}, []);

  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const pending = localStorage.getItem("pendingEmail");
    if (!pending) {
      toast.error("Session expired. Please signup again.");
      navigate("/signup");
      return;
    }
    setEmail(pending);
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const res = await verifyOtp(email, code);

    // Direct backend reject (before Celery)
    if (res.detail) {
      toast.error(res.detail);
      setIsLoading(false);
      return;
    }

    if (!res.task_id) {
      toast.error("Verification gateway error");
      setIsLoading(false);
      return;
    }

    // Poll Celery
    const polled = await pollTask(res.task_id);

    // Celery result is ALWAYS inside polled.result
    let final = polled.result;

    // If result is a string → parse it
    if (typeof final === "string") {
      try {
        final = JSON.parse(final.replace(/'/g, '"'));
      } catch (err) {
        console.error("Failed to parse verify result:", final);
      }
    }

    console.log("FINAL VERIFY RESULT =", final);

    // ⭐ FIX #1 → correct check
    if (!final?.ok) {
      toast.error(final?.error || final?.data?.error || "Verification failed");
      setIsLoading(false);
      return;
    }

    // ⭐ FIX #2 → success case
    toast.success(final?.data?.message || "Identity verified!");

    localStorage.removeItem("pendingEmail");
    navigate("/login");

  } catch (err) {
    console.error(err);
    toast.error("Unexpected verification error.");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden font-sans bg-black">
      <style>{autofillStyles}</style>

      {/* === BACKGROUND === */}
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

      {/* === PARTICLES === */}
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

      {/* === MAIN CARD === */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="relative z-10 w-full max-w-md p-6 pt-24"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-green-500/20 blur-[80px] rounded-full -z-10" />

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center border border-green-500/30">
              <FaShieldHalved className="text-3xl text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Security Check
            </h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-green-100/60 text-xs font-mono uppercase tracking-widest">
                Two-Factor Authentication
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-400 text-center mb-8 leading-relaxed">
            A secure 6-digit token has been transmitted to <br />
            <span className="text-green-400 font-mono bg-green-900/20 px-2 py-1 rounded border border-green-500/20">
              {email}
            </span>
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-emerald-300/80 uppercase ml-1 tracking-wider">
                Enter Token
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <FaKey className="text-gray-500 group-focus-within:text-green-400 transition-colors" />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/40 border border-white/10 
                            text-white text-center text-2xl font-mono tracking-[0.5em] placeholder-gray-700
                            focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-500/50 
                            transition-all duration-300 backdrop-blur-sm"
                  placeholder="000000"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, ""))
                  }
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: "0 0 20px rgba(16,185,129,0.4)",
              }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 
                    text-white font-bold tracking-wider uppercase shadow-lg shadow-green-900/40 
                    border border-white/10 relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Access</span>
                    <FaUnlockKeyhole />
                  </>
                )}
              </span>
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Did not receive code?{" "}
              <button className="text-green-400 hover:text-green-300 underline underline-offset-4 transition-colors">
                Resend Transmission
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Verify;
