import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/',
    withCredentials: true,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;