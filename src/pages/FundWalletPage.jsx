import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Loader, CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import axiosInstance from "../config/axiosConfig";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/api";

const FundWalletSchema = Yup.object().shape({
  amount: Yup.number()
    .min(1, "Amount must be at least ₦1")
    .max(1000000, "Amount cannot exceed ₦1,000,000")
    .required("Amount is required"),
});

const FundWalletPage = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFundWallet = async (values, { resetForm }) => {
    if (!token) {
      setError("No authentication token found");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axiosInstance.post(
        `${API_URL}/paystack/create-payment-intent`,
        {
          amount: values.amount,
        }
      );

      console.log("Payment Intent Response:", response.data);

      if (response.data?.data?.authorization_url) {
        setPaymentUrl(response.data.data.authorization_url);

        // Open payment URL in new window
        const paymentWindow = window.open(
          response.data.data.authorization_url,
          "paystack-payment",
          "width=600,height=700,scrollbars=yes,resizable=yes"
        );

        // Monitor for when the payment window closes
        const checkClosed = setInterval(() => {
          if (paymentWindow.closed) {
            clearInterval(checkClosed);
            setPaymentUrl("");
            setSuccess(
              `Payment completed! Your balance should be updated shortly`
            );
            resetForm();
          }
        }, 1000);
      } else {
        setError("Failed to create payment intent");
      }
    } catch (error) {
      console.error("Funding Error:", error);
      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">Fund Wallet</h1>
        <div className="page-subtitle">
          <div style={{ marginBottom: "1rem" }}>
            <strong>NOTE: 1 FUC = 1 NAIRA</strong>
          </div>
          <p>
            Enter the amount of tokens you wish to purchase and proceed to
            payment.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      <div className="form-container">
        <Formik
          initialValues={{ amount: "" }}
          validationSchema={FundWalletSchema}
          onSubmit={handleFundWallet}
        >
          {({ values }) => (
            <Form>
              <div className="form-group">
                <label
                  htmlFor="amount"
                  style={{
                    fontWeight: "bold",
                    marginBottom: "0.5rem",
                    display: "block",
                  }}
                >
                  Amount (₦)
                </label>
                <Field
                  name="amount"
                  type="number"
                  placeholder="Enter amount"
                  className="form-input"
                  min="1"
                  max="1000000"
                  step="0.01"
                />
                <ErrorMessage
                  name="amount"
                  component="div"
                  className="error-message"
                />

                {values.amount && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      color: "#006400",
                      fontSize: "0.9rem",
                    }}
                  >
                    You will receive:{" "}
                    {parseFloat(values.amount || 0).toLocaleString()} FUC tokens
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "1rem" }}
              >
                {loading ? (
                  <>
                    <Loader className="spinner" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Fund Wallet
                  </>
                )}
              </button>
            </Form>
          )}
        </Formik>

        {paymentUrl && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "#f8f9fa",
              borderRadius: "8px",
            }}
          >
            <p>
              <strong>Payment window opened.</strong> Complete your payment and
              close the window.
            </p>
            <p>
              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="auth-link"
              >
                Click here if payment window didn't open
              </a>
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .alert-error {
          background: #fee;
          color: #c53030;
          border: 1px solid #fed7d7;
        }

        .alert-success {
          background: #f0fff4;
          color: #38a169;
          border: 1px solid #c6f6d5;
        }
      `}</style>
    </div>
  );
};

export default FundWalletPage;
