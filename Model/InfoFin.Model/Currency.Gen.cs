using System;

namespace InfoFin.Model
{
    public partial class Currency
    {
        public int? Id { get; set; }
        public string? Code { get; set; }
        public decimal ExchangeRateToUSD { get; set; }
        public DateTime? UpdateDT { get; set; }
        public DateTime? CreateDT { get; set; }
        public bool? IsActive { get; set; }
        public int? TotalRows { get; set; }
    }
}