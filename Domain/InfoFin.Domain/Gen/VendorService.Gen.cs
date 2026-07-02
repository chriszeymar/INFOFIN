using InfoFin.Domain.Interface;
using InfoFin.Dal.Interface;
using InfoFin.Model;

namespace InfoFin.Domain
{
    public partial class VendorService : IVendorService
    {
        private readonly IVendorRepository _repo;
        public VendorService(IVendorRepository repo)
        {
            _repo = repo;
        }

        public async Task DelVendorHrd(int id)
        {
            await _repo.DelVendorHrd(id);
        }

        public async Task DelVendorSft(int id)
        {
            await _repo.DelVendorSft(id);
        }

        public async Task<List<InfoFin.Model.Vendor>> GetVendorById(int? id, bool? isActive)
        {
            return await _repo.GetVendorById(id, isActive);
        }

        public async Task<List<InfoFin.Model.Vendor>> GetVendorByIds(List<int> ids)
        {
            return await _repo.GetVendorByIds(ids);
        }

        public async Task<InfoFin.Model.Vendor> InsUpdVendor(InfoFin.Model.Vendor vendor)
        {
            return await _repo.InsUpdVendor(vendor);
        }
    }
}