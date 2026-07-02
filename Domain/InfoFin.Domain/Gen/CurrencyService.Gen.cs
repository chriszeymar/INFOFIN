using InfoFin.Domain.Interface;
using InfoFin.Dal.Interface;
using InfoFin.Model;

namespace InfoFin.Domain
{
    public partial class CurrencyService : ICurrencyService
    {
        private readonly ICurrencyRepository _repo;
        public CurrencyService(ICurrencyRepository repo)
        {
            _repo = repo;
        }

        public async Task DelCurrencyHrd(int id)
        {
            await _repo.DelCurrencyHrd(id);
        }

        public async Task DelCurrencySft(int id)
        {
            await _repo.DelCurrencySft(id);
        }

        public async Task<List<InfoFin.Model.Currency>> GetCurrencyById(int? id, bool? isActive)
        {
            return await _repo.GetCurrencyById(id, isActive);
        }

        public async Task<List<InfoFin.Model.Currency>> GetCurrencyByIds(List<int> ids)
        {
            return await _repo.GetCurrencyByIds(ids);
        }

        public async Task<InfoFin.Model.Currency> InsUpdCurrency(InfoFin.Model.Currency currency)
        {
            return await _repo.InsUpdCurrency(currency);
        }
    }
}