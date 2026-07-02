using InfoFin.Model;

namespace InfoFin.Dal.Interface
{
    public partial interface ISpendRequestAttachmentRepository
    {
        Task DelSpendRequestAttachmentHrd(int id);
        Task DelSpendRequestAttachmentSft(int id);
        Task<List<InfoFin.Model.SpendRequestAttachment>> GetSpendRequestAttachmentById(int? id, bool? isActive);
        Task<List<InfoFin.Model.SpendRequestAttachment>> GetSpendRequestAttachmentByIds(int? spendRequestId, int? uploadedByUserId, bool? isActive, string sortDirection = "ASC");
        Task<List<InfoFin.Model.SpendRequestAttachment>> GetSpendRequestAttachmentByIdsPaging(int? spendRequestId, int? uploadedByUserId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC");
        Task<InfoFin.Model.SpendRequestAttachment> InsUpdSpendRequestAttachment(InfoFin.Model.SpendRequestAttachment spendRequestAttachment);
    }
}