using System;

namespace InfoFin.Model
{
    public partial class User
    {
        public int? Id { get; set; }
        public string? Email { get; set; }
        public string? PasswordHash { get; set; }
        public int RoleId { get; set; }
        public int? DepartmentId { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CreateDT { get; set; }
        public DateTime? UpdateDT { get; set; }
        public int? TotalRows { get; set; }
        public Department? Department { get; set; }
        public Role? Role { get; set; }
    }
}