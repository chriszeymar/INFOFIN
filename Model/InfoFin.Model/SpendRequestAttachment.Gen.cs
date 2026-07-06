using System;

namespace InfoFin.Model
{
    public partial class SpendRequestAttachment
    {
        public int? Id { get; set; }
        public int SpendRequestId { get; set; }
        public string? FileUrl { get; set; }
        public string? FileName { get; set; }
        public int UploadedByUserId { get; set; }
        public DateTime? CreateDT { get; set; }
        public DateTime? UpdateDT { get; set; }
        public bool? IsActive { get; set; }
        public int? TotalRows { get; set; }
        public SpendRequest? SpendRequest { get; set; }
        public User? UploadedByUser { get; set; }
    }
}