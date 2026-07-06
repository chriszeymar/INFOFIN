using System;

namespace InfoFin.Model
{
    public partial class Category
    {
        public int? Id { get; set; }
        public string? Name { get; set; }
        public int FinancialGroupId { get; set; }
        public int? ClassificationId { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CreateDT { get; set; }
        public DateTime? UpdateDT { get; set; }
        public int? OdooAccountId { get; set; }
        public string? OdooAccountCode { get; set; }
        public string? OdooAccountType { get; set; }
        public int? TotalRows { get; set; }
        public Classification? Classification { get; set; }
        public FinancialGroup? FinancialGroup { get; set; }
    }
}