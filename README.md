# Backend Development – Core Concepts (Production-Grade Example)

A **production-ready backend application** built with **TypeScript, Fastify, Prisma, and PostgreSQL**, demonstrating real-world backend engineering practices including authentication, authorization, security, testing, and Dockerized infrastructure.

This repository serves as a **practical reference** for modern backend development using Node.js.

---

## 📚 Overview

This backend follows clean architectural principles and showcases:

- Stateless REST APIs
- JWT-based authentication & RBAC
- Secure password handling
- Prisma ORM with PostgreSQL
- Centralized error handling
- OpenAPI (Swagger) documentation
- Unit & integration testing
- Docker-based local development

---

## 🧱 Tech Stack

| Category | Technology |
|---|---|
| **Runtime** | Node.js (TypeScript) |
| **Framework** | Fastify |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Authentication** | JWT |
| **Security** | Helmet, CORS, Rate Limiting |
| **Testing** | Jest, Supertest |
| **DevOps** | Docker, Docker Compose |

---

## 🚀 Getting Started

**Start with Docker**

```bash
docker compose up
```

**Run Locally**

```bash
npm install
npm run dev
```

**Run Tests**

```bash
npm test
```

---

## 📖 Table of Contents

1. [Fundamentals](#1-fundamentals)
2. [API Design](#2-api-design)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [Data & Persistence](#4-data--persistence)
5. [Application Architecture](#5-application-architecture)
6. [State Management](#6-state-management)
7. [Performance & Scalability](#7-performance--scalability)
8. [Concurrency & Async Processing](#8-concurrency--async-processing)
9. [Error Handling & Resilience](#9-error-handling--resilience)
10. [Security](#10-security-beyond-authentication)
11. [Testing](#11-testing)
12. [DevOps Awareness](#12-devops-awareness)

---

## 1. Fundamentals

### Client–Server Architecture
- Clear separation between API server and frontend clients
- Backend exposes REST endpoints consumed over HTTP

### HTTP / HTTPS
- HTTP-based API with security headers applied via Helmet
- HTTPS assumed in production

### Request–Response Lifecycle

```
Request → Fastify Server → Middleware (preHandler) → Controllers → Services → Prisma (DB) → Structured Response
```

### Statelessness
- No server-side session storage
- Authentication handled entirely via JWT

### HTTP Methods

| Method | Usage |
|---|---|
| `GET` | Fetch resources |
| `POST` | Authentication and creation flows |

### Status Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `400` | Validation or domain errors |
| `401` | Unauthorized |
| `500` | Internal server error |

---

## 2. API Design

### REST Principles
- Resource-based endpoints
- Stateless operations
- Predictable URL structure

### Resource Modeling
- Users
- Tasks
- Authentication flows

### API Versioning
- Versioned routes: `/api/v1`
- Enables backward compatibility

### Error Response Standard

All errors follow a consistent structure:

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

### OpenAPI / Swagger Documentation
- Swagger UI enabled
- Route-level schemas
- Request & response validation
- Bearer authentication defined

---

## 3. Authentication & Authorization

### Authentication vs Authorization
- **Authentication**: Who the user is (JWT)
- **Authorization**: What the user can do (roles)

### Token-Based Authentication
- Stateless JWT authentication
- No cookies or sessions

### JWT (JSON Web Tokens)
- Signed access tokens
- Payload contains `userId` and `role`

### Role-Based Access Control (RBAC)
- Roles: `USER`, `ADMIN`
- Middleware-enforced permissions
- Admin routes fully protected

### Refresh Tokens
- Refresh token generation supported
- Used to extend authentication sessions

### Password Hashing
- Secure hashing using `argon2`
- Password verification on login

---

## 4. Data & Persistence

### Relational Database
- PostgreSQL as the primary datastore
- Structured relational schema

### ORM (Prisma)
- Type-safe database queries
- Auto-generated Prisma client
- Compile-time query validation

### Schema Design
- Users with roles and timestamps
- Strong typing across all data access layers

### Database Migrations
- Prisma-managed migrations
- Version-controlled schema evolution

### Connection Management
- Singleton Prisma client
- Prevents connection exhaustion
- Environment-aware logging

---

## 5. Application Architecture

### Layered Architecture

```
Routes       →  API contracts
Controllers  →  Request/response handling
Services     →  Business logic
Middleware   →  Cross-cutting concerns
Config       →  Environment & infrastructure
```

### Separation of Concerns
- No business logic in controllers
- Services are fully testable in isolation

### Configuration Management
- Environment variables via `dotenv`
- Centralized configuration module
- App fails fast on missing secrets

### Design Mapping

| Concept | Implementation |
|---|---|
| Routes = Contract | Fastify route definitions |
| Middleware = Policy | Auth, role, rate limiting |
| Controller = Use Case | Controller methods |
| Service = Business Logic | `AuthService`, domain services |

---

## 6. State Management

### Stateless Server Design
- Each request is authenticated independently
- JWT used instead of sessions — no shared state between requests

---

## 7. Performance & Scalability

### Asynchronous Processing
- Non-blocking I/O using Node.js event loop
- `async/await` across all DB and crypto operations

### Rate Limiting
- Global rate limiting enabled
- Protects against brute-force and abuse

### Database Connection Efficiency
- Prisma manages connection pooling internally
- Singleton client avoids overhead

---

## 8. Concurrency & Async Processing

### Node.js Event Loop
- Handles multiple concurrent requests
- Efficient async execution model

### Non-Blocking I/O
- Password hashing and DB calls are fully async
- No blocking synchronous operations

---

## 9. Error Handling & Resilience

### Centralized Error Handling
- Global Fastify error handler
- Unified error format across all routes

### Domain Errors
- Custom `AppError` class
- Explicit HTTP status codes and error codes

### Timeouts
- Request timeout configured
- Prevents hanging requests

---

## 10. Security (Beyond Authentication)

### CORS
- Strict origin allowlist
- Credentials support
- Integration-tested behavior

### Security Headers
Helmet protects against:
- XSS
- Clickjacking
- MIME sniffing

### SQL Injection Protection
- Prisma parameterized queries
- No raw SQL execution

### Input Validation
- Schema-based validation via Swagger
- Strong TypeScript typing throughout

### Secrets Management
- Secrets stored in environment variables
- Runtime validation for missing configuration

---

## 11. Testing

### Unit Testing
- Service-level unit tests
- External dependencies fully mocked
- Business logic tested in isolation

### Integration Testing
- HTTP-level testing with Supertest
- Real Fastify server instance
- Middleware and CORS behavior validated

### Mocking Strategy
- Prisma mocked in unit tests
- Crypto and JWT mocked where appropriate
- Clear separation between unit and integration tests

---

## 12. DevOps Awareness

### Docker & Containerization
- Multi-container Docker Compose setup
- App + PostgreSQL containers
- Persistent volumes for database data

### Environment Separation
- Development vs. production behavior
- Logging and DB config vary by environment

### Health Checks
- `/health` endpoint exposed
- Docker health checks configured for PostgreSQL

### Logging
- Fastify structured logging
- Environment-aware verbosity levels

---

## ✅ Summary

This repository demonstrates a real-world, production-grade backend built with modern best practices:

- **Clean architecture** with clear separation of concerns
- **Secure authentication** using JWT and argon2
- **Strong typing** end-to-end with TypeScript and Prisma
- **Database safety** via ORM and parameterized queries
- **Automated testing** at unit and integration levels
- **Dockerized development** for consistent local environments
