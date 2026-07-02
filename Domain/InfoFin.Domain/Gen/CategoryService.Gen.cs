using InfoFin.Domain.Interface;
using InfoFin.Dal.Interface;
using InfoFin.Model;

namespace InfoFin.Domain
{
    public partial class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _repo;
        public CategoryService(ICategoryRepository repo)
        {
            _repo = repo;
        }

        public async Task DelCategoryHrd(int id)
        {
            await _repo.DelCategoryHrd(id);
        }

        public async Task DelCategorySft(int id)
        {
            await _repo.DelCategorySft(id);
        }

        public async Task<List<InfoFin.Model.Category>> GetCategoryById(int? id, bool? isActive)
        {
            return await _repo.GetCategoryById(id, isActive);
        }

        public async Task<List<InfoFin.Model.Category>> GetCategoryByIds(int? financialGroupId, int? classificationId, bool? isActive, string sortDirection = "ASC")
        {
            return await _repo.GetCategoryByIds(financialGroupId, classificationId, isActive, sortDirection);
        }

        public async Task<List<InfoFin.Model.Category>> GetCategoryByIdsPaging(int? financialGroupId, int? classificationId, bool? isActive, int? pageNumber, int? pageSize, string sortDirection = "ASC")
        {
            return await _repo.GetCategoryByIdsPaging(financialGroupId, classificationId, isActive, pageNumber, pageSize, sortDirection);
        }

        public async Task<InfoFin.Model.Category> InsUpdCategory(InfoFin.Model.Category category)
        {
            return await _repo.InsUpdCategory(category);
        }
    }
}