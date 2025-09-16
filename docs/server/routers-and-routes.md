---
title: Routers and Routes
description: Define routers with @Router and RPC endpoints with @Route
---

### Define a router

```ts
import { Router, Route } from '@nestjs-rpc/server';

@Router()
export class UserQueriesRouter {
  @Route()
  getUser({ id }: { id: string }) { /* ... */ }

  @Route()
  listUsers() { /* ... */ }
}
```

### Register routers

```ts
import { defineManifest } from '@nestjs-rpc/server';
import { UserQueriesRouter } from './user.queries.router';

export const manifest = defineManifest({
  user: { queries: UserQueriesRouter },
});

export type Manifest = typeof manifest;
```

Also add your router classes to the module's `controllers` array so Nest can instantiate them:

```ts
import { Module } from '@nestjs/common';
import { UserQueriesRouter } from './user.queries.router';

@Module({ controllers: [UserQueriesRouter] })
export class AppModule {}
```

Call `nestRpcInit(manifest)` BEFORE creating your Nest app. The runtime validates that:
- the final path segment is a router class decorated with `@Router()`
- the method exists and is decorated with `@Route()`

### Input param rule

The first parameter is reserved for the input and is injected automatically.

Further reading:
- Nest Controllers: https://docs.nestjs.com/controllers
- Nest Providers & DI: https://docs.nestjs.com/providers

### Client pathing follows your keys

The nested keys you choose define the access path on the client. For example:

```ts
export const manifest = defineManifest({
  app: AppRouter,
  user: { queries: UserQueriesRouter },
});
```

Client calls:

```ts
rpc.app.someMethod(123)
rpc.user.queries.getUser({ id: '1' })
```

