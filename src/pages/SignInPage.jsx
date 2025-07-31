import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/api";
import "./AuthPages.css";
import fuoLogo from "../assets/fuo-logo.png";

const SignInSchema = Yup.object().shape({
  identifier: Yup.string().required("Username or email is required"),
  password: Yup.string().required("Password is required"),
});

const SignInPage = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (values) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post(`${API_URL}/users/login`, values);
      const { token, profile } = response.data;
      login(token, profile);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        setErrorMessage(error.response.data.message || "An error occurred.");
      } else if (error.request) {
        setErrorMessage("No response received from the server.");
      } else {
        setErrorMessage("Error setting up request.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img
            src={fuoLogo}
            alt="Fountain University Logo"
            className="auth-logo"
          />
          <h1 className="auth-title">Welcome Back!</h1>
          <p className="auth-subtitle">Sign in to your FUO Wallet</p>
        </div>

        <Formik
          initialValues={{ identifier: "", password: "" }}
          validationSchema={SignInSchema}
          onSubmit={handleSignIn}
        >
          {() => (
            <Form className="auth-form">
              <div className="form-group">
                <Field
                  name="identifier"
                  type="text"
                  placeholder="Username or Email"
                  className="form-input"
                />
                <ErrorMessage
                  name="identifier"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-group">
                <div className="password-input-container">
                  <Field
                    name="password"
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Password"
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
                  name="password"
                  component="div"
                  className="error-message"
                />
              </div>

              {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )}

              <button type="submit" disabled={loading} className="auth-button">
                {loading ? (
                  <>
                    <Loader className="spinner" size={20} />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </Form>
          )}
        </Formik>

        <div className="auth-links">
          <p>
            New here?{" "}
            <Link to="/signup" className="auth-link">
              Sign Up
            </Link>
          </p>
          <Link to="/forgot-password" className="auth-link">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
