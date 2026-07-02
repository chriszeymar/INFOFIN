using InfoFin.Domain.Interface;
using InfoFin.Dal.Interface;
using InfoFin.Model;

namespace InfoFin.Domain
{
    public partial class RoleService : IRoleService
    {
        private readonly IRoleRepository _repo;
        public RoleService(IRoleRepository repo)
        {
            _repo = repo;
        }

        public async Task DelRoleHrd(int id)
        {
            await _repo.DelRoleHrd(id);
        }

        public async Task DelRoleSft(int id)
        {
            await _repo.DelRoleSft(id);
        }

        public async Task<List<InfoFin.Model.Role>> GetRoleById(int? id, bool? isActive)
        {
            return await _repo.GetRoleById(id, isActive);
        }

        public async Task<List<InfoFin.Model.Role>> GetRoleByIds(List<int> ids)
        {
            return await _repo.GetRoleByIds(ids);
        }

        public async Task<InfoFin.Model.Role> InsUpdRole(InfoFin.Model.Role role)
        {
            return await _repo.InsUpdRole(role);
        }
    }
}