---
title: Client Overview
description: Create a typed RPC client and call routes like local functions
---

The client mirrors your server router map using TypeScript inference.

Responses are Axios `AxiosResponse`, so destructure `data` from the result.

```ts
import { RpcClient } from '@nestjs-rpc/client';
import type { Manifest } from '../server/nest-rpc.config';

const client = new RpcClient<Manifest>({ baseUrl: 'http://localhost:3000', apiPrefix: 'nestjs-rpc' });
const rpc = client.routers();
// Recommended router constants
export const userRepo = client.route('user');

// Calls
const { data: user } = await rpc.user.queries.getUser({ id: '1' });
const { data: all } = await rpc.user.queries.listUsers();
const { data: one } = await userRepo.queries.getUser({ id: '1' });
```

Errors surface through the HTTP client (Axios) as usual. Handle with try/catch or interceptors.

