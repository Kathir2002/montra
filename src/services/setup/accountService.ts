import HttpRoutingService from '@services/httpRoutingService';
import CommonDataService from '@shared/commonDataServices';
import axios from 'axios';
import {config} from '../../../environment';

class accountService {
  addAccount(data: any) {
    return HttpRoutingService.postMethod(
      'api/account/add-new-bank-account',
      data,
    );
  }
  updateAccount(data: any) {
    return HttpRoutingService.postMethod(
      'api/account/update-bank-account',
      data,
    );
  }
  deleteWallet(data: any) {
    return HttpRoutingService.postMethod(
      'api/account/delete-bank-account',
      data,
    );
  }
  changeAccountPreferences(data: any) {
    return HttpRoutingService.postMethod(
      'api/account/change-preferences',
      data,
    );
  }
  checkUserPin(data: any) {
    return HttpRoutingService.postMethod('api/account/check-user-pin', data);
  }
  getWalletList() {
    return HttpRoutingService.getMethod('api/account/get-wallet-list');
  }
  getAccountBalance(data: any) {
    return HttpRoutingService.getMethod(
      'api/account/get-account-balance',
      data,
    );
  }
  getUserNotificationPreference() {
    return HttpRoutingService.getMethod(
      'api/account/get-notification-preferences',
    );
  }

  getWeeklyTransactions(data: any) {
    return HttpRoutingService.postMethod(
      'api/account/get-weekly-transactions',
      data,
    );
  }
  logoutUser(data: any) {
    return HttpRoutingService.postMethod('api/account/logout-user', data);
  }
  changePassword(data: any) {
    return HttpRoutingService.postMethod('api/auth/change-password', data);
  }
  async updateUserDetails(data: any) {
    const token = await CommonDataService.getToken();
    if (token) {
      return await new Promise(async (resolve, reject) => {
        try {
          const response = await axios.post(
            config.apiUrldb + 'api/account/update-user-details',

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

  async deactivateAccount(data?: any) {
    return HttpRoutingService.deleteMethod(
      'api/account/deactivate-account',
      data,
    );
  }
}
const AccountService = new accountService();
export default AccountService;
