// src/LanguageContext.js
import React, { createContext, useState, useContext, useEffect } from "react";

// =======================
//  TRAIT TRANSLATIONS
// =======================
export const traitTranslations = {
  CUDI_REPRO: { en: "Culm Diameter", te: "తాడు వ్యాసం", hi: "तना व्यास" },
  CULT_REPRO: { en: "Culm Length", te: "తాడు పొడవు", hi: "तना लंबाई" },
  CUNO_REPRO: { en: "Culm Node Count", te: "తాడు కండరాల సంఖ్య", hi: "तना ग्रंथियों की संख्या" },
  GRLT: { en: "Grain Length", te: "ధాన్యం పొడవు", hi: "दाना लंबाई" },
  GRWD: { en: "Grain Width", te: "ధాన్యం వెడల్పు", hi: "दाना चौड़ाई" },
  GRWT100: { en: "100-Grain Weight", te: "100 గింజల బరువు", hi: "100 दानों का वज़न" },
  HDG_80HEAD: { en: "Heading Days (80%)", te: "హెడ్డింగ్ రోజులు (80%)", hi: "फूल आने के दिन (80%)" },
  LIGLT: { en: "Ligule Length", te: "లిగ్యూల్ పొడవు", hi: "लिग्यूल लंबाई" },
  LLT: { en: "Leaf Length", te: "ఆకు పొడవు", hi: "पत्ती की लंबाई" },
  LWD: { en: "Leaf Width", te: "ఆకు వెడల్పు", hi: "पत्ती की चौड़ाई" },
  PLT_POST: { en: "Plant Height", te: "మొక్క ఎత్తు", hi: "पौधे की ऊँचाई" },
  SDHT: { en: "Seedling Height", te: "ముద్ద మొక్క ఎత్తు", hi: "नवांकुर ऊँचाई" },
};

