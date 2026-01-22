---
title: Routers and Routes
description: Define routers with @Router and RPC endpoints with @Route. Learn about file uploads, nested routers, and parameter decorators.
---

# Routers and Routes

Routers and routes are the core building blocks of NestRPC. This guide covers everything you need to know about defining and organizing your RPC endpoints.

## 🎯 Defining a Router

Create a router class with the `@Router()` decorator:

```typescript
import { Router, Route } from '@nestjs-rpc/server';

@Router()
export class UserQueriesRouter {
  @Route()
  getUser({ id }: { id: string }) {
    return { id, name: 'John Doe', email: 'john@example.com' };
  }

  @Route()
  listUsers() {
    return [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ];
  }
}
```

The `@Router()` decorator applies `@Controller()` under the hood, making your class a NestJS controller. This means:
- Routers accept all NestJS controller parameter decorators (`@Req()`, `@Res()`, `@Headers()`, `@Body()`, etc.)
- Routes can have guard and pipe decorators (`@UseGuards()`, `@UsePipes()`, `@UseInterceptors()`, etc.) just like native NestJS controllers
- They work with dependency injection, interceptors, and all NestJS features
- **They MUST be registered in the module's `controllers` array**

## 🛣️ Defining Routes

Mark methods with `@Route()` to expose them as RPC endpoints:

```typescript
@Router()
export class UserMutationsRouter {
  @Route()
  createUser({ name, email }: { name: string; email: string }) {
    // Create user logic
    return { id: '123', name, email };
  }

  @Route()
  updateUser({ id, name, email }: { id: string; name?: string; email?: string }) {
    // Update user logic
    return { id, name, email };
  }
}
```

### 📤 File Upload Routes

NestRPC has built-in support for file uploads. See the [File Uploads](/docs/server/file-uploads) guide for details:

```typescript
@Router()
export class FilesRouter {
  // Single file upload
  @Route({ file: 'single' })
  uploadFile(
    { description }: { description?: string },
    file?: Express.Multer.File
  ) {
    return { filename: file?.originalname, size: file?.size };
  }

  // Multiple file upload
  @Route({ file: 'multiple' })
  uploadFiles(
    { category }: { category?: string },
    files?: Express.Multer.File[]
  ) {
    return { files: files?.map(f => f.originalname), count: files?.length };
  }
}
```

## 📋 Registering Routers

### Create the Manifest

Use `defineManifest()` to map keys to routers or nested maps:

```typescript
import { defineManifest } from '@nestjs-rpc/server';
import { UserQueriesRouter } from './user.queries.router';
import { UserMutationsRouter } from './user.mutations.router';

export const manifest = defineManifest({
  user: {
    queries: UserQueriesRouter,
    mutations: UserMutationsRouter,
  },
});

// 🔁 Export the type for client-side type safety
export type Manifest = typeof manifest;
```

### Register in Module

**⚠️ CRITICAL:** Routers are NestJS controllers under the hood. You **MUST** add your router classes to the module's `controllers` array so Nest can instantiate them:

```typescript
import { Module } from '@nestjs/common';
import { UserQueriesRouter } from './user.queries.router';
import { UserMutationsRouter } from './user.mutations.router';

@Module({
  controllers: [UserQueriesRouter, UserMutationsRouter],
  providers: [],
})
export class AppModule {}
```

### Initialize Before App Creation

**⚠️ CRITICAL:** Call `nestRpcInit(manifest)` **BEFORE** creating your Nest app:

```typescript
import { nestRpcInit } from '@nestjs-rpc/server';

async function bootstrap() {
  nestRpcInit(manifest); // ✅ Must be called FIRST
  
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
```

The runtime validates that:
- The final path segment is a router class decorated with `@Router()`
- The method exists and is decorated with `@Route()`

## 📥 Parameter Rules

**Important parameter rules:**

1. **First Parameter (index 0)**: Reserved for the **incoming request body**. It's automatically injected. **Do not decorate it.** Its TypeScript type flows to the client automatically.

2. **Second Parameter (index 1)**: If the route has file upload configuration (`file: 'single'` or `file: 'multiple'`), this parameter is **reserved for the file/files** (`Express.Multer.File` or `Express.Multer.File[]`).

3. **Subsequent Parameters**: Can use NestJS parameter decorators (`@Req()`, `@Res()`, `@Headers()`, etc.)

```typescript
// No file upload - first param is body
@Route()
async getUserById(id: string) { // ✅ First param = request body
  return getUserFromDb(id);
}

// No file upload - first param is body, subsequent params can use decorators
@Route()
async createUser(
  { name, email }: { name: string; email: string }, // ✅ First param = request body
  @Req() req: Request, // ✅ Can use decorators for subsequent params
) {
  return createUserInDb({ name, email, ip: req.ip });
}

// With file upload - first param is body, second param is file
@Route({ file: 'single' })
async uploadFile(
  { description }: { description?: string }, // ✅ First param = request body
  file?: Express.Multer.File, // ✅ Second param = file (when file config is set)
  @Req() req: Request, // ✅ Subsequent params can use decorators
) {
  return { filename: file?.originalname, description };
}
```

## 🎨 Nested Routers

Organize your API with nested router structures:

```typescript
export const manifest = defineManifest({
  user: {
    queries: UserQueriesRouter,    // GET-like operations
    mutations: UserMutationsRouter, // POST-like operations
  },
  files: FilesRouter,
  admin: {
    users: AdminUsersRouter,
    settings: AdminSettingsRouter,
  },
});
```

Routes become:
- `POST /nestjs-rpc/user/queries/getUser`
- `POST /nestjs-rpc/user/mutations/createUser`
- `POST /nestjs-rpc/files/uploadFile`
- `POST /nestjs-rpc/admin/users/listAll`

### Client Pathing

The nested keys you choose define the access path on the client:

```typescript
// Client usage
const { data: user } = await rpc.user.queries.getUser({ id: '1' });
await rpc.user.mutations.createUser({ name: 'John', email: 'john@example.com' });
await rpc.files.uploadFile({ description: 'Avatar' }, { file: myFile });
const { data: all } = await rpc.admin.users.listAll();
```

## 🔧 Advanced Usage

### Dependency Injection

Routers are NestJS controllers, so you can use dependency injection:

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

### Custom Parameter Decorators

You can use NestJS parameter decorators for subsequent parameters:

```typescript
import { Router, Route } from '@nestjs-rpc/server';
import { Req, Headers, Body } from '@nestjs/common';
import type { Request } from 'express';

@Router()
export class UserRouter {
  @Route()
  updateUser(
    { id, name }: { id: string; name: string }, // ✅ First param = input
    @Req() req: Request, // ✅ Can use decorators
    @Headers('x-trace') trace?: string, // ✅ Can use decorators
  ) {
    return { id, name, updatedBy: req.ip, trace };
  }
}
```

### Custom Router Parameter Decorators

Create your own decorators using `createRouterParamDecorator`:

```typescript
import { createRouterParamDecorator } from '@nestjs-rpc/server';
import { ExecutionContext } from '@nestjs/common';

const CurrentUser = createRouterParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // From your auth middleware
  }
);

@Router()
export class UserRouter {
  @Route()
  async getProfile(
    {}, // ✅ First param still reserved for input (can be empty object)
    @CurrentUser() user: User, // ✅ Custom decorator
  ) {
    return user;
  }
}
```

## 📚 Further Reading

- [NestJS Controllers](https://docs.nestjs.com/controllers)
- [NestJS Providers & DI](https://docs.nestjs.com/providers)
- [File Uploads](/docs/server/file-uploads)
- [Execution Context](/docs/server/execution-context)

