// import promise from 'promise';
// import axios from 'axios';
// import axiosRetry from 'axios-retry';
// import CommonDataService from '@shared/commonDataServices';
// import { config } from '../../environment';
// import NetInfo from '@react-native-community/netinfo';

// const axiosInstance = axios.create({
//   baseURL: config.apiUrldb,
//   timeout: 10000,
// });
// // Configure automatic retry for failed requests
// axiosRetry(axiosInstance, {
//   retries: 3, // Number of retry attempts
//   retryDelay: (retryCount) => {
//     // Exponential backoff: 1s, 2s, 4s
//     return retryCount * 1000;
//   },
//   retryCondition: (error) => {
//     // Retry on network errors or 5xx server errors
//     return (
//       axiosRetry.isNetworkOrIdempotentRequestError(error) ||
//       (error.response?.status >= 500 && error.response?.status <= 599)
//     );
//   },
//   onRetry: (retryCount, error, requestConfig) => {
//     console.log(`Retry attempt ${retryCount} for ${requestConfig.url}`);
//   },
// });

// axiosInstance.interceptors.request.use(
//   async function (config) {
//     const netInfo = await NetInfo.fetch();

//     if (!netInfo.isConnected) {
//       return Promise.reject({
//         message: 'No internet connection',
//         isNetworkError: true,
//       });
//     }
//     const token = await CommonDataService.getToken();

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     config.headers['Access-Control-Allow-Origin'] = '*';
//     config.headers['Content-Type'] = 'application/json';
//     return config;
//   },
//   function (error) {
//     return promise.reject(error);
//   },
// );

// axiosInstance.interceptors.response.use(
//   function (response) {
//     return response.data;
//   },
//   async function (error) {
//     if (error) {
//       if (error?.response?.status == 401) {
//         return promise.reject({ code: 401 });
//       }
//     }
//     if (error?.isNetworkError) {
//       // Handle offline error
//       console.log('Network error:', error?.message);
//     } else if (error?.code === 'ECONNABORTED') {
//       // Handle timeout
//       console.log('Request timeout');
//     }

//     return promise.reject(error);
//   },
// );

// export default axiosInstance;


import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';
import CommonDataService from '@shared/commonDataServices';
import { config } from '../../environment';
import NetInfo from '@react-native-community/netinfo';
import { EventEmitter } from 'events';

// Event emitter for network status
export const networkEventEmitter = new EventEmitter();

const axiosInstance = axios.create({
  baseURL: config.apiUrldb,
  timeout: 10000,
});

// Store failed requests for manual retry - FIXED: Store actual promise handlers
let failedRequestsQueue: Array<{
  config: InternalAxiosRequestConfig;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];

// Configure automatic retry for failed requests
axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: (retryCount) => {
    console.log(`Retrying... attempt ${retryCount}`);
    networkEventEmitter.emit('retrying', { attempt: retryCount, total: 3 });
    return retryCount * 1000;
  },
  retryCondition: (error: AxiosError) => {
    // Don't retry if it's a network error (offline)
    if (error.code === 'ERR_NETWORK' || error.message === 'No internet connection') {
      return false;
    }

    // Retry on 5xx server errors and timeout
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response?.status >= 500 && error.response?.status <= 599) ||
      error.code === 'ECONNABORTED'
    );
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  async function (config: InternalAxiosRequestConfig) {
    const netInfo = await NetInfo.fetch();

    if (!netInfo.isConnected) {
      networkEventEmitter.emit('offline');

      return Promise.reject({
        message: 'No internet connection',
        isNetworkError: true,
        code: 'ERR_NETWORK',
        config,
      });
    }

    const token = await CommonDataService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Access-Control-Allow-Origin'] = '*';
    config.headers['Content-Type'] = 'application/json';

    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  function (response) {
    networkEventEmitter.emit('online');
    return response.data;
  },
  async function (error: AxiosError) {
    // Handle 401 Unauthorized
    if (error?.response?.status === 401) {
      networkEventEmitter.emit('unauthorized');
      return Promise.reject({ code: 401, message: 'Unauthorized' });
    }

    // Handle network errors (offline) - FIXED: Return promise with actual handlers
    if (error?.code === 'ERR_NETWORK' || (error as any)?.isNetworkError) {
      console.log('Network error detected, queuing request');
      networkEventEmitter.emit('offline');

      const originalRequest = error.config;
      if (originalRequest) {
        // Return a NEW promise that will be resolved/rejected when we retry
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            config: originalRequest,
            resolve,
            reject,
          });
        });
      }
    }

    // Handle timeout
    if (error?.code === 'ECONNABORTED') {
      console.log('Request timeout');
      networkEventEmitter.emit('timeout');
    }

    return Promise.reject(error);
  },
);

// Function to retry all failed requests manually
export const retryFailedRequests = async () => {
  const netInfo = await NetInfo.fetch();

  if (!netInfo.isConnected) {
    console.log('Still offline, cannot retry');
    return false;
  }

  const queueLength = failedRequestsQueue.length;
  console.log(`Retrying ${queueLength} failed requests`);

  if (queueLength === 0) {
    return true;
  }

  networkEventEmitter.emit('retrying_manual', { count: queueLength });

  // FIXED: Process queue properly
  const requests = [...failedRequestsQueue];
  failedRequestsQueue = []; // Clear queue immediately

  // Process all requests
  const retryPromises = requests.map(async ({ config, resolve, reject }) => {
    try {
      const response = await axiosInstance.request(config);
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });

  await Promise.allSettled(retryPromises);
  return true;
};

// Function to clear failed requests queue
export const clearFailedRequests = () => {
  failedRequestsQueue = [];
};

// Function to get count of failed requests
export const getFailedRequestsCount = () => {
  return failedRequestsQueue.length;
};

export default axiosInstance;