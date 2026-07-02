using InfoFin.Model;

namespace InfoFin.Dal.Interface
{
    public partial interface IBudgetAdjustmentRepository
    {
        Task DelBudgetAdjustmentHrd(int id);
        Task DelBudgetAdjustmentSft(int id);
        Task<List<InfoFin.Model.BudgetAdjustment>> GetBudgetAdjustmentById(int? id, bool? isActive);
        Task<List<InfoFin.Model.BudgetAdjustment>> GetBudgetAdjustmentByIds(int? budgetId, int? adjustedByUserId, bool? isActive, string sortDirection = "ASC");
        Task<List<InfoFin.Model.BudgetAdjustment>> GetBudgetAdjustmentByIdsPaging(int? budgetId, int? adjustedByUserId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC");
        Task<InfoFin.Model.BudgetAdjustment> InsUpdBudgetAdjustment(InfoFin.Model.BudgetAdjustment budgetAdjustment);
    }
}