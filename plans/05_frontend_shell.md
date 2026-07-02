# Phase 5: Frontend UI Shell

## Step 5.1: Authentication Context
- [x] Build React `AuthContext` to hold the parsed JWT user token.
- [x] Create `ProtectedRoute` wrappers.
- [x] Build a basic static `/login` screen to capture email/password and populate the Auth Context.

## Step 5.2: Layout & Navigation Shell
- [x] Build a fixed Sidebar and Top Header shell layout.
- [x] Map navigation links that conditionally render based on `User.RoleId` (e.g., only Admin sees "Master Data").

## Step 5.3: Empty View Stubs (AI UI Prep)
- [x] Build blank component files for:
  - `Dashboard.tsx`
  - `SpendRequestsList.tsx`
  - `CreateSpendRequest.tsx`
  - `BudgetManagement.tsx`
- [x] Wire these components into React Router so the app is navigable.
- *Note: At this stage, the UI is handed off to visual AI tools (v0/Figma) to paste the actual JSX markup into these stubs.*