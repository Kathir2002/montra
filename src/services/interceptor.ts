import promise from 'promise';
import axios from 'axios';
import CommonDataService from '@shared/commonDataServices';

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
  async function (config) {
    const token = await CommonDataService.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Access-Control-Allow-Origin'] = '*';
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  function (error) {
    return promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  function (response) {
    return response.data;
  },
  async function (error) {
    if (error) {
      if (error?.response?.status == 401) {
        return promise.reject({code: 401});
      }
    }

    return promise.reject(error);
  },
);

export default axiosInstance;
