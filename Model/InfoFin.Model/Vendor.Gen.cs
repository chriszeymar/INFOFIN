using System;

namespace InfoFin.Model
{
    public partial class Vendor
    {
        public int? Id { get; set; }
        public string? Name { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreateDT { get; set; }
        public int? TotalRows { get; set; }
    }
}


