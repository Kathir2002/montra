import HttpRoutingService from '@services/httpRoutingService';
import CommonDataService from '@shared/commonDataServices';
import axios from 'axios';
import {config} from '../../environment';

class contactSupportService {
  async addContactSupport(data: any) {
    const token = await CommonDataService.getToken();
    if (token) {
      return await new Promise(async (resolve, reject) => {
        try {
          const response = await axios.post(
            config.apiUrldb + 'api/contact-support/add',

            data,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
              },
            },
          );
          resolve(response.data);
        } catch (err) {
          reject(err);
        }
      });
    }
  }
  async getSupportList(data?: any) {
    return HttpRoutingService.getMethod('api/contact-support/get-list', data);
  }
  async getSupportDetails(data: any) {
    return HttpRoutingService.getMethod(
      'api/contact-support/get-details',
      data,
    );
  }
  async getChatDetails(data: any) {
    return HttpRoutingService.getMethod('api/contact-support/chat', data);
  }
  async addReply(data: any) {
    return HttpRoutingService.postMethod('api/contact-support/add-reply', data);
  }
  async updateStatus(data: any) {
    return HttpRoutingService.postMethod(
      'api/contact-support/update-request-status',
      data,
    );
  }
}
const ContactService = new contactSupportService();
export default ContactService;
