using Microsoft.Extensions.DependencyInjection;
using InfoFin.Dal.Interface;
using InfoFin.Dal.Dapper;

namespace InfoFin.ServiceCollectionExtension.Gen
{
    public static class AddGeneratedRepositoriesServiceCollectionExtension
    {
        public static IServiceCollection AddGeneratedRepositories(this IServiceCollection services, string connectionString)
        {
            services.AddTransient<IBucketTypeRepository, BucketTypeRepository>(x => new BucketTypeRepository(connectionString));
            services.AddTransient<IBudgetRepository, BudgetRepository>(x => new BudgetRepository(connectionString));
            services.AddTransient<IBudgetAdjustmentRepository, BudgetAdjustmentRepository>(x => new BudgetAdjustmentRepository(connectionString));
            services.AddTransient<ICategoryRepository, CategoryRepository>(x => new CategoryRepository(connectionString));
            services.AddTransient<IClassificationRepository, ClassificationRepository>(x => new ClassificationRepository(connectionString));
            services.AddTransient<ICurrencyRepository, CurrencyRepository>(x => new CurrencyRepository(connectionString));
            services.AddTransient<IDepartmentRepository, DepartmentRepository>(x => new DepartmentRepository(connectionString));
            services.AddTransient<IDepartmentGroupRepository, DepartmentGroupRepository>(x => new DepartmentGroupRepository(connectionString));
            services.AddTransient<IFinancialGroupRepository, FinancialGroupRepository>(x => new FinancialGroupRepository(connectionString));
            services.AddTransient<INotificationLogRepository, NotificationLogRepository>(x => new NotificationLogRepository(connectionString));
            services.AddTransient<IRoleRepository, RoleRepository>(x => new RoleRepository(connectionString));
            services.AddTransient<ISpendRequestRepository, SpendRequestRepository>(x => new SpendRequestRepository(connectionString));
            services.AddTransient<ISpendRequestAttachmentRepository, SpendRequestAttachmentRepository>(x => new SpendRequestAttachmentRepository(connectionString));
            services.AddTransient<ISpendRequestHistoryRepository, SpendRequestHistoryRepository>(x => new SpendRequestHistoryRepository(connectionString));
            services.AddTransient<IUserRepository, UserRepository>(x => new UserRepository(connectionString));
            services.AddTransient<IVendorRepository, VendorRepository>(x => new VendorRepository(connectionString));
            services.AddTransient<IActualsRepository, ActualsRepository>(x => new ActualsRepository(connectionString));
            services.AddTransient<IOdooAccountMappingRepository, OdooAccountMappingRepository>(x => new OdooAccountMappingRepository(connectionString));
            services.AddTransient<IOdooJournalLineRepository, OdooJournalLineRepository>(x => new OdooJournalLineRepository(connectionString));
            return services;
        }
    }
}