using InfoFin.Model;

namespace InfoFin.Dal.Interface
{
    public partial interface IFinancialGroupRepository
    {
        Task DelFinancialGroupHrd(int id);
        Task DelFinancialGroupSft(int id);
        Task<List<InfoFin.Model.FinancialGroup>> GetFinancialGroupById(int? id, bool? isActive);
        Task<List<InfoFin.Model.FinancialGroup>> GetFinancialGroupByIds(List<int> ids);
        Task<InfoFin.Model.FinancialGroup> InsUpdFinancialGroup(InfoFin.Model.FinancialGroup financialGroup);
    }
}