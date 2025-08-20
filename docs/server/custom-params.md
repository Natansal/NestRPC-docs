---
title: Custom Param Decorators
description: Build reusable param decorators for your RPC routes
---

Create custom param decorators with `createRouterParamDecorator()`. The factory receives your decoration-time input and the `NestRpcExecutionContext` at runtime.

```ts
import { createRouterParamDecorator, Router, Route } from '@nestjs-rpc/server';

// Retrieves the user from the session: req.session.user
const SessionUser = createRouterParamDecorator((_, ctx) => ctx.switchToHttp().getRequest().session.user);

@Router()
export class UserRouter {
  @Route()
  me(_: unknown, @SessionUser() user: { id: string }) {
    return user;
  }
}
```

Built-ins:
- `Req` / `Res` / `Next` from Nest HTTP adapter
- `Input` convenience for raw input (equivalent to first param)

Rule: The input parameter is always index 0 and cannot be decorated—reserve custom decorators for subsequent parameters.

