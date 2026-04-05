# Vercel + Render Deployment Checklist

## 1. Backend Preparation
- Confirm the Render service will use the `backend` root directory.
- Confirm the Render build command is `npm install`.
- Confirm the Render start command is `npm start`.
- Confirm the Render health check path is `/health`.
- Copy `backend/.env.example` into Render environment variables.
- Replace `MONGODB_URI` with the MongoDB Atlas connection string.
- Replace `JWT_SECRET` with a long random secret.
- Replace `BASE_URL` with the public Render backend URL.
- Replace `CORS_ALLOWED_ORIGINS` with the Vercel production URL and any custom frontend domain.
- Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` for the first deploy.

## 2. Frontend Preparation
- Confirm the Vercel project will use the `frontend` root directory.
- Confirm the Vercel build command is `npm run build`.
- Confirm the Vercel output directory is `build`.
- Copy `frontend/.env.example` into Vercel environment variables.
- Replace `REACT_APP_API_BASE_URL` with the public Render backend URL.
- Confirm `frontend/vercel.json` is present so BrowserRouter refreshes rewrite to `index.html`.

## 3. Local Verification Before Deploy
- From `backend/`, run `node --check server.js`.
- From `frontend/`, run `env CI=true npm run build`.
- From `frontend/`, run `env CI=true npm test -- --watchAll=false --runInBand`.
- Confirm the frontend can create a shortened URL against the backend.
- Confirm the admin login works with the configured admin credentials.

## 4. Render Deployment
- Create the Render web service.
- Add all backend environment variables before the first production start.
- Deploy the service.
- Open `https://your-render-service.onrender.com/health` and confirm it returns a healthy JSON response.
- Confirm the first startup either seeds the configured admin user or reports that the user already exists.

## 5. Vercel Deployment
- Create the Vercel project.
- Add `REACT_APP_API_BASE_URL` before deploying.
- Deploy the frontend.
- Open the Vercel URL and confirm the home page loads.
- Open `/admin` directly and confirm it loads without a 404 on refresh.

## 6. Production Smoke Test
- Create a shortened URL from the Vercel frontend.
- Open the generated short URL and confirm it redirects correctly.
- Confirm the generated short URL uses the Render backend domain from `BASE_URL`.
- Log into `/admin` from the Vercel frontend.
- Confirm listing, editing, and deleting URLs work.
- Confirm click counts increase after redirects.

## 7. Immediate Post-Deploy Cleanup
- If you only needed `ADMIN_USERNAME` and `ADMIN_PASSWORD` for first-time seeding, remove them after confirming the admin account exists.
- Keep `JWT_SECRET`, `MONGODB_URI`, `BASE_URL`, and `CORS_ALLOWED_ORIGINS` in place.
- If you move to custom domains later, update both `BASE_URL` and `CORS_ALLOWED_ORIGINS` together.

## Operator Warning
- Do not point `REACT_APP_API_BASE_URL` at the Vercel frontend domain.
- Do not leave `BASE_URL` pointing at localhost.
- Do not remove CORS configuration in production.
- Do not assume the old CRA `proxy` setting affects production. It does not.
