using InfoFin.Domain.Interface;
using InfoFin.Dal.Interface;
using InfoFin.Model;

namespace InfoFin.Domain
{
    public partial class DepartmentService : IDepartmentService
    {
        private readonly IDepartmentRepository _repo;
        public DepartmentService(IDepartmentRepository repo)
        {
            _repo = repo;
        }

        public async Task DelDepartmentHrd(int id)
        {
            await _repo.DelDepartmentHrd(id);
        }

        public async Task DelDepartmentSft(int id)
        {
            await _repo.DelDepartmentSft(id);
        }

        public async Task<List<InfoFin.Model.Department>> GetDepartmentById(int? id, bool? isActive)
        {
            return await _repo.GetDepartmentById(id, isActive);
        }

        public async Task<List<InfoFin.Model.Department>> GetDepartmentByIds(int? departmentGroupId, bool? isActive, string sortDirection = "ASC")
        {
            return await _repo.GetDepartmentByIds(departmentGroupId, isActive, sortDirection);
        }

        public async Task<List<InfoFin.Model.Department>> GetDepartmentByIdsPaging(int? departmentGroupId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            return await _repo.GetDepartmentByIdsPaging(departmentGroupId, isActive, pageNumber, pageSize, sortDirection);
        }

        public async Task<InfoFin.Model.Department> InsUpdDepartment(InfoFin.Model.Department department)
        {
            return await _repo.InsUpdDepartment(department);
        }
    }
}