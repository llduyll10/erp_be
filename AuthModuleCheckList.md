📄 AuthModuleCheckList.md

# ✅ Auth Module Checklist – ERP Mini

This checklist tracks progress for authentication-related features. After each task is implemented (including E2E test), please mark as done with timestamp.

🗂️ Tổng số mục tiêu: 5 chính + 5 nhóm kiểm thử = 10 mục tiêu

━━━━━━━━━━━━━━━━━━━━━━

1. Register New Company

- [ ] Implement company & admin user creation
- [ ] Validate inputs, unique constraints
- [ ] Return JWT token upon success
- [ ] Write E2E tests for registration flows

━━━━━━━━━━━━━━━━━━━━━━
2\. User Login / Logout

- [ ] Implement login endpoint
- [ ] Validate credentials & return token
- [ ] Handle wrong email/password response
- [ ] Write E2E tests for login/logout

━━━━━━━━━━━━━━━━━━━━━━
3\. JWT Authentication

- [ ] Setup JwtStrategy & JwtAuthGuard
- [ ] Add token to protected routes
- [ ] Validate token payload structure
- [ ] E2E test: access protected route with/without token

━━━━━━━━━━━━━━━━━━━━━━
4\. Refresh Token (Optional)

- [ ] Implement refresh token endpoint
- [ ] Store & validate refresh token
- [ ] Rotate or revoke old token
- [ ] E2E test for refresh flows

━━━━━━━━━━━━━━━━━━━━━━
5\. Role-Based Access Control (RBAC)

- [ ] Create @Roles() decorator & RolesGuard
- [ ] Protect routes by role
- [ ] Test route blocking by unauthorized role
- [ ] E2E tests for role restrictions

━━━━━━━━━━━━━━━━━━━━━━
🧪 Global E2E Setup

- [ ] Setup e2e test env (jest + supertest)
- [ ] Setup test DB connection
- [ ] Provide cleanup logic per test file

━━━━━━━━━━━━━━━━━━━━━━
📝 Notes / Logs

- You may append ✅ \[Task Name] – \[Done] \[timestamp] after each subtask here or programmatically update this file.
