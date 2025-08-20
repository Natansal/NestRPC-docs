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
import { defineAppRouter } from '@nestjs-rpc/server';
import { UserQueriesRouter } from './user.queries.router';

export const routes = defineAppRouter({
  user: { queries: UserQueriesRouter },
});
```

Use the map in `NestRPCModule.forRoot({ routes })`. The dynamic controller validates that:
- the final path segment is a router class decorated with `@Router()`
- the method exists and is decorated with `@Route()`

### Input param rule

The first parameter is reserved for the input and is injected automatically. Do not decorate it; decorating index 0 throws at runtime.

### Client pathing follows your keys

The nested keys you choose define the access path on the client. For example:

```ts
export const routes = defineAppRouter({
  app: AppRouter,
  user: { queries: UserQueriesRouter },
});
```

Client calls:

```ts
rpc.app.batch1(123)
rpc.user.queries.getUser({ id: '1' })
```

