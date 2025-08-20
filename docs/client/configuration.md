---
title: Client Configuration
description: Options for createRpcClient
---

`createRpcClient(config)` accepts:

- `baseUrl` (required): server origin, e.g. `http://localhost:3000`
- `apiPrefix` (default `"/nestjs-rpc"`): controller mount path; can be `"api"`
- `fetchOptions` (default `{}`): merged into each request
- `batch` (default enabled): boolean or object `{ enabled, maxBatchSize, debounceMs, maxUrlSize }`

```ts
import { createRpcClient } from '@nestjs-rpc/client';

const rpc = createRpcClient<RpcApp>({
  baseUrl: 'https://api.example.com',
  apiPrefix: 'api',
  fetchOptions: { headers: { Authorization: 'Bearer …' } },
  batch: { enabled: true, maxBatchSize: 10, debounceMs: 25, maxUrlSize: 4096 },
});
```

