import axios, { AxiosError } from "axios";
import { toast } from "sonner";

// A more Vercel-like toast for errors
const showErrorToast = (message: string) => {
    toast.error(message, {
        style: {
            borderLeft: "4px solid #f00",
            color: "#000",
            backgroundColor: "#fff",
        },
        className: 'vercel-error-toast',
    });
};


const api = axios.create({
    baseURL: "http://localhost:5000/api/v1",
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("admin-token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // This logic handles API errors for an already authenticated session.
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            if (window.location.pathname !== '/') {
                localStorage.removeItem("admin-token");
                window.location.href = "/";
                showErrorToast("Сессия истекла. Пожалуйста, войдите снова.");
            }
        }

        const data: any = error.response?.data;
        const errorMessage = data?.message || "Произошла непредвиденная ошибка";
        showErrorToast(errorMessage);

        return Promise.reject(error);
    }
);

export default api;

