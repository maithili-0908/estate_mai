# LuxEstate Full Stack

LuxEstate is a real-estate platform with a React frontend and a Node.js + MongoDB backend.

## Features
- Public browsing: home, listings, map view, agents, property and agent details.
- Auth: register, login, profile, settings, password update.
- Agent dashboard: listing CRUD, appointments, messages, analytics view.
- Admin panel: platform stats, property moderation, user/agent management.
- Interaction flows: save listings, compare listings, send inquiries, contact agents.

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
- Node.js 18+
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/luxestate`)

## Setup
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
JWT_SECRET=luxestate_dev_secret_change_me
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

## API Overview
- Auth: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- Bootstrap: `/api/bootstrap`
- Properties: `/api/properties`
- Agents: `/api/agents`
- User profile/settings: `/api/users/me`, `/api/users/password`, `/api/users/settings`
- Interactions: `/api/interactions/*`
- Admin: `/api/admin/*`
