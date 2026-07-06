using System;

namespace InfoFin.Model
{
    public partial class Actuals
    {
        public int? Id { get; set; }
        public int DepartmentId { get; set; }
        public int CategoryId { get; set; }
        public int Year { get; set; }
        public int? Month { get; set; }
        public decimal Amount { get; set; }
        public int? TotalRows { get; set; }
        public Category? Category { get; set; }
        public Department? Department { get; set; }
    }
}