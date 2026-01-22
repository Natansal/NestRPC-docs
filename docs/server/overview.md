---
title: Server Overview
description: Core concepts and features of @nestjs-rpc/server
---

# Server Overview

The `@nestjs-rpc/server` package provides the NestJS integration and runtime for defining and executing RPC routes. It gives you type-safe, zero-boilerplate RPC endpoints with built-in file upload support.

## 🎯 Core Concepts

### Decorators

- **`@Router()`** - Marks a class as an RPC router (applies `@Controller()` under the hood, making it a NestJS controller)
- **`@Route(config?)`** - Marks a method as an RPC endpoint with optional file upload configuration

**Important:** Since routers are NestJS controllers under the hood:
- They accept all NestJS controller parameter decorators (`@Req()`, `@Res()`, `@Headers()`, `@Body()`, etc.)
- Routes can have guard and pipe decorators (`@UseGuards()`, `@UsePipes()`, `@UseInterceptors()`, etc.) just like native NestJS controllers
- They work with dependency injection, interceptors, and all NestJS features

### Manifest

- **`defineManifest({...})`** - Creates a manifest from your router structure, preserving type information
- Maps keys to routers or nested maps, defining the API structure

### Initialization

- **`nestRpcInit(manifest, { apiPrefix })`** - **MUST be called BEFORE `NestFactory.create(...)`**
- Applies Nest decorators so routes can be discovered at bootstrap

## ✨ Key Features

### 🎯 Zero Boilerplate

No controllers, DTOs, or manual route definitions needed. Just define your methods:

```typescript
@Router()
export class UserRouter {
  @Route()
  async getUserById(id: string) {
    return getUserFromDb(id);
  }
}
```

### 🔒 Type Safety

**Parameter Rules:**
- The **first parameter (index 0)** is **reserved for the incoming request body**. Its TypeScript type flows to the client automatically. **Do not decorate it.**
- If the route has file upload configuration (`file: 'single'` or `file: 'multiple'`), the **second parameter (index 1)** is **reserved for the file/files** (`Express.Multer.File` or `Express.Multer.File[]`).
- Subsequent parameters can use NestJS parameter decorators (`@Req()`, `@Res()`, `@Headers()`, etc.)

```typescript
@Route()
async createUser({ name, email }: { name: string; email: string }) {
  // name and email are typed on both server and client!
  return createUserInDb({ name, email });
}
```

### 📤 Built-in File Uploads

Single and multiple file uploads with one decorator:

```typescript
@Route({ file: 'single' })
async uploadAvatar(
  { userId }: { userId: string },
  file?: Express.Multer.File
) {
  // Handle file upload
}

@Route({ file: 'multiple' })
async uploadDocuments(
  { category }: { category?: string },
  files?: Express.Multer.File[]
) {
  // Handle multiple files
}
```

### 🧩 NestJS Native

Routers are NestJS controllers, so you can:
- Use dependency injection
- Apply guards, interceptors, and pipes
- Access request/response objects
- Use custom parameter decorators

```typescript
@Router()
export class UserRouter {
  constructor(
    private readonly userService: UserService,
    private readonly db: DatabaseService,
  ) {}

  @Route()
  async getUserById(id: string) {
    return this.userService.findById(id);
  }
}
```

## 📝 Important Notes

1. **Parameter Rules**: 
   - The **first parameter (index 0)** is **reserved for the incoming request body**. Its type flows to the client. Do not decorate it.
   - If the route has file upload configuration, the **second parameter (index 1)** is **reserved for the file/files**.
   - Subsequent parameters can use NestJS parameter decorators.

2. **Routers are Controllers**: Routers are NestJS controllers under the hood. They accept all controller parameter decorators, and routes can have guard and pipe decorators just like native NestJS controllers.

3. **Module Registration**: **⚠️ CRITICAL** - Router classes **MUST** be added to your module's `controllers` array for them to work:

```typescript
@Module({
  controllers: [UserRouter], // ✅ REQUIRED - Routers must be in controllers array
})
export class AppModule {}
```

4. **Initialization Order**: `nestRpcInit()` **MUST** be called **BEFORE** `NestFactory.create()`. This is critical for decorator discovery.

5. **API Prefix**: The `apiPrefix` defaults to `'nestjs-rpc'` when not provided. All routes will be prefixed with this path.

## 🚀 What's Next?

- Learn about [routers and routes](/docs/server/routers-and-routes) in detail
- Explore [file uploads](/docs/server/file-uploads) capabilities
- See [NestJS integration](/docs/server/nest-integration) patterns
- Understand [error handling](/docs/server/error-handling)

