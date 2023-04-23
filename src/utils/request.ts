import axios from 'axios'
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

// 封装axios实例创建函数
const createRequest = (
  host: string,
  { headers, data, params }: { headers?: Record<string, string>, data?: Record<string, any>, params?: Record<string, any> }
) => {
  // 创建axios实例
  const instance = axios.create({
    baseURL: host,
    timeout: 5000
  });

  // 请求拦截器
  instance.interceptors.request.use(
    function (config: InternalAxiosRequestConfig) {
      params && (config.params = { ...params, ...config.params });
      headers && (config.headers.set(headers));
      data && (config.data = { ...data, ...config.data })
      return config
    },
    function (error: AxiosError) {
      return Promise.reject(error)
    }
  );

  // 相应拦截器
  instance.interceptors.response.use(
    function (response: AxiosResponse) {
      return response;
    },
    function (error: AxiosError) {
      return Promise.reject(error)
    }
  );

  return instance;

}
export default createRequest;