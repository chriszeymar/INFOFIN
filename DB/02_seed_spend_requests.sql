-- Seed data for Spend Request feature
-- Run after 01_initial_schema.sql has been applied
-- Prerequisites: Departments, Categories, Currencies, Users already exist

-- ── Vendors ─────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM [dbo].[Vendor] WHERE [Name] = 'Meridian Media')
BEGIN
  INSERT INTO [dbo].[Vendor] ([Name], [IsActive]) VALUES
    ('Meridian Media', 1),
    ('CloudStack Inc.', 1),
    ('Northgate Services', 1),
    ('Globe Travel Co.', 1),
    ('Summit Events', 1),
    ('TechSupply Ltd.', 1),
    ('FastFreight', 1);
END

-- ── Spend Requests ──────────────────────────────────────
-- Using existing: DepartmentId=1 (CIRRUS), 2 (INFOSET), 3 (GENISYS)
--                CategoryId=1 (Sales Rev-Hardwares), etc.
--                CurrencyId=1 (USD), 2 (FC)
--                EncoderId=2 (analyst.cirrus), etc.

DECLARE @d1 INT = 1, @d2 INT = 2, @d3 INT = 3;  -- departments
DECLARE @c1 INT = 1, @c2 INT = 2;                -- categories (adjust if needed)
DECLARE @usd INT = 1, @fc INT = 2;               -- currencies
DECLARE @u1 INT = 2, @u2 INT = 3, @u3 INT = 1;   -- users (analyst, reviewer, admin)
DECLARE @v1 INT, @v2 INT, @v3 INT, @v4 INT, @v5 INT, @v6 INT;

SELECT @v1 = Id FROM [dbo].[Vendor] WHERE [Name] = 'Meridian Media';
SELECT @v2 = Id FROM [dbo].[Vendor] WHERE [Name] = 'CloudStack Inc.';
SELECT @v3 = Id FROM [dbo].[Vendor] WHERE [Name] = 'Northgate Services';
SELECT @v4 = Id FROM [dbo].[Vendor] WHERE [Name] = 'Globe Travel Co.';
SELECT @v5 = Id FROM [dbo].[Vendor] WHERE [Name] = 'Summit Events';
SELECT @v6 = Id FROM [dbo].[Vendor] WHERE [Name] = 'TechSupply Ltd.';

-- Use a fallback category if the seeded ones differ from expectations
DECLARE @catMarketing INT, @catSoftware INT, @catFacilities INT, @catTravel INT, @catEvents INT, @catHardware INT;
SELECT @catMarketing  = MIN(Id) FROM [dbo].[Category] WHERE [IsActive] = 1;
SELECT @catSoftware   = @catMarketing;
SELECT @catFacilities = @catMarketing;
SELECT @catTravel     = @catMarketing;
SELECT @catEvents     = @catMarketing;
SELECT @catHardware   = @catMarketing;

-- Request 1: Under Review
IF NOT EXISTS (SELECT 1 FROM [dbo].[SpendRequest] WHERE [ReferenceNumber] = 'SR-2026-0148')
INSERT INTO [dbo].[SpendRequest] ([ReferenceNumber], [DepartmentId], [CategoryId], [EncoderId], [AssignedToUserId], [Amount], [CurrencyId], [LockedExchangeRate], [VendorId], [Description], [Status], [CreateDT], [UpdateDT])
VALUES ('SR-2026-0148', @d1, @catMarketing, @u1, @u2, 48000.00, @usd, 1.0, @v1, 'Q3 digital advertising campaign across paid social and search to support the product launch.', 'UnderReview', '2026-06-18', '2026-06-18');

-- Request 2: Under Review
IF NOT EXISTS (SELECT 1 FROM [dbo].[SpendRequest] WHERE [ReferenceNumber] = 'SR-2026-0147')
INSERT INTO [dbo].[SpendRequest] ([ReferenceNumber], [DepartmentId], [CategoryId], [EncoderId], [AssignedToUserId], [Amount], [CurrencyId], [LockedExchangeRate], [VendorId], [Description], [Status], [CreateDT], [UpdateDT])
VALUES ('SR-2026-0147', @d3, @catSoftware, @u1, @u2, 22500.00, @usd, 1.0, @v2, 'Annual renewal of cloud infrastructure monitoring and observability suite.', 'UnderReview', '2026-06-17', '2026-06-18');

-- Request 3: Completed (FC currency)
IF NOT EXISTS (SELECT 1 FROM [dbo].[SpendRequest] WHERE [ReferenceNumber] = 'SR-2026-0146')
INSERT INTO [dbo].[SpendRequest] ([ReferenceNumber], [DepartmentId], [CategoryId], [EncoderId], [AssignedToUserId], [Amount], [CurrencyId], [LockedExchangeRate], [VendorId], [Description], [Status], [CreateDT], [UpdateDT])
VALUES ('SR-2026-0146', @d2, @catFacilities, @u1, @u2, 91000.00, @fc, 2200.0, @v3, 'Office refurbishment for the regional headquarters, phase one.', 'Completed', '2026-06-15', '2026-06-17');

-- Request 4: Completed (USD)
IF NOT EXISTS (SELECT 1 FROM [dbo].[SpendRequest] WHERE [ReferenceNumber] = 'SR-2026-0145')
INSERT INTO [dbo].[SpendRequest] ([ReferenceNumber], [DepartmentId], [CategoryId], [EncoderId], [AssignedToUserId], [Amount], [CurrencyId], [LockedExchangeRate], [VendorId], [Description], [Status], [CreateDT], [UpdateDT])
VALUES ('SR-2026-0145', @d1, @catTravel, @u1, @u2, 12750.00, @usd, 1.0, @v4, 'Customer conference attendance and client visits across the EMEA region.', 'Completed', '2026-06-12', '2026-06-14');

-- Request 5: Declined
IF NOT EXISTS (SELECT 1 FROM [dbo].[SpendRequest] WHERE [ReferenceNumber] = 'SR-2026-0144')
INSERT INTO [dbo].[SpendRequest] ([ReferenceNumber], [DepartmentId], [CategoryId], [EncoderId], [AssignedToUserId], [Amount], [CurrencyId], [LockedExchangeRate], [VendorId], [Description], [Status], [CreateDT], [UpdateDT])
VALUES ('SR-2026-0144', @d1, @catEvents, @u1, @u2, 64000.00, @usd, 1.0, @v5, 'Sponsorship of industry trade show booth and hospitality suite.', 'Declined', '2026-06-10', '2026-06-12');

-- Request 6: Posted
IF NOT EXISTS (SELECT 1 FROM [dbo].[SpendRequest] WHERE [ReferenceNumber] = 'SR-2026-0143')
INSERT INTO [dbo].[SpendRequest] ([ReferenceNumber], [DepartmentId], [CategoryId], [EncoderId], [AssignedToUserId], [Amount], [CurrencyId], [LockedExchangeRate], [VendorId], [Description], [Status], [CreateDT], [UpdateDT])
VALUES ('SR-2026-0143', @d3, @catHardware, @u1, NULL, 8900.00, @usd, 1.0, @v6, 'Replacement workstations for the platform team.', 'Posted', '2026-06-20', '2026-06-20');

-- ── History entries ─────────────────────────────────────
DECLARE @sr1 INT, @sr2 INT, @sr3 INT, @sr4 INT, @sr5 INT, @sr6 INT;
SELECT @sr1 = Id FROM [dbo].[SpendRequest] WHERE [ReferenceNumber] = 'SR-2026-0148';
SELECT @sr2 = Id FROM [dbo].[SpendRequest] WHERE [ReferenceNumber] = 'SR-2026-0147';
SELECT @sr3 = Id FROM [dbo].[SpendRequest] WHERE [ReferenceNumber] = 'SR-2026-0146';
SELECT @sr4 = Id FROM [dbo].[SpendRequest] WHERE [ReferenceNumber] = 'SR-2026-0145';
SELECT @sr5 = Id FROM [dbo].[SpendRequest] WHERE [ReferenceNumber] = 'SR-2026-0144';
SELECT @sr6 = Id FROM [dbo].[SpendRequest] WHERE [ReferenceNumber] = 'SR-2026-0143';

-- SR-2026-0148: Posted -> UnderReview
IF NOT EXISTS (SELECT 1 FROM [dbo].[SpendRequestHistory] WHERE [SpendRequestId] = @sr1 AND [NewStatus] = 'Posted')
INSERT INTO [dbo].[SpendRequestHistory] ([SpendRequestId], [ActionById], [OldStatus], [NewStatus], [Comments], [CreateDT])
VALUES
  (@sr1, @u1, 'Draft', 'Posted', 'Spend request created', '2026-06-18'),
  (@sr1, @u2, 'Posted', 'UnderReview', 'Assigned for review', '2026-06-18');

-- SR-2026-0147: Posted -> UnderReview -> Approved
IF NOT EXISTS (SELECT 1 FROM [dbo].[SpendRequestHistory] WHERE [SpendRequestId] = @sr2 AND [NewStatus] = 'Approved')
INSERT INTO [dbo].[SpendRequestHistory] ([SpendRequestId], [ActionById], [OldStatus], [NewStatus], [Comments], [CreateDT])
VALUES
  (@sr2, @u1, 'Draft', 'Posted', 'Spend request created', '2026-06-17'),
  (@sr2, @u2, 'Posted', 'UnderReview', 'Assigned for review', '2026-06-17'),
  (@sr2, @u3, 'UnderReview', 'Approved', 'Approved, within budget.', '2026-06-18');

-- SR-2026-0146: Posted -> UnderReview -> Approved -> Completed
IF NOT EXISTS (SELECT 1 FROM [dbo].[SpendRequestHistory] WHERE [SpendRequestId] = @sr3 AND [NewStatus] = 'Completed')
INSERT INTO [dbo].[SpendRequestHistory] ([SpendRequestId], [ActionById], [OldStatus], [NewStatus], [Comments], [CreateDT])
VALUES
  (@sr3, @u1, 'Draft', 'Posted', 'Spend request created', '2026-06-15'),
  (@sr3, @u2, 'Posted', 'UnderReview', 'Assigned for review', '2026-06-15'),
  (@sr3, @u3, 'UnderReview', 'Approved', 'Capex confirmed.', '2026-06-16'),
  (@sr3, @u1, 'Approved', 'Completed', 'Request fulfilled', '2026-06-17');

-- SR-2026-0145: Posted -> UnderReview -> Approved -> Completed
IF NOT EXISTS (SELECT 1 FROM [dbo].[SpendRequestHistory] WHERE [SpendRequestId] = @sr4 AND [NewStatus] = 'Completed')
INSERT INTO [dbo].[SpendRequestHistory] ([SpendRequestId], [ActionById], [OldStatus], [NewStatus], [Comments], [CreateDT])
VALUES
  (@sr4, @u1, 'Draft', 'Posted', 'Spend request created', '2026-06-12'),
  (@sr4, @u2, 'Posted', 'UnderReview', 'Assigned for review', '2026-06-12'),
  (@sr4, @u3, 'UnderReview', 'Approved', 'Approved', '2026-06-13'),
  (@sr4, @u1, 'Approved', 'Completed', 'Request fulfilled', '2026-06-14');

-- SR-2026-0144: Posted -> UnderReview -> Declined
IF NOT EXISTS (SELECT 1 FROM [dbo].[SpendRequestHistory] WHERE [SpendRequestId] = @sr5 AND [NewStatus] = 'Declined')
INSERT INTO [dbo].[SpendRequestHistory] ([SpendRequestId], [ActionById], [OldStatus], [NewStatus], [Comments], [CreateDT])
VALUES
  (@sr5, @u1, 'Draft', 'Posted', 'Spend request created', '2026-06-10'),
  (@sr5, @u2, 'Posted', 'UnderReview', 'Assigned for review', '2026-06-10'),
  (@sr5, @u3, 'UnderReview', 'Declined', 'Exceeds remaining events budget for the quarter.', '2026-06-12');

-- SR-2026-0143: Posted
IF NOT EXISTS (SELECT 1 FROM [dbo].[SpendRequestHistory] WHERE [SpendRequestId] = @sr6)
INSERT INTO [dbo].[SpendRequestHistory] ([SpendRequestId], [ActionById], [OldStatus], [NewStatus], [Comments], [CreateDT])
VALUES
  (@sr6, @u1, 'Draft', 'Posted', 'Spend request created', '2026-06-20');

PRINT 'Seed data inserted successfully.';
