---
title: Quick Start
description: Get up and running with NestRPC in minutes. Install, configure, and call your first type-safe RPC.
slug: /quick-start
---

# 🚀 Quick Start

Get NestRPC up and running in minutes. This guide will walk you through creating a complete RPC setup with user management.

## 📦 Installation

```bash
# Server (NestJS app)
npm install @nestjs-rpc/server

# Client (web/app)
npm install @nestjs-rpc/client axios
```

## 🎯 Step 1: Define Your Routers (Server)

Create router classes with `@Router()` and mark methods with `@Route()`. 

**Important:** Routers are NestJS controllers under the hood. This means:
- They accept all NestJS controller parameter decorators (`@Req()`, `@Res()`, `@Headers()`, etc.)
- Routes can have guard and pipe decorators (`@UseGuards()`, `@UsePipes()`, etc.) just like native NestJS controllers
- They work with dependency injection, interceptors, and all NestJS features

```typescript
// src/user/user.queries.router.ts
import { Router, Route } from '@nestjs-rpc/server';

@Router()
export class UserQueriesRouter {
  @Route()
  getUser({ id }: { id: string }) {
    return { id, name: 'Ada Lovelace', email: 'ada@example.com' };
  }

  @Route()
  listUsers() {
    return [
      { id: '1', name: 'Ada Lovelace' },
      { id: '2', name: 'Alan Turing' },
    ];
  }
}
```

```typescript
// src/user/user.mutations.router.ts
import { Router, Route } from '@nestjs-rpc/server';

@Router()
export class UserMutationsRouter {
  @Route()
  createUser({ name, email }: { name: string; email: string }) {
    const newUser = { id: Date.now().toString(), name, email };
    // Save to database...
    return newUser;
  }

  @Route()
  updateUser({ id, name, email }: { id: string; name?: string; email?: string }) {
    // Update user in database...
    return { id, name, email };
  }
}
```

**Important:** 
- The **first parameter** in each route method is **reserved for the incoming request body**. Its TypeScript type flows to the client automatically.
- If the route has file upload configuration (`file: 'single'` or `file: 'multiple'`), the **second parameter** is reserved for the file/files.
- Do not decorate the first parameter - it's automatically injected with the request body.

## 📋 Step 2: Create the Manifest (Server)

Use `defineManifest()` to map keys to routers or nested maps. Export `type Manifest = typeof manifest` for client type safety.

```typescript
// src/nest-rpc.config.ts
import { defineManifest } from '@nestjs-rpc/server';
import { UserQueriesRouter } from './user/user.queries.router';
import { UserMutationsRouter } from './user/user.mutations.router';

export const manifest = defineManifest({
  user: {
    queries: UserQueriesRouter,
    mutations: UserMutationsRouter,
  },
});

// 🔁 Export the type for client-side type safety
export type Manifest = typeof manifest;
```

**Note:** The nested keys you define here become the paths the client will use. For the example above:
- `rpc.user.queries.getUser(...)`
- `rpc.user.mutations.createUser(...)`

## ⚙️ Step 3: Initialize RPC (Server)

**⚠️ IMPORTANT:** Call `nestRpcInit()` **BEFORE** `NestFactory.create()`. This applies Nest decorators so routes can be discovered at bootstrap.

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { nestRpcInit } from '@nestjs-rpc/server';
import { manifest } from './nest-rpc.config';

async function bootstrap() {
  // ✅ Call this FIRST - it applies decorators that Nest needs at bootstrap
  nestRpcInit(manifest, { apiPrefix: 'nestjs-rpc' }); // 'nestjs-rpc' is default

  // Then create your Nest app
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS if needed for your client
  app.enableCors({
    origin: 'http://localhost:5173',
  });
  
  await app.listen(3000);
  console.log('🚀 Server running on http://localhost:3000');
}

bootstrap();
```

## 📦 Step 4: Register Routers in Module

**⚠️ CRITICAL:** Routers are NestJS controllers under the hood. You **MUST** add your router classes to the module's `controllers` array for them to work:

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { UserQueriesRouter } from './user/user.queries.router';
import { UserMutationsRouter } from './user/user.mutations.router';

@Module({
  controllers: [UserQueriesRouter, UserMutationsRouter],
  providers: [],
})
export class AppModule {}
```

## 🔗 Step 5: Create Typed Client (Client)

**⚠️ IMPORTANT:** Import your server's `Manifest` **type only** using `import type`. Do **NOT** import the manifest object itself, as this will cause the frontend to try to evaluate backend code and result in errors.

```typescript
// src/rpc-client.ts
import { RpcClient } from '@nestjs-rpc/client';
import type { Manifest } from '../../server/src/nest-rpc.config'; // ✅ Use 'import type'

export const rpcClient = new RpcClient<Manifest>({
  baseUrl: 'http://localhost:3000',
  apiPrefix: 'nestjs-rpc', // Optional, defaults to 'nestjs-rpc'
});

// Recommended: derive stable router constants
export const rpc = rpcClient.routers();
export const userRepo = rpc.user;
```

## 🎉 Step 6: Call Methods Like Local Functions (Client)

Now you have full type safety and autocomplete! 🎉

```typescript
// User operations
const { data: user } = await rpc.user.queries.getUser({ id: '1' });
//    ^? { id: string; name: string; email: string }

const { data: users } = await rpc.user.queries.listUsers();
//    ^? Array<{ id: string; name: string; email: string }>

await rpc.user.mutations.createUser({ 
  name: 'Jane Doe', 
  email: 'jane@example.com' 
});

// Or via router constants
const { data: one } = await userRepo.queries.getUser({ id: '1' });
```

## ✅ What You Get

- ✅ Full TypeScript autocomplete
- ✅ Compile-time type checking
- ✅ Runtime type safety
- ✅ Zero boilerplate

## 📚 Next Steps

- Explore [advanced configuration](/docs/client/configuration) options
- Check out [best practices](/docs/best-practices) for organizing your code
- Learn about [file uploads](/docs/server/file-uploads) when you need them
- See the [complete example](https://github.com/Natansal/NestRPC/tree/main/example) with React frontend

## 💡 Real-World Example

See a full working example in the monorepo under `NestRPC/example` (server and client) with:
- User CRUD operations
- React frontend
- NestJS backend
