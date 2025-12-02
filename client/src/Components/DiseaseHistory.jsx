// src/Components/DiseaseHistory.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHistory, FaTimes } from "react-icons/fa";
import { useLanguage } from "../LanguageContext";

// fallback translator (rare)
async function translate(text, language) {
  if (!text) return text;
  try {
    const response = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: "en", target: language, format: "text" })
    });
    const data = await response.json();
    return data.translatedText || text;
  } catch {
    return text;
  }
}

export default function DiseaseHistory() {
  const { language } = useLanguage();
  const username =
    JSON.parse(localStorage.getItem("user"))?.name ||
    JSON.parse(localStorage.getItem("user"))?.username ||
    null;

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalRecord, setModalRecord] = useState(null);
  const [suggestionsToShow, setSuggestionsToShow] = useState([]);
  const [commentDraft, setCommentDraft] = useState("");

  // ⬇️ NEW: load comments + predictions correctly
  useEffect(() => {
    if (!username) { setLoading(false); return; }

    async function load() {
      try {
        const res = await fetch(`http://localhost:5000/api/disease/${username}`);
        const data = await res.json();
        setRecords(data.predictions || []);
      } catch (err) {
        console.error("fetch history error", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [username]);

  function langKey() {
    return language === "te" ? "te" : language === "hi" ? "hi" : "en";
  }

  // ⬇️ NEW: load suggestions + comment into modal
  async function openRecord(rec) {
    setModalRecord(rec);

    const key = langKey();
    const suggObj = rec.traits?.suggestions || { en: [] };

    if (Array.isArray(suggObj[key]) && suggObj[key].length > 0) {
      setSuggestionsToShow(suggObj[key]);
      return;
    }

    // fallback translate
    if (Array.isArray(suggObj.en)) {
      const translated = [];
      for (let s of suggObj.en) {
        translated.push(await translate(s, key));
      }
      setSuggestionsToShow(translated);
    }
  }

  // save comment
  async function saveComment() {
    if (!modalRecord || !commentDraft.trim()) return;
    const idx = records.indexOf(modalRecord);
    if (idx === -1) return;

    try {
      const res = await fetch(`http://localhost:5000/api/disease/${username}/${idx}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: commentDraft })
      });

      if (res.ok) {
        modalRecord.traits.comment = commentDraft;
        setRecords([...records]);
        setCommentDraft("");
      }
    } catch (err) {
      console.error("saveComment error", err);
    }
  }

  // -----------------------------------------------------------------------------------------
  // UI STARTS BELOW — ONLY SMALL LAYOUT CHANGES DONE (4 grid, bigger disease name, show comment)
  // -----------------------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-28 pb-16">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <FaHistory className="text-green-400" /> Disease History
      </h1>

      {loading && <div className="text-gray-400 text-center py-20">Loading history...</div>}
      {!loading && records.length === 0 && (
        <div className="text-gray-400 text-center py-20">No records found for {username}</div>
      )}

      {/* 4 per row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {records.map((rec, idx) => (
          <motion.div
            key={idx}
            className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-xl"
            whileHover={{ scale: 1.02 }}
          >
            <img
              src={rec.traits?.image_base64}
              alt="leaf"
              className="w-full h-44 object-cover rounded-lg mb-3"
            />

            {/* Bigger disease name */}
            <div className="text-xl font-bold text-green-300">
              {rec.traits.prediction}
            </div>

            <div className="text-[12px] text-gray-400 mt-1">
              Confidence: {(rec.traits?.confidence * 100 || 0).toFixed(2)}%
            </div>

            <button
              onClick={() => openRecord(rec)}
              className="mt-3 w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              View More
            </button>
          </motion.div>
        ))}
      </div>

      {/* MODAL */}
<AnimatePresence>
  {modalRecord && (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[200]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setModalRecord(null)}  // click outside closes
    >
      <motion.div
        className="bg-black p-6 rounded-xl border border-white/10 w-[90%] max-w-xl max-h-[80vh] overflow-y-auto relative"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        onClick={(e) => e.stopPropagation()}   // don't close when clicking inside
      >
        <button
          className="absolute right-4 top-4 text-gray-300 hover:text-white"
          onClick={() => setModalRecord(null)}
        >
          <FaTimes size={22} />
        </button>

        <img
          src={modalRecord.traits?.image_base64}
          alt="leaf"
          className="w-full h-56 object-cover rounded-lg mb-4"
        />

        <h2 className="text-2xl font-bold text-green-400">
          {modalRecord.traits?.prediction}
        </h2>

        <div className="mt-4">
          <h3 className="text-sm text-gray-300 mb-1">Suggestions:</h3>
          <ul className="list-disc ml-6 space-y-1 text-gray-200">
            {suggestionsToShow.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        {modalRecord.traits.comment && (
          <div className="mt-4 bg-white/5 p-3 rounded-lg border border-white/10">
            <div className="text-sm text-green-300 font-bold mb-1">
              Your Comment:
            </div>
            <div className="text-gray-200 text-sm">
              {modalRecord.traits.comment}
            </div>
          </div>
        )}

        <textarea
          value={commentDraft}
          onChange={(e) => setCommentDraft(e.target.value)}
          className="w-full bg-black/50 border border-white/10 p-2 rounded-lg text-sm mt-4"
          placeholder="Update your comment!..."
        />

        <button
          onClick={saveComment}
          className="mt-3 w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold"
        >
          Save Comment
        </button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
}
