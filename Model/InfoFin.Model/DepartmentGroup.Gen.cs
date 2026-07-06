using System;

namespace InfoFin.Model
{
    public partial class DepartmentGroup
    {
        public int? Id { get; set; }
        public string? Name { get; set; }
        public int BucketTypeId { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CreateDT { get; set; }
        public DateTime? UpdateDT { get; set; }
        public int? TotalRows { get; set; }
        public BucketType? BucketType { get; set; }
    }
}