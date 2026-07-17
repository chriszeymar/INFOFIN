using InfoFin.Model;

namespace InfoFin.Domain.Interface
{
    public partial interface IOdooAccountMappingService
    {
        Task DelOdooAccountMappingHrd(int id);
        Task DelOdooAccountMappingSft(int id);
        Task<List<InfoFin.Model.OdooAccountMapping>> GetOdooAccountMappingById(int? id, bool? isActive);
        Task<List<InfoFin.Model.OdooAccountMapping>> GetOdooAccountMappingByIds(int? infoFinAccountId, bool? isActive, string sortDirection = "ASC");
        Task<List<InfoFin.Model.OdooAccountMapping>> GetOdooAccountMappingByIdsPaging(int? infoFinAccountId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC");
        Task<InfoFin.Model.OdooAccountMapping> InsUpdOdooAccountMapping(InfoFin.Model.OdooAccountMapping odooAccountMapping);
    }
}