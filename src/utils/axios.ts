import axios, { AxiosRequestConfig } from 'axios';
import { showApiLoader, hideApiLoader } from '../api/loader';

// const axiosServices = axios.create({ baseURL: import.meta.env.VITE_APP_API_URL || 'http://localhost:3006/' });
const axiosServices = axios.create({ baseURL: 'http://localhost:3006/' });

axiosServices.defaults.withCredentials = true;
axiosServices.defaults.headers.common['Content-Type'] = 'application/json';
axiosServices.defaults.headers.common['Accept'] = 'application/json';
// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

axiosServices.interceptors.request.use(
  async (config) => {
    try {
      showApiLoader();
    } catch {
      // ignore loader errors
    }
    const accessToken = localStorage.getItem('serviceToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    try {
      hideApiLoader();
    } catch {
      // ignore
    }
    return Promise.reject(error);
  }
);

axiosServices.interceptors.response.use(
  (response) => {
    try {
      hideApiLoader();
    } catch {
      // ignore
    }
    return response;
  },
  (error) => {
    try {
      hideApiLoader();
    } catch {
      // ignore
    }
    if (error?.response?.status === 401 && !window.location.href.includes('/login')) {
      console.error('Unauthorized access - redirecting to login', error);
    }
    return Promise.reject((error.response && error.response.data) || 'Wrong Services');
  }
);

export default axiosServices;

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.get(url, { ...config });

  return res.data;
};
