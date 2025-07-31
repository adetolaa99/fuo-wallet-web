import React, { useState, useEffect } from "react";
import {
  Loader,
  RefreshCw,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
} from "lucide-react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/api";

const TransactionPage = () => {
  const { token, profile } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      if (!userId) {
        throw new Error("User ID not found in token");
      }

      const response = await axios.get(
        `${API_URL}/stellar/transactions/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTransactions(response.data || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError(
        error.response?.data?.message ||
          "Failed to fetch transactions. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [token]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label} copied to clipboard!`);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        alert(`${label} copied to clipboard!`);
      } catch (err) {
        alert("Failed to copy to clipboard");
      }
      document.body.removeChild(textArea);
    }
  };

  const formatAddress = (address) => {
    if (!address) return "N/A";
    return `${address.substring(0, 8)}...${address.substring(
      address.length - 8
    )}`;
  };

  const getTransactionType = (transaction) => {
    if (!profile?.stellarPublicKey) return "unknown";
    return transaction.from === profile.stellarPublicKey ? "sent" : "received";
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader className="spinner" size={40} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 className="page-title">Transaction History</h1>
          <p className="page-subtitle">View all your FUC token transactions</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn btn-secondary"
        >
          <RefreshCw className={refreshing ? "spinner" : ""} size={16} />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="card">
          <div
            className="error-message"
            style={{ textAlign: "center", padding: "2rem" }}
          >
            <p>{error}</p>
            <button onClick={handleRefresh} className="btn btn-primary">
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        </div>
      ) : transactions.length > 0 ? (
        <div className="transactions-list">
          {transactions.map((transaction) => {
            const transactionType = getTransactionType(transaction);
            const isOutgoing = transactionType === "sent";

            return (
              <div key={transaction.transactionId} className="transaction-card">
                <div className="transaction-header">
                  <div
                    className={`transaction-icon ${
                      isOutgoing ? "outgoing" : "incoming"
                    }`}
                  >
                    {isOutgoing ? (
                      <ArrowUpRight size={20} />
                    ) : (
                      <ArrowDownLeft size={20} />
                    )}
                  </div>
                  <div className="transaction-info">
                    <h3 className="transaction-type">
                      {isOutgoing ? "Sent" : "Received"} {transaction.assetCode}
                    </h3>
                    <p className="transaction-date">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div
                    className={`transaction-amount ${
                      isOutgoing ? "outgoing" : "incoming"
                    }`}
                  >
                    {isOutgoing ? "-" : "+"}
                    {parseFloat(transaction.assetAmount).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 7,
                      }
                    )}{" "}
                    {transaction.assetCode}
                  </div>
                </div>

                <div className="transaction-details">
                  <div className="detail-row">
                    <span className="detail-label">From:</span>
                    <div className="detail-value">
                      <span>{formatAddress(transaction.from)}</span>
                      <button
                        onClick={() =>
                          copyToClipboard(transaction.from, "Sender address")
                        }
                        className="copy-btn"
                        title="Copy full address"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">To:</span>
                    <div className="detail-value">
                      <span>{formatAddress(transaction.to)}</span>
                      <button
                        onClick={() =>
                          copyToClipboard(transaction.to, "Receiver address")
                        }
                        className="copy-btn"
                        title="Copy full address"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Transaction ID:</span>
                    <div className="detail-value">
                      <span>
                        {formatAddress(transaction.stellarTransactionId)}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            transaction.stellarTransactionId,
                            "Transaction ID"
                          )
                        }
                        className="copy-btn"
                        title="Copy full transaction ID"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div
            style={{ textAlign: "center", padding: "2rem", color: "#6c757d" }}
          >
            <History size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
            <h3>No transactions found</h3>
            <p>
              Your transaction history will appear here once you start making
              transfers.
            </p>
            <button onClick={handleRefresh} className="btn btn-primary">
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .transaction-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .transaction-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .transaction-header {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }

        .transaction-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
        }

        .transaction-icon.outgoing {
          background: #fee2e2;
          color: #dc2626;
        }

        .transaction-icon.incoming {
          background: #dcfce7;
          color: #16a34a;
        }

        .transaction-info {
          flex: 1;
        }

        .transaction-type {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          color: #333;
        }

        .transaction-date {
          font-size: 0.875rem;
          color: #6c757d;
          margin: 0;
        }

        .transaction-amount {
          font-size: 1.25rem;
          font-weight: bold;
          text-align: right;
        }

        .transaction-amount.outgoing {
          color: #dc2626;
        }

        .transaction-amount.incoming {
          color: #16a34a;
        }

        .transaction-details {
          border-top: 1px solid #e5e7eb;
          padding-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .detail-label {
          font-weight: 500;
          color: #6c757d;
          min-width: 100px;
        }

        .detail-value {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: monospace;
          font-size: 0.9rem;
          color: #333;
        }

        .copy-btn {
          background: #f3f4f6;
          border: none;
          border-radius: 4px;
          padding: 0.25rem;
          cursor: pointer;
          color: #6c757d;
          transition: all 0.2s;
        }

        .copy-btn:hover {
          background: #e5e7eb;
          color: #006400;
        }

        @media (max-width: 768px) {
          .transaction-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .transaction-amount {
            text-align: left;
          }

          .detail-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .detail-value {
            word-break: break-all;
          }
        }
      `}</style>
    </div>
  );
};

export default TransactionPage;
