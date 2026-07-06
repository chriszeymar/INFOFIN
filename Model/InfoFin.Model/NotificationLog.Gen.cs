using System;

namespace InfoFin.Model
{
    public partial class NotificationLog
    {
        public int? Id { get; set; }
        public int SpendRequestId { get; set; }
        public int RecipientUserId { get; set; }
        public string? TriggerStatus { get; set; }
        public bool? IsSuccessful { get; set; }
        public DateTime? CreateDT { get; set; }
        public DateTime? UpdateDT { get; set; }
        public bool? IsActive { get; set; }
        public int? TotalRows { get; set; }
        public User? RecipientUser { get; set; }
        public SpendRequest? SpendRequest { get; set; }
    }
}