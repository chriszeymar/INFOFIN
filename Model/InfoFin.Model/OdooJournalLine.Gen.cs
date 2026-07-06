using System;

namespace InfoFin.Model
{
    public partial class OdooJournalLine
    {
        public int? Id { get; set; }
        public int OdooLineId { get; set; }
        public int OdooCompanyId { get; set; }
        public string? OdooCompanyName { get; set; }
        public int OdooAccountId { get; set; }
        public string? OdooAccountCode { get; set; }
        public string? OdooAccountName { get; set; }
        public DateTime Date { get; set; }
        public decimal? Debit { get; set; }
        public decimal? Credit { get; set; }
        public string? State { get; set; }
        public DateTime? OdooWriteDate { get; set; }
        public DateTime? ImportedAt { get; set; }
        public int? TotalRows { get; set; }
    }
}