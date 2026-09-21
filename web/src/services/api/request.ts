import axios from "axios";
import { useAuthStore } from "@/stores/use-auth-store";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

const apiClient = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
    headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export default apiClient;
