using InfoFin.Domain.Interface;
using InfoFin.Dal.Interface;
using InfoFin.Model;

namespace InfoFin.Domain
{
    public partial class FinancialGroupService : IFinancialGroupService
    {
        private readonly IFinancialGroupRepository _repo;
        public FinancialGroupService(IFinancialGroupRepository repo)
        {
            _repo = repo;
        }

        public async Task DelFinancialGroupHrd(int id)
        {
            await _repo.DelFinancialGroupHrd(id);
        }

        public async Task DelFinancialGroupSft(int id)
        {
            await _repo.DelFinancialGroupSft(id);
        }

        public async Task<List<InfoFin.Model.FinancialGroup>> GetFinancialGroupById(int? id, bool? isActive)
        {
            return await _repo.GetFinancialGroupById(id, isActive);
        }

        public async Task<List<InfoFin.Model.FinancialGroup>> GetFinancialGroupByIds(List<int> ids)
        {
            return await _repo.GetFinancialGroupByIds(ids);
        }

        public async Task<InfoFin.Model.FinancialGroup> InsUpdFinancialGroup(InfoFin.Model.FinancialGroup financialGroup)
        {
            return await _repo.InsUpdFinancialGroup(financialGroup);
        }
    }
}