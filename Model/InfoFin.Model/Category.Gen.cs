using System;

namespace InfoFin.Model
{
    public partial class Category
    {
        public int? Id { get; set; }
        public string? Name { get; set; }
        public int FinancialGroupId { get; set; }
        public int? ClassificationId { get; set; }
        public bool IsActive { get; set; }
        public int? TotalRows { get; set; }
        public FinancialGroup? FinancialGroup { get; set; }
        public Classification? Classification { get; set; }
    }
}


