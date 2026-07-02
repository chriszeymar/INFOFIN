using InfoFin.Domain.Interface;
using InfoFin.Dal.Interface;
using InfoFin.Model;

namespace InfoFin.Domain
{
    public partial class NotificationLogService : INotificationLogService
    {
        private readonly INotificationLogRepository _repo;
        public NotificationLogService(INotificationLogRepository repo)
        {
            _repo = repo;
        }

        public async Task DelNotificationLogHrd(int id)
        {
            await _repo.DelNotificationLogHrd(id);
        }

        public async Task DelNotificationLogSft(int id)
        {
            await _repo.DelNotificationLogSft(id);
        }

        public async Task<List<InfoFin.Model.NotificationLog>> GetNotificationLogById(int? id, bool? isActive)
        {
            return await _repo.GetNotificationLogById(id, isActive);
        }

        public async Task<List<InfoFin.Model.NotificationLog>> GetNotificationLogByIds(int? spendRequestId, int? recipientUserId, bool? isActive, string sortDirection = "ASC")
        {
            return await _repo.GetNotificationLogByIds(spendRequestId, recipientUserId, isActive, sortDirection);
        }

        public async Task<List<InfoFin.Model.NotificationLog>> GetNotificationLogByIdsPaging(int? spendRequestId, int? recipientUserId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            return await _repo.GetNotificationLogByIdsPaging(spendRequestId, recipientUserId, isActive, pageNumber, pageSize, sortDirection);
        }

        public async Task<InfoFin.Model.NotificationLog> InsUpdNotificationLog(InfoFin.Model.NotificationLog notificationLog)
        {
            return await _repo.InsUpdNotificationLog(notificationLog);
        }
    }
}