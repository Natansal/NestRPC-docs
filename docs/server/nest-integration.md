---
title: Nest Integration
description: Initialize NestJS RPC before app creation and define the manifest. Critical setup steps for proper integration.
---

# Nest Integration

Proper integration with NestJS requires calling `nestRpcInit()` before app creation and properly defining your manifest. This guide covers the essential setup steps.

## ⚠️ Critical: Initialize Before App Creation

**`nestRpcInit()` MUST be called BEFORE `NestFactory.create()`**. This is essential because NestRPC applies NestJS decorators (`@Controller()`, `@Post()`, etc.) to your router classes, and NestJS needs these decorators to be present when it discovers controllers during app creation.

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { nestRpcInit } from '@nestjs-rpc/server';
import { manifest } from './nest-rpc.config';

async function bootstrap() {
  // ✅ Must be called BEFORE app creation
  // This applies decorators that Nest needs at bootstrap
  nestRpcInit(manifest, { apiPrefix: 'nestjs-rpc' }); // 'nestjs-rpc' is default

  // Then create your Nest app
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS if needed for your client
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  
  await app.listen(3000);
  console.log('🚀 Server running on http://localhost:3000');
}

bootstrap();
```

### Why This Order Matters

1. `nestRpcInit()` applies decorators to your router classes
2. `NestFactory.create()` discovers controllers by scanning for `@Controller()` decorators
3. If `nestRpcInit()` is called after `NestFactory.create()`, the decorators won't be applied in time
4. Your routes won't be registered

## 📋 Define the Manifest

`defineManifest()` creates a manifest from your router structure and preserves type information so the client can infer method signatures and inputs.

```typescript
// nest-rpc.config.ts
import { defineManifest } from '@nestjs-rpc/server';
import { UserQueriesRouter } from './user/user.queries.router';
import { UserMutationsRouter } from './user/user.mutations.router';
import { FilesRouter } from './files/files.router';

export const manifest = defineManifest({
  user: {
    queries: UserQueriesRouter,
    mutations: UserMutationsRouter,
  },
  files: FilesRouter,
});

// 🔁 Always export the type for client-side type safety
export type Manifest = typeof manifest;
```

### Manifest Structure

The manifest structure defines your API organization:

```typescript
export const manifest = defineManifest({
  // Flat structure
  user: UserRouter,
  files: FilesRouter,
  
  // Nested structure
  admin: {
    users: AdminUsersRouter,
    settings: AdminSettingsRouter,
  },
});
```

The keys you choose become the paths on the client:
- `rpc.user.someMethod()`
- `rpc.files.uploadFile()`
- `rpc.admin.users.listAll()`

## 📦 Register Routers in Module

**⚠️ CRITICAL:** Routers are NestJS controllers under the hood. Router classes **MUST** be registered in your NestJS module's `controllers` array for them to work:

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { UserQueriesRouter } from './user/user.queries.router';
import { UserMutationsRouter } from './user/user.mutations.router';
import { FilesRouter } from './files/files.router';

@Module({
  controllers: [
    UserQueriesRouter,
    UserMutationsRouter,
    FilesRouter,
  ],
  providers: [],
})
export class AppModule {}
```

## 🔧 Configuration Options

### API Prefix

Set a custom API prefix:

```typescript
nestRpcInit(manifest, { apiPrefix: 'api/v1' });
```

All routes will be prefixed with this path:
- `POST /api/v1/user/getUserById`
- `POST /api/v1/files/uploadFile`

**Default:** `'nestjs-rpc'`

## ✅ Complete Setup Example

Here's a complete setup example:

```typescript
// nest-rpc.config.ts
import { defineManifest } from '@nestjs-rpc/server';
import { UserQueriesRouter } from './user/user.queries.router';
import { UserMutationsRouter } from './user/user.mutations.router';

export const manifest = defineManifest({
  user: {
    queries: UserQueriesRouter,
    mutations: UserMutationsRouter,
  },
});

export type Manifest = typeof manifest;

// app.module.ts
import { Module } from '@nestjs/common';
import { UserQueriesRouter } from './user/user.queries.router';
import { UserMutationsRouter } from './user/user.mutations.router';

@Module({
  controllers: [UserQueriesRouter, UserMutationsRouter],
  providers: [],
})
export class AppModule {}

// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { nestRpcInit } from '@nestjs-rpc/server';
import { manifest } from './nest-rpc.config';

async function bootstrap() {
  // ✅ Step 1: Initialize RPC (MUST be first)
  nestRpcInit(manifest, { apiPrefix: 'nestjs-rpc' });

  // ✅ Step 2: Create Nest app
  const app = await NestFactory.create(AppModule);

  // ✅ Step 3: Configure app (CORS, etc.)
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // ✅ Step 4: Start server
  await app.listen(3000);
  console.log('🚀 Server running on http://localhost:3000');
}

bootstrap();
```

## 🐛 Troubleshooting

### Routes Not Registered

If your routes aren't being registered:

1. ✅ Check that `nestRpcInit()` is called **before** `NestFactory.create()`
2. ✅ Check that router classes are in the module's `controllers` array
3. ✅ Check that classes have `@Router()` decorator
4. ✅ Check that methods have `@Route()` decorator

### Type Errors

If you're getting type errors:

1. ✅ Make sure you export `export type Manifest = typeof manifest`
2. ✅ Make sure the client imports the correct `Manifest` type
3. ✅ Check that TypeScript can resolve the type (may need path mapping)

## 📚 Further Reading

- [Quick Start](/docs/quick-start) - Get started quickly
- [Routers and Routes](/docs/server/routers-and-routes) - Define routes
- [Execution Context](/docs/server/execution-context) - How routes execute

