import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isTokenValid = (token) => {
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("profile");
    setToken(null);
    setProfile(null);
  };

  useEffect(() => {
    const initializeAuth = () => {
      const savedToken = localStorage.getItem("authToken");
      const savedProfile = localStorage.getItem("profile");

      if (savedToken && isTokenValid(savedToken)) {
        setToken(savedToken);
        if (savedProfile) {
          try {
            setProfile(JSON.parse(savedProfile));
          } catch (error) {
            console.error("Error parsing saved profile:", error);
            logout();
          }
        }
      } else {
        // When token is expired or invalid
        logout();
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Check token expiration periodically
  useEffect(() => {
    if (!token) return;

    const checkTokenExpiration = () => {
      if (!isTokenValid(token)) {
        console.log("Token expired, logging out...");
        logout();
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(interval);
  }, [token]);

  const login = (authToken, userProfile) => {
    if (isTokenValid(authToken)) {
      localStorage.setItem("authToken", authToken);
      localStorage.setItem("profile", JSON.stringify(userProfile));
      setToken(authToken);
      setProfile(userProfile);
    } else {
      console.error("Attempted to login with invalid token");
    }
  };

  const isAuthenticated = !!token && isTokenValid(token);

  const value = {
    token,
    profile,
    login,
    logout,
    isAuthenticated,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
