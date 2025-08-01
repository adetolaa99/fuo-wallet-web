import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Loader, Send, AlertCircle, CheckCircle } from "lucide-react";
import axiosInstance from "../config/axiosConfig";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/api";

const TransferSchema = Yup.object().shape({
  receiverPublicKey: Yup.string()
    .required("Receiver's public key is required")
    .min(56, "Invalid public key length")
    .max(56, "Invalid public key length"),
  amount: Yup.number()
    .min(0.0000001, "Amount must be greater than 0")
    .max(1000000, "Amount cannot exceed 1,000,000")
    .required("Amount is required"),
});

const TransferPage = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleTransfer = async (values, { resetForm }) => {
    if (!token) {
      setError("No authentication token found");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axiosInstance.post(`${API_URL}/stellar/transfer`, {
        receiverPublicKey: values.receiverPublicKey,
        amount: values.amount,
      });

      console.log("Transfer response:", response.data);
      setSuccess(`Successfully transferred ${values.amount} FUC tokens!`);
      resetForm();
    } catch (error) {
      console.error("Transfer error:", error);

      let errorMessage = "Something went wrong";

      if (error.response) {
        if (error.response.status === 400) {
          if (error.response.data === "The receiver account does not exist!") {
            errorMessage =
              "The receiver's public key is invalid! Please check and try again.";
          } else if (typeof error.response.data === "string") {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else {
          errorMessage = error.response.data?.message || "Transfer failed";
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">Transfer Tokens</h1>
        <p className="page-subtitle">
          Transfer <span className="highlight">FUC</span> tokens to another user
          by entering the receiver's public key and the amount of tokens you
          wish to transfer.
        </p>
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
          initialValues={{ receiverPublicKey: "", amount: "" }}
          validationSchema={TransferSchema}
          onSubmit={handleTransfer}
        >
          {({ values }) => (
            <Form>
              <div className="form-group">
                <label
                  htmlFor="receiverPublicKey"
                  style={{
                    fontWeight: "bold",
                    marginBottom: "0.5rem",
                    display: "block",
                  }}
                >
                  Receiver's Public Key
                </label>
                <Field
                  name="receiverPublicKey"
                  type="text"
                  placeholder="Enter receiver's public key (56 characters)"
                  className="form-input"
                  style={{ fontFamily: "monospace", fontSize: "0.9rem" }}
                />
                <ErrorMessage
                  name="receiverPublicKey"
                  component="div"
                  className="error-message"
                />
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#6c757d",
                    marginTop: "0.25rem",
                  }}
                >
                  Public keys start with 'G' and are exactly 56 characters long
                </div>
              </div>

              <div className="form-group">
                <label
                  htmlFor="amount"
                  style={{
                    fontWeight: "bold",
                    marginBottom: "0.5rem",
                    display: "block",
                  }}
                >
                  Amount (FUC)
                </label>
                <Field
                  name="amount"
                  type="number"
                  placeholder="Enter amount to transfer"
                  className="form-input"
                  min="0.0000001"
                  max="1000000"
                  step="0.0000001"
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
                    Transferring:{" "}
                    {parseFloat(values.amount || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 7,
                    })}{" "}
                    FUC
                  </div>
                )}
              </div>

              <div
                style={{
                  background: "#fff3cd",
                  border: "1px solid #ffeaa7",
                  borderRadius: "8px",
                  padding: "1rem",
                  marginBottom: "1rem",
                  color: "#856404",
                }}
              >
                <strong>⚠️ Important:</strong>
                <ul style={{ margin: "0.5rem 0 0 1rem", paddingLeft: "1rem" }}>
                  <li>
                    Double-check the receiver's public key before transferring
                  </li>
                  <li>Transactions cannot be reversed once confirmed</li>
                  <li>A small amount of XLM will be used as transaction fee</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: "100%" }}
              >
                {loading ? (
                  <>
                    <Loader className="spinner" size={20} />
                    Processing Transfer...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Transfer FUC
                  </>
                )}
              </button>
            </Form>
          )}
        </Formik>
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

export default TransferPage;
