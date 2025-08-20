---
title: Execution Context
description: Access request data and RPC input via NestRpcExecutionContext
---

`NestRpcExecutionContext` wraps Nest's `ExecutionContext` and exposes:

- `getClass()` and `getHandler()` for the current router and method
- `getType()` which returns `"http-rpc"`
- `switchToHttp()` for standard Nest HTTP objects
- `switchToHttpRpc().getInput<T>()` to access the raw input for this call

Use it implicitly via param decorators or explicitly in service code:

```ts
import { NestRPCService } from '@nestjs-rpc/server';

// programmatic execution
await rpcService.execute(UserQueriesRouter, 'getUser', ctx);
```

