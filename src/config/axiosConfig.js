import axios from "axios";
import { jwtDecode } from "jwt-decode";

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp <= currentTime) {
          // Token is expired
          localStorage.removeItem("authToken");
          localStorage.removeItem("profile");
          window.location.href = "/signin";
          return Promise.reject(new Error("Token expired"));
        }

        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        // Invalid token
        localStorage.removeItem("authToken");
        localStorage.removeItem("profile");
        window.location.href = "/signin";
        return Promise.reject(new Error("Invalid token"));
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token is invalid or expired
      localStorage.removeItem("authToken");
      localStorage.removeItem("profile");
      window.location.href = "/signin";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
