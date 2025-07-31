import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../components/layout/MainLayout";
import SignInPage from "../pages/SignInPage";
import SignUpPage from "../pages/SignUpPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import ProfilePage from "../pages/ProfilePage";
import FundWalletPage from "../pages/FundWalletPage";
import BalancePage from "../pages/BalancePage";
import TransferPage from "../pages/TransferPage";
import TransactionPage from "../pages/TransactionPage";

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/signin"
        element={
          !isAuthenticated ? <SignInPage /> : <Navigate to="/dashboard" />
        }
      />
      <Route
        path="/signup"
        element={
          !isAuthenticated ? <SignUpPage /> : <Navigate to="/dashboard" />
        }
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={isAuthenticated ? <MainLayout /> : <Navigate to="/signin" />}
      >
        <Route index element={<Navigate to="/dashboard/profile" />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="fund-wallet" element={<FundWalletPage />} />
        <Route path="balance" element={<BalancePage />} />
        <Route path="transfer" element={<TransferPage />} />
        <Route path="transactions" element={<TransactionPage />} />
      </Route>

      {/* Default redirects */}
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/signin"} />}
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/signin"} />}
      />
    </Routes>
  );
};

export default AppRoutes;
