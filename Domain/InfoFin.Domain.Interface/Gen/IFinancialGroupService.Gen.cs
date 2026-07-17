using InfoFin.Model;

namespace InfoFin.Domain.Interface
{
    public partial interface IFinancialGroupService
    {
        Task DelFinancialGroupHrd(int id);
        Task DelFinancialGroupSft(int id);
        Task<List<InfoFin.Model.FinancialGroup>> GetFinancialGroupById(int? id, bool? isActive);
        Task<List<InfoFin.Model.FinancialGroup>> GetFinancialGroupByIds(List<int> ids);
        Task<InfoFin.Model.FinancialGroup> InsUpdFinancialGroup(InfoFin.Model.FinancialGroup financialGroup);
    }
}