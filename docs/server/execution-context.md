---
title: Execution Context
description: How routes execute within NestJS. Understanding the execution flow, dependency injection, and NestJS integration.
---

# Execution Context

RPC routes run as standard NestJS controller methods after `nestRpcInit` applies decorators. This means they have full access to NestJS features like dependency injection, guards, interceptors, and pipes.

## 🎯 How It Works

After `nestRpcInit()` is called, NestRPC applies NestJS decorators (`@Controller()`, `@Post()`, etc.) to your router classes. When a request comes in:

1. NestJS routes the request to the appropriate controller method
2. The first parameter (index 0) is automatically injected with the request body from the client
3. If the route has file upload configuration, the second parameter (index 1) is reserved for the file/files
4. Subsequent parameters can use NestJS parameter decorators (`@Req()`, `@Res()`, `@Headers()`, etc.)
5. Guards, interceptors, and pipes execute in their normal order
6. The method executes and returns a value
7. The response is sent back to the client

## 🔧 Dependency Injection

Your router classes can use dependency injection like any NestJS provider:

```typescript
import { Router, Route } from '@nestjs-rpc/server';
import { Injectable } from '@nestjs/common';

@Injectable()
class UsersService {
  find(id: string) {
    return { id, name: 'John Doe' };
  }
}

@Router()
export class UserRouter {
  constructor(private readonly users: UsersService) {}

  @Route()
  getUser({ id }: { id: string }) {
    return this.users.find(id);
  }
}
```

## 🛡️ Guards, Interceptors, and Pipes

All NestJS features work as usual:

```typescript
import { Router, Route } from '@nestjs-rpc/server';
import { UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ValidationPipe } from './pipes/validation.pipe';

@Router()
@UseGuards(AuthGuard) // ✅ Apply guard to all routes
export class UserRouter {
  @Route()
  @UseInterceptors(LoggingInterceptor) // ✅ Apply interceptor to specific route
  @UsePipes(ValidationPipe) // ✅ Apply pipe to specific route
  async createUser(input: CreateUserDto) {
    return this.userService.create(input);
  }
}
```

## 📥 Parameter Injection

**Parameter Rules:**
- **First parameter (index 0)**: Reserved for the **incoming request body** from the client. Do not decorate it. Its type flows to the client automatically.
- **Second parameter (index 1)**: If the route has file upload configuration (`file: 'single'` or `file: 'multiple'`), this parameter is reserved for the file/files (`Express.Multer.File` or `Express.Multer.File[]`).
- **Subsequent parameters**: Can use NestJS parameter decorators (`@Req()`, `@Res()`, `@Headers()`, etc.):

```typescript
import { Router, Route } from '@nestjs-rpc/server';
import { Req, Res, Headers, Body } from '@nestjs/common';
import type { Request, Response } from 'express';

@Router()
export class UserRouter {
  @Route()
  async getUserById(
    id: string, // ✅ First param = input (no decorator)
    @Req() req: Request, // ✅ Can use decorators
    @Res() res: Response, // ✅ Can use decorators
    @Headers('x-trace') trace?: string, // ✅ Can use decorators
  ) {
    // Access request/response
    const ip = req.ip;
    res.setHeader('X-Custom-Header', 'value');
    
    return this.userService.findById(id);
  }
}
```

## 🎨 Custom Parameter Decorators

Create custom decorators using `createRouterParamDecorator`:

```typescript
import { createRouterParamDecorator } from '@nestjs-rpc/server';
import { ExecutionContext } from '@nestjs/common';

const CurrentUser = createRouterParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // From your auth middleware
  }
);

@Router()
export class UserRouter {
  @Route()
  async getProfile(
    {}, // ✅ First param still reserved
    @CurrentUser() user: User, // ✅ Custom decorator
  ) {
    return user;
  }
}
```

## 🔄 Execution Flow

Here's the complete execution flow:

```
1. Client sends request
   ↓
2. NestJS routing matches to controller method
   ↓
3. Guards execute (if any)
   ↓
4. Interceptors execute (before)
   ↓
5. Pipes execute (transform/validate)
   ↓
6. Route method executes
   - First param = input from client
   - Other params = from decorators
   ↓
7. Interceptors execute (after)
   ↓
8. Response sent to client
```

## 📚 Further Reading

- [NestJS Controllers](https://docs.nestjs.com/controllers)
- [NestJS Providers](https://docs.nestjs.com/providers)
- [NestJS Guards](https://docs.nestjs.com/guards)
- [NestJS Interceptors](https://docs.nestjs.com/interceptors)
- [NestJS Pipes](https://docs.nestjs.com/pipes)

