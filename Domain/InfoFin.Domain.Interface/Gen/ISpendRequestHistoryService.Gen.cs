using InfoFin.Model;

namespace InfoFin.Domain.Interface
{
    public partial interface ISpendRequestHistoryService
    {
        Task DelSpendRequestHistoryHrd(int id);
        Task DelSpendRequestHistorySft(int id);
        Task<List<InfoFin.Model.SpendRequestHistory>> GetSpendRequestHistoryById(int? id, bool? isActive);
        Task<List<InfoFin.Model.SpendRequestHistory>> GetSpendRequestHistoryByIds(int? spendRequestId, int? actionById, bool? isActive, string sortDirection = "ASC");
        Task<List<InfoFin.Model.SpendRequestHistory>> GetSpendRequestHistoryByIdsPaging(int? spendRequestId, int? actionById, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC");
        Task<InfoFin.Model.SpendRequestHistory> InsUpdSpendRequestHistory(InfoFin.Model.SpendRequestHistory spendRequestHistory);
    }
}