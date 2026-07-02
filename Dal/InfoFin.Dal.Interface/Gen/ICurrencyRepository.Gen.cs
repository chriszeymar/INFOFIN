using InfoFin.Model;

namespace InfoFin.Dal.Interface
{
    public partial interface ICurrencyRepository
    {
        Task DelCurrencyHrd(int id);
        Task DelCurrencySft(int id);
        Task<List<InfoFin.Model.Currency>> GetCurrencyById(int? id, bool? isActive);
        Task<List<InfoFin.Model.Currency>> GetCurrencyByIds(List<int> ids);
        Task<InfoFin.Model.Currency> InsUpdCurrency(InfoFin.Model.Currency currency);
    }
}