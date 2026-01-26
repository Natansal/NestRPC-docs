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

## 🎉 Step 6: Use RPC in Your Client

You have two options for using RPC in your client:

### Option A: Direct RPC Calls

Use RPC methods directly with full type safety:

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

### Option B: React Query Hooks (Recommended for React)

For React applications, use the `@nestjs-rpc/query` package for automatic caching, background refetching, and cache invalidation:

```typescript
// Install: npm install @nestjs-rpc/query @tanstack/react-query

// src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRpcQuery, createRpcMutation } from '@nestjs-rpc/query';
import { rpc } from './rpc-client';

const queryClient = new QueryClient();

// Create reusable hooks
const useUserList = createRpcQuery(rpc.user.queries.listUsers, {
  staleTime: 30000,
});

const useCreateUser = createRpcMutation(rpc.user.mutations.createUser, {
  invalidate: [rpc.user.queries.listUsers], // Auto-invalidate after success!
});

function UserList() {
  const { data: users = [], isLoading } = useUserList(undefined);
  const createUser = useCreateUser({
    onSuccess: () => console.log('User created!'),
  });

  return (
    <div>
      {isLoading ? <div>Loading...</div> : (
        <ul>
          {users.map(user => <li key={user.id}>{user.name}</li>)}
        </ul>
      )}
      <button onClick={() => createUser.mutate({ body: { name: 'John', email: 'john@example.com' } })}>
        Create User
      </button>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserList />
    </QueryClientProvider>
  );
}
```

**Benefits of React Query integration:**
- ✅ Automatic caching and background refetching
- ✅ Automatic cache invalidation after mutations
- ✅ No manual loading/error state management
- ✅ Optimistic updates support
- ✅ Full type safety from server to hooks

See the [React Query Integration](/docs/query/overview) guide for complete documentation.

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
