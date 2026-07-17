using InfoFin.Model;

namespace InfoFin.Domain.Interface
{
    public partial interface IDepartmentService
    {
        Task DelDepartmentHrd(int id);
        Task DelDepartmentSft(int id);
        Task<List<InfoFin.Model.Department>> GetDepartmentById(int? id, bool? isActive);
        Task<List<InfoFin.Model.Department>> GetDepartmentByIds(int? departmentGroupId, bool? isActive, string sortDirection = "ASC");
        Task<List<InfoFin.Model.Department>> GetDepartmentByIdsPaging(int? departmentGroupId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC");
        Task<InfoFin.Model.Department> InsUpdDepartment(InfoFin.Model.Department department);
    }
}