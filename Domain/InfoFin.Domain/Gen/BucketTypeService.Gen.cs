using InfoFin.Domain.Interface;
using InfoFin.Dal.Interface;
using InfoFin.Model;

namespace InfoFin.Domain
{
    public partial class BucketTypeService : IBucketTypeService
    {
        private readonly IBucketTypeRepository _repo;
        public BucketTypeService(IBucketTypeRepository repo)
        {
            _repo = repo;
        }

        public async Task DelBucketTypeHrd(int id)
        {
            await _repo.DelBucketTypeHrd(id);
        }

        public async Task DelBucketTypeSft(int id)
        {
            await _repo.DelBucketTypeSft(id);
        }

        public async Task<List<InfoFin.Model.BucketType>> GetBucketTypeById(int? id, bool? isActive)
        {
            return await _repo.GetBucketTypeById(id, isActive);
        }

        public async Task<List<InfoFin.Model.BucketType>> GetBucketTypeByIds(List<int> ids)
        {
            return await _repo.GetBucketTypeByIds(ids);
        }

        public async Task<InfoFin.Model.BucketType> InsUpdBucketType(InfoFin.Model.BucketType bucketType)
        {
            return await _repo.InsUpdBucketType(bucketType);
        }
    }
}