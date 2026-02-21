# System Design

A deep-dive into the architectural decisions, trade-offs, and design patterns behind this backend.

---

## Table of Contents

1. [Requirements](#1-requirements)
2. [Capacity Estimation](#2-capacity-estimation)
3. [API Design](#3-api-design)
4. [Database Design](#4-database-design)
5. [Architectural Decisions](#5-architectural-decisions)
6. [Authentication & Session Design](#6-authentication--session-design)
7. [Security Design](#7-security-design)
8. [Caching Strategy](#8-caching-strategy)
9. [Rate Limiting Design](#9-rate-limiting-design)
10. [Error Handling Strategy](#10-error-handling-strategy)
11. [Testing Strategy](#11-testing-strategy)
12. [Scalability Considerations](#12-scalability-considerations)
13. [Trade-offs & Alternatives Considered](#13-trade-offs--alternatives-considered)
14. [Future Improvements](#14-future-improvements)

---

## 1. Requirements

### Functional Requirements

- Users can register and log in with email and password
- Authenticated users can create, read, update, and delete their own tasks
- Admins can manage all users and tasks
- Access tokens expire; refresh tokens allow session extension without re-login
- All API responses follow a consistent structure

### Non-Functional Requirements

| Requirement              | Target                              |
| ------------------------ | ----------------------------------- |
| **Availability**         | 99.9% uptime                        |
| **Latency**              | p95 < 200ms per API call            |
| **Security**             | OWASP Top 10 mitigations            |
| **Scalability**          | Horizontally scalable app tier      |
| **Observability**        | Structured logging, health endpoint |
| **Developer Experience** | Type-safe, well-tested, documented  |

### Out of Scope (for this reference implementation)

- Message queues / async job processing
- Real-time features (WebSockets)
- Multi-tenancy
- CDN / static asset delivery
- Payment processing

---

## 2. Capacity Estimation

> These are illustrative estimates for a moderate-scale SaaS product. Adjust based on actual traffic.

### Assumptions

- **10,000 Daily Active Users (DAU)**
- **Average 20 API requests per user per day**
- **Read/write ratio: 80/20**

### Request Volume

```
Total daily requests    = 10,000 × 20         = 200,000 req/day
Requests per second     = 200,000 / 86,400     ≈ 2.3 req/s (average)
Peak RPS (10× avg)                             ≈ 23 req/s
```

### Storage

```
Users table:    10,000 rows × ~500 bytes       ≈ 5 MB
Tasks table:    10,000 users × 50 tasks avg    = 500,000 rows × ~1 KB ≈ 500 MB
Refresh tokens: 10,000 rows × ~200 bytes       ≈ 2 MB
Total (year 1)                                 ≈ 1–2 GB (well within single PostgreSQL instance)
```

### Conclusion

A single Fastify node + single PostgreSQL instance comfortably serves this load. Horizontal scaling only required beyond ~500 RPS sustained.

---

## 3. API Design

### Base URL

```
https://api.yourdomain.com/api/v1
```

### Versioning Strategy

URI versioning (`/api/v1`) was chosen over header versioning for:

- Discoverability (visible in browser / logs)
- Simplicity for consumers
- Easy routing separation in Fastify

### Endpoint Reference

#### Auth

| Method | Path             | Auth          | Description                     |
| ------ | ---------------- | ------------- | ------------------------------- |
| `POST` | `/auth/register` | None          | Create new user account         |
| `POST` | `/auth/login`    | None          | Authenticate and receive tokens |
| `POST` | `/auth/refresh`  | Refresh Token | Issue new access token          |
| `POST` | `/auth/logout`   | Bearer        | Invalidate refresh token        |

#### Users

| Method   | Path         | Auth   | Description              |
| -------- | ------------ | ------ | ------------------------ |
| `GET`    | `/users/me`  | Bearer | Get current user profile |
| `PATCH`  | `/users/me`  | Bearer | Update current user      |
| `GET`    | `/users`     | Admin  | List all users           |
| `DELETE` | `/users/:id` | Admin  | Delete a user            |

#### Tasks

| Method   | Path         | Auth   | Description               |
| -------- | ------------ | ------ | ------------------------- |
| `GET`    | `/tasks`     | Bearer | List current user's tasks |
| `POST`   | `/tasks`     | Bearer | Create a task             |
| `GET`    | `/tasks/:id` | Bearer | Get task by ID            |
| `PATCH`  | `/tasks/:id` | Bearer | Update task               |
| `DELETE` | `/tasks/:id` | Bearer | Delete task               |

### Standard Response Envelopes

**Success**

```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Paginated**

```json
{
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

**Error**

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Task with ID abc123 does not exist"
  }
}
```

---

## 4. Database Design

### Schema

```sql
-- Users
CREATE TABLE users (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'USER',   -- 'USER' | 'ADMIN'
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  completed    BOOLEAN NOT NULL DEFAULT FALSE,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Refresh Tokens
CREATE TABLE refresh_tokens (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  token        TEXT UNIQUE NOT NULL,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at   TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Indexing Strategy

```sql
-- Primary lookups
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- Email lookup on login
-- Covered by UNIQUE constraint on users.email
```

### Design Decisions

**UUIDs as primary keys** — avoids sequential ID enumeration attacks, safe to expose in URLs.

**ON DELETE CASCADE for tasks and tokens** — when a user is deleted, all related records are removed automatically. Simplifies application code and prevents orphaned rows.

**`updated_at` managed by Prisma** — Prisma's `@updatedAt` decorator handles this automatically, keeping it consistent without triggers.

**Soft deletes not implemented** — kept out of scope for clarity. A `deleted_at` column can be added if audit trails become a requirement.

---

## 5. Architectural Decisions

### Decision 1: Fastify over Express

|                   | Fastify                      | Express                   |
| ----------------- | ---------------------------- | ------------------------- |
| Performance       | ~3× faster on benchmarks     | Slower                    |
| Schema validation | Built-in (JSON Schema)       | Manual / middleware       |
| TypeScript        | First-class support          | Requires additional setup |
| Plugin ecosystem  | Mature, well-structured      | Massive but uneven        |
| OpenAPI           | Native via `fastify-swagger` | Manual                    |

**Decision**: Fastify, for performance, built-in validation, and first-class TypeScript.

---

### Decision 2: Prisma over raw SQL / other ORMs

|                   | Prisma              | TypeORM     | Knex        | Raw SQL        |
| ----------------- | ------------------- | ----------- | ----------- | -------------- |
| Type safety       | ✅ Generated types  | ⚠️ Partial  | ❌ None     | ❌ None        |
| Migration tooling | ✅ Built-in         | ✅ Built-in | ✅ Built-in | ❌ Manual      |
| DX                | ✅ Excellent        | ⚠️ Complex  | ⚠️ Verbose  | ❌ Error-prone |
| Query flexibility | ⚠️ Some limitations | ✅ Good     | ✅ Full     | ✅ Full        |

**Decision**: Prisma, for its superior type safety and developer experience. Raw query escape hatch available via `prisma.$queryRaw` for complex cases.

---

### Decision 3: Stateless JWT over Server-Side Sessions

|                           | JWT (Stateless)                        | Server-Side Sessions             |
| ------------------------- | -------------------------------------- | -------------------------------- |
| Horizontal scaling        | ✅ No shared state                     | ❌ Requires shared store (Redis) |
| Token revocation          | ⚠️ Hard (needs refresh token rotation) | ✅ Instant                       |
| Infrastructure complexity | ✅ Low                                 | ⚠️ Requires session store        |
| Payload size              | ⚠️ Larger per request                  | ✅ Just a session ID             |

**Decision**: JWT for stateless scalability. Refresh token rotation mitigates the revocation weakness.

---

### Decision 4: Argon2 over bcrypt for Password Hashing

|                   | Argon2id        | bcrypt                   |
| ----------------- | --------------- | ------------------------ |
| Memory-hardness   | ✅ Yes          | ❌ No                    |
| OWASP recommended | ✅ First choice | ✅ Acceptable fallback   |
| GPU resistance    | ✅ Strong       | ⚠️ Weaker                |
| Node.js library   | ✅ `argon2`     | ✅ `bcrypt` / `bcryptjs` |

**Decision**: Argon2id — current OWASP first recommendation for password hashing.

---

## 6. Authentication & Session Design

### Token Lifecycle

```
Registration / Login
        │
        ▼
   Issue Access Token (short-lived: 15 min)
   Issue Refresh Token (long-lived: 7 days, stored in DB)
        │
        ▼
   Client stores tokens (memory / secure storage)
        │
        ├─── Access Token valid ──► Use directly on requests
        │
        └─── Access Token expired ──► POST /auth/refresh
                                          │
                                          ▼
                                   Validate refresh token (DB lookup)
                                   Rotate: delete old, issue new pair
                                          │
                                          ▼
                                   New Access Token + New Refresh Token
```

### Refresh Token Rotation

Each use of a refresh token invalidates it and issues a new one. This limits the damage window if a refresh token is stolen — the attacker can only use it once before the legitimate user's next refresh renders it invalid.

### Token Payload

```json
// Access Token
{
  "userId": "uuid",
  "role": "USER",
  "iat": 1700000000,
  "exp": 1700000900
}

// Refresh Token
{
  "userId": "uuid",
  "iat": 1700000000,
  "exp": 1700604800
}
```

Minimal payload — no sensitive data, no permissions that expand beyond role checks.

---

## 7. Security Design

### Threat Model Summary

| Threat                   | Mitigation                                           |
| ------------------------ | ---------------------------------------------------- |
| Brute-force login        | Rate limiting (global + per-route)                   |
| Password database breach | Argon2id hashing                                     |
| Token theft              | Short access token TTL + refresh rotation            |
| XSS                      | Helmet CSP headers                                   |
| Clickjacking             | Helmet `X-Frame-Options`                             |
| MIME sniffing            | Helmet `X-Content-Type-Options`                      |
| SQL injection            | Prisma parameterized queries                         |
| Mass assignment          | Explicit Prisma `select` / DTO validation            |
| CORS bypass              | Strict origin allowlist                              |
| Secret leakage           | Env vars, never in source code, fail-fast validation |
| Enumeration attacks      | UUID primary keys, consistent error messages         |

### Security Headers (Helmet)

```
Content-Security-Policy:    default-src 'self'
X-Frame-Options:            DENY
X-Content-Type-Options:     nosniff
Referrer-Policy:            no-referrer
Strict-Transport-Security:  max-age=31536000; includeSubDomains
```

---

## 8. Caching Strategy

> Caching is **not implemented** in the current version. Below documents the recommended approach when scaling demands it.

### What to Cache

| Data                            | Strategy                                 | TTL            |
| ------------------------------- | ---------------------------------------- | -------------- |
| User profile (`/users/me`)      | Redis, per-user key                      | 5 min          |
| Task lists (`/tasks`)           | Redis, per-user key, invalidate on write | 2 min          |
| JWT public keys (if asymmetric) | In-memory                                | Until rotation |

### Cache Invalidation Rules

- Write operations (`POST`, `PATCH`, `DELETE`) must invalidate the relevant user's cache keys
- Prefer **cache-aside** pattern: check cache → on miss, query DB → populate cache

### Why Not Cached Now

Adding Redis introduces operational complexity (another container, connection management, cache invalidation bugs). At the current scale estimate (~2 RPS average), PostgreSQL with proper indexing is well within capacity without caching.

---

## 9. Rate Limiting Design

### Current Implementation

Global rate limiter applied to all routes via Fastify plugin.

```
Window:   1 minute
Limit:    100 requests per IP
Response: 429 Too Many Requests
```

### Recommended Route-Specific Limits

| Route                 | Limit                  | Reasoning                |
| --------------------- | ---------------------- | ------------------------ |
| `POST /auth/login`    | 10 req / 15 min per IP | Prevent brute-force      |
| `POST /auth/register` | 5 req / hour per IP    | Prevent account spam     |
| `POST /auth/refresh`  | 30 req / 15 min per IP | Token rotation abuse     |
| All other routes      | 100 req / min per user | General abuse protection |

### Future: Distributed Rate Limiting

When running multiple app instances, per-instance in-memory limits are insufficient. Use Redis as the shared counter store with a sliding window algorithm.

---

## 10. Error Handling Strategy

### Error Classification

```
AppError (known, expected)
├── ValidationError      400  VALIDATION_ERROR
├── AuthenticationError  401  INVALID_CREDENTIALS / TOKEN_EXPIRED
├── AuthorizationError   403  INSUFFICIENT_PERMISSIONS
├── NotFoundError        404  RESOURCE_NOT_FOUND
└── ConflictError        409  EMAIL_ALREADY_EXISTS

UnhandledError (unknown, unexpected)
└── Caught by global handler → 500 INTERNAL_ERROR + stack logged
```

### Global Error Handler Responsibilities

1. Distinguish `AppError` from unknown errors
2. Format consistent JSON error response
3. Set correct HTTP status code
4. Log stack traces for unexpected errors (not for domain errors)
5. Never leak internal stack traces to the client in production

### Error Code Catalogue

| Code                       | HTTP | Description                      |
| -------------------------- | ---- | -------------------------------- |
| `VALIDATION_ERROR`         | 400  | Schema validation failure        |
| `INVALID_CREDENTIALS`      | 401  | Wrong email or password          |
| `TOKEN_EXPIRED`            | 401  | Access token has expired         |
| `TOKEN_INVALID`            | 401  | Malformed or tampered token      |
| `INSUFFICIENT_PERMISSIONS` | 403  | User role cannot access resource |
| `RESOURCE_NOT_FOUND`       | 404  | Entity does not exist            |
| `EMAIL_ALREADY_EXISTS`     | 409  | Registration conflict            |
| `RATE_LIMIT_EXCEEDED`      | 429  | Too many requests                |
| `INTERNAL_ERROR`           | 500  | Unexpected server failure        |

---

## 11. Testing Strategy

### Test Pyramid

```
        ▲
       /E\        End-to-End Tests (not in scope)
      /   \       Full stack, slow, brittle
     /─────\
    / Integ \     Integration Tests ← Supertest + real Fastify
   / Tests   \    HTTP layer, middleware, CORS, auth flows
  /───────────\
 /  Unit Tests \  Unit Tests ← Jest + mocks
/───────────────\ Services, business logic, pure functions
```

### Unit Test Approach

Services are tested in complete isolation:

```typescript
// Prisma, JWT, and Argon2 are all jest.mock()'d
// Tests verify:
// - Correct DB methods called with correct args
// - Correct tokens issued on success
// - Correct errors thrown on failure
// - Edge cases (user not found, wrong password, etc.)
```

### Integration Test Approach

Real Fastify server is built (no mocks), real Prisma client pointed at a test database:

```typescript
// Tests verify:
// - Full HTTP request/response cycle
// - Middleware behavior (CORS headers, rate limits)
// - Auth flows end-to-end
// - Protected routes reject unauthenticated requests
// - Role-based access enforced
```

### Test Database Strategy

- Separate `.env.test` with `TEST_DATABASE_URL`
- Migrations run before suite via `prisma migrate deploy`
- Each test suite resets relevant tables with `prisma.$transaction` rollback or `deleteMany`

---

## 12. Scalability Considerations

### Current Architecture (Single Node)

```
Internet → Fastify App (1 instance) → PostgreSQL (1 instance)
```

Suitable for: < 500 RPS sustained, < 10,000 DAU.

### Horizontal Scaling Path

```
                    ┌─── Fastify App Instance 1 ───┐
Internet ──► LB ───├─── Fastify App Instance 2 ───┼──► PostgreSQL Primary
                    └─── Fastify App Instance 3 ───┘         │
                                                          Read Replicas
                                                         (read-heavy queries)
```

**What enables this**: stateless JWT authentication means any instance can handle any request — no sticky sessions needed.

**What needs to change**:

- Rate limiting must move to Redis (shared counter)
- Refresh token store is already in PostgreSQL (shared)
- Add a load balancer (nginx, AWS ALB)

### Database Scaling Path

| Scale       | Strategy                                                            |
| ----------- | ------------------------------------------------------------------- |
| Read-heavy  | Add PostgreSQL read replicas, route reads via Prisma replica config |
| Write-heavy | Partition tables (e.g., tasks by user_id range)                     |
| Very large  | Migrate to distributed DB (CockroachDB, PlanetScale)                |

### Bottleneck Analysis

| Component     | Current Bottleneck     | Mitigation                                   |
| ------------- | ---------------------- | -------------------------------------------- |
| Auth (argon2) | CPU-intensive          | Worker thread pool or dedicated auth service |
| DB reads      | Index coverage         | Covered by current indexes at this scale     |
| DB writes     | Single primary         | Read replicas defer this concern             |
| Rate limiting | In-memory per-instance | Redis shared counter                         |

---

## 13. Trade-offs & Alternatives Considered

### What was prioritized

- **Developer experience** over premature optimization
- **Type safety** over flexibility (Prisma over raw SQL)
- **Simplicity** over feature completeness (no Redis, no queues yet)
- **Security correctness** over convenience (Argon2, refresh rotation)

### Alternatives Not Chosen

| Decision       | Alternative      | Why not chosen                          |
| -------------- | ---------------- | --------------------------------------- |
| Fastify        | Express          | Performance and built-in validation     |
| Prisma         | TypeORM          | Better type inference, cleaner DX       |
| JWT            | Sessions + Redis | Requires additional infrastructure      |
| Argon2         | bcrypt           | Argon2 is OWASP first recommendation    |
| PostgreSQL     | MySQL            | Better JSON support, richer feature set |
| Docker Compose | Bare metal       | Reproducible dev environment            |
| Monolith       | Microservices    | Premature complexity at this scale      |

---

## 14. Future Improvements

### Short Term

- [ ] Pagination on `GET /tasks` and `GET /users`
- [ ] Soft deletes for users and tasks (`deleted_at`)
- [ ] Email verification on registration
- [ ] Password reset flow (email + time-limited token)
- [ ] Per-route rate limiting (stricter on auth endpoints)

### Medium Term

- [ ] Redis for distributed rate limiting and session caching
- [ ] Structured audit log (who did what, when)
- [ ] File upload support (avatars, task attachments) via S3
- [ ] Webhook support for task events
- [ ] Admin dashboard metrics endpoint

### Long Term

- [ ] Multi-tenancy (organization-scoped data)
- [ ] Async job queue (BullMQ + Redis) for email, exports
- [ ] Read replicas for PostgreSQL
- [ ] OpenTelemetry tracing
- [ ] GraphQL gateway (if client query flexibility is needed)
