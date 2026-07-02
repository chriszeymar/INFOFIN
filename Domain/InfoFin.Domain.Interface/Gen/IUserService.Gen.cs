using InfoFin.Model;

namespace InfoFin.Domain.Interface
{
    public partial interface IUserService
    {
        Task DelUserHrd(int id);
        Task DelUserSft(int id);
        Task<List<InfoFin.Model.User>> GetUserById(int? id, bool? isActive);
        Task<List<InfoFin.Model.User>> GetUserByIds(int? roleId, int? departmentId, bool? isActive, string sortDirection = "ASC");
        Task<List<InfoFin.Model.User>> GetUserByIdsPaging(int? roleId, int? departmentId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC");
        Task<InfoFin.Model.User> InsUpdUser(InfoFin.Model.User user);
    }
}
