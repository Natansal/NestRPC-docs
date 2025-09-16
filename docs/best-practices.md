---
title: Best Practices
description: Recommended patterns for server and client usage
---

### Server

- Export a manifest and its type

```ts
// nest-rpc.config.ts
import { defineManifest } from '@nestjs-rpc/server';

export const manifest = defineManifest({
  // ...routers
});

export type Manifest = typeof manifest;
```

- Initialize before app creation

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { nestRpcInit } from '@nestjs-rpc/server';
import { manifest } from './nest-rpc.config';

async function bootstrap() {
  nestRpcInit(manifest, { apiPrefix: 'nestjs-rpc' });
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

- Keep your routers thin
  - Inject services for business logic
  - Validate inputs with pipes or class-validator

### Client

- Create a single client instance

```ts
import { RpcClient } from '@nestjs-rpc/client';
import type { Manifest } from '../server/nest-rpc.config';

export const client = new RpcClient<Manifest>({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  apiPrefix: 'nestjs-rpc',
});
```

- Prefer `routers()` and router constants

```ts
export const rpc = client.routers();
export const userRepo = rpc.user;

// Usage
const { data: user } = await rpc.user.queries.getUser({ id: '1' });
const { data: one } = await userRepo.queries.getUser({ id: '1' });
```

- Use per-call overrides sparingly

```ts
await userRepo.queries.getUser({ id: '1' }, {
  requestOptions: { headers: { Authorization: 'Bearer …' } },
});
```

- Handle errors with Axios patterns

```ts
try {
  await userRepo.queries.getUser({ id: 'missing' });
} catch (e) {
  console.error(e.response?.status, e.response?.data);
}
```

Further reading:
- Axios docs: https://axios-http.com

### Project structure

```
src/
  app.module.ts
  main.ts
  nest-rpc.config.ts   # manifest + Manifest type
  routers/
    user.queries.router.ts
    user.mutations.router.ts
  client/
    rpc.ts             # RpcClient + routers() + router constants
```


