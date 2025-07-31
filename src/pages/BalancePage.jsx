import React, { useState, useEffect } from "react";
import { Loader, RefreshCw, Wallet, DollarSign } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/api";

const BalancePage = () => {
  const { token, profile } = useAuth();
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Mapping asset types to their display info
  const assetTypeInfo = {
    credit_alphanum4: { name: "FUC", icon: DollarSign, color: "#006400" },
    native: { name: "XLM", icon: Wallet, color: "#7c4dff" },
  };

  const fetchBalances = async () => {
    if (!profile?.stellarPublicKey) {
      setError("Public key not found. Please ensure you are logged in.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/stellar/check-balance/${profile.stellarPublicKey}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBalances(response.data.balances || []);
      setError(null);
    } catch (error) {
      console.error("Balance fetch error:", error);
      setError(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to fetch balances"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBalances();
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
          <h1 className="page-title">Wallet Balance</h1>
          <p className="page-subtitle">
            The balance of your <span className="highlight">FUC</span> tokens
            and Stellar <span className="highlight">XLM</span> is displayed
            below.
            <br />
            <span className="highlight">FUC</span> is used to transact while{" "}
            <span className="highlight">XLM</span> is used to handle the gas fee
            on each transaction.
          </p>
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
      ) : balances.length > 0 ? (
        <div className="balances-grid">
          {balances.map((balance, index) => {
            const assetInfo = assetTypeInfo[balance.asset_type] || {
              name: balance.asset_type,
              icon: Wallet,
              color: "#6c757d",
            };
            const IconComponent = assetInfo.icon;

            return (
              <div key={index} className="balance-card">
                <div className="balance-header">
                  <div
                    className="balance-icon"
                    style={{
                      backgroundColor: `${assetInfo.color}20`,
                      color: assetInfo.color,
                    }}
                  >
                    <IconComponent size={24} />
                  </div>
                  <div className="balance-info">
                    <h3 className="balance-asset-name">{assetInfo.name}</h3>
                    <p className="balance-asset-type">{balance.asset_type}</p>
                  </div>
                </div>
                <div className="balance-amount">
                  {parseFloat(balance.balance).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 7,
                  })}
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
            <Wallet size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
            <p>No balances found</p>
            <button onClick={handleRefresh} className="btn btn-primary">
              <RefreshCw size={16} />
              Refresh Balances
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .balances-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .balance-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .balance-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .balance-header {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }

        .balance-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
        }

        .balance-info {
          flex: 1;
        }

        .balance-asset-name {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0 0 0.25rem 0;
          color: #333;
        }

        .balance-asset-type {
          font-size: 0.875rem;
          color: #6c757d;
          margin: 0;
          text-transform: capitalize;
        }

        .balance-amount {
          font-size: 2rem;
          font-weight: bold;
          color: #006400;
          text-align: right;
        }

        @media (max-width: 768px) {
          .balances-grid {
            grid-template-columns: 1fr;
          }

          .balance-amount {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default BalancePage;
