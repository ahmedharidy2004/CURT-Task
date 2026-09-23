# CURT Task Management API

A RESTful task-management platform built with **Express 5** and **Prisma ORM** on **PostgreSQL**. It supports role-based access control (Owner / Member), project management, member assignment, and task tracking with filtering and pagination.

> **Live API:** <https://curt-task-management-production.up.railway.app>
>
> **Swagger Docs:** <https://curt-task-management-production.up.railway.app/api-docs/>

---

## Table of Contents

- [Project Overview](#project-overview)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Running the Project](#running-the-project)
- [Database Setup & Migrations](#database-setup--migrations)
- [Database Design](#database-design)
- [API Documentation](#api-documentation)
- [Assumptions & Additional Features](#assumptions--additional-features)

---

## Project Overview

CURT lets teams organize work through **Projects** and **Tasks**:

| Concept | Description |
| --- | --- |
| **Users** | Accounts with one of two roles: `OWNER` or `MEMBER`. |
| **Projects** | Created and managed by owners. Members are added explicitly. |
| **Tasks** | Belong to a project, assigned to a member, tracked by status and priority. |
| **Roles** | **OWNER** – full CRUD on projects, tasks, and members. **MEMBER** – can view assigned projects/tasks and update the status of tasks assigned to them. |

---

## Technologies Used

| Layer | Technology |
| --- | --- |
| Runtime | Node.js (ES Modules) |
| Framework | Express 5 |
| ORM | Prisma ORM 7 with `@prisma/adapter-pg` driver adapter |
| Database | PostgreSQL |
| Authentication | JSON Web Tokens (`jsonwebtoken`) |
| Password Hashing | `bcrypt` |
| Validation | `express-validator` |
| Rate Limiting | `express-rate-limit` |
| API Docs | Swagger UI (`swagger-ui-express`) |
| Logging | `morgan` |
| Deployment | Railway |

---

## Project Structure

```
curt-task-management/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seeder.js              # Seed script
│   └── migrations/            # Prisma migration history
├── lib/
│   └── prisma.ts              # PrismaClient singleton with PrismaPg adapter
├── docs/
│   └── swagger.js             # OpenAPI 3.0 specification
├── routes/
│   ├── auth.router.js
│   ├── user.router.js
│   ├── project.router.js
│   └── task.router.js
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── project.controller.js
│   └── task.controller.js
├── services/
│   ├── auth.service.js
│   ├── user.service.js
│   ├── project.service.js
│   └── task.service.js
├── middlewares/
│   ├── auth.middleware.js      # JWT verification & role guard
│   └── validation.middleware.js
├── utils/
│   └── errorHandler.js        # Global error-handling middleware
├── app.js                     # Express app configuration
├── server.js                  # Server entry point
├── .env.example
└── package.json
```

---

## Setup Instructions

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** instance (local or hosted, e.g. Railway, Neon, Supabase)

### 1. Clone the repository

```bash
git clone https://github.com/ahmedharidy2004/curt-task-management.git
cd curt-task-management
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Example |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (used by Prisma & the app) | `postgresql://user:pass@localhost:5432/curt` |
| `DIRECT_URL` | Direct DB URL (for Prisma migrations, if using a connection pooler) | same as `DATABASE_URL` or a direct connection |
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | Secret key for signing JWTs | `my-super-secret-key` |
| `JWT_EXPIRES_IN` | Token expiry duration | `7d` |

### 4. Generate Prisma Client

```bash
npx prisma generate
```

---

## Running the Project

### Development (with hot-reload)

```bash
npm run dev
```

### Production

```bash
npm start
```

The server starts on the port specified in `.env` (defaults to `3000`).

---

## Database Setup & Migrations

### Run migrations

Apply all migrations to your database:

```bash
npx prisma migrate deploy
```

For development (creates & applies a new migration):

```bash
npx prisma migrate dev
```

### Seed the database

Populate the database with sample data (1 owner + 4 members, 5 projects, 8 memberships, 8 tasks):

```bash
npm run seed
```

Or via Prisma:

```bash
npx prisma db seed
```

> The seeder clears all existing data before inserting, so it is safe to re-run.

---

## Database Design

### ER Diagram

```mermaid
erDiagram
    User ||--o{ Project : "owns"
    User ||--o{ ProjectMember : "belongs to"
    User ||--o{ Task : "assigned to"
    Project ||--o{ ProjectMember : "has"
    Project ||--o{ Task : "contains"

    User {
        String id PK "UUID"
        String name
        String username UK
        String email UK
        String password
        Role role "OWNER | MEMBER"
        DateTime createdAt
        DateTime updatedAt
    }

    Project {
        String id PK "UUID"
        String name
        String description
        String ownerId FK
        DateTime createdAt
        DateTime updatedAt
    }

    ProjectMember {
        String projectId FK
        String userId FK
    }

    Task {
        String id PK "UUID"
        String title
        String description
        TaskPriority priority "LOW | MEDIUM | HIGH"
        TaskStatus status "TODO | IN_PROGRESS | DONE"
        String assignedTo FK
        String projectId FK
        DateTime createdAt
        DateTime updatedAt
    }
```

### Enums

| Enum | Values |
| --- | --- |
| `Role` | `OWNER`, `MEMBER` |
| `TaskStatus` | `TODO`, `IN_PROGRESS`, `DONE` |
| `TaskPriority` | `LOW`, `MEDIUM`, `HIGH` |

---

## API Documentation

Full interactive documentation is available at the **[Swagger UI](https://curt-task-management-production.up.railway.app/api-docs/)**.

All protected endpoints require a `Bearer` token in the `Authorization` header.

### Authentication

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/auth/signup` | Create a new user account | ✗ |
| `POST` | `/auth/login` | Log in and receive a JWT | ✗ |

### Users

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `GET` | `/users/me` | Get authenticated user's profile | ✔ |
| `PATCH` | `/users/me` | Update profile (name, username, email) | ✔ |
| `PATCH` | `/users/updatePassword` | Update password | ✔ |

### Projects

| Method | Endpoint | Description | Auth | Role |
| --- | --- | --- | --- | --- |
| `GET` | `/projects` | List accessible projects (paginated, filterable by name) | ✔ | Any |
| `POST` | `/projects` | Create a project | ✔ | Any |
| `GET` | `/projects/:id` | Get a project by ID | ✔ | Any |
| `PATCH` | `/projects/:id` | Update a project | ✔ | Owner |
| `DELETE` | `/projects/:id` | Delete a project | ✔ | Owner |
| `POST` | `/projects/:id/members` | Add a member to a project | ✔ | Owner |
| `DELETE` | `/projects/:id/members/:memberId` | Remove a member from a project | ✔ | Owner |
| `PATCH` | `/projects/:id/members/:memberId/role` | Promote a member to OWNER | ✔ | Owner |

### Tasks

| Method | Endpoint | Description | Auth | Role |
| --- | --- | --- | --- | --- |
| `GET` | `/tasks` | List tasks (paginated, filterable by status, priority, assignee, project) | ✔ | Any |
| `POST` | `/tasks` | Create a task | ✔ | Owner |
| `GET` | `/tasks/:id` | Get a task by ID | ✔ | Any |
| `PATCH` | `/tasks/:id` | Update a task | ✔ | Owner |
| `DELETE` | `/tasks/:id` | Delete a task | ✔ | Owner |
| `PATCH` | `/tasks/:id/status` | Update the status of an assigned task | ✔ | Assigned Member |

### Query Parameters

**Projects** – `GET /projects`

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `page` | integer | `1` | Page number |
| `limit` | integer | `10` | Items per page (max 100) |
| `name` | string | — | Filter by project name |

**Tasks** – `GET /tasks`

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `page` | integer | `1` | Page number |
| `limit` | integer | `10` | Items per page (max 100) |
| `status` | string | — | `TODO`, `IN_PROGRESS`, or `DONE` |
| `priority` | string | — | `LOW`, `MEDIUM`, or `HIGH` |
| `assignedTo` | uuid | — | Filter by assigned user ID |
| `projectId` | uuid | — | Filter by project ID |

---

## Assumptions & Additional Features

### Assumptions

1. **At least one OWNER exists at the start of production.** The system assumes an initial owner account is created (via the seeder or manually) before the application is used. New users sign up with the `MEMBER` role by default.

### Features

- **Swagger UI** – Interactive API documentation served at `/api-docs/`.
- **Rate Limiting** – Authentication endpoints are rate-limited via `express-rate-limit` to prevent brute-force attacks.
- **Request Validation** – All inputs are validated using `express-validator` with descriptive error messages.
- **Pagination** – List endpoints support `page` and `limit` query parameters.
- **Filtering** – Projects are filterable by name; tasks are filterable by status, priority, assignee, and project.
- **Global Error Handler** – Centralized error-handling middleware for consistent API error responses.
- **Database Seeder** – Pre-built seed script to populate the database with realistic sample data.
- **Role Promotion** – Owners can promote members to `OWNER` role via the `/projects/:id/members/:memberId/role` endpoint.

---

## License

ISC © [Ahmed Haridy](https://github.com/ahmedharidy2004)
