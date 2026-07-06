using System;

namespace InfoFin.Model
{
    public partial class BudgetAdjustment
    {
        public int? Id { get; set; }
        public int BudgetId { get; set; }
        public decimal OldAmount { get; set; }
        public decimal NewAmount { get; set; }
        public int AdjustedByUserId { get; set; }
        public string? Reason { get; set; }
        public DateTime? CreateDT { get; set; }
        public DateTime? UpdateDT { get; set; }
        public bool? IsActive { get; set; }
        public int? TotalRows { get; set; }
        public Budget? Budget { get; set; }
        public User? AdjustedByUser { get; set; }
    }
}