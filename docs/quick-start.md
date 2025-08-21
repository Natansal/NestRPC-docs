---
title: Quick Start
description: Install, configure, and call your first RPC with NestJS RPC
slug: /quick-start
---

### Install

```bash
# Server (NestJS app)
npm install @nestjs-rpc/server

# Client (web/app)
npm install @nestjs-rpc/client
```

### 1) Define routers and routes (server)

Create a router with `@Router()` and expose methods with `@Route()`.

```ts
// user.queries.router.ts
import { Router, Route } from '@nestjs-rpc/server';

@Router()
export class UserQueriesRouter {
  @Route()
  getUser({ id }: { id: string }) {
    return { id, name: 'Ada' };
  }

  @Route()
  listUsers() {
    return [{ id: '1', name: 'Ada' }];
  }
}
```

Important: The first parameter in each route method is reserved for the incoming input. Its TypeScript type flows to the client automatically. Do not decorate the first parameter with custom decorators—it’s used for the raw input and enforced at runtime.

### 2) Declare the app router map (server)

Use `defineAppRouter()` to map keys to routers or nested maps. Export a type for the client.

```ts
// nest-rpc.config.ts
import { defineAppRouter, type InferNestRpcRouterApp } from '@nestjs-rpc/server';
import { UserQueriesRouter } from './user.queries.router';

export const appRouter = defineAppRouter({
  user: { queries: UserQueriesRouter },
});

export type RpcApp = InferNestRpcRouterApp<typeof appRouter>;

Note: The nested keys you define here are the exact paths the client will use. For the example above, method access becomes: `rpc.user.queries.getUser(...)`.
```

### 3) Mount the RPC controller (server)

Register the module and pass the router map. Optionally customize `apiPrefix` and `logger`.

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { NestRPCModule } from '@nestjs-rpc/server';
import { appRouter } from './nest-rpc.config';

@Module({
  imports: [
    NestRPCModule.forRoot({
      routes: appRouter,
      apiPrefix: 'api',
    }),
  ],
})
export class AppModule {}
```

### 4) Create a typed client (client)

Import the server type and build the client. Batching is enabled by default.

```ts
// rpc.ts (client)
import { createRpcClient } from '@nestjs-rpc/client';
import type { RpcApp } from '../server/nest-rpc.config';

export const rpc = createRpcClient<RpcApp>({
  baseUrl: 'http://localhost:3000',
  apiPrefix: 'api',
});
```

### 5) Call methods like local functions (client)

```ts
const user = await rpc.user.queries.getUser({ id: '1' });
const all = await rpc.user.queries.listUsers();
```

### About batching (client-side)

- Enabled by default with sane defaults: `{ enabled: true, maxBatchSize: 20, debounceMs: 50, maxUrlSize: 2048 }`.
- Multiple calls within the debounce window coalesce into a single POST with encoded `calls` query and parallel body.
- Configure via `batch`:

```ts
createRpcClient<RpcApp>({
  baseUrl: 'http://localhost:3000',
  apiPrefix: 'api',
  batch: { enabled: true, maxBatchSize: 10, debounceMs: 25, maxUrlSize: 4096 },
});
```

Tip: If you disable batching (`batch: false`), each call posts immediately.

### Example repo

See a full working example in the monorepo under `NestRPC/example` (server and client). The docs here mirror that usage style.

