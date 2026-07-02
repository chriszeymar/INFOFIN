using InfoFin.Model;

namespace InfoFin.Dal.Interface
{
    public partial interface ICategoryRepository
    {
        Task DelCategoryHrd(int id);
        Task DelCategorySft(int id);
        Task<List<InfoFin.Model.Category>> GetCategoryById(int? id, bool? isActive);
        Task<List<InfoFin.Model.Category>> GetCategoryByIds(int? financialGroupId, int? classificationId, bool? isActive, string sortDirection = "ASC");
        Task<List<InfoFin.Model.Category>> GetCategoryByIdsPaging(int? financialGroupId, int? classificationId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC");
        Task<InfoFin.Model.Category> InsUpdCategory(InfoFin.Model.Category category);
    }
}