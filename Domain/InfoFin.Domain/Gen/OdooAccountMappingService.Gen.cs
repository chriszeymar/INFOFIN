using InfoFin.Domain.Interface;
using InfoFin.Dal.Interface;
using InfoFin.Model;

namespace InfoFin.Domain
{
    public partial class OdooAccountMappingService : IOdooAccountMappingService
    {
        private readonly IOdooAccountMappingRepository _repo;
        public OdooAccountMappingService(IOdooAccountMappingRepository repo)
        {
            _repo = repo;
        }

        public async Task DelOdooAccountMappingHrd(int id)
        {
            await _repo.DelOdooAccountMappingHrd(id);
        }

        public async Task DelOdooAccountMappingSft(int id)
        {
            await _repo.DelOdooAccountMappingSft(id);
        }

        public async Task<List<InfoFin.Model.OdooAccountMapping>> GetOdooAccountMappingById(int? id, bool? isActive)
        {
            return await _repo.GetOdooAccountMappingById(id, isActive);
        }

        public async Task<List<InfoFin.Model.OdooAccountMapping>> GetOdooAccountMappingByIds(int? infoFinCategoryId, bool? isActive, string sortDirection = "ASC")
        {
            return await _repo.GetOdooAccountMappingByIds(infoFinCategoryId, isActive, sortDirection);
        }

        public async Task<List<InfoFin.Model.OdooAccountMapping>> GetOdooAccountMappingByIdsPaging(int? infoFinCategoryId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            return await _repo.GetOdooAccountMappingByIdsPaging(infoFinCategoryId, isActive, pageNumber, pageSize, sortDirection);
        }

        public async Task<InfoFin.Model.OdooAccountMapping> InsUpdOdooAccountMapping(InfoFin.Model.OdooAccountMapping odooAccountMapping)
        {
            return await _repo.InsUpdOdooAccountMapping(odooAccountMapping);
        }
    }
}