# Nội dung file

# ERP Backend Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Setup & Installation](#setup--installation)
3. [Project Structure](#project-structure)
4. [Database Management](#database-management)
5. [Core Services](#core-services)
6. [Shared Modules](#shared-modules)
7. [Development Guidelines](#development-guidelines)

## Project Overview

This is an Enterprise Resource Planning (ERP) backend built with NestJS, providing:

- Role-based authentication and authorization
- Database migrations and seeding
- File upload management
- Email service integration
- Redis caching and queue processing
- Event management system
- System health monitoring
- Comprehensive error handling and logging
- Modular architecture for easy extension

## Setup & Installation

### Prerequisites

- Node.js >= 16
- PostgreSQL >= 13
- Redis (for caching and queues)

### Installation Steps

1. Clone the repository and install dependencies:

   ```
   git clone [repository-url]
   cd erp_be
   yarn install
   ```

2. Set up environment variables:

   ```
   cp .env.example .env
   # Edit .env file to match your environment
   ```

3. Create and set up the database:

   ```
   createdb erp_development
   ```

4. Run migrations:

   ```
   yarn migration:run
   # Or using new scripts
   yarn db:run
   ```

5. (Optional) Run database seeds:

   ```
   yarn seed
   # Or using new scripts
   yarn db:seed
   ```

6. Start the development server:

   ```
   yarn start:dev
   ```

7. Initialize database (create, generate migration, and run) in one command:
   ```
   yarn db:init
   ```

## Project Structure

```
src/
├── app.module.ts             # Main application module
├── base/                     # Base classes and services
│   ├── base.module.ts        # Global base module
│   ├── dtos/                 # Base DTOs
│   ├── entities/             # Base entities
│   └── services/             # Base services
│       ├── base.service.ts   # Generic CRUD service
│       ├── cache.service.ts  # Cache service
│       ├── config.service.ts # Configuration service
│       ├── database.service.ts # Database service
│       ├── encryption.service.ts # Encryption service
│       ├── event.service.ts  # Event service
│       ├── file.service.ts   # File service
│       ├── health.service.ts # Health check service
│       ├── logger.service.ts # Logger service
│       ├── mail.service.ts   # Mail service
│       ├── queue.service.ts  # Queue service
│       └── redis.service.ts  # Redis service
├── common/                   # Common utilities
│   ├── decorators/          # Decorators
│   ├── filters/             # Error filters
│   ├── guards/              # Guards
│   └── interceptors/        # Interceptors
├── config/                  # Configuration files
├── database/                # Database related files
│   ├── migrations/          # Migrations
│   └── seeds/               # Seeds
├── modules/                 # Feature modules
│   ├── auth/                # Authentication module
│   ├── users/               # Users module
│   └── [other modules]/     # Other feature modules
└── utils/                   # Utilities
    ├── errors/              # Error classes
    └── helpers/             # Helper functions
```

## Database Management

### Migrations

#### Creating a Migration

1. Create a new empty migration:

   ```
   yarn typeorm migration:create src/database/migrations/CreateTableName
   ```

2. Generate a migration from entity changes:
   ```
   yarn db:generate
   ```

#### Running Migrations

1. Apply pending migrations:

   ```
   yarn db:run
   # Or
   yarn db:migrate
   ```

2. Revert the most recent migration:

   ```
   yarn db:rollback
   ```

3. View migration status:
   ```
   yarn migration:show
   ```

### Database Seeding

Run all seeders:

```
yarn db:seed
```

### Database Initialization

To create the database, generate migrations from entities, and run migrations in one command:

```
yarn db:init
```

### Migration Example

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsers1625000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
          },
          {
            name: 'roles',
            type: 'varchar',
            isArray: true,
            default: '{}',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
```

### Seeder Example

```typescript
import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';

export default class CreateUsers implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        {
          email: 'admin@example.com',
          password: 'hashed_password',
          roles: ['admin'],
        },
      ])
      .execute();
  }
}
```

## Core Services

### Base Service

Provides basic CRUD operations for all entities:

```typescript
async findAll(query: CommonQueryDTO): Promise<[T[], number]> { ... }
async findOne(id: string): Promise<T> { ... }
async create(data: DeepPartial<T>): Promise<T> { ... }
async update(id: string, data: DeepPartial<T>): Promise<T> { ... }
async softDelete(id: string): Promise<void> { ... }
```

### Database Service

Provides transaction support and bulk operations:

```typescript
async transaction<T>(callback: (queryRunner: QueryRunner) => Promise<T>): Promise<T> { ... }
async executeInTransaction<T>(callback: (entityManager: EntityManager) => Promise<T>): Promise<T> { ... }
async bulkInsert<T>(entity: any, data: T[], chunkSize: number = 1000): Promise<void> { ... }
```

### Cache Service

Provides caching functionality:

```typescript
async get<T>(key: string): Promise<T | null> { ... }
async set(key: string, value: unknown, ttl = 60 * 1000): Promise<void> { ... }
async del(key: string): Promise<void> { ... }
async reset(): Promise<void> { ... }
```

### Encryption Service

Provides encryption, hashing and comparison functionality:

```typescript
encrypt(text: string): string { ... }
decrypt(encryptedText: string): string { ... }
async hash(plainText: string): Promise<string> { ... }
async compare(plainText: string, hash: string): Promise<boolean> { ... }
generateRandomBytes(length: number): string { ... }
```

### File Service

Handles file uploads and management:

```typescript
async uploadFile(file: UploadedFile, options?: FileUploadOptions): Promise<string> { ... }
async deleteFile(filepath: string): Promise<void> { ... }
getFileStream(filePath: string): fs.ReadStream { ... }
```

### Health Service

Provides system health monitoring:

```typescript
async checkHealth(): Promise<{ status: string; details: Record<string, any>; }> { ... }
```

### Queue Service

Manages background job processing:

```typescript
async addJob<T>(name: string, data: T, options?: { delay?: number; priority?: number; attempts?: number; }): Promise<void> { ... }
async getJob(jobId: string) { ... }
async removeJob(jobId: string): Promise<void> { ... }
async clearQueue(): Promise<void> { ... }
```

## Shared Modules

### Authentication and Authorization

The system uses JWT and Guards for authentication and authorization:

- `JwtAuthGuard`: JWT token authentication
- `RolesGuard`: Role-based authorization
- `ThrottlerGuard`: API rate limiting

Convenient decorators:

```typescript
@Public() // Public API, no authentication required
@Roles(Role.ADMIN) // Requires specific role
@Auth(Role.USER) // Combined authentication and authorization
```

### Error Handling and Response

The system has HTTP exception filters and transform interceptors to ensure consistent response format:

```typescript
// Response format
{
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
```

## Development Guidelines

### Creating a New Module

1. Create module structure:

   ```
   src/modules/your-module/
   ├── controllers/
   ├── dtos/
   ├── entities/
   └── services/
   ```

2. Define entity extending BaseEntity:

   ```typescript
   @Entity('your_table')
   export class YourEntity extends BaseEntity {
     @Column()
     name: string;

     // Other fields...
   }
   ```

3. Create DTOs:

   ```typescript
   export class CreateEntityDto {
     @StringField({ minLength: 3 })
     name: string;
   }

   export class UpdateEntityDto extends PartialType(CreateEntityDto) {}
   ```

4. Implement service extending BaseService:

   ```typescript
   @Injectable()
   export class YourService extends BaseService<YourEntity> {
     constructor(
       @InjectRepository(YourEntity)
       private readonly repository: Repository<YourEntity>,
     ) {
       super(repository);
     }

     // Custom methods...
   }
   ```

5. Create controller:

   ```typescript
   @Controller('your-endpoint')
   export class YourController {
     constructor(private readonly service: YourService) {}

     @Get()
     @Auth(Role.USER)
     findAll(@Query() query: CommonQueryDTO) {
       return this.service.findAll(query);
     }

     // Other endpoints...
   }
   ```

6. Register module:
   ```typescript
   @Module({
     imports: [TypeOrmModule.forFeature([YourEntity])],
     providers: [YourService],
     controllers: [YourController],
     exports: [YourService],
   })
   export class YourModule {}
   ```

### API Documentation

Use Swagger decorators for API documentation:

```typescript
@Get()
@ApiOperation({ summary: 'Get all items' })
@ApiPaginatedResponse(ItemDto)
findAll() {
  // Implementation
}
```

### Caching Mechanism

Use CacheService to store and retrieve data from cache:

```typescript
// Store data in cache
await this.cacheService.set('cache-key', data, 60 * 1000); // TTL 60s

// Retrieve data from cache
const cachedData = await this.cacheService.get<DataType>('cache-key');
```

### Background Job Processing

Use QueueService to manage background jobs:

```typescript
// Add job to queue
await this.queueService.addJob('job-name', { data: value }, { delay: 5000 });

// Process job
@Processor('default')
export class JobProcessor {
  @Process('job-name')
  async processJob(job: Job<any>) {
    // Process job
  }
}
```
