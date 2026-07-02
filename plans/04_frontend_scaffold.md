# Phase 4: Frontend Scaffolding

## Step 4.1: React Initialization
- [x] Scaffold standard React application using `npm create vite@latest InfoFin.UI -- --template react-ts`.
- [x] Install Tailwind CSS, PostCSS, and Autoprefixer.
- [x] Install React Router (`react-router-dom`).

## Step 4.2: Apstory API Generation
- [x] Ensure the `InfoFin.Api` is running dynamically (Swagger active).
- [x] Setup `apstory-api-gen.ps1` in the `InfoFin.UI` directory.
- [ ] Execute script to query the live Swagger spec and auto-generate Typescript fetch clients & strict interfaces.

Note: Current run is blocked by parser compatibility in `Apstory.TypescriptCodeGen.Swagger` against generated OpenAPI schema (`components.schemas.ProblemDetails.additionalProperties`).

## Step 4.3: Foundation Setup
- [x] Setup `.env` files for differing environments.
- [x] Hook the generated API clients into a central singleton/axios interceptor that automatically attaches the JWT Bearer token to headers.