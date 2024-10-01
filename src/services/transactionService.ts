import HttpRoutingService from '@services/httpRoutingService';
import axios from 'axios';
import {config} from '../../environment';
import CommonDataService from '@shared/commonDataServices';
class transactionService {
  async addTransaction(data: any) {
    const token = await CommonDataService.getToken();
    if (token) {
      return await new Promise(async (resolve, reject) => {
        try {
          const response = await axios.post(
            config.apiUrldb + 'api/transaction/add-transaction',

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
  async updateTransaction(data: any) {
    const token = await CommonDataService.getToken();
    if (token) {
      return await new Promise(async (resolve, reject) => {
        try {
          const response = await axios.post(
            config.apiUrldb + 'api/transaction/update-transaction',

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
  async getTransactionList(data: any) {
    return await HttpRoutingService.postMethod(
      'api/transaction/get-transactions',
      data,
    );
  }
  async deleteTransaction(data: any) {
    return await HttpRoutingService.postMethod(
      'api/transaction/delete-transaction',
      data,
    );
  }
  async getTransactionCategory(data: any) {
    return await HttpRoutingService.getMethod(
      'api/transaction/get-category',
      data,
    );
  }
  async addTransactionCategory(data: any) {
    return await HttpRoutingService.postMethod(
      'api/transaction/add-category',
      data,
    );
  }
}
const TransactionService = new transactionService();
export default TransactionService;
