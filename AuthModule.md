📄 AuthModule.md

# 🔐 Auth Module – ERP Mini System

This module handles user authentication, company registration, role-based access, and token generation. All users must belong to a company (multi-tenant). All protected API routes require a valid JWT token, and authorization is enforced based on user roles.

━━━━━━━━━━━━━━━━━━━━━━

1. Register New Company
   ━━━━━━━━━━━━━━━━━━━━━━

- Endpoint: POST /auth/register

- Request Body:

  {
  "companyName": "Example Fashion Co",
  "admin": {
  "fullName": "Alice Nguyen",
  "email": "[alice@example.com](mailto:alice@example.com)",
  "password": "secret123"
  }
  }

- Actions:

  - Create new Company entity.
  - Create initial User (admin) and assign role.
  - Hash password using bcrypt.
  - Return JWT access token upon success.

- Validation:

  - Required fields.
  - Email must be unique within users table.
  - Company name must be unique.

- 🧪 E2E Test Requirements:

  - Register with valid data → expect 201 + token.
  - Register with existing email → expect 409.
  - Register with missing fields → expect 400.

━━━━━━━━━━━━━━━━━━━━━━
2\. User Login / Logout
━━━━━━━━━━━━━━━━━━━━━━

- Endpoint: POST /auth/login

- Request Body:

  {
  "email": "[alice@example.com](mailto:alice@example.com)",
  "password": "secret123"
  }

- Actions:

  - Validate user credentials.
  - Issue JWT access token (and refresh token if enabled).
  - Return user info (name, role, companyId).

- 🧪 E2E Test Requirements:

  - Valid login → 200 + token.
  - Wrong password → 401.
  - Non-existing email → 404.

━━━━━━━━━━━━━━━━━━━━━━
3\. JWT Authentication
━━━━━━━━━━━━━━━━━━━━━━

- Use @nestjs/jwt to sign and verify tokens.

- JWT Payload includes:

  {
  userId,
  companyId,
  role
  }

- Middleware/guard protects all routes using JwtStrategy.

- Use AuthGuard('jwt') in protected controllers.

- 🧪 E2E Test Requirements:

  - Access protected route with valid token → 200.
  - Missing/invalid token → 401.

━━━━━━━━━━━━━━━━━━━━━━
4\. Refresh Token (Optional)
━━━━━━━━━━━━━━━━━━━━━━

- Endpoint: POST /auth/refresh

- Use HttpOnly cookie or request body (as chosen).

- Refresh token must be stored securely (DB or in-memory).

- 🧪 E2E Test Requirements:

  - Valid refresh → returns new token.
  - Expired/invalid → 403.

━━━━━━━━━━━━━━━━━━━━━━
5\. Role-Based Access Control (RBAC)
━━━━━━━━━━━━━━━━━━━━━━

- Roles: admin, sales, warehouse, etc.

- Use @Roles('admin') decorator.

- Create custom RolesGuard to check user.role.

- 🧪 E2E Test Requirements:

  - Admin accesses admin route → 200.
  - Sales accesses admin route → 403.

━━━━━━━━━━━━━━━━━━━━━━
✅ Shared Technical Notes
━━━━━━━━━━━━━━━━━━━━━━

- Use DTO + class-validator for input.
- Use bcrypt to hash password.
- Use TypeORM entities: Company, User.
- Controller → Service → Repository pattern.
- Swagger docs enabled for /auth endpoints.

━━━━━━━━━━━━━━━━━━━━━━
🧪 Global E2E Setup
━━━━━━━━━━━━━━━━━━━━━━

- E2E tests written using @nestjs/testing + supertest.
- Setup test db via Docker or in-memory PostgreSQL.
- Use fixtures or factories to insert test data.
- Each test should clean up database afterward.

━━━━━━━━━━━━━━━━━━━━━━
📌 Future Enhancements
━━━━━━━━━━━━━━━━━━━━━━

- Email verification
- Forgot/reset password
- Login history
- Device session tracking
