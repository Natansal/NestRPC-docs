---
title: Error Handling
description: RpcError and server error mapping
---

When the server returns an error for a call, the client throws a `RpcError` with `{ code, name, message }`.

Examples of sources:
- Non-HTTP errors → normalized to code 500
- Nest `HttpException` → code/status and message
- Network or invalid JSON parsing → `RpcError.fromFetchError` / `fromInvalidJson`

Handle errors per-call:

```ts
try {
  await rpc.user.queries.getUser({ id: 'missing' });
} catch (e) {
  if (e instanceof RpcError) {
    console.error(e.code, e.name, e.message);
  }
}
```

