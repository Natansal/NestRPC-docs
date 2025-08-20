---
title: Client Overview
description: Create a typed RPC client and call routes like local functions
---

The client mirrors your server router map using TypeScript inference.

```ts
import { createRpcClient } from '@nestjs-rpc/client';
import type { RpcApp } from '../server/nest-rpc.config';

const rpc = createRpcClient<RpcApp>({ baseUrl: 'http://localhost:3000', apiPrefix: 'api' });

// Calls
const user = await rpc.user.queries.getUser({ id: '1' });
const all = await rpc.user.queries.listUsers();
```

Errors are surfaced as `RpcError` when a response item includes an error rather than data.

