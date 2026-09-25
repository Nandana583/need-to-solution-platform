# Need-to-Solution Platform

A production-ready full-stack MERN web application engineered with an intelligent **Two-Phase Solution Discovery Engine**:
1. **Phase 1 — Commercial / Professional Providers**: Searches verified local and remote service providers, electricians, technicians, and tutors matching the category, skills, proximity, and availability.
2. **Phase 2 — Community Fallback Solutions**: Automatically activates when commercial options are unavailable, matching peer students, textbook owners, lecture notes, shared equipment, and local lenders.

---

## 🚀 Live Production Deployments

- **Frontend (Vercel)**: [https://client-nu-gilt.vercel.app](https://client-nu-gilt.vercel.app)
- **Backend (Render)**: [https://need-to-solution-platform.onrender.com](https://need-to-solution-platform.onrender.com)
- **Repository**: [https://github.com/Nandana583/need-to-solution-platform](https://github.com/Nandana583/need-to-solution-platform)

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router v7, Axios, Lucide React, React Hot Toast.
- **Backend**: Node.js, Express.js (ES Modules), Mongoose, JWT (`jsonwebtoken`), bcryptjs (12 salt rounds), Cookie-Parser, Helmet, CORS.
- **Database**: MongoDB Atlas with Geospatial 2dsphere indexing and text indexing.
- **Authentication**: Stateless in-memory short-lived Access Tokens (15m) with automatic silent refresh via secure `httpOnly` rotated Refresh Token cookies (7d).
- **One Unified Account Model**: Any registered user can act as a requester and additively unlock provider capabilities or list community resources on the exact same account.

---

## 📦 Directory Structure

```text
need-to-solution/
├── client/                     # React / Vite SPA
│   ├── src/
│   │   ├── api/                # Axios instance with 401 silent refresh retry queue & domain APIs
│   │   ├── components/         # Glassmorphism UI, Navbar, NotificationBell, ProtectedRoute
│   │   ├── context/            # React AuthContext
│   │   ├── hooks/              # Custom hooks (useAuth)
│   │   ├── pages/              # Landing, Dashboard, Needs, Providers, Resources, Bookings, Shares, Admin
│   │   └── styles/             # Tailwind directives & Glassmorphism design tokens
│   ├── .env.example
│   ├── package.json
│   ├── vercel.json             # SPA rewrites for Vercel
│   └── vite.config.js
├── server/                     # Express REST API
│   ├── src/
│   │   ├── config/             # DB connection & environment variable validation
│   │   ├── controllers/        # Auth, Provider, Category, Need, Booking, Resource, Share, Review, Notification
│   │   ├── middleware/         # AuthMiddleware, RoleMiddleware, RateLimiter, ErrorHandler
│   │   ├── models/             # User, RefreshToken, Category, ProviderProfile, Service, Resource, Need, Booking, ShareRequest, Notification, Review
│   │   ├── routes/             # REST API routes mounted under /api/v1
│   │   ├── services/           # AuthService, MatchingService, CategoryService, NotificationService
│   │   └── utils/              # Token utils, AppError, asyncHandler, apiResponse
│   ├── test/                   # Automated Node.js native test suite
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── .env.example
├── .gitignore
└── package.json
```

---

## 🔌 API Overview (`/api/v1`)

| Module | Route | Method | Description |
| :--- | :--- | :---: | :--- |
| **Auth** | `/api/v1/auth/register` | POST | Register new user (default `requester` role) |
| **Auth** | `/api/v1/auth/login` | POST | Login and receive in-memory token + httpOnly refresh cookie |
| **Auth** | `/api/v1/auth/refresh` | POST | Silent token rotation |
| **Auth** | `/api/v1/auth/logout` | POST | Invalidate refresh token and clear cookie |
| **Auth** | `/api/v1/auth/me` | GET / PUT | View & update user profile |
| **Auth** | `/api/v1/auth/me/password` | PUT | Change password & revoke all existing sessions |
| **Categories** | `/api/v1/categories` | GET | List seeded categories |
| **Providers** | `/api/v1/providers/public` | GET | Search and browse active verified providers |
| **Providers** | `/api/v1/providers/public/:id`| GET | View single provider profile, services & reviews |
| **Providers** | `/api/v1/providers/enable-capability` | POST | Additive provider unlock on same account |
| **Providers** | `/api/v1/providers/profile/me` | GET / PUT | Manage provider profile & availability |
| **Providers** | `/api/v1/providers/services` | GET / POST / PUT / DELETE | CRUD for provider service packages |
| **Resources** | `/api/v1/resources/public` | GET | Browse & search community textbooks, notes, and tools |
| **Resources** | `/api/v1/resources/public/:id` | GET | View single resource details & owner info |
| **Resources** | `/api/v1/resources` | POST / GET / PUT / DELETE | Manage shared community items |
| **Needs** | `/api/v1/needs` | POST | Post need & immediately trigger 2-Phase Matching |
| **Needs** | `/api/v1/needs/me` | GET | List user's posted needs with live lifecycle status |
| **Needs** | `/api/v1/needs/:id` | GET | Detailed need tracker with matched providers & fallbacks |
| **Needs** | `/api/v1/needs/:id/match` | POST | Recalculate 2-phase matches |
| **Needs** | `/api/v1/needs/:id/cancel` | PUT | Cancel posted need |
| **Bookings** | `/api/v1/bookings` | POST | Book service package with provider |
| **Bookings** | `/api/v1/bookings/my-requests` | GET | Requester's service booking requests |
| **Bookings** | `/api/v1/bookings/incoming-provider` | GET | Provider's incoming jobs to accept/reject |
| **Bookings** | `/api/v1/bookings/:id/accept` | PUT | Provider accepts booking |
| **Bookings** | `/api/v1/bookings/:id/reject` | PUT | Provider declines booking |
| **Bookings** | `/api/v1/bookings/:id/complete` | PUT | Mark booking completed & increment provider stats |
| **Shares** | `/api/v1/shares` | POST | Send request to borrow/share community resource |
| **Shares** | `/api/v1/shares/sent` | GET | User's sent resource borrow requests |
| **Shares** | `/api/v1/shares/incoming` | GET | Incoming requests for user's listed resources |
| **Shares** | `/api/v1/shares/:id/accept` | PUT | Owner accepts resource share |
| **Shares** | `/api/v1/shares/:id/complete` | PUT | Complete share and return item to available state |
| **Notifications** | `/api/v1/notifications` | GET | List user notifications |
| **Notifications** | `/api/v1/notifications/unread-count` | GET | Live unread notification counter |
| **Notifications** | `/api/v1/notifications/:id/read` | PUT | Mark single notification as read |
| **Reviews** | `/api/v1/reviews` | POST | Submit 1-5★ review on completed bookings/shares |
| **Admin** | `/api/v1/admin/users` | GET | User management catalog |
| **Admin** | `/api/v1/admin/stats` | GET | Platform activity statistics |

---

## 🔑 Required Environment Variables

### Backend (`server/.env` & Render Environment Variables)
- `NODE_ENV`: `production` (in deployment) or `development` (locally)
- `PORT`: Server port (`5000` locally, dynamically bound on Render)
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_ACCESS_SECRET`: Secret key for signing short-lived access JWTs
- `JWT_REFRESH_SECRET`: Secret key for signing rotated refresh JWTs
- `JWT_ACCESS_EXPIRES_IN`: `15m`
- `JWT_REFRESH_EXPIRES_IN`: `7d`
- `CLIENT_URL`: Allowed frontend origin (`http://localhost:5173,https://client-nu-gilt.vercel.app`)
- `ADMIN_EMAIL`: Default administrator email for startup seeder
- `ADMIN_PASSWORD`: Default administrator password for startup seeder

### Frontend (`client/.env` & Vercel Environment Variables)
- `VITE_API_URL`: Backend API base URL (`http://localhost:5000/api/v1` locally or `https://need-to-solution-platform.onrender.com/api/v1` in production)
- `VITE_APP_NAME`: `Need-to-Solution`

---

## 💻 Local Development & Testing

1. **Install dependencies**:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

2. **Run dev servers**:
   - Backend: `npm run dev --prefix server` (http://localhost:5000)
   - Frontend: `npm run dev --prefix client` (http://localhost:5173)

3. **Run Automated Test Suite**:
   ```bash
   npm run test:server
   ```
   *(Executes all 20 authentication, role authorization, and two-phase matching flow tests)*
