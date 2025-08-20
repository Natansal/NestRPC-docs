---
title: FAQ
---

- How are input types inferred on the client?
  - The first parameter of each `@Route()` method is treated as the input type. `InferNestRpcRouterApp` maps that to the client.

- Can I decorate the first parameter?
  - No. Index 0 is reserved for input and enforced at runtime.

- How do I access the Nest request/response?
  - Use built-ins: `Req`, `Res`, `Next`, or create custom param decorators.

- Does batching change execution order?
  - Calls are executed in parallel on the server and returned in a correlated response array; each client call receives its own result or error.

