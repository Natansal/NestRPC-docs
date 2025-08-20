---
title: Error Handling (Server)
description: Throw NestJS HttpExceptions inside routes; batching behavior
---

You can throw any NestJS `HttpException` (e.g., `BadRequestException`, `UnauthorizedException`, `NotFoundException`) directly from your `@Route()` methods. The RPC controller normalizes these to RPC error items with the proper status code and message.

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

Batch behavior:
- Each call in a batch is executed independently; an error in one call does not cancel the others.
- The server returns a `BatchResponse[]` with per-call `error` or `response`.
- On the client, the specific call that failed will throw an error, while other calls in the same batch resolve normally.

