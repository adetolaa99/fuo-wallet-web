import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem("profile");
    return savedProfile ? JSON.parse(savedProfile) : null;
  });

  const login = (authToken, userProfile) => {
    localStorage.setItem("authToken", authToken);
    localStorage.setItem("profile", JSON.stringify(userProfile));
    setToken(authToken);
    setProfile(userProfile);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("profile");
    setToken(null);
    setProfile(null);
  };

  const isAuthenticated = !!token;

  const value = {
    token,
    profile,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
