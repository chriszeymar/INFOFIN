using InfoFin.Domain.Interface;
using InfoFin.Dal.Interface;
using InfoFin.Model;

namespace InfoFin.Domain
{
    public partial class SpendRequestAttachmentService : ISpendRequestAttachmentService
    {
        private readonly ISpendRequestAttachmentRepository _repo;
        public SpendRequestAttachmentService(ISpendRequestAttachmentRepository repo)
        {
            _repo = repo;
        }

        public async Task DelSpendRequestAttachmentHrd(int id)
        {
            await _repo.DelSpendRequestAttachmentHrd(id);
        }

        public async Task DelSpendRequestAttachmentSft(int id)
        {
            await _repo.DelSpendRequestAttachmentSft(id);
        }

        public async Task<List<InfoFin.Model.SpendRequestAttachment>> GetSpendRequestAttachmentById(int? id, bool? isActive)
        {
            return await _repo.GetSpendRequestAttachmentById(id, isActive);
        }

        public async Task<List<InfoFin.Model.SpendRequestAttachment>> GetSpendRequestAttachmentByIds(int? spendRequestId, int? uploadedByUserId, bool? isActive, string sortDirection = "ASC")
        {
            return await _repo.GetSpendRequestAttachmentByIds(spendRequestId, uploadedByUserId, isActive, sortDirection);
        }

        public async Task<List<InfoFin.Model.SpendRequestAttachment>> GetSpendRequestAttachmentByIdsPaging(int? spendRequestId, int? uploadedByUserId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            return await _repo.GetSpendRequestAttachmentByIdsPaging(spendRequestId, uploadedByUserId, isActive, pageNumber, pageSize, sortDirection);
        }

        public async Task<InfoFin.Model.SpendRequestAttachment> InsUpdSpendRequestAttachment(InfoFin.Model.SpendRequestAttachment spendRequestAttachment)
        {
            return await _repo.InsUpdSpendRequestAttachment(spendRequestAttachment);
        }
    }
}