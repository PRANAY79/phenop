import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css"; 

// --- CONTEXT IMPORT ---
// This enables the language features across the whole app
import { LanguageProvider } from "./LanguageContext";

// --- COMPONENT IMPORTS ---
import Navbar from "./Components/Navbar";
import Home from "./Components/Home";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import Welcome from "./Components/Welcome";
import Verify from "./Components/Verify";
import TraitPredict from "./Components/TraitPredict";
import Visualize from "./Components/visualize"; 
import Charts from "./Components/Charts";

import ProtectedRoute from "./Components/ProtectedRoute";
import AuthRoute from "./Components/AuthRoute";
import PredictDisease from "./Components/PredictDisease";
import DiseaseHistory from "./Components/DiseaseHistory";

const App = () => {
  // --- STATE INITIALIZATION ---
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  return (
    // 1. Wrap the entire app in LanguageProvider
    <LanguageProvider>
      <BrowserRouter>
        <Navbar user={user} setUser={setUser} />
        <ToastContainer position="top-right" theme="dark" />

        <Routes>
          {/* === SMART HOME ROUTE === */}
          <Route 
            path="/" 
            element={
              localStorage.getItem("token") ? <Navigate to="/welcome" replace /> : <Home />
            } 
          />

          {/* === AUTH ROUTES === */}
          <Route
            path="/login"
            element={
              <AuthRoute>
                <Login setUser={setUser} />
              </AuthRoute>
            }
          />

          <Route
            path="/signup"
            element={
              <AuthRoute>
                <Signup />
              </AuthRoute>
            }
          />

          {/* === PROTECTED ROUTES === */}
          <Route
            path="/welcome"
            element={
              <ProtectedRoute>
                <Welcome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trait-predict"
            element={
              <ProtectedRoute>
                <TraitPredict />
              </ProtectedRoute>
            }
          />

          <Route
            path="/visualize"
            element={
              <ProtectedRoute>
                <Visualize username={user?.name} />
              </ProtectedRoute>
            }
          />
        
          <Route
            path="/charts"
            element={
              <ProtectedRoute>
                <Charts username={user?.name} />
              </ProtectedRoute>
            }
          />

          <Route path="/verify" element={<Verify />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route
  path="/predict-disease"
  element={
    <ProtectedRoute>
      <PredictDisease />
    </ProtectedRoute>    
  }/>
  <Route
  path="/disease-history"
  element={
    <ProtectedRoute>
      <DiseaseHistory />
    </ProtectedRoute>    
  }
/>

        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
};

export default App;