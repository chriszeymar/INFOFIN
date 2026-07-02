using InfoFin.Model;

namespace InfoFin.Domain.Interface
{
    public partial interface IDepartmentGroupService
    {
        Task DelDepartmentGroupHrd(int id);
        Task DelDepartmentGroupSft(int id);
        Task<List<InfoFin.Model.DepartmentGroup>> GetDepartmentGroupById(int? id, bool? isActive);
        Task<List<InfoFin.Model.DepartmentGroup>> GetDepartmentGroupByIds(int? bucketTypeId, bool? isActive, string sortDirection = "ASC");
        Task<List<InfoFin.Model.DepartmentGroup>> GetDepartmentGroupByIdsPaging(int? bucketTypeId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC");
        Task<InfoFin.Model.DepartmentGroup> InsUpdDepartmentGroup(InfoFin.Model.DepartmentGroup departmentGroup);
    }
}
