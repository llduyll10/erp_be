Chắc chắn rồi! Dưới đây là nội dung file mô tả dự án (project description file) mà bạn có thể đặt tên là ProjectDescription.md. File này giúp AI hiểu tổng thể kiến trúc và mục tiêu hệ thống trước khi thực hiện từng module.

📄 File: ProjectDescription.md

# 🧵 Mini ERP System for Fashion Manufacturing

This is a multi-tenant ERP system built for a small/medium-sized fashion (garment) manufacturing company. The goal is to support order management, inventory tracking, product variants (SKU), shipping, and internal roles (sales, warehouse, admin, etc.).

## 🔧 Tech Stack (Backend)

- Framework: NestJS (TypeScript)
- ORM: TypeORM
- Database: PostgreSQL
- Authentication: JWT + RBAC
- Dev Tools: Docker, Swagger, Winston logging
- Structure: Module-based, multi-tenant

## 🏗️ Architecture Overview

- Each Company (tenant) has isolated users, products, orders, etc.
- Role-based access control to protect routes.
- SKU-based inventory with import/export and transaction history.
- Order flow: Create Order → Inventory check → Shipping → Report
- Supports file upload for product images.

## 📦 Core Modules

1. Auth Module

   - Register company
   - Login / Logout
   - JWT + Refresh token (optional)
   - Role-based permission

2. Product Module

   - Product + SKUs (color/size/barcode)
   - Category + Images

3. Inventory Module

   - Inventory per SKU
   - Import / Export transactions
   - Stock reporting

4. Order Module

   - Customer order creation
   - Order item details
   - Order history & status

5. Customer Module

   - Basic customer info
   - Attach to order

6. Shipping Module

   - Shipment generation per order
   - Delivery status tracking

7. Report Module

   - Revenue, top products
   - Stock aging, low stock

8. Company & User Module

   - Multi-tenant company logic
   - Add/remove users with roles

## 📂 Folder Structure (Sample)

src/
├── app.module.ts # Main application module
├── base/ # Base classes and services
│ ├── base.module.ts # Global base module
│ ├── dtos/ # Base DTOs
│ ├── entities/ # Base entities
│ └── services/ # Base services
│ ├── base.service.ts # Generic CRUD service
│ ├── cache.service.ts # Cache service
│ ├── config.service.ts # Configuration service
│ ├── database.service.ts # Database service
│ ├── encryption.service.ts # Encryption service
│ ├── event.service.ts # Event service
│ ├── file.service.ts # File service
│ ├── health.service.ts # Health check service
│ ├── logger.service.ts # Logger service
│ ├── mail.service.ts # Mail service
│ ├── queue.service.ts # Queue service
│ └── redis.service.ts # Redis service
├── common/ # Common utilities
│ ├── decorators/ # Decorators
│ ├── filters/ # Error filters
│ ├── guards/ # Guards
│ └── interceptors/ # Interceptors
├── config/ # Configuration files
├── database/ # Database related files
│ ├── migrations/ # Migrations
│ └── seeds/ # Seeds
├── modules/ # Feature modules
│ ├── auth/ # Authentication module
│ ├── users/ # Users module
│ └── [other modules]/ # Other feature modules
└── utils/ # Utilities
├── errors/ # Error classes
└── helpers/ # Helper functions

## ✅ Requirements Summary

- RESTful API design
- Use DTOs + class-validator
- TypeORM with proper relations & migrations
- JWT protected routes
- Admin users can manage their company's data only
- Swagger UI for API docs
- E2E test
