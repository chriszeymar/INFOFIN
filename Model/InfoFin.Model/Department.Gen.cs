using System;

namespace InfoFin.Model
{
    public partial class Department
    {
        public int? Id { get; set; }
        public string? Name { get; set; }
        public int DepartmentGroupId { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CreateDT { get; set; }
        public DateTime? UpdateDT { get; set; }
        public int? OdooCompanyId { get; set; }
        public int? TotalRows { get; set; }
        public DepartmentGroup? DepartmentGroup { get; set; }
    }
}