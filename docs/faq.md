---
title: FAQ
description: Frequently asked questions about NestRPC. Type inference, file uploads, custom decorators, and more.
---

# Frequently Asked Questions

## 🔒 Type Safety

### How are input types inferred on the client?

The first parameter of each `@Route()` method is treated as the input type. Export `type Manifest = typeof manifest` on the server and use `new RpcClient<Manifest>()` on the client:

```typescript
// Server
@Route()
async getUserById(id: string) {
  return { id, name: 'John' };
}

// Client - id is automatically typed as string
const { data } = await rpc.user.getUserById('123');
```

### Can I decorate the first parameter?

**No.** The first parameter (index 0) is reserved for the incoming request body and should be left undecorated. The first parameter's type flows to the client automatically. If the route has file upload configuration, the second parameter is reserved for the file/files:

```typescript
// ✅ Correct
@Route()
async getUserById(id: string) {
  return getUser(id);
}

// ❌ Incorrect - don't decorate first parameter
@Route()
async getUserById(@Body() id: string) {
  return getUser(id);
}

// ✅ Correct - decorate subsequent parameters
@Route()
async getUserById(
  id: string, // ✅ First param = request body (no decorator)
  @Req() req: Request, // ✅ Can decorate subsequent params
) {
  return getUser(id);
}

// ✅ With file upload - first param = body, second param = file
@Route({ file: 'single' })
async uploadFile(
  { description }: { description?: string }, // ✅ First param = request body
  file?: Express.Multer.File, // ✅ Second param = file (when file config is set)
  @Req() req: Request, // ✅ Subsequent params can use decorators
) {
  return { filename: file?.originalname };
}
```

### How do I access the Nest request/response?

Use standard Nest request/response access patterns inside your router methods or global interceptors/guards:

```typescript
import { Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

@Router()
export class UserRouter {
  @Route()
  async getUserById(
    id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Access request properties
    const ip = req.ip;
    const headers = req.headers;
    
    // Access response
    res.setHeader('X-Custom-Header', 'value');
    
    return getUser(id);
  }
}
```

## 📤 File Uploads

### How do file uploads work?

NestRPC has built-in file upload support. Use the `file` option in `@Route()`:

```typescript
// Single file
@Route({ file: 'single' })
async uploadFile(
  { description }: { description?: string },
  file?: Express.Multer.File
) {
  // Handle file
}

// Multiple files
@Route({ file: 'multiple' })
async uploadFiles(
  { category }: { category?: string },
  files?: Express.Multer.File[]
) {
  // Handle files
}
```

On the client, pass files in the second parameter:

```typescript
// Single file
await rpc.files.uploadFile(
  { description: 'Avatar' },
  { file: myFile }
);

// Multiple files
await rpc.files.uploadFiles(
  { category: 'documents' },
  { files: [file1, file2] }
);
```

See [Server File Uploads](/docs/server/file-uploads) and [Client File Uploads](/docs/client/file-uploads) for details.

### Can I set file size limits?

Yes, use the advanced file configuration:

```typescript
@Route({
  file: {
    mode: 'single',
    options: {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    },
  },
})
async uploadFile({}, file?: Express.Multer.File) {
  // Handle file
}
```

### Can I filter file types?

Yes, use `fileFilter` in the options:

```typescript
@Route({
  file: {
    mode: 'single',
    options: {
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only images are allowed'), false);
        }
      },
    },
  },
})
async uploadFile({}, file?: Express.Multer.File) {
  // Handle file
}
```

## 🎨 Routers as Controllers

### Are routers NestJS controllers?

**Yes!** Routers are NestJS controllers under the hood. This means:
- They accept all NestJS controller parameter decorators (`@Req()`, `@Res()`, `@Headers()`, `@Body()`, etc.)
- Routes can have guard and pipe decorators (`@UseGuards()`, `@UsePipes()`, `@UseInterceptors()`, etc.) just like native NestJS controllers
- They work with dependency injection, interceptors, and all NestJS features
- **They MUST be registered in the module's `controllers` array**

### Do I need to register routers in the module?

**Yes, absolutely!** Routers are controllers, so they must be in the `controllers` array:

```typescript
@Module({
  controllers: [UserRouter], // ✅ REQUIRED
})
export class AppModule {}
```

## 🎨 Custom Decorators

### Can I create custom parameter decorators?

Yes, use `createRouterParamDecorator`:

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
    {}, // ✅ First param still reserved for input
    @CurrentUser() user: User, // ✅ Custom decorator
  ) {
    return user;
  }
}
```

## 💻 Client Configuration

### Should I import the manifest object or just the type?

**Always import the type only!** Use `import type { Manifest }` from the server. Do **NOT** import the manifest object itself, as this will cause the frontend to try to evaluate backend code and result in errors:

```typescript
// ✅ Correct: Import type only
import type { Manifest } from '../server/nest-rpc.config';

// ❌ Wrong: Importing the object will cause errors
import { manifest } from '../server/nest-rpc.config'; // DON'T DO THIS
```

## ⚙️ Configuration

### How do I change the API prefix?

Set it in `nestRpcInit()`:

```typescript
nestRpcInit(manifest, { apiPrefix: 'api/v1' });
```

And match it on the client:

```typescript
const client = new RpcClient<Manifest>({
  baseUrl: 'http://localhost:3000',
  apiPrefix: 'api/v1',
});
```

### Can I use different base URLs for different environments?

Yes, use environment variables:

```typescript
const client = new RpcClient<Manifest>({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  apiPrefix: 'nestjs-rpc',
});
```

### Can I update the client configuration at runtime?

Yes, use `$setConfig()` or `$setConfigProperty()`:

```typescript
// Update single property
client.$setConfigProperty('baseUrl', 'https://api.production.com');

// Update entire config
client.$setConfig({
  baseUrl: 'https://api.production.com',
  requestOptions: {
    headers: {
      Authorization: `Bearer ${newToken}`,
    },
  },
});
```

## 🔧 NestJS Integration

### Do routers work with NestJS dependency injection?

Yes! Routers are NestJS controllers, so you can use dependency injection:

```typescript
@Router()
export class UserRouter {
  constructor(
    private readonly userService: UserService,
    private readonly db: DatabaseService,
  ) {}

  @Route()
  async getUserById(id: string) {
    return this.userService.findById(id);
  }
}
```

### Can I use guards, interceptors, and pipes?

Yes! Routers are standard NestJS controllers:

```typescript
@Router()
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
export class UserRouter {
  @Route()
  @UsePipes(ValidationPipe)
  async createUser(input: CreateUserDto) {
    return this.userService.create(input);
  }
}
```

### Why must `nestRpcInit()` be called before `NestFactory.create()`?

`nestRpcInit()` applies Nest decorators (`@Controller()`, `@Post()`, etc.) to your router classes. NestJS needs these decorators to be present when it discovers controllers during app creation. Calling it after `NestFactory.create()` means the decorators won't be applied in time.

## 🐛 Troubleshooting

### Routes are not being registered

1. **Check initialization order**: `nestRpcInit()` must be called **before** `NestFactory.create()`
2. **Check module registration**: Router classes must be in the module's `controllers` array
3. **Check decorators**: Classes must have `@Router()` and methods must have `@Route()`

### Type inference not working on client

1. **Check manifest export**: Make sure you export `export type Manifest = typeof manifest`
2. **Check import**: Make sure the client imports the correct `Manifest` type
3. **Check TypeScript**: Ensure TypeScript can resolve the type (may need path mapping)

### File uploads not working

1. **Check decorator**: Make sure `@Route({ file: 'single' })` or `@Route({ file: 'multiple' })` is used
2. **Check parameter order**: First param = input, second param = file/files
3. **Check client call**: Make sure you pass `{ file }` or `{ files }` as second parameter

### CORS errors

Enable CORS on your NestJS app:

```typescript
app.enableCors({
  origin: 'http://localhost:5173',
  credentials: true,
});
```

## 📚 Further Reading

- [Quick Start](/docs/quick-start) - Get started quickly
- [Server Overview](/docs/server/overview) - Server concepts
- [Client Overview](/docs/client/overview) - Client concepts
- [Best Practices](/docs/best-practices) - Recommended patterns


