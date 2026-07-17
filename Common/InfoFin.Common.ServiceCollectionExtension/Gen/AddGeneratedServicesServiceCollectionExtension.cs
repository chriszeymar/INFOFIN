using Microsoft.Extensions.DependencyInjection;
using InfoFin.Domain.Interface;
using InfoFin.Domain;

namespace InfoFin.ServiceCollectionExtension.Gen
{
    public static class AddGeneratedServicesServiceCollectionExtension
    {
        public static IServiceCollection AddGeneratedServices(this IServiceCollection services)
        {
            services.AddTransient<IBucketTypeService, BucketTypeService>();
            services.AddTransient<IBudgetService, BudgetService>();
            services.AddTransient<IBudgetAdjustmentService, BudgetAdjustmentService>();
            services.AddTransient<IClassificationService, ClassificationService>();
            services.AddTransient<ICurrencyService, CurrencyService>();
            services.AddTransient<IDepartmentService, DepartmentService>();
            services.AddTransient<IDepartmentGroupService, DepartmentGroupService>();
            services.AddTransient<IFinancialGroupService, FinancialGroupService>();
            services.AddTransient<INotificationLogService, NotificationLogService>();
            services.AddTransient<IRoleService, RoleService>();
            services.AddTransient<ISpendRequestService, SpendRequestService>();
            services.AddTransient<ISpendRequestAttachmentService, SpendRequestAttachmentService>();
            services.AddTransient<ISpendRequestHistoryService, SpendRequestHistoryService>();
            services.AddTransient<IUserService, UserService>();
            services.AddTransient<IVendorService, VendorService>();
            services.AddTransient<IActualsService, ActualsService>();
            services.AddTransient<IOdooAccountMappingService, OdooAccountMappingService>();
            services.AddTransient<IOdooJournalLineService, OdooJournalLineService>();
            services.AddTransient<IAccountService, AccountService>();
            return services;
        }
    }
}