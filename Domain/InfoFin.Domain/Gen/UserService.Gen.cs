using InfoFin.Domain.Interface;
using InfoFin.Dal.Interface;
using InfoFin.Model;

namespace InfoFin.Domain
{
    public partial class UserService : IUserService
    {
        private readonly IUserRepository _repo;
        public UserService(IUserRepository repo)
        {
            _repo = repo;
        }

        public async Task DelUserHrd(int id)
        {
            await _repo.DelUserHrd(id);
        }

        public async Task DelUserSft(int id)
        {
            await _repo.DelUserSft(id);
        }

        public async Task<List<InfoFin.Model.User>> GetUserById(int? id, bool? isActive)
        {
            return await _repo.GetUserById(id, isActive);
        }

        public async Task<List<InfoFin.Model.User>> GetUserByIds(int? roleId, int? departmentId, bool? isActive, string sortDirection = "ASC")
        {
            return await _repo.GetUserByIds(roleId, departmentId, isActive, sortDirection);
        }

        public async Task<List<InfoFin.Model.User>> GetUserByIdsPaging(int? roleId, int? departmentId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            return await _repo.GetUserByIdsPaging(roleId, departmentId, isActive, pageNumber, pageSize, sortDirection);
        }

        public async Task<InfoFin.Model.User> InsUpdUser(InfoFin.Model.User user)
        {
            return await _repo.InsUpdUser(user);
        }
    }
}