import HttpRoutingService from '@services/httpRoutingService';

class budgetService {
  async addBudget(data: any) {
    return await HttpRoutingService.postMethod('api/budget/add-budget', data);
  }
  async getBudgetList(data: any) {
    return await HttpRoutingService.getMethod('api/budget/get-budget', data);
  }
  async updateBudget(data: any) {
    return await HttpRoutingService.postMethod(
      'api/budget/update-budget',
      data,
    );
  }
  async deleteBudget(data: any) {
    return await HttpRoutingService.postMethod(
      'api/budget/delete-budget',
      data,
    );
  }
}

const BudgetService = new budgetService();
export default BudgetService;
