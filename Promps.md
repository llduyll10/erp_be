🔧 Prompt:

Task: Implement the "Register New Company" feature of the Auth Module in a NestJS backend project.
prefer @AuthModule.md and @AuthModuleCheckList.md

Project Context:

- The backend uses NestJS + TypeORM + PostgreSQL.
- The feature is part of the AuthModule (refer to file: AuthModule.md).
- After each sub-feature is implemented, the AI should update the progress checklist file: @AuthModuleCheckList.md.

Acceptance Criteria:

- A new company can register via an API endpoint.
- A user (admin) account is automatically created and linked to the company.
- The company and user are stored in the database using TypeORM.
- The password must be hashed using bcrypt before saving.
- The registration must return a JWT token (access token) after success.
- Validation must be done via DTO and class-validator.
- Appropriate HTTP status codes and messages should be returned.

Technical Requirements:

- Create DTOs: RegisterCompanyDto.
- Create the registration controller, service, and route.
- Use Dependency Injection to manage services.
- Ensure the JWT secret and logic is configured using @nestjs/jwt.
- Use a module structure: AuthModule, CompanyModule, UserModule.

Instructions to AI:

- Implement the code step-by-step using standard NestJS structure.
- Explain briefly before writing code (if required).
- After implementation, append the following line to AuthModuleCheckList.md:

✅ Register New Company - done \[timestamp]

Optional:

- Create migration or seed data for testing.
- Log the registration event using NestJS Logger.

Let me know if you'd like me to:

- Write the AuthModuleCheckList.md template,
- Create a pre-filled AuthModule.md,
- Or generate directory/file structure for this task.
