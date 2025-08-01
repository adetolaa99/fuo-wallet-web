import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axiosInstance from "../config/axiosConfig";
import { Eye, EyeOff, Loader } from "lucide-react";
import { API_URL } from "../config/api";
import "./AuthPages.css";
import fuoLogo from "../assets/fuo-logo.png";

const SignUpSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters!")
    .required("Password is required"),
});

const SignUpPage = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (values) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axiosInstance.post(
        `${API_URL}/users/signup`,
        values
      );
      console.log(response.data);
      // Show success message and redirect to sign in
      alert("Account created successfully! Please sign in.");
      navigate("/signin");
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "You've already signed up! Please check your details and try again"
      );
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
          <h1 className="auth-title">Create Your Account</h1>
          <p className="auth-subtitle">Welcome to FUO Wallet</p>
        </div>

        <Formik
          initialValues={{
            username: "",
            email: "",
            firstName: "",
            lastName: "",
            password: "",
          }}
          validationSchema={SignUpSchema}
          onSubmit={handleSignUp}
        >
          {() => (
            <Form className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <Field
                    name="firstName"
                    type="text"
                    placeholder="First Name"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="firstName"
                    component="div"
                    className="error-message"
                  />
                </div>

                <div className="form-group">
                  <Field
                    name="lastName"
                    type="text"
                    placeholder="Last Name"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="lastName"
                    component="div"
                    className="error-message"
                  />
                </div>
              </div>

              <div className="form-group">
                <Field
                  name="username"
                  type="text"
                  placeholder="Username"
                  className="form-input"
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-group">
                <Field
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="form-input"
                />
                <ErrorMessage
                  name="email"
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
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </Form>
          )}
        </Formik>

        <div className="auth-links">
          <p>
            Already have an account?{" "}
            <Link to="/signin" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
