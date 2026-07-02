using InfoFin.Model;

namespace InfoFin.Domain.Interface
{
    public partial interface IRoleService
    {
        Task DelRoleHrd(int id);
        Task DelRoleSft(int id);
        Task<List<InfoFin.Model.Role>> GetRoleById(int? id, bool? isActive);
        Task<List<InfoFin.Model.Role>> GetRoleByIds(List<int> ids);
        Task<InfoFin.Model.Role> InsUpdRole(InfoFin.Model.Role role);
    }
}