// =======================
//      UI TRANSLATIONS
// =======================
export const translations = {
  // -----------------------------------
  //            ENGLISH
  // -----------------------------------
  en: {
    welcome: "Welcome back",
    operator: "Operator",
    systemStatus: "System Operational",
    serverStatus: "Server Status: Optimal",
    selectModule: "Select a module to begin genotype analysis or visualize trait predictions.",
    quickLaunch: "Quick Launch: Prediction",

    options: {
      trait: { title: "Trait Predictor", desc: "Run ML models on genotype data." },
      analytics: { title: "Analytics Core", desc: "Interactive visualization charts." },
      history: { title: "Data History", desc: "Archive of past predictions." }
    },

    // 🔥 HOME PAGE (NEW)
    home_title_1: "AI-Powered Genotype",
    home_title_2: "Trait Prediction Engine",
    home_subtitle:
      "Upload genotype data, run machine learning models, and retrieve high-accuracy phenotype trait predictions instantly.",
    home_cta_button: "Begin Analysis",

    home_what_title: "What This System Does",
    home_what_subtitle: "A powerful ML pipeline designed for agricultural genomics and trait prediction.",

    home_step1_title: "Upload Genotype Data",
    home_step1_desc: "Input SNP marker files or genotype CSVs to initiate trait prediction.",

    home_step2_title: "ML Trait Prediction",
    home_step2_desc: "Our optimized machine learning model processes your data and generates phenotype predictions.",

    home_step3_title: "Get Results Instantly",
    home_step3_desc: "View trait scores, confidence intervals, and statistical summaries.",

    home_cheat_title: "Genetics Jargon Buster",
    home_cheat_subtitle: "Quick explanations for common genomic terms used in trait prediction.",

    home_genotype_label: "GENOTYPE =",
    home_genotype_desc: "The genetic makeup (SNPs/markers) of a plant used as ML input.",

    home_phenotype_label: "PHENOTYPE =",
    home_phenotype_desc: "Observable traits such as height, yield, grain weight, etc.",

    home_snp_label: "SNP =",
    home_snp_desc: "A single nucleotide polymorphism — a single base variation in the genome.",

    home_data_to_result: "DATA INPUT → PREDICTED RESULT",

    home_ready: "Ready to see the unseen?",
    home_ready_cta: "Create your free account",
  },

  // -----------------------------------
  //             TELUGU
  // -----------------------------------
  te: {
    welcome: "తిరిగి స్వాగతం",
    operator: "ఆపరేటర్",
    systemStatus: "సిస్టమ్ పనిచేస్తోంది",
    serverStatus: "సర్వర్ స్థితి: ఉత్తమం",
    selectModule: "జెనోటైప్ విశ్లేషణ ప్రారంభించడానికి ఒక మాడ్యూల్‌ను ఎంచుకోండి.",
    quickLaunch: "త్వరిత ప్రారంభం: అంచనా",

    options: {
      trait: { title: "లక్షణ అంచనా", desc: "జెనోటైప్ డేటాపై ML మోడళ్లను అమలు చేయండి." },
      analytics: { title: "విశ్లేషణ కోర్", desc: "ఇంటరాక్టివ్ చార్ట్‌లు." },
      history: { title: "డేటా చరిత్ర", desc: "గత అంచనాల రికార్డ్." },
    },

    // 🔥 HOME PAGE (TELUGU)
    home_title_1: "AI ఆధారిత జెనోటైప్",
    home_title_2: "లక్షణ అంచనా ఇంజిన్",
    home_subtitle:
      "జెనోటైప్ డేటాను అప్‌లోడ్ చేసి, ML మోడళ్లను అమలు చేసి, ఫీనోటైప్ లక్షణాల ఖచ్చితమైన అంచనాలను వెంటనే పొందండి.",
    home_cta_button: "విశ్లేషణ ప్రారంభించండి",

    home_what_title: "ఈ సిస్టమ్ ఏం చేస్తుంది?",
    home_what_subtitle: "వ్యవసాయ జనోమిక్స్ కోసం శక్తివంతమైన ML పైప్లైన్.",

    home_step1_title: "జెనోటైప్ డేటాను అప్‌లోడ్ చేయండి",
    home_step1_desc: "SNP/మార్కర్ ఫైళ్లను లేదా CSVలను అప్‌లోడ్ చేసి అంచనా ప్రారంభించండి.",

    home_step2_title: "ML లక్షణ అంచనా",
    home_step2_desc: "మా ML మోడల్ మీ డేటాను ప్రాసెస్ చేసి ఫీనోటైప్ ఫలితాలను సృష్టిస్తుంది.",

    home_step3_title: "వెంటనే ఫలితాలు పొందండి",
    home_step3_desc: "లక్షణ విలువలు, కాన్ఫిడెన్స్ రేంజ్, గణాంక వివరాలు చూడండి.",

    home_cheat_title: "జెనెటిక్స్ సులభ పదకోశం",
    home_cheat_subtitle: "ట్రైట్ అంచనాలో వాడే పదాలకు సులభ అర్ధాలు.",

    home_genotype_label: "GENOTYPE =",
    home_genotype_desc: "మొక్కలోని జెనెటిక్ డేటా (SNPలు) — MLకి ఇన్‌పుట్ డేటా.",

    home_phenotype_label: "PHENOTYPE =",
    home_phenotype_desc: "దృశ్య లక్షణాలు — ఎత్తు, దిగుబడి, గింజ బరువు మొదలైనవి.",

    home_snp_label: "SNP =",
    home_snp_desc: "జనోంలో ఒకే బేస్ మార్పు — Single Nucleotide Polymorphism.",

    home_data_to_result: "DATA INPUT → అంచనా ఫలితం",

    home_ready: "ప్రారంభించడానికి సిద్ధమా?",
    home_ready_cta: "మీ ఖాతాను సృష్టించండి",
  },

  // -----------------------------------
  //             HINDI
  // -----------------------------------
  hi: {
    welcome: "वापसी पर स्वागत है",
    operator: "ऑपरेटर",
    systemStatus: "सिस्टम सक्रिय है",
    serverStatus: "सर्वर स्थिति: इष्टतम",
    selectModule: "जीनोटाइप विश्लेषण शुरू करने के लिए एक मॉड्यूल चुनें।",
    quickLaunch: "त्वरित लॉन्च: पूर्वानुमान",

    options: {
      trait: { title: "लक्षण पूर्वानुमान", desc: "जीनोटाइप डेटा पर ML मॉडल चलाएँ।" },
      analytics: { title: "एनालिटिक्स कोर", desc: "इंटरैक्टिव चार्ट्स।" },
      history: { title: "डाटा इतिहास", desc: "पिछले पूर्वानुमानों का संग्रह।" },
    },

    // 🔥 HOME PAGE (HINDI)
    home_title_1: "AI आधारित जीनोटाइप",
    home_title_2: "लक्षण पूर्वानुमान इंजन",
    home_subtitle:
      "जीनोटाइप डेटा अपलोड करें और फीनोटाइप लक्षणों का हाई-एक्यूरेसी पूर्वानुमान तुरंत प्राप्त करें।",
    home_cta_button: "विश्लेषण शुरू करें",

    home_what_title: "यह सिस्टम क्या करता है?",
    home_what_subtitle: "कृषि जीनोमिक्स और लक्षण पूर्वानुमान के लिए एक शक्तिशाली ML पाइपलाइन।",

    home_step1_title: "जीनोटाइप डेटा अपलोड करें",
    home_step1_desc: "SNP/मार्कर फ़ाइलें या CSV अपलोड कर प्रक्रिया शुरू करें।",

    home_step2_title: "ML लक्षण पूर्वानुमान",
    home_step2_desc: "हमारा मॉडल डेटा को प्रोसेस कर फीनोटाइप परिणाम देता है।",

    home_step3_title: "तुरंत परिणाम पाएँ",
    home_step3_desc: "लक्षण स्कोर, विश्वसनीयता रेंज और सांख्यिकीय सार देखें।",

    home_cheat_title: "जेनेटिक्स शब्दावली",
    home_cheat_subtitle: "ट्रेट प्रेडिक्शन में उपयोग होने वाले महत्वपूर्ण शब्दों के सरल अर्थ।",

    home_genotype_label: "GENOTYPE =",
    home_genotype_desc: "पौधे की आनुवंशिक जानकारी (SNP/मार्कर) — ML इनपुट।",

    home_phenotype_label: "PHENOTYPE =",
    home_phenotype_desc: "दिखाई देने वाले लक्षण — ऊँचाई, उत्पादन, दाना वजन आदि।",

    home_snp_label: "SNP =",
    home_snp_desc: "जीनोम में एक बेस का परिवर्तन — Single Nucleotide Polymorphism।",

    home_data_to_result: "DATA INPUT → परिणाम",

    home_ready: "शुरू करने के लिए तैयार?",
    home_ready_cta: "अपना अकाउंट बनाएँ",
  },
};

// =======================
//      CONTEXT SETUP
// =======================
const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem("appLanguage") || "en");

  useEffect(() => {
    localStorage.setItem("appLanguage", language);
  }, [language]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

// Helper to translate trait keys dynamically
export const translateTrait = (traitKey, lang) =>
  traitTranslations[traitKey]?.[lang] || traitKey;
