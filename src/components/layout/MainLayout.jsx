import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { User, Wallet, CreditCard, Send, History, LogOut } from "lucide-react";
import "./MainLayout.css";

const MainLayout = () => {
  const { logout, profile } = useAuth();

  const handleLogout = () => {
    logout();
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
          <h1 className="logo">FUO Wallet</h1>
          <div className="user-info">
            <span>Welcome, {profile?.firstName || "User"}</span>
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="main-container">
        <nav className="sidebar">
          <ul className="nav-list">
            {navItems.map(({ path, icon: Icon, label }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
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
