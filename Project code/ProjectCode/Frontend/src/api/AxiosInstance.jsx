import axios from "axios"

const axiosInstance=axios.create({
    baseURL:import.meta.env.VITE_SERVER_URL,
    withCredentials:true
})
axiosInstance.interceptors.request.use((config)=>{
    const token=localStorage.getItem("jwtToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
},
(error) => {
    return Promise.reject(error);
});
export default axiosInstance;