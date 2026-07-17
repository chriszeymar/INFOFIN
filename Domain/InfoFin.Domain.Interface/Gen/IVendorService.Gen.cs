using InfoFin.Model;

namespace InfoFin.Domain.Interface
{
    public partial interface IVendorService
    {
        Task DelVendorHrd(int id);
        Task DelVendorSft(int id);
        Task<List<InfoFin.Model.Vendor>> GetVendorById(int? id, bool? isActive);
        Task<List<InfoFin.Model.Vendor>> GetVendorByIds(List<int> ids);
        Task<InfoFin.Model.Vendor> InsUpdVendor(InfoFin.Model.Vendor vendor);
    }
}