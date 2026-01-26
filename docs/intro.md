---
sidebar_position: 1
title: Introduction
description: Type-safe, end-to-end RPC for NestJS. Write server methods, call them from the client like local functions. Zero boilerplate. Full TypeScript inference.
---

# 🚀 Welcome to NestRPC

**Type-safe, end-to-end RPC for NestJS. Write server methods, call them from the client like local functions. Zero boilerplate. Full TypeScript inference. Powered by runtime magic using proxies.**

NestRPC is a lightweight RPC layer for NestJS that eliminates the boilerplate of traditional REST APIs. Instead of writing controllers, DTOs, and manual route definitions, you simply define router classes with decorators and get automatic type inference from server to client.

## ✨ Why NestRPC?

**Stop writing REST endpoints manually.** NestRPC gives you:

- 🎯 **Zero Boilerplate** - No controllers, DTOs, or manual route definitions
- 🔒 **End-to-End Type Safety** - Full TypeScript inference from server to client
- 📤 **Built-in File Uploads** - Single and multiple file support out of the box
- 🧩 **Decorator-Driven** - Simple `@Router()` and `@Route()` decorators
- ⚡ **Zero Runtime Overhead** - Runtime magic using proxies, no code generation needed
- 🔄 **Automatic Route Registration** - Routes work via TypeScript decorators and runtime magic using proxies
- 🎨 **Framework Agnostic Client** - Works with React, Vue, Angular, or vanilla JS
- ⚛️ **React Query Integration** - Type-safe React Query hooks with automatic caching and cache invalidation

### The Problem It Solves

Traditional REST APIs require you to:
- Write controllers, DTOs, and validation manually
- Maintain separate types for client and server
- Manually map routes to methods
- Handle file uploads with custom middleware
- Write client-side API wrappers

**NestRPC eliminates all of this.** Write your server methods, and they're automatically available as type-safe client functions.

## 🎯 Core Concepts

### 1. Define Routers

Create router classes with `@Router()` and mark methods with `@Route()`:

```typescript
import { Router, Route } from '@nestjs-rpc/server';

@Router()
export class UserRouter {
  @Route()
  async getUserById(id: string) {
    return { id, name: 'John Doe', email: 'john@example.com' };
  }

  @Route({ file: 'single' })
  async uploadAvatar(
    { userId }: { userId: string },
    file?: Express.Multer.File
  ) {
    return { userId, filename: file?.originalname };
  }
}
```

### 2. Create Manifest

Group your routers in a manifest and export the type:

```typescript
import { defineManifest } from '@nestjs-rpc/server';

export const manifest = defineManifest({
  user: UserRouter,
});

export type Manifest = typeof manifest; // 👈 Export for client type safety
```

### 3. Initialize Server

Call `nestRpcInit()` **before** `NestFactory.create()`:

```typescript
import { nestRpcInit } from '@nestjs-rpc/server';

async function bootstrap() {
  nestRpcInit(manifest); // ⚠️ Must be called FIRST
  
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
```

### 4. Use Typed Client

Import your server's manifest type and call methods like local functions:

```typescript
import { RpcClient } from '@nestjs-rpc/client';
import type { Manifest } from '../server/nest-rpc.config';

const rpc = new RpcClient<Manifest>({
  baseUrl: 'http://localhost:3000',
}).routers();

// Full type safety and autocomplete! 🎉
const { data: user } = await rpc.user.getUserById('123');
await rpc.user.uploadAvatar({ userId: '123' }, { file: myFile });
```

## 📦 Packages

| Package | Description | npm |
|---------|-------------|-----|
| `@nestjs-rpc/server` | NestJS server integration with decorators and runtime magic using proxies | [![npm](https://img.shields.io/npm/v/@nestjs-rpc/server.svg)](https://www.npmjs.com/package/@nestjs-rpc/server) |
| `@nestjs-rpc/client` | Type-safe client for calling RPC methods from any frontend | [![npm](https://img.shields.io/npm/v/@nestjs-rpc/client.svg)](https://www.npmjs.com/package/@nestjs-rpc/client) |
| `@nestjs-rpc/query` | Type-safe React Query hooks with automatic caching and cache invalidation | [![npm](https://img.shields.io/npm/v/@nestjs-rpc/query.svg)](https://www.npmjs.com/package/@nestjs-rpc/query) |

## 🚀 Quick Start

Ready to get started? Head to the [Quick Start guide](/docs/quick-start) to build your first RPC in minutes.

Or explore the [complete example](https://github.com/Natansal/NestRPC/tree/main/example) with:
- User CRUD operations
- Single and multiple file uploads
- React frontend
- NestJS backend

## 🆚 Comparison

| Feature | NestRPC | Traditional REST | tRPC |
|---------|---------|------------------|------|
| Type Safety | ✅ End-to-end | ❌ Manual types | ✅ End-to-end |
| File Uploads | ✅ Built-in | ⚠️ Custom setup | ❌ Not supported |
| Boilerplate | ✅ Zero | ❌ High | ✅ Low |
| NestJS Integration | ✅ Native | ✅ Native | ⚠️ Limited |
| Framework Agnostic Client | ✅ Yes | ✅ Yes | ⚠️ React-focused |
| React Query Integration | ✅ Type-safe hooks | ❌ Manual setup | ✅ Type-safe hooks |
| Automatic Cache Invalidation | ✅ Built-in | ❌ Manual | ⚠️ Manual |

---

<div align="center">

**Made with ❤️ for the NestJS community**

[⭐ Star us on GitHub](https://github.com/natansal/NestRPC) • [📖 Documentation](https://natansal.github.io/NestRPC-docs/) • [🐛 Report Bug](https://github.com/natansal/NestRPC/issues)

</div>
