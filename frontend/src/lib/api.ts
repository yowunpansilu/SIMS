import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 10000,
});

// Response interceptor — redirect to /login on 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear any stored auth state
            try { localStorage.removeItem("sims_user"); } catch {}

            const isFile = typeof window !== "undefined" && window.location.protocol === "file:";
            const onLoginAlready = isFile
                ? window.location.hash === "#/login"
                : window.location.pathname === "/login";

            if (!onLoginAlready) {
                if (isFile) {
                    window.location.hash = "#/login";
                } else {
                    window.location.href = "/login";
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
