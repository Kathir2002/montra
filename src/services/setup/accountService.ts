import HttpRoutingService from '@services/httpRoutingService';

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
}
const AccountService = new accountService();
export default AccountService;
