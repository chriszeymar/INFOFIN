using InfoFin.Domain.Interface;
using InfoFin.Dal.Interface;
using InfoFin.Model;

namespace InfoFin.Domain
{
    public partial class BudgetAdjustmentService : IBudgetAdjustmentService
    {
        private readonly IBudgetAdjustmentRepository _repo;
        public BudgetAdjustmentService(IBudgetAdjustmentRepository repo)
        {
            _repo = repo;
        }

        public async Task DelBudgetAdjustmentHrd(int id)
        {
            await _repo.DelBudgetAdjustmentHrd(id);
        }

        public async Task DelBudgetAdjustmentSft(int id)
        {
            await _repo.DelBudgetAdjustmentSft(id);
        }

        public async Task<List<InfoFin.Model.BudgetAdjustment>> GetBudgetAdjustmentById(int? id, bool? isActive)
        {
            return await _repo.GetBudgetAdjustmentById(id, isActive);
        }

        public async Task<List<InfoFin.Model.BudgetAdjustment>> GetBudgetAdjustmentByIds(int? budgetId, int? adjustedByUserId, bool? isActive, string sortDirection = "ASC")
        {
            return await _repo.GetBudgetAdjustmentByIds(budgetId, adjustedByUserId, isActive, sortDirection);
        }

        public async Task<List<InfoFin.Model.BudgetAdjustment>> GetBudgetAdjustmentByIdsPaging(int? budgetId, int? adjustedByUserId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            return await _repo.GetBudgetAdjustmentByIdsPaging(budgetId, adjustedByUserId, isActive, pageNumber, pageSize, sortDirection);
        }

        public async Task<InfoFin.Model.BudgetAdjustment> InsUpdBudgetAdjustment(InfoFin.Model.BudgetAdjustment budgetAdjustment)
        {
            return await _repo.InsUpdBudgetAdjustment(budgetAdjustment);
        }
    }
}