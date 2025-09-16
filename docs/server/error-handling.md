---
title: Server Error Handling
description: How errors are surfaced to the client
---

Throw inside a route method to trigger Nest's standard exception handling. The client receives the HTTP error mapped by Nest (e.g., 400/401/500) via Axios.

Example:

```ts
import { Router, Route } from '@nestjs-rpc/server';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@Router()
export class UserMutationsRouter {
  @Route()
  updateUser({ id, name }: { id: string; name: string }) {
    if (!id) throw new BadRequestException('id is required');
    const user = findUser(id);
    if (!user) throw new NotFoundException('user not found');
    return saveUser({ ...user, name });
  }
}
```

Note: Each call executes independently; one failing call does not affect others.

Further reading:
- NestJS Exception filters: https://docs.nestjs.com/exception-filters
- NestJS Guards: https://docs.nestjs.com/guards

