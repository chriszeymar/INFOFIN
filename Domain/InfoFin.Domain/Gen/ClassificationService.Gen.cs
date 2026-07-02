using InfoFin.Domain.Interface;
using InfoFin.Dal.Interface;
using InfoFin.Model;

namespace InfoFin.Domain
{
    public partial class ClassificationService : IClassificationService
    {
        private readonly IClassificationRepository _repo;
        public ClassificationService(IClassificationRepository repo)
        {
            _repo = repo;
        }

        public async Task DelClassificationHrd(int id)
        {
            await _repo.DelClassificationHrd(id);
        }

        public async Task DelClassificationSft(int id)
        {
            await _repo.DelClassificationSft(id);
        }

        public async Task<List<InfoFin.Model.Classification>> GetClassificationById(int? id, bool? isActive)
        {
            return await _repo.GetClassificationById(id, isActive);
        }

        public async Task<List<InfoFin.Model.Classification>> GetClassificationByIds(List<int> ids)
        {
            return await _repo.GetClassificationByIds(ids);
        }

        public async Task<InfoFin.Model.Classification> InsUpdClassification(InfoFin.Model.Classification classification)
        {
            return await _repo.InsUpdClassification(classification);
        }
    }
}