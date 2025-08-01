import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axiosInstance from "../config/axiosConfig";
import { Loader, Lock, Eye, EyeOff } from "lucide-react";
import { API_URL } from "../config/api";
import "./AuthPages.css";

const ResetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters!")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Please confirm your password"),
});

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token");
    }
  }, [token]);

  const handleResetPassword = async (values) => {
    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post(`${API_URL}/users/reset-password`, {
        token,
        newPassword: values.newPassword,
      });

      alert(response.data.message || "Password reset successful!");
      navigate("/signin");
    } catch (error) {
      console.error("Reset Password Error:", error);
      setError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Invalid Link</h1>
            <p className="auth-subtitle">
              This password reset link is invalid or has expired.
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => navigate("/forgot-password")}
              className="auth-button"
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Enter your new password below</p>
        </div>

        <Formik
          initialValues={{ newPassword: "", confirmPassword: "" }}
          validationSchema={ResetPasswordSchema}
          onSubmit={handleResetPassword}
        >
          {() => (
            <Form className="auth-form">
              <div className="form-group">
                <div className="password-input-container">
                  <Field
                    name="newPassword"
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Enter new password"
                    className="form-input password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="password-toggle"
                  >
                    {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <ErrorMessage
                  name="newPassword"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-group">
                <div className="password-input-container">
                  <Field
                    name="confirmPassword"
                    type={confirmPasswordVisible ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="form-input password-input"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmPasswordVisible(!confirmPasswordVisible)
                    }
                    className="password-toggle"
                  >
                    {confirmPasswordVisible ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="error-message"
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" disabled={loading} className="auth-button">
                {loading ? (
                  <>
                    <Loader className="spinner" size={20} />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    Reset Password
                  </>
                )}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
