import axios from "axios";

// Base API URL with fallback to local development server
const rawBaseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor to attach JWT auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors (such as 401 session expiry)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired credentials
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_email");
      window.dispatchEvent(new Event("auth-expired"));
    }

    const message =
      error.response?.data?.detail ||
      error.message ||
      "An unexpected network error occurred.";
    return Promise.reject(new Error(message));
  }
);

export const api = {
  // Authentication
  async register(name, email, password) {
    const response = await apiClient.post("/api/register", {
      name,
      email,
      password,
    });
    return response.data;
  },

  async login(email, password) {
    const response = await apiClient.post("/api/login", {
      email,
      password,
    });
    return response.data;
  },

  async getMe() {
    const response = await apiClient.get("/api/me");
    return response.data;
  },

  // Dashboard & Overview
  async getDashboard() {
    const response = await apiClient.get("/api/dashboard");
    return response.data;
  },

  // Transactions CRUD
  async getTransactions() {
    const response = await apiClient.get("/api/transactions");
    return response.data;
  },

  async createTransaction(transactionData) {
    const response = await apiClient.post("/api/transactions", transactionData);
    return response.data;
  },

  async updateTransaction(id, transactionData) {
    const response = await apiClient.put(
      `/api/transactions/${id}`,
      transactionData
    );
    return response.data;
  },

  async deleteTransaction(id) {
    const response = await apiClient.delete(`/api/transactions/${id}`);
    return response.data;
  },

  // Budgets CRUD
  async getBudgets() {
    const response = await apiClient.get("/api/budgets");
    return response.data;
  },

  async createBudget(budgetData) {
    const response = await apiClient.post("/api/budgets", budgetData);
    return response.data;
  },

  async deleteBudget(id) {
    const response = await apiClient.delete(`/api/budgets/${id}`);
    return response.data;
  },

  // Analytics & ML Services
  async getAnalytics() {
    const response = await apiClient.get("/api/analytics");
    return response.data;
  },

  async getPrediction() {
    const response = await apiClient.get("/api/prediction");
    return response.data;
  },

  async getInsights() {
    const response = await apiClient.get("/api/insights");
    return response.data;
  },

  // AI Chatbot
  async sendChatMessage(message) {
    const response = await apiClient.post("/api/chat", { message });
    return response.data;
  },
};

export default api;
