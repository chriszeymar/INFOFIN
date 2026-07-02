using InfoFin.Model;

namespace InfoFin.Dal.Interface
{
    public partial interface INotificationLogRepository
    {
        Task DelNotificationLogHrd(int id);
        Task DelNotificationLogSft(int id);
        Task<List<InfoFin.Model.NotificationLog>> GetNotificationLogById(int? id, bool? isActive);
        Task<List<InfoFin.Model.NotificationLog>> GetNotificationLogByIds(int? spendRequestId, int? recipientUserId, bool? isActive, string sortDirection = "ASC");
        Task<List<InfoFin.Model.NotificationLog>> GetNotificationLogByIdsPaging(int? spendRequestId, int? recipientUserId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC");
        Task<InfoFin.Model.NotificationLog> InsUpdNotificationLog(InfoFin.Model.NotificationLog notificationLog);
    }
}