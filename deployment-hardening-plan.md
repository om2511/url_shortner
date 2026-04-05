# Deployment Hardening Plan

## Objective
Prepare the project for a Vercel frontend deployment and a Render backend deployment without adding new product features.

## Approved Scope
- Remove insecure default admin bootstrapping and frontend credential exposure.
- Remove JWT fallback behavior and fail fast on missing required environment variables.
- Add backend health endpoint for Render health checks.
- Add production-safe frontend to backend routing for Vercel.
- Update deployment documentation for Vercel and Render.
- Validate install, build, and deploy-critical behavior.

## Work Items
- Review live backend and frontend runtime assumptions and keep changes aligned with actual entrypoints.
- Harden backend configuration handling and authentication behavior.
- Add deploy-safe API base URL handling to the frontend.
- Add Vercel configuration for SPA routing and API rewrites.
- Update README with exact Vercel and Render deployment steps and environment variables.
- Run targeted validation commands and record remaining risks.

## Status
Implementation complete. Backend auth and config hardening are done. Frontend production API configuration and Vercel SPA routing are done. README deployment instructions are updated for Vercel plus Render. Deploy-ready example environment files are added at `backend/.env.example` and `frontend/.env.example`, and the operator checklist is added at `vercel-render-deployment-checklist.md`. Validation is mostly complete: `node --check backend/server.js` passed and `env CI=true npm test -- --watchAll=false --runInBand` passed after fixing the hook dependency issue and mocking the API wrapper in tests. The only remaining open item is a clean final `env CI=true npm run build` confirmation on the target machine or CI because this environment still does not return a reliable CRA build exit status.
