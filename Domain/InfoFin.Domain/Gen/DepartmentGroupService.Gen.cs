using InfoFin.Domain.Interface;
using InfoFin.Dal.Interface;
using InfoFin.Model;

namespace InfoFin.Domain
{
    public partial class DepartmentGroupService : IDepartmentGroupService
    {
        private readonly IDepartmentGroupRepository _repo;
        public DepartmentGroupService(IDepartmentGroupRepository repo)
        {
            _repo = repo;
        }

        public async Task DelDepartmentGroupHrd(int id)
        {
            await _repo.DelDepartmentGroupHrd(id);
        }

        public async Task DelDepartmentGroupSft(int id)
        {
            await _repo.DelDepartmentGroupSft(id);
        }

        public async Task<List<InfoFin.Model.DepartmentGroup>> GetDepartmentGroupById(int? id, bool? isActive)
        {
            return await _repo.GetDepartmentGroupById(id, isActive);
        }

        public async Task<List<InfoFin.Model.DepartmentGroup>> GetDepartmentGroupByIds(int? bucketTypeId, bool? isActive, string sortDirection = "ASC")
        {
            return await _repo.GetDepartmentGroupByIds(bucketTypeId, isActive, sortDirection);
        }

        public async Task<List<InfoFin.Model.DepartmentGroup>> GetDepartmentGroupByIdsPaging(int? bucketTypeId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            return await _repo.GetDepartmentGroupByIdsPaging(bucketTypeId, isActive, pageNumber, pageSize, sortDirection);
        }

        public async Task<InfoFin.Model.DepartmentGroup> InsUpdDepartmentGroup(InfoFin.Model.DepartmentGroup departmentGroup)
        {
            return await _repo.InsUpdDepartmentGroup(departmentGroup);
        }
    }
}