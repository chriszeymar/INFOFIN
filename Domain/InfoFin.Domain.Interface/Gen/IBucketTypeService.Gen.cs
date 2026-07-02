using InfoFin.Model;

namespace InfoFin.Domain.Interface
{
    public partial interface IBucketTypeService
    {
        Task DelBucketTypeHrd(int id);
        Task DelBucketTypeSft(int id);
        Task<List<InfoFin.Model.BucketType>> GetBucketTypeById(int? id, bool? isActive);
        Task<List<InfoFin.Model.BucketType>> GetBucketTypeByIds(List<int> ids);
        Task<InfoFin.Model.BucketType> InsUpdBucketType(InfoFin.Model.BucketType bucketType);
    }
}
