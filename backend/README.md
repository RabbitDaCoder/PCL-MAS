# PCL-MAS Backend

Node.js + Express + MongoDB API for the Personalized Collaborative Learning MAS platform.

## Architecture

Clean Architecture layering under `src/`:

- `domain/` — framework-agnostic entities (`User`, `ROLES`), errors (`AppError`), repository interfaces. No Express/Mongoose imports.
- `application/` — use-cases (`auth/register`, `auth/login`, `auth/validateToken`, `auth/validators`) that depend only on `domain`.
- `infrastructure/` — Mongoose models (`database/models/*.js`), `database/connection.js`, repository implementations (`repositories/MongoUserRepository.js`), security adapters (`security/passwordHasher.js`, `security/tokenService.js`).
- `interfaces/http/` — Express wiring: `routes/*.js`, `controllers/*.js` (composition roots), `middlewares/*.js` (`authenticate`, `role.middleware` (`requireRole`), `errorHandler`, `rateLimit.middleware`).
- `config/` — `env.js`, `database.js` config, `cors.js`, `swagger.js`.
- `utils/apiResponse.js` — shared `success(data, message)` response helper.

`app.js` builds the Express app (middleware + routes) only. `server.js` is the process entry point: loads env, connects to MongoDB (refuses to start listening if that fails), starts the HTTP server, and handles graceful shutdown on `SIGTERM`/`SIGINT`.

## Running

```
npm install
npm run dev    # nodemon, auto-restart
npm start      # node server.js
```

Requires a `.env` (see `.env.example`): `PORT`, `NODE_ENV`, `MONGODB_URI`, `CLIENT_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `AI_SERVICE_BASE_URL`.

## API

All routes are mounted under `/api/v1`. Every response follows a standard envelope:

- Success: `{ success: true, data, message }`
- Error: `{ success: false, message, error: { code } }`

### Interactive API docs (Swagger / OpenAPI)

- Swagger UI: `http://localhost:4000/api/v1/docs`
- Raw OpenAPI JSON: `http://localhost:4000/api/v1/docs.json`

Docs are generated from JSDoc `@openapi` comments directly above each route handler in `src/interfaces/http/routes/*.js` (see `src/config/swagger.js`). Add a new `@openapi` block whenever a new route is added — no separate spec file to keep in sync.

### Current endpoints

- `GET /health` — API + DB connectivity check
- `POST /auth/register` — student/lecturer registration (admin self-registration rejected)
- `POST /auth/login` — role-aware login
- `GET /auth/me` — current authenticated user (Bearer JWT)

## Security

helmet, CORS restricted to `CLIENT_URL`, rate limiting (general + stricter `authLimiter` on `/auth/*`), bcrypt password hashing, JWT auth via `authenticate` middleware, role checks via `requireRole(...roles)`, centralized error handling (never leaks stack traces), passwords/secrets never logged or returned.

## AI service integration

The Python/CrewAI service is a separate process (`mas-engine/`), reached only over HTTP at `AI_SERVICE_BASE_URL`. No CrewAI/agent code lives in this backend.
