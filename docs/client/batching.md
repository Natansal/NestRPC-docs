---
title: Batching
description: How client-side batching combines calls into a single request
---

The client batches multiple calls into one POST to reduce network overhead.

Mechanics:
- Each call is queued with an incrementing id and its method path.
- The URL encodes `calls` like `1:user.get,2:user.list`.
- The body is an array: `[{ id: '1', input: {...} }, { id: '2', input: undefined }]`.
- The server pairs each body item with its query entry and executes in parallel.

Defaults: `{ enabled: true, maxBatchSize: 20, debounceMs: 50, maxUrlSize: 2048 }`.

Configuration:

```ts
createRpcClient<RpcApp>({
  baseUrl: 'http://localhost:3000',
  apiPrefix: 'api',
  batch: { enabled: true, maxBatchSize: 5, debounceMs: 10 },
});
```

Disabling:

```ts
createRpcClient<RpcApp>({ baseUrl: '...', batch: false });
```

Oversized calls: If a queued batch would exceed `maxUrlSize` or `maxBatchSize`, it flushes and retries the last item in a new batch. If a single call exceeds `maxUrlSize`, an error is thrown.

