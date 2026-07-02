using InfoFin.Model;

namespace InfoFin.Dal.Interface
{
    public partial interface IClassificationRepository
    {
        Task DelClassificationHrd(int id);
        Task DelClassificationSft(int id);
        Task<List<InfoFin.Model.Classification>> GetClassificationById(int? id, bool? isActive);
        Task<List<InfoFin.Model.Classification>> GetClassificationByIds(List<int> ids);
        Task<InfoFin.Model.Classification> InsUpdClassification(InfoFin.Model.Classification classification);
    }
}