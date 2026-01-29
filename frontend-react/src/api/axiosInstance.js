import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api", // URL Backend Spring Boot/NodeJS của bạn
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: Tự động đính kèm Token vào mọi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Refresh token logic
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
      isRefreshing = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const res = await axiosInstance.post("/auth/refresh-token", {
          refreshToken,
        });
        localStorage.setItem("accessToken", res.data.accessToken);
        processQueue(null, res.data.accessToken);
        originalRequest.headers["Authorization"] =
          "Bearer " + res.data.accessToken;
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
