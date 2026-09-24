# Need-to-Solution Platform

A full-stack MERN web application engineered with a two-phase solution discovery system: finding verified commercial providers first, and automatically falling back to smart community resource matching when standard options are unavailable.

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, React Router v6, Axios, Lucide React, React Hot Toast, React Hook Form, Zod
- **Backend**: Node.js, Express.js, Mongoose, JSON Web Tokens (JWT), bcryptjs (12 salt rounds), Cookie-Parser, Helmet, CORS, Express-Rate-Limit
- **Database**: MongoDB Atlas
- **Security & Auth**: Stateless in-memory access tokens (15m), secure `httpOnly` rotated refresh token cookies (7d), role-based access control (`requester`, `provider`, `admin`) on a single unified account model

## Directory Structure

```text
need-to-solution/
├── client/                     # Frontend React (Vite) application
│   ├── src/
│   │   ├── api/                # Axios instance with 401 silent refresh retry queue
│   │   ├── components/         # Glassmorphism UI & layout components
│   │   ├── context/            # React AuthContext
│   │   ├── features/           # Auth forms (LoginForm, RegisterForm)
│   │   ├── hooks/              # Custom hooks (useAuth)
│   │   ├── pages/              # Views (Landing, Login, Register, Dashboard, Profile, Provider, Admin)
│   │   └── styles/             # Glassmorphism design tokens & Tailwind directives
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── server/                     # Backend Express REST API
│   ├── src/
│   │   ├── config/             # DB & validated environment config
│   │   ├── controllers/        # Auth & admin controllers
│   │   ├── middleware/         # Auth, role check, rate limiting, error handlers
│   │   ├── models/             # User & RefreshToken Mongoose schemas
│   │   ├── routes/             # API routes (/api/v1/auth, /admin, /providers)
│   │   ├── services/           # AuthService with token rotation
│   │   ├── utils/              # Token utils, AppError, asyncHandler, apiResponse
│   │   └── validators/         # Express-validator schemas
│   ├── test/                   # Automated backend test suite
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── .env.example
├── .gitignore
└── package.json
```

## Getting Started Locally

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster URI or local MongoDB instance

### Installation

1. Clone repository:
   ```bash
   git clone https://github.com/Nandana583/need-to-solution-platform.git
   cd need-to-solution-platform
   ```

2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

3. Install client dependencies:
   ```bash
   cd ../client
   npm install
   ```

4. Configure environment files:
   - Copy `server/.env.example` to `server/.env` and enter your database credentials and secrets.
   - Copy `client/.env.example` to `client/.env`.

5. Run development servers:
   - Backend: `npm run server` (from root) or `npm run dev` in `server/` (runs at http://localhost:5000)
   - Frontend: `npm run client` (from root) or `npm run dev` in `client/` (runs at http://localhost:5173)

6. Run automated test suite:
   ```bash
   npm run test:server
   ```
