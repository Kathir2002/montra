import axiosInstance from './interceptor';
import {config} from '../../environment';

class httpRoutingService {
  /** Get method Function which is used for get method */
  getMethod<T>(url: string, queryParams?: any) {
    // console.log('Inside get method', url);
    url = url?.replace(/#/g, '%23');
    return axiosInstance.get<T>(config.apiUrldb + url, {
      params: queryParams,
    });
  }
  /** Post method Function which is used for post method */
  postMethod<T>(url: string, data: any, queryParams: boolean = false) {
    // console.log('inside post method', url, data);
    return axiosInstance.post<T>(config.apiUrldb + url, data, {
      params: queryParams,
    });
  }
}
const HttpRoutingService = new httpRoutingService();
export default HttpRoutingService;
