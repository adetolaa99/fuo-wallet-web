import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axiosInstance from "../config/axiosConfig";
import { Loader, Mail, ArrowLeft } from "lucide-react";
import { API_URL } from "../config/api";
import "./AuthPages.css";

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
});

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleForgotPassword = async (values) => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axiosInstance.post(
        `${API_URL}/users/send-reset-password-email`,
        values
      );

      setMessage(response.data.message || "Reset email sent successfully!");
      //Redirect to sign in
      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    } catch (error) {
      console.error("Forgot Password Error:", error);
      setError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Forgot Password?</h1>
          <p className="auth-subtitle">
            Enter your email address and we'll send you a link to reset your
            password
          </p>
        </div>

        <Formik
          initialValues={{ email: "" }}
          validationSchema={ForgotPasswordSchema}
          onSubmit={handleForgotPassword}
        >
          {() => (
            <Form className="auth-form">
              <div className="form-group">
                <Field
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="form-input"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="error-message"
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              {message && (
                <div
                  style={{
                    color: "#38a169",
                    backgroundColor: "#f0fff4",
                    border: "1px solid #c6f6d5",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                    textAlign: "center",
                  }}
                >
                  {message}
                </div>
              )}

              <button type="submit" disabled={loading} className="auth-button">
                {loading ? (
                  <>
                    <Loader className="spinner" size={20} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={20} />
                    Send Reset Email
                  </>
                )}
              </button>
            </Form>
          )}
        </Formik>

        <div className="auth-links">
          <Link to="/signin" className="auth-link">
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
