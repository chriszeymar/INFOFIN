using System;

namespace InfoFin.Model
{
    public partial class OdooAccountMapping
    {
        public int? Id { get; set; }
        public string? OdooAccountCode { get; set; }
        public string? OdooAccountName { get; set; }
        public int InfoFinAccountId { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CreateDT { get; set; }
        public DateTime? UpdateDT { get; set; }
        public int? TotalRows { get; set; }
        public Account? InfoFinAccount { get; set; }
    }
}