using InfoFin.Model;

namespace InfoFin.Domain.Interface
{
    public partial interface IAccountService
    {
        Task DelAccountHrd(int id);
        Task DelAccountSft(int id);
        Task<List<InfoFin.Model.Account>> GetAccountById(int? id, bool? isActive);
        Task<List<InfoFin.Model.Account>> GetAccountByIds(int? financialGroupId, int? classificationId, bool? isActive, string sortDirection = "ASC");
        Task<List<InfoFin.Model.Account>> GetAccountByIdsPaging(int? financialGroupId, int? classificationId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC");
        Task<InfoFin.Model.Account> InsUpdAccount(InfoFin.Model.Account account);
    }
}