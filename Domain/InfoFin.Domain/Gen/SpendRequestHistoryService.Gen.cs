using InfoFin.Domain.Interface;
using InfoFin.Dal.Interface;
using InfoFin.Model;

namespace InfoFin.Domain
{
    public partial class SpendRequestHistoryService : ISpendRequestHistoryService
    {
        private readonly ISpendRequestHistoryRepository _repo;
        public SpendRequestHistoryService(ISpendRequestHistoryRepository repo)
        {
            _repo = repo;
        }

        public async Task DelSpendRequestHistoryHrd(int id)
        {
            await _repo.DelSpendRequestHistoryHrd(id);
        }

        public async Task DelSpendRequestHistorySft(int id)
        {
            await _repo.DelSpendRequestHistorySft(id);
        }

        public async Task<List<InfoFin.Model.SpendRequestHistory>> GetSpendRequestHistoryById(int? id, bool? isActive)
        {
            return await _repo.GetSpendRequestHistoryById(id, isActive);
        }

        public async Task<List<InfoFin.Model.SpendRequestHistory>> GetSpendRequestHistoryByIds(int? spendRequestId, int? actionById, bool? isActive, string sortDirection = "ASC")
        {
            return await _repo.GetSpendRequestHistoryByIds(spendRequestId, actionById, isActive, sortDirection);
        }

        public async Task<List<InfoFin.Model.SpendRequestHistory>> GetSpendRequestHistoryByIdsPaging(int? spendRequestId, int? actionById, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            return await _repo.GetSpendRequestHistoryByIdsPaging(spendRequestId, actionById, isActive, pageNumber, pageSize, sortDirection);
        }

        public async Task<InfoFin.Model.SpendRequestHistory> InsUpdSpendRequestHistory(InfoFin.Model.SpendRequestHistory spendRequestHistory)
        {
            return await _repo.InsUpdSpendRequestHistory(spendRequestHistory);
        }
    }
}