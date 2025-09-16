---
title: Error Handling
description: Handling HTTP and network errors in the client
---

When the server returns an error for a call, Axios rejects the promise with an error containing the HTTP status and data.

Examples of sources:
- Nest `HttpException` → code/status and message
- Network errors → Axios network error

Handle errors per-call:

```ts
try {
  await rpc.user.queries.getUser({ id: 'missing' });
} catch (e) {
  // AxiosError
  console.error(e.response?.status, e.response?.data);
}
```

Further reading:
- Axios error handling: https://axios-http.com/docs/handling_errors
- Axios interceptors: https://axios-http.com/docs/interceptors
