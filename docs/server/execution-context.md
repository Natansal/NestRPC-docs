---
title: Execution Context
description: How routes execute within NestJS
---

RPC routes run as standard NestJS controller methods after `nestRpcInit` applies decorators.

- The first parameter is the raw input from the client
- Your router classes can use dependency injection like any Nest provider
- Nest guards, interceptors, and pipes apply as usual

```ts
import { Router, Route } from '@nestjs-rpc/server';
import { Injectable } from '@nestjs/common';

@Injectable()
class UsersService { /* ... */ }

@Router()
export class UserRouter {
  constructor(private readonly users: UsersService) {}

  @Route()
  getUser({ id }: { id: string }) {
    return this.users.find(id);
  }
}
```

