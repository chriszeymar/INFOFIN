using InfoFin.Model;

namespace InfoFin.Domain.Interface
{
    public partial interface ISpendRequestService
    {
        Task DelSpendRequestHrd(int id);
        Task DelSpendRequestSft(int id);
        Task<List<InfoFin.Model.SpendRequest>> GetSpendRequestById(int? id, bool? isActive);
        Task<List<InfoFin.Model.SpendRequest>> GetSpendRequestByIds(int? departmentId, int? categoryId, int? encoderId, int? currencyId, int? assignedToUserId, int? vendorId, bool? isActive, string sortDirection = "ASC");
        Task<List<InfoFin.Model.SpendRequest>> GetSpendRequestByIdsPaging(int? departmentId, int? categoryId, int? encoderId, int? currencyId, int? assignedToUserId, int? vendorId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC");
        Task<InfoFin.Model.SpendRequest> InsUpdSpendRequest(InfoFin.Model.SpendRequest spendRequest);
    }
}
