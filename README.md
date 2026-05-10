# LuxEstate Full Stack

LuxEstate is a real-estate platform with:
- React frontend (deploy to Netlify)
- Node.js/Express backend (deploy to Render)
- MongoDB database (MongoDB Atlas/local MongoDB)

This repo is configured for a **Netlify + Render + MongoDB** workflow and does **not** require Docker.

## Tech Stack
- Frontend: React 18, React Router v6, TailwindCSS, Recharts, React Leaflet
- Backend: Node.js, Express, MongoDB, Mongoose, JWT auth

## Project Structure
```text
src/                    # Frontend
backend/
  src/
    controllers/        # API controllers
    routes/             # Express routes
    models/             # Mongoose models
    middleware/         # Auth + error middleware
    utils/              # Seed data + helpers
  scripts/seed.js       # Seed command
```

## Prerequisites
- Node.js 18+ (Node 22 recommended)
- MongoDB local or MongoDB Atlas

## Local Setup
### 1) Install dependencies
```bash
npm install
npm --prefix backend install
```

### 2) Environment files
Frontend (`.env` at repo root):
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

Backend (`backend/.env`):
```bash
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/luxestate
JWT_SECRET=replace-with-a-strong-random-secret
CORS_ORIGIN=http://localhost:3000
```

### 3) Seed database
```bash
npm run backend:seed
```

### 4) Run backend and frontend
Terminal 1:
```bash
npm run backend
```

Terminal 2:
```bash
npm start
```

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:5000/api/health`

## Deploy (No Docker)
### Backend on Render
Use the included `render.yaml` or configure manually.

Manual Render service settings:
- Runtime: `Node`
- Root Directory: `backend`
- Build Command: `npm ci`
- Start Command: `npm run start`
- Health Check Path: `/api/health`

Required Render environment variables:
- `MONGO_URI` = your MongoDB Atlas connection string
- `JWT_SECRET` = long random secret
- `CORS_ORIGIN` = comma-separated allowed frontend origins, e.g.
  `http://localhost:3000,https://your-site.netlify.app`

### Frontend on Netlify
This repo includes:
- `netlify.toml`
- `public/_redirects`

They handle build + SPA route rewrites for React Router.

Required Netlify environment variable:
- `REACT_APP_API_URL` = Render API URL, e.g.
  `https://your-render-service.onrender.com/api`

Build settings (already in `netlify.toml`):
- Build command: `npm run build`
- Publish directory: `build`

## Demo Accounts
| Role  | Email               | Password |
|-------|---------------------|----------|
| User  | user@luxestate.com  | demo123  |
| Agent | agent@luxestate.com | demo123  |
| Admin | admin@luxestate.com | demo123  |

## Available Scripts
- `npm start` - run frontend dev server
- `npm run build` - build frontend production bundle
- `npm run backend` - run backend in dev mode
- `npm run backend:start` - run backend in production mode
- `npm run backend:seed` - seed MongoDB with demo data
- `npm --prefix backend run test:auth` - auth middleware test

## API Overview
- Auth: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- Bootstrap: `/api/bootstrap`
- Properties: `/api/properties`
- Agents: `/api/agents`
- User profile/settings: `/api/users/me`, `/api/users/password`, `/api/users/settings`
- Interactions: `/api/interactions/*`
- Admin: `/api/admin/*`
