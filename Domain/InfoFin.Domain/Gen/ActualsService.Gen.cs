using InfoFin.Domain.Interface;
using InfoFin.Dal.Interface;
using InfoFin.Model;

namespace InfoFin.Domain
{
    public partial class ActualsService : IActualsService
    {
        private readonly IActualsRepository _repo;
        public ActualsService(IActualsRepository repo)
        {
            _repo = repo;
        }

        public async Task DelActualsHrd(int id)
        {
            await _repo.DelActualsHrd(id);
        }

        public async Task DelActualsSft(int id)
        {
            await _repo.DelActualsSft(id);
        }

        public async Task<List<InfoFin.Model.Actuals>> GetActualsById(int? id, bool? isActive)
        {
            return await _repo.GetActualsById(id, isActive);
        }

        public async Task<List<InfoFin.Model.Actuals>> GetActualsByIds(int? departmentId, int? categoryId, bool? isActive, string sortDirection = "ASC")
        {
            return await _repo.GetActualsByIds(departmentId, categoryId, isActive, sortDirection);
        }

        public async Task<List<InfoFin.Model.Actuals>> GetActualsByIdsPaging(int? departmentId, int? categoryId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            return await _repo.GetActualsByIdsPaging(departmentId, categoryId, isActive, pageNumber, pageSize, sortDirection);
        }

        public async Task<InfoFin.Model.Actuals> InsUpdActuals(InfoFin.Model.Actuals actuals)
        {
            return await _repo.InsUpdActuals(actuals);
        }
    }
}