# Phase 7: v0 UI Integration Plan

This plan details the step-by-step conversion of the exported v0 Next.js App Router code (`InfoFin.UI/ui-design-spec`) into our existing Vite + React Router application (`InfoFin.UI`).

## Step 1: Tooling & Configuration
- [ ] Install production dependencies: `lucide-react`, `recharts`, `clsx`, `tailwind-merge`, `class-variance-authority`, `@base-ui/react`, `tw-animate-css`.
- [ ] Install dev dependencies: `@tailwindcss/postcss`.
- [ ] Configure `@/*` path alias in both `vite.config.ts` and `tsconfig.app.json` (resolving to `./src/*`).
- [ ] Delete `postcss.config.cjs` and create `postcss.config.mjs` configured with `@tailwindcss/postcss` and `autoprefixer`.

## Step 2: Global Styles & Utilities
- [ ] Copy `ui-design-spec/app/globals.css` into `src/index.css` to bring over the full Tailwind v4 Shadcn theme and variables.
- [ ] Copy `ui-design-spec/lib/utils.ts` to `src/lib/utils.ts`.
- [ ] Copy `ui-design-spec/lib/mock-data.ts` to `src/lib/mock-data.ts`.

## Step 3: Base UI Components
- [ ] Copy all Shadcn UI components from `ui-design-spec/components/ui/` to `src/components/ui/`.
- [ ] Ensure all `@/lib/utils` imports within these components resolve correctly.

## Step 4: Auth & Session Context
- [ ] Merge `ui-design-spec/components/session-provider.tsx` logic into our real `src/auth/AuthContext.tsx`.
- [ ] Expose the `useSession` hook from `AuthContext` so that the v0 components (which expect `name`, `email`, `role`, `isElevated`) work seamlessly while backed by our real JWT authentication.

## Step 5: Layout & Navigation (React Router translation)
- [ ] Port `ui-design-spec/components/app-sidebar.tsx` and `top-bar.tsx` to `src/components/`.
- [ ] Replace `next/link` with `react-router-dom`'s `<Link to="...">`.
- [ ] Replace `next/navigation` hooks (`usePathname`, `useRouter`) with `useLocation` and `useNavigate`.
- [ ] Replace `src/layout/AppShell.tsx` with the new shell layout incorporating the Sidebar and TopBar.

## Step 6: Feature Components & Charting fixes
- [ ] Copy `ui-design-spec/components/dashboard/*` and `components/requests/*` into `src/components/`.
- [ ] Fix Next.js routing in components (Slideover, RequestForm).
- [ ] Fix strict TypeScript errors in Recharts tooltips (e.g. `formatter={(v: unknown) => ...}`).

## Step 7: Page Integration & Routing
- [ ] Read and translate the following pages to `src/pages/`:
  - `Login.tsx`
  - `Dashboard.tsx`
  - `SpendRequestsList.tsx`
  - `CreateSpendRequest.tsx`
  - `SpendRequestDetail.tsx`
  - `BudgetManagement.tsx`
  - `MasterData.tsx`
  - `UserManagement.tsx`
  - `Profile.tsx`
- [ ] Update `src/App.tsx` routes exactly mapped to these components.

## Step 8: Final Build Verification
- [ ] Run `tsc -b` and `vite build` to ensure absolute zero errors across the entire codebase.
