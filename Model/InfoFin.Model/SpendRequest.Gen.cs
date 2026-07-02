using System;

namespace InfoFin.Model
{
    public partial class SpendRequest
    {
        public int? Id { get; set; }
        public string? ReferenceNumber { get; set; }
        public int DepartmentId { get; set; }
        public int CategoryId { get; set; }
        public int EncoderId { get; set; }
        public decimal Amount { get; set; }
        public int CurrencyId { get; set; }
        public decimal LockedExchangeRate { get; set; }
        public int? VendorId { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
        public DateTime CreateDT { get; set; }
        public DateTime UpdateDT { get; set; }
        public int? TotalRows { get; set; }
        public Department? Department { get; set; }
        public Category? Category { get; set; }
//         public Encoder? Encoder { get; set; }
        public Currency? Currency { get; set; }
        public Vendor? Vendor { get; set; }
    }
}


