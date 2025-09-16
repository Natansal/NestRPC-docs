---
title: FAQ
---

- How are input types inferred on the client?
  - The first parameter of each `@Route()` method is treated as the input type. Export `type Manifest = typeof manifest` on the server and use `new RpcClient<Manifest>()` on the client.

- Can I decorate the first parameter?
  - Prefer not to. Index 0 is the raw input and should be left undecorated.

- How do I access the Nest request/response?
  - Use standard Nest request/response access patterns inside your router methods or global interceptors/guards.


