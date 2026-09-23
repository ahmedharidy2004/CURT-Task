import "dotenv/config";

const swaggerDocument = {
    openapi: "3.0.3",
    info: {
        title: "CURT Task Management API",
        version: "1.0.0",
        description: "API for managing projects, members, and tasks."
    },
    servers: [
        {
            url: process.env.API_URL || "http://localhost:3000",
            description: process.env.API_URL ? "Deployed API server" : "Local development server"
        }
    ],
    tags: [
        { name: "Authentication" },
        { name: "Users" },
        { name: "Projects" },
        { name: "Tasks" }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        },
        schemas: {
            UserInput: {
                type: "object",
                required: ["name", "username", "email", "password"],
                properties: {
                    name: { type: "string", example: "Sara Hassan" },
                    username: { type: "string", example: "sara_h" },
                    email: { type: "string", format: "email", example: "sara@example.com" },
                    password: { type: "string", format: "password", minLength: 8, example: "Password123!" }
                }
            },
            LoginInput: {
                type: "object",
                required: ["email", "password"],
                properties: {
                    email: { type: "string", format: "email", example: "sara@example.com" },
                    password: { type: "string", format: "password", example: "Password123!" }
                }
            },
            ProjectInput: {
                type: "object",
                required: ["name", "description"],
                properties: {
                    name: { type: "string", example: "Mobile App" },
                    description: { type: "string", example: "Cross-platform mobile client" }
                }
            },
            TaskInput: {
                type: "object",
                required: ["title", "description", "priority", "status", "assignedTo", "projectId"],
                properties: {
                    title: { type: "string", example: "Build onboarding screens" },
                    description: { type: "string", example: "Create the onboarding flow" },
                    priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"], example: "MEDIUM" },
                    status: { type: "string", enum: ["TODO", "IN_PROGRESS", "DONE"], example: "TODO" },
                    assignedTo: { type: "string", format: "uuid" },
                    projectId: { type: "string", format: "uuid" }
                }
            },
            TaskStatusInput: {
                type: "object",
                required: ["status"],
                properties: {
                    status: { type: "string", enum: ["TODO", "IN_PROGRESS", "DONE"], example: "DONE" }
                }
            },
            Error: {
                type: "object",
                properties: {
                    status: { type: "string", example: "fail" },
                    message: { type: "string", example: "You are not allowed to perform this action" }
                }
            }
        }
    },
    paths: {
        "/auth/signup": {
            post: {
                tags: ["Authentication"],
                summary: "Create a user account",
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/UserInput" } } }
                },
                responses: {
                    201: { description: "User created" },
                    400: { description: "Validation or duplicate-user error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
                    429: { description: "Too many authentication requests" }
                }
            }
        },
        "/auth/login": {
            post: {
                tags: ["Authentication"],
                summary: "Log in and receive a JWT",
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/LoginInput" } } }
                },
                responses: {
                    200: { description: "Login successful" },
                    401: { description: "Invalid credentials" },
                    429: { description: "Too many authentication requests" }
                }
            }
        },
        "/users/me": {
            get: {
                tags: ["Users"],
                summary: "Get the authenticated user's profile",
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: "Profile retrieved" }, 401: { description: "Authentication required" } }
            },
            patch: {
                tags: ["Users"],
                summary: "Update the authenticated user's profile",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    name: { type: "string", example: "Ahmed Haridy" },
                                    username: { type: "string", example: "ahmed_owner" },
                                    email: { type: "string", format: "email", example: "ahmed@example.com" }
                                },
                                additionalProperties: false
                            }
                        }
                    }
                },
                responses: { 200: { description: "Profile updated" }, 400: { description: "Duplicate username or email" }, 401: { description: "Authentication required" } }
            }
        },
        "/users/updatePassword": {
            patch: {
                tags: ["Users"],
                summary: "Update the authenticated user's password",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["currentPassword", "newPassword"],
                                properties: {
                                    currentPassword: { type: "string", format: "password", example: "Password123!" },
                                    newPassword: { type: "string", format: "password", minLength: 8, example: "NewPassword123!" }
                                },
                                additionalProperties: false
                            }
                        }
                    }
                },
                responses: { 200: { description: "Password updated" }, 400: { description: "Current password is invalid" }, 401: { description: "Authentication required" } }
            }
        },
        "/projects": {
            get: {
                tags: ["Projects"],
                summary: "List accessible projects",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
                    { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
                    { name: "name", in: "query", schema: { type: "string" } }
                ],
                responses: { 200: { description: "Projects retrieved" }, 401: { description: "Authentication required" } }
            },
            post: {
                tags: ["Projects"],
                summary: "Create a project",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectInput" } } }
                },
                responses: { 201: { description: "Project created" }, 400: { description: "Validation error" }, 401: { description: "Authentication required" } }
            }
        },
        "/projects/{id}": {
            get: {
                tags: ["Projects"],
                summary: "Get a project",
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: "#/components/parameters/id" }],
                responses: { 200: { description: "Project retrieved" }, 403: { description: "No project access" } }
            },
            patch: {
                tags: ["Projects"],
                summary: "Update a project (owner only)",
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: "#/components/parameters/id" }],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectInput" } } }
                },
                responses: { 200: { description: "Project updated" }, 403: { description: "Owner only" } }
            },
            delete: {
                tags: ["Projects"],
                summary: "Delete a project (owner only)",
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: "#/components/parameters/id" }],
                responses: { 204: { description: "Project deleted" }, 403: { description: "Owner only" } }
            }
        },
        "/projects/{id}/members": {
            post: {
                tags: ["Projects"],
                summary: "Add a project member (owner only)",
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: "#/components/parameters/id" }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["userId"],
                                properties: { userId: { type: "string", format: "uuid" } }
                            }
                        }
                    }
                },
                responses: { 201: { description: "Member added" }, 403: { description: "Owner only" }, 409: { description: "Already a member" } }
            }
        },
        "/projects/{id}/members/{memberId}": {
            delete: {
                tags: ["Projects"],
                summary: "Remove a project member (owner only)",
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: "#/components/parameters/id" }, { $ref: "#/components/parameters/memberId" }],
                responses: { 200: { description: "Member removed" }, 403: { description: "Owner only" } }
            }
        },
        "/projects/{id}/members/{memberId}/role": {
            patch: {
                tags: ["Projects"],
                summary: "Promote a member to OWNER",
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: "#/components/parameters/id" }, { $ref: "#/components/parameters/memberId" }],
                responses: { 200: { description: "Member promoted" }, 403: { description: "Owner only" }, 404: { description: "Member or project not found" } }
            }
        },
        "/tasks": {
            get: {
                tags: ["Tasks"],
                summary: "List accessible tasks",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
                    { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
                    { name: "status", in: "query", schema: { type: "string", enum: ["TODO", "IN_PROGRESS", "DONE"] } },
                    { name: "priority", in: "query", schema: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] } },
                    { name: "assignedTo", in: "query", schema: { type: "string", format: "uuid" } },
                    { name: "projectId", in: "query", schema: { type: "string", format: "uuid" } }
                ],
                responses: { 200: { description: "Tasks retrieved" }, 401: { description: "Authentication required" } }
            },
            post: {
                tags: ["Tasks"],
                summary: "Create a task (owner only)",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/TaskInput" } } }
                },
                responses: { 201: { description: "Task created" }, 403: { description: "Owner only" } }
            }
        },
        "/tasks/{id}": {
            get: {
                tags: ["Tasks"],
                summary: "Get a task",
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: "#/components/parameters/id" }],
                responses: { 200: { description: "Task retrieved" }, 403: { description: "No task access" } }
            },
            patch: {
                tags: ["Tasks"],
                summary: "Update a task (owner only)",
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: "#/components/parameters/id" }],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/TaskInput" } } }
                },
                responses: { 200: { description: "Task updated" }, 403: { description: "Owner only" } }
            },
            delete: {
                tags: ["Tasks"],
                summary: "Delete a task (owner only)",
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: "#/components/parameters/id" }],
                responses: { 204: { description: "Task deleted" }, 403: { description: "Owner only" } }
            }
        },
        "/tasks/{id}/status": {
            patch: {
                tags: ["Tasks"],
                summary: "Update status of an assigned task",
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: "#/components/parameters/id" }],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/TaskStatusInput" } } }
                },
                responses: { 200: { description: "Task status updated" }, 403: { description: "Only the assigned member can update status" } }
            }
        }
    }
};

swaggerDocument.components.parameters = {
    id: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" }
    },
    memberId: {
        name: "memberId",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" }
    }
};

export default swaggerDocument;
