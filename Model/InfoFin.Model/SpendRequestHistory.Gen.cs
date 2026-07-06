using System;

namespace InfoFin.Model
{
    public partial class SpendRequestHistory
    {
        public int? Id { get; set; }
        public int SpendRequestId { get; set; }
        public int ActionById { get; set; }
        public string? OldStatus { get; set; }
        public string? NewStatus { get; set; }
        public string? Comments { get; set; }
        public DateTime? CreateDT { get; set; }
        public DateTime? UpdateDT { get; set; }
        public bool? IsActive { get; set; }
        public int? TotalRows { get; set; }
        public User? ActionBy { get; set; }
        public SpendRequest? SpendRequest { get; set; }
    }
}