import React from "react";
import { Navigate } from "react-router-dom";

const AuthRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (token) return <Navigate to="/welcome" replace />;

  return children;
};

export default AuthRoute;
