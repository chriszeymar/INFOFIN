using InfoFin.Model;

namespace InfoFin.Domain.Interface
{
    public partial interface IActualsService
    {
        Task DelActualsHrd(int id);
        Task DelActualsSft(int id);
        Task<List<InfoFin.Model.Actuals>> GetActualsById(int? id, bool? isActive);
        Task<List<InfoFin.Model.Actuals>> GetActualsByIds(int? departmentId, int? accountId, bool? isActive, string sortDirection = "ASC");
        Task<List<InfoFin.Model.Actuals>> GetActualsByIdsPaging(int? departmentId, int? accountId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC");
        Task<InfoFin.Model.Actuals> InsUpdActuals(InfoFin.Model.Actuals actuals);
    }
}