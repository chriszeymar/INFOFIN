using InfoFin.Domain.Interface;
using InfoFin.Dal.Interface;
using InfoFin.Model;

namespace InfoFin.Domain
{
    public partial class AccountService : IAccountService
    {
        private readonly IAccountRepository _repo;
        public AccountService(IAccountRepository repo)
        {
            _repo = repo;
        }

        public async Task DelAccountHrd(int id)
        {
            await _repo.DelAccountHrd(id);
        }

        public async Task DelAccountSft(int id)
        {
            await _repo.DelAccountSft(id);
        }

        public async Task<List<InfoFin.Model.Account>> GetAccountById(int? id, bool? isActive)
        {
            return await _repo.GetAccountById(id, isActive);
        }

        public async Task<List<InfoFin.Model.Account>> GetAccountByIds(int? financialGroupId, int? classificationId, bool? isActive, string sortDirection = "ASC")
        {
            return await _repo.GetAccountByIds(financialGroupId, classificationId, isActive, sortDirection);
        }

        public async Task<List<InfoFin.Model.Account>> GetAccountByIdsPaging(int? financialGroupId, int? classificationId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            return await _repo.GetAccountByIdsPaging(financialGroupId, classificationId, isActive, pageNumber, pageSize, sortDirection);
        }

        public async Task<InfoFin.Model.Account> InsUpdAccount(InfoFin.Model.Account account)
        {
            return await _repo.InsUpdAccount(account);
        }
    }
}