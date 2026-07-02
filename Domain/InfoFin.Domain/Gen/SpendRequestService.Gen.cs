using InfoFin.Domain.Interface;
using InfoFin.Dal.Interface;
using InfoFin.Model;

namespace InfoFin.Domain
{
    public partial class SpendRequestService : ISpendRequestService
    {
        private readonly ISpendRequestRepository _repo;
        public SpendRequestService(ISpendRequestRepository repo)
        {
            _repo = repo;
        }

        public async Task DelSpendRequestHrd(int id)
        {
            await _repo.DelSpendRequestHrd(id);
        }

        public async Task DelSpendRequestSft(int id)
        {
            await _repo.DelSpendRequestSft(id);
        }

        public async Task<List<InfoFin.Model.SpendRequest>> GetSpendRequestById(int? id, bool? isActive)
        {
            return await _repo.GetSpendRequestById(id, isActive);
        }

        public async Task<List<InfoFin.Model.SpendRequest>> GetSpendRequestByIds(int? departmentId, int? categoryId, int? encoderId, int? currencyId, int? vendorId, bool? isActive, string sortDirection = "ASC")
        {
            return await _repo.GetSpendRequestByIds(departmentId, categoryId, encoderId, currencyId, vendorId, isActive, sortDirection);
        }

        public async Task<List<InfoFin.Model.SpendRequest>> GetSpendRequestByIdsPaging(int? departmentId, int? categoryId, int? encoderId, int? currencyId, int? vendorId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            return await _repo.GetSpendRequestByIdsPaging(departmentId, categoryId, encoderId, currencyId, vendorId, isActive, pageNumber, pageSize, sortDirection);
        }

        public async Task<InfoFin.Model.SpendRequest> InsUpdSpendRequest(InfoFin.Model.SpendRequest spendRequest)
        {
            return await _repo.InsUpdSpendRequest(spendRequest);
        }
    }
}