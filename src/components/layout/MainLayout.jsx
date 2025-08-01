import React, { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  User,
  Wallet,
  CreditCard,
  Send,
  History,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import "./MainLayout.css";

const MainLayout = () => {
  const { logout, profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const closeMobileMenu = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { path: "profile", icon: User, label: "Profile" },
    { path: "fund-wallet", icon: Wallet, label: "Fund Wallet" },
    { path: "balance", icon: CreditCard, label: "Balance" },
    { path: "transfer", icon: Send, label: "Transfer" },
    { path: "transactions", icon: History, label: "Transactions" },
  ];

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            {isMobile && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="mobile-menu-toggle"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
            <h1 className="logo">FUO Wallet</h1>
          </div>
          <div className="user-info">
            <span className="user-name">
              Welcome, {profile?.firstName || "User"}
            </span>
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={20} />
              <span className="logout-text">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="main-container">
        {/* Backdrop for mobile */}
        {isMobile && isMobileMenuOpen && (
          <div className="mobile-backdrop" onClick={closeMobileMenu} />
        )}

        <nav
          className={`sidebar ${isMobile ? "mobile-sidebar" : ""} ${
            isMobileMenuOpen ? "open" : ""
          }`}
        >
          <ul className="nav-list">
            {navItems.map(({ path, icon: Icon, label }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
