using InfoFin.Model;

namespace InfoFin.Domain.Interface
{
    public partial interface IBudgetService
    {
        Task DelBudgetHrd(int id);
        Task DelBudgetSft(int id);
        Task<List<InfoFin.Model.Budget>> GetBudgetById(int? id, bool? isActive);
        Task<List<InfoFin.Model.Budget>> GetBudgetByIds(int? departmentId, int? accountId, int? currencyId, bool? isActive, string sortDirection = "ASC");
        Task<List<InfoFin.Model.Budget>> GetBudgetByIdsPaging(int? departmentId, int? accountId, int? currencyId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC");
        Task<InfoFin.Model.Budget> InsUpdBudget(InfoFin.Model.Budget budget);
    }
}