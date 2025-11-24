import axios from 'axios';

// Create axios instance with centralized configuration
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    withCredentials: true, // Always send cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Optional: Add request interceptor for logging in development
if (import.meta.env.DEV) {
    apiClient.interceptors.request.use(
        (config) => {
            console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        },
        (error) => {
            console.error('❌ Request Error:', error);
            return Promise.reject(error);
        }
    );

    apiClient.interceptors.response.use(
        (response) => {
            console.log(`🟢 API Response: ${response.config.url}`, response.status);
            return response;
        },
        (error) => {
            console.error('❌ Response Error:', error.response?.status, error.config?.url);
            return Promise.reject(error);
        }
    );
}

export default apiClient;
