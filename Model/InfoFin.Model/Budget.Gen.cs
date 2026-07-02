using System;

namespace InfoFin.Model
{
    public partial class Budget
    {
        public int? Id { get; set; }
        public int DepartmentId { get; set; }
        public int CategoryId { get; set; }
        public int Year { get; set; }
        public int? Month { get; set; }
        public decimal ForecastAmount { get; set; }
        public int CurrencyId { get; set; }
        public DateTime CreateDT { get; set; }
        public DateTime UpdateDT { get; set; }
        public int? TotalRows { get; set; }
        public Department? Department { get; set; }
        public Category? Category { get; set; }
        public Currency? Currency { get; set; }
    }
}


