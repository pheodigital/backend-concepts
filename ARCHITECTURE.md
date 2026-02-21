# Architecture Diagrams

Visual reference for the system's structural and behavioral design.

---

## 1. High-Level System Overview

```mermaid
graph TB
    subgraph Clients["🌐 Clients"]
        WEB[Web Browser]
        MOB[Mobile App]
        API_CLIENT[API Client / Postman]
    end

    subgraph Docker["🐳 Docker Compose Environment"]
        subgraph App["⚙️ App Container (Node.js / Fastify)"]
            FASTIFY[Fastify Server\n:3000]
            MW[Middleware Layer\nHelmet · CORS · Rate Limit · Auth]
            ROUTER[Route Handlers\n/api/v1/*]
            CTRL[Controllers]
            SVC[Services\nBusiness Logic]
            PRISMA[Prisma ORM Client]
        end

        subgraph DB["🗄️ PostgreSQL Container"]
            PG[(PostgreSQL\n:5432)]
        end
    end

    subgraph External["🔐 Auth Utilities"]
        JWT[JWT\nSign · Verify]
        ARGON[Argon2\nHash · Verify]
    end

    WEB -->|HTTPS / REST| FASTIFY
    MOB -->|HTTPS / REST| FASTIFY
    API_CLIENT -->|HTTPS / REST| FASTIFY

    FASTIFY --> MW
    MW --> ROUTER
    ROUTER --> CTRL
    CTRL --> SVC
    SVC --> PRISMA
    SVC --> JWT
    SVC --> ARGON
    PRISMA --> PG
```

---

## 2. Layered Application Architecture

```mermaid
graph LR
    subgraph Layer1["Layer 1 — Transport"]
        HTTP[HTTP Request]
    end

    subgraph Layer2["Layer 2 — Middleware"]
        HELMET[Helmet\nSecurity Headers]
        CORS[CORS\nOrigin Policy]
        RATE[Rate Limiter\nAbuse Protection]
        AUTH_MW[Auth Middleware\nJWT Verification]
        ROLE_MW[Role Guard\nRBAC Enforcement]
    end

    subgraph Layer3["Layer 3 — Routing"]
        ROUTES[Route Definitions\n/api/v1/auth\n/api/v1/users\n/api/v1/tasks]
    end

    subgraph Layer4["Layer 4 — Controllers"]
        AUTH_CTRL[AuthController]
        USER_CTRL[UserController]
        TASK_CTRL[TaskController]
    end

    subgraph Layer5["Layer 5 — Services"]
        AUTH_SVC[AuthService]
        USER_SVC[UserService]
        TASK_SVC[TaskService]
    end

    subgraph Layer6["Layer 6 — Data Access"]
        PRISMA_CLIENT[Prisma Client\nType-safe Queries]
    end

    subgraph Layer7["Layer 7 — Database"]
        POSTGRES[(PostgreSQL)]
    end

    HTTP --> HELMET --> CORS --> RATE --> AUTH_MW --> ROLE_MW --> ROUTES
    ROUTES --> AUTH_CTRL & USER_CTRL & TASK_CTRL
    AUTH_CTRL --> AUTH_SVC
    USER_CTRL --> USER_SVC
    TASK_CTRL --> TASK_SVC
    AUTH_SVC & USER_SVC & TASK_SVC --> PRISMA_CLIENT
    PRISMA_CLIENT --> POSTGRES
```

---

## 3. Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    participant Client
    participant Fastify
    participant AuthController
    participant AuthService
    participant Argon2
    participant Prisma
    participant PostgreSQL
    participant JWT

    Client->>Fastify: POST /api/v1/auth/login { email, password }
    Fastify->>AuthController: Route matched, body validated
    AuthController->>AuthService: login(email, password)
    AuthService->>Prisma: findUnique({ where: { email } })
    Prisma->>PostgreSQL: SELECT * FROM users WHERE email = ?
    PostgreSQL-->>Prisma: User record
    Prisma-->>AuthService: User | null

    alt User not found
        AuthService-->>AuthController: throw AppError(401, INVALID_CREDENTIALS)
        AuthController-->>Client: 401 { error: { code, message } }
    else User found
        AuthService->>Argon2: verify(user.passwordHash, password)
        Argon2-->>AuthService: boolean

        alt Password mismatch
            AuthService-->>AuthController: throw AppError(401, INVALID_CREDENTIALS)
            AuthController-->>Client: 401 { error: { code, message } }
        else Password valid
            AuthService->>JWT: sign({ userId, role }, secret)
            JWT-->>AuthService: accessToken
            AuthService->>JWT: sign({ userId }, refreshSecret)
            JWT-->>AuthService: refreshToken
            AuthService-->>AuthController: { accessToken, refreshToken }
            AuthController-->>Client: 200 { accessToken, refreshToken }
        end
    end
```

---

## 4. Authorized Request Flow (RBAC)

```mermaid
sequenceDiagram
    autonumber
    participant Client
    participant RateLimiter
    participant AuthMiddleware
    participant RoleGuard
    participant Controller
    participant Service
    participant Prisma

    Client->>RateLimiter: GET /api/v1/admin/users\nAuthorization: Bearer <token>

    alt Rate limit exceeded
        RateLimiter-->>Client: 429 Too Many Requests
    else Within limit
        RateLimiter->>AuthMiddleware: Forward request
        AuthMiddleware->>AuthMiddleware: JWT.verify(token, secret)

        alt Token invalid / expired
            AuthMiddleware-->>Client: 401 Unauthorized
        else Token valid
            AuthMiddleware->>RoleGuard: Attach { userId, role } to request
            RoleGuard->>RoleGuard: Check role === 'ADMIN'

            alt Role insufficient
                RoleGuard-->>Client: 403 Forbidden
            else Authorized
                RoleGuard->>Controller: Forward request
                Controller->>Service: Execute business logic
                Service->>Prisma: Database query
                Prisma-->>Service: Result
                Service-->>Controller: Domain object
                Controller-->>Client: 200 { data }
            end
        end
    end
```

---

## 5. Data Model (Entity Relationship)

```mermaid
erDiagram
    USER {
        string  id          PK
        string  email       UK
        string  passwordHash
        enum    role
        datetime createdAt
        datetime updatedAt
    }

    TASK {
        string  id          PK
        string  title
        string  description
        boolean completed
        string  userId      FK
        datetime createdAt
        datetime updatedAt
    }

    REFRESH_TOKEN {
        string  id          PK
        string  token       UK
        string  userId      FK
        datetime expiresAt
        datetime createdAt
    }

    USER ||--o{ TASK : "owns"
    USER ||--o{ REFRESH_TOKEN : "holds"
```

---

## 6. Docker Infrastructure

```mermaid
graph TB
    subgraph Host["💻 Host Machine"]
        COMPOSE[docker-compose.yml]
        ENV[.env file]
    end

    subgraph Network["🔗 Docker Network: backend_net"]
        subgraph AppContainer["📦 app (Node.js)"]
            NODE[Node.js Process\nFastify :3000]
            PRISMA_BIN[Prisma Client]
        end

        subgraph DBContainer["📦 postgres"]
            PG[(PostgreSQL :5432)]
            VOL[(pgdata volume\nPersistent Storage)]
        end
    end

    subgraph Ports["🔌 Exposed Ports"]
        P3000[Host :3000]
        P5432[Host :5432]
    end

    COMPOSE -->|defines| AppContainer
    COMPOSE -->|defines| DBContainer
    ENV -->|injects secrets| AppContainer
    NODE -->|DATABASE_URL| PRISMA_BIN
    PRISMA_BIN -->|TCP| PG
    PG --- VOL
    NODE --- P3000
    PG --- P5432
```

---

## 7. Error Handling Flow

```mermaid
flowchart TD
    REQ[Incoming Request] --> HANDLER[Route Handler]

    HANDLER --> TRY{Try Block}

    TRY -->|Success| RES[200 Structured Response]

    TRY -->|AppError thrown| APP_ERR[AppError\nknown domain error]
    TRY -->|Unexpected throw| UNKNOWN[Unknown Error]

    APP_ERR --> GLOBAL[Global Fastify\nError Handler]
    UNKNOWN --> GLOBAL

    GLOBAL --> IS_APP{instanceof AppError?}

    IS_APP -->|Yes| FORMAT_APP["Format Response\n{ error: { code, message } }\nHTTP status from AppError"]
    IS_APP -->|No| FORMAT_500["Format Response\n{ error: { code: INTERNAL_ERROR } }\nHTTP 500"]

    FORMAT_APP --> CLIENT[Client]
    FORMAT_500 --> CLIENT
    FORMAT_500 --> LOG[Logger: capture stack trace]
```

---

## 8. Testing Architecture

```mermaid
graph TB
    subgraph UnitTests["🧪 Unit Tests (Jest)"]
        UT_AUTH[AuthService.test.ts]
        UT_USER[UserService.test.ts]
        UT_TASK[TaskService.test.ts]

        MOCK_PRISMA[Prisma Mock]
        MOCK_JWT[JWT Mock]
        MOCK_ARGON[Argon2 Mock]

        UT_AUTH --> MOCK_PRISMA & MOCK_JWT & MOCK_ARGON
        UT_USER --> MOCK_PRISMA
        UT_TASK --> MOCK_PRISMA
    end

    subgraph IntegrationTests["🔗 Integration Tests (Supertest)"]
        IT_AUTH[auth.integration.test.ts]
        IT_CORS[cors.integration.test.ts]
        IT_HEALTH[health.integration.test.ts]

        REAL_SERVER[Real Fastify Instance]
        REAL_PRISMA[Real Prisma Client\nTest DB]

        IT_AUTH --> REAL_SERVER --> REAL_PRISMA
        IT_CORS --> REAL_SERVER
        IT_HEALTH --> REAL_SERVER
    end

    subgraph Coverage["📊 Coverage Reports"]
        LCOV[lcov / HTML report]
    end

    UnitTests --> LCOV
    IntegrationTests --> LCOV
```
