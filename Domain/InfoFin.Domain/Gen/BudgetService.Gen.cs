using InfoFin.Domain.Interface;
using InfoFin.Dal.Interface;
using InfoFin.Model;

namespace InfoFin.Domain
{
    public partial class BudgetService : IBudgetService
    {
        private readonly IBudgetRepository _repo;
        public BudgetService(IBudgetRepository repo)
        {
            _repo = repo;
        }

        public async Task DelBudgetHrd(int id)
        {
            await _repo.DelBudgetHrd(id);
        }

        public async Task DelBudgetSft(int id)
        {
            await _repo.DelBudgetSft(id);
        }

        public async Task<List<InfoFin.Model.Budget>> GetBudgetById(int? id, bool? isActive)
        {
            return await _repo.GetBudgetById(id, isActive);
        }

        public async Task<List<InfoFin.Model.Budget>> GetBudgetByIds(int? departmentId, int? categoryId, int? currencyId, bool? isActive, string sortDirection = "ASC")
        {
            return await _repo.GetBudgetByIds(departmentId, categoryId, currencyId, isActive, sortDirection);
        }

        public async Task<List<InfoFin.Model.Budget>> GetBudgetByIdsPaging(int? departmentId, int? categoryId, int? currencyId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            return await _repo.GetBudgetByIdsPaging(departmentId, categoryId, currencyId, isActive, pageNumber, pageSize, sortDirection);
        }

        public async Task<InfoFin.Model.Budget> InsUpdBudget(InfoFin.Model.Budget budget)
        {
            return await _repo.InsUpdBudget(budget);
        }
    }
}