
<h1 align="center">NestJS JWT Authentication Module with Passport</h1>

<p align="center">
  A production-ready, scalable, and modular authentication system built with <b>NestJS</b>, <b>Passport</b>, and <b>JWT</b>. Featuring robust security patterns, Role-Based Access Control (RBAC), and clean architecture.
</p>

---
## 📸 Postman Testing & Verification Screenshots

All endpoints have been tested and verified via Postman. Below are the actual execution screenshots from the Postman test suite:

---

### 1. 🟢 Public Health Check Endpoint (`GET /health`)
> **Description:** Checks application status and uptime. Bypasses JWT verification using the `@Public()` custom decorator.

<p align="center">
  <img src="./some%20screenshots%20from%20postman/health.PNG" alt="Health Check Endpoint" width="850"/>
</p>

---

### 2. 📝 User Registration (`POST /auth/signup`)
> **Description:** Creates a new user. The password is encrypted with **bcrypt (10 salt rounds)** and is completely excluded from the response for security.

<p align="center">
  <img src="./some%20screenshots%20from%20postman/signup.PNG" alt="User Signup Endpoint" width="850"/>
</p>

---

### 3. 🔑 User Login & Token Generation (`POST /auth/login`)
> **Description:** Validates credentials against hashed passwords and generates a signed JWT `access_token` containing `{ sub, email, role }`.

<p align="center">
  <img src="./some%20screenshots%20from%20postman/login.PNG" alt="User Login Endpoint" width="850"/>
</p>

---

### 4. 👤 Protected User Profile (`GET /auth/profile`)
> **Description:** Accesses a protected route using the `Authorization: Bearer <token>` header. The user data is extracted directly from the decoded token payload without database overhead.

<p align="center">
  <img src="./some%20screenshots%20from%20postman/Get%20profile.PNG" alt="Protected Profile Endpoint" width="850"/>
</p>

---

### 5. 🔄 Token Refreshing Mechanism (`POST /auth/refresh`)
> **Description:** Seamless token renewal issuing a short-lived access token (15 mins) and a long-lived refresh token (7 days).

<p align="center">
  <img src="./some%20screenshots%20from%20postman/refresh%20token.PNG" alt="Token Refresh Endpoint" width="850"/>
</p>

---

### 6. 🛡️ Admin Account Registration (`POST /auth/signup-admin`)
> **Description:** Creates a user with elevated `admin` privileges for testing Role-Based Access Control (RBAC).

<p align="center">
  <img src="./some%20screenshots%20from%20postman/signup-admin.PNG" alt="Admin Signup Endpoint" width="850"/>
</p>

---

### 7. 👑 Role-Based Access Control (`GET /auth/admin`)
> **Description:** Route protected by both `JwtAuthGuard` and `RolesGuard` requiring `@Roles('admin')`. Regular users receive a `403 Forbidden` error.

<p align="center">
  <img src="./some%20screenshots%20from%20postman/Get%20Dasboard.PNG" alt="Admin Dashboard RBAC Endpoint" width="850"/>
</p>

---

## 🧪 Postman Collection Import

A complete Postman Collection is included in the root directory:
📁 **[`postman_collection.json`](./postman_collection.json)**

* **Auto-Token Script:** Automatically extracts and attaches tokens to subsequent requests.
* **Pre-configured Tests:** Covers public, protected, role-based, and error scenarios (400, 401, 403).

---

## 🚀 Setup & Execution

### 1. Installation
```bash
$ npm install
```

### 2. Run the Application
```bash
# Development mode with hot-reload
$ npm run start:dev

# Production mode
$ npm run start:prod
```

### 3. Automated Tests
```bash
# E2E test suite covering all auth flows & RBAC
$ npm run test:e2e
```

---

## 🌟 Key Architecture & Scalability Highlights

This module is designed adhering to **Clean Architecture** and enterprise design principles:

* **Clean & Modular Structure:** Clear separation of concerns between Controllers (HTTP layer), Services (Business Logic), Strategies (Auth verification), and DTOs (Data validation).
* **High Scalability:** 
  - Stateless JWT token flow ensures horizontal scaling across multiple server instances without session state synchronization.
  - In-memory data store is abstracted behind service methods, making database integration (Prisma, TypeORM, Mongoose) seamless without touching controllers or guards.
* **Global Security by Default:** Global `JwtAuthGuard` secures all endpoints automatically. Public endpoints are explicitly marked via custom `@Public()` metadata decorator, preventing accidental data leaks.
* **Granular Role-Based Access Control (RBAC):** Extensible `@Roles()` decorator with `RolesGuard` enabling easy permission management for any number of roles (`admin`, `user`, `manager`, etc.).
* **Standardized Error Handling:** Global `HttpExceptionFilter` transforms all exceptions (including nested class-validator errors) into a uniform API response format: `{ success: false, statusCode, message }`.
* **Strict Input Validation:** Powered by `class-validator` and `ValidationPipe` with payload whitelist filtering.

---

## 📋 API Endpoints Specifications

| Method | Endpoint | Access Level | Description | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | 🟢 **Public** (`@Public()`) | Server health status & uptime | `200 OK` |
| `POST` | `/auth/signup` | 🟢 **Public** (`@Public()`) | Registers a new user with bcrypt password hashing | `201 Created` |
| `POST` | `/auth/login` | 🟢 **Public** (`@Public()`) | Validates credentials & returns JWT access token | `201 Created` |
| `GET` | `/auth/profile` | 🔒 **Protected** (Bearer JWT) | Returns authenticated user data from token payload | `200 OK` |
| `POST` | `/auth/refresh` | 🔒 **Protected** (Bearer JWT) | Issues fresh access (15m) & refresh (7d) tokens | `201 Created` |
| `POST` | `/auth/signup-admin` | 🟢 **Public** (`@Public()`) | Registers an administrator account | `201 Created` |
| `GET` | `/auth/admin` | 👑 **Admin Only** (`@Roles('admin')`) | Protected dashboard for admin role | `200 OK` |

---


## 📄 License
This project is [UNLICENSED](LICENSE).
