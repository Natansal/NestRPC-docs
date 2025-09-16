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
npm install @nestjs-rpc/client axios
```

### 1) Define routers and routes (server)

Create a router with `@Router()` and expose methods with `@Route()`.

```ts
// user.queries.router.ts
import { Router, Route } from "@nestjs-rpc/server";

@Router()
export class UserQueriesRouter {
   @Route()
   getUser({ id }: { id: string }) {
      return { id, name: "Ada" };
   }

   @Route()
   listUsers() {
      return [{ id: "1", name: "Ada" }];
   }
}
```

Optional: add Nest param decorators (like any controller method). The first param stays your RPC input; decorate subsequent params.

```ts
import { Router, Route } from "@nestjs-rpc/server";
import { Req, Headers } from "@nestjs/common";
import type { Request } from "express";

@Router()
export class UserMutationsRouter {
   @Route()
   updateUser(
      { id, name }: { id: string; name: string },
      @Req() req: Request,
      @Headers("x-trace") trace?: string,
   ) {
      // use req.user, headers, etc.
      return { id, name, updatedBy: req.ip, trace };
   }
}
```

Important: The first parameter in each route method is reserved for the incoming input. Its TypeScript type flows to the
client automatically.

### 2) Declare the manifest (server)

Use `defineManifest()` to map keys to routers or nested maps. Export `type Manifest = typeof manifest` for the client.

```ts
// nest-rpc.config.ts
import { defineManifest } from '@nestjs-rpc/server';
import { UserQueriesRouter } from './user.queries.router';

export const manifest = defineManifest({
  user: { queries: UserQueriesRouter },
});

export type Manifest = typeof manifest;

Note: The nested keys you define here are the paths the client will use. For the example above, method access becomes: `rpc.user.queries.getUser(...)`.
```

### 3) Initialize RPC before NestFactory.create (server)

Call `nestRpcInit(manifest, { apiPrefix })` BEFORE `NestFactory.create(...)`. This applies Nest decorators so routes can
be discovered at bootstrap.

```ts
// main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { nestRpcInit } from "@nestjs-rpc/server";
import { manifest } from "./nest-rpc.config";

async function bootstrap() {
   nestRpcInit(manifest, { apiPrefix: "nestjs-rpc" /* default */ });
   const app = await NestFactory.create(AppModule);
   await app.listen(3000);
}

bootstrap();
```

### 4) Create a typed client (client)

Import the server `Manifest` type and build the client.

```ts
// rpc.ts (client)
import { RpcClient } from "@nestjs-rpc/client";
import type { Manifest } from "../server/nest-rpc.config";

export const client = new RpcClient<Manifest>({
   baseUrl: "http://localhost:3000",
   apiPrefix: "nestjs-rpc",
});

// Recommended: derive stable router constants
export const rpc = client.routers();
export const userRepo = rpc.user;
```

### 5) Call methods like local functions (client)

```ts
const { data: user } = await rpc.user.queries.getUser({ id: "1" });
const { data: all } = await rpc.user.queries.listUsers();
// Or via a router constant
const { data: one } = await userRepo.queries.getUser({ id: "1" });
```

### Example repo

See a full working example in the monorepo under `NestRPC/example` (server and client). The docs here mirror that usage
style.
