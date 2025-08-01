import React, { useEffect, useState } from "react";
import { Copy, Eye, EyeOff, Loader, RefreshCw } from "lucide-react";
import axiosInstance from "../config/axiosConfig";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/api";

const ProfilePage = () => {
  const { token, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [secretKeyVisible, setSecretKeyVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/users/profile`);
      setProfile(response.data);
      setError(null);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProfile();
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

  if (loading) {
    return (
      <div className="loading-container">
        <Loader className="spinner" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
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
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">
            View your account details and wallet information
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

      <div
        className="card"
        style={{
          marginBottom: "1rem",
          padding: "1rem",
          backgroundColor: "#fff3cd",
          border: "1px solid #ffeaa7",
          borderRadius: "8px",
        }}
      >
        <div
          style={{ color: "#856404", fontWeight: "bold", textAlign: "center" }}
        >
          ⚠️ WARNING: Keep your Secret Key safe. Anyone with access to your
          secret key can steal your funds!
        </div>
      </div>

      <div className="form-container">
        <div className="form-row">
          <div className="form-group">
            <label
              style={{
                fontWeight: "bold",
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              First Name
            </label>
            <div className="profile-field">{profile?.firstName || "N/A"}</div>
          </div>

          <div className="form-group">
            <label
              style={{
                fontWeight: "bold",
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Last Name
            </label>
            <div className="profile-field">{profile?.lastName || "N/A"}</div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label
              style={{
                fontWeight: "bold",
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Username
            </label>
            <div className="profile-field">{profile?.username || "N/A"}</div>
          </div>

          <div className="form-group">
            <label
              style={{
                fontWeight: "bold",
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Email
            </label>
            <div className="profile-field">{profile?.email || "N/A"}</div>
          </div>
        </div>

        <div className="form-group">
          <label
            style={{
              fontWeight: "bold",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Public Key
          </label>
          <div className="key-field">
            <div className="key-text">{profile?.stellarPublicKey || "N/A"}</div>
            <button
              onClick={() =>
                copyToClipboard(profile?.stellarPublicKey, "Public Key")
              }
              className="key-action-btn"
              title="Copy Public Key"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        <div className="form-group">
          <label
            style={{
              fontWeight: "bold",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Secret Key
          </label>
          <div className="key-field">
            <div className="key-text">
              {secretKeyVisible
                ? profile?.stellarSecretKey || "N/A"
                : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setSecretKeyVisible(!secretKeyVisible)}
                className="key-action-btn"
                title={secretKeyVisible ? "Hide Secret Key" : "Show Secret Key"}
              >
                {secretKeyVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {secretKeyVisible && (
                <button
                  onClick={() =>
                    copyToClipboard(profile?.stellarSecretKey, "Secret Key")
                  }
                  className="key-action-btn"
                  title="Copy Secret Key"
                >
                  <Copy size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-field {
          padding: 0.75rem;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          color: #495057;
        }

        .key-field {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 6px;
        }

        .key-text {
          flex: 1;
          font-family: "Courier New", monospace;
          font-size: 0.9rem;
          word-break: break-all;
          color: #495057;
        }

        .key-action-btn {
          background: #006400;
          color: white;
          border: none;
          padding: 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .key-action-btn:hover {
          background: #005000;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
