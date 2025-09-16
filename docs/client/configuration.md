---
title: Client Configuration
description: Options for RpcClient
---

`new RpcClient<Manifest>(config)` accepts:

- `baseUrl?` (string): server origin, e.g. `http://localhost:3000`
- `apiPrefix?` (string): controller mount path. Default: `"nestjs-rpc"` (slashes trimmed)
- `requestOptions?` (AxiosRequestConfig): merged into each request. Default: `{}`
- `axiosInstance?` (AxiosInstance): custom Axios instance. Default: `axios`

```ts
import { RpcClient } from '@nestjs-rpc/client';
import type { Manifest } from '../server/nest-rpc.config';

const client = new RpcClient<Manifest>({
  baseUrl: 'https://api.example.com',
  apiPrefix: 'nestjs-rpc',
  requestOptions: { headers: { Authorization: 'Bearer …' } },
});

// Per-call overrides
await client.route('user').getUserById('123', {
  requestOptions: { headers: { 'X-Trace': 'abc' } },
});
```

Further reading:
- Axios config: https://axios-http.com/docs/req_config
- Axios instance: https://axios-http.com/docs/instance
