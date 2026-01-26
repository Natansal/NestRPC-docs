---
title: Best Practices
description: Recommended patterns for server and client usage. Organization, error handling, file uploads, and more.
---

# Best Practices

This guide covers recommended patterns and best practices for using NestRPC in your projects.

## 🖥️ Server Best Practices

### Export Manifest and Type

Always export both the manifest and its type:

```typescript
// nest-rpc.config.ts
import { defineManifest } from '@nestjs-rpc/server';
import { UserQueriesRouter } from './user/user.queries.router';
import { UserMutationsRouter } from './user/user.mutations.router';

export const manifest = defineManifest({
  user: {
    queries: UserQueriesRouter,
    mutations: UserMutationsRouter,
  },
});

// 🔁 Always export the type for client-side type safety
export type Manifest = typeof manifest;
```

### Register Routers in Module

**⚠️ CRITICAL:** Routers are NestJS controllers under the hood. You **MUST** add your router classes to the module's `controllers` array:

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { UserQueriesRouter } from './user/user.queries.router';
import { UserMutationsRouter } from './user/user.mutations.router';

@Module({
  controllers: [UserQueriesRouter, UserMutationsRouter], // ✅ REQUIRED
  providers: [],
})
export class AppModule {}
```

### Initialize Before App Creation

**⚠️ CRITICAL:** Call `nestRpcInit()` **BEFORE** `NestFactory.create()`:

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { nestRpcInit } from '@nestjs-rpc/server';
import { manifest } from './nest-rpc.config';

async function bootstrap() {
  // ✅ Must be called FIRST
  nestRpcInit(manifest, { apiPrefix: 'nestjs-rpc' });
  
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
```

### Understanding Routers as Controllers

**Routers are NestJS controllers under the hood.** This means:
- They accept all NestJS controller parameter decorators (`@Req()`, `@Res()`, `@Headers()`, `@Body()`, etc.)
- Routes can have guard and pipe decorators (`@UseGuards()`, `@UsePipes()`, `@UseInterceptors()`, etc.) just like native NestJS controllers
- They work with dependency injection, interceptors, and all NestJS features
- The first parameter is reserved for the incoming request body
- If the route has file upload configuration, the second parameter is reserved for the file/files

### Keep Routers Thin

Routers should be thin layers that delegate to services:

```typescript
@Router()
export class UserRouter {
  constructor(
    private readonly userService: UserService, // ✅ Inject services
    private readonly validationService: ValidationService,
  ) {}

  @Route()
  async createUser({ name, email }: { name: string; email: string }) {
    // ✅ Validate inputs
    await this.validationService.validateUser({ name, email });
    
    // ✅ Delegate to service
    return this.userService.create({ name, email });
  }
}
```

### Use Dependency Injection

Leverage NestJS dependency injection for services:

```typescript
@Router()
export class UserRouter {
  constructor(
    private readonly userService: UserService,
    private readonly db: DatabaseService,
    private readonly logger: Logger,
  ) {}

  @Route()
  async getUserById(id: string) {
    this.logger.log(`Fetching user ${id}`);
    return this.userService.findById(id);
  }
}
```

### Validate Inputs

Use class-validator or custom validation:

```typescript
import { IsString, IsEmail, MinLength } from 'class-validator';

class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;
}

@Router()
export class UserRouter {
  @Route()
  async createUser(input: CreateUserDto) {
    // Validation happens automatically if using ValidationPipe
    return this.userService.create(input);
  }
}
```

### Handle Errors Properly

Throw NestJS exceptions for proper error handling:

```typescript
import { NotFoundException, BadRequestException } from '@nestjs/common';

@Router()
export class UserRouter {
  @Route()
  async getUserById(id: string) {
    if (!id) {
      throw new BadRequestException('ID is required');
    }
    
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }
}
```

### File Upload Best Practices

```typescript
@Router()
export class FilesRouter {
  @Route({ file: 'single' })
  async uploadFile(
    { description }: { description?: string },
    file?: Express.Multer.File
  ) {
    // ✅ Always check for file
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // ✅ Validate file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    // ✅ Validate file type
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }

    // ✅ Process file
    return { success: true, filename: file.originalname };
  }
}
```

## ⚛️ React Query Best Practices

### Use Factory Pattern

Create reusable hooks with default options:

```typescript
// ✅ Good: Create reusable hooks
const useUserList = createRpcQuery(rpc.user.queries.listUsers, {
  staleTime: 30000,
  refetchOnWindowFocus: false,
});

const useCreateUser = createRpcMutation(rpc.user.mutations.createUser, {
  invalidate: [rpc.user.queries.listUsers],
});

// ❌ Avoid: Creating hooks inline everywhere
function Component() {
  const { data } = useRpcQuery(rpc.user.queries.listUsers, undefined, {
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}
```

### Auto-Invalidate Related Queries

Always invalidate related queries after mutations:

```typescript
const useCreateUser = createRpcMutation(rpc.user.mutations.createUser, {
  invalidate: [
    rpc.user.queries.listUsers, // ✅ Invalidate list
    rpc.user.queries.getUserById, // ✅ Invalidate detail queries
  ],
});
```

### Set Appropriate Stale Times

Balance freshness with performance:

```typescript
// ✅ Good: Set appropriate stale times
const useUserList = createRpcQuery(rpc.user.queries.listUsers, {
  staleTime: 30000, // 30 seconds - data changes infrequently
});

const useNotifications = createRpcQuery(rpc.notifications.list, {
  staleTime: 5000, // 5 seconds - data changes frequently
});
```

### Use Placeholder Data

Provide default values for better UX:

```typescript
const useUserList = createRpcQuery(rpc.user.queries.listUsers, {
  placeholderData: [], // ✅ Guaranteed non-undefined
});

// In component
const { data: users = [] } = useUserList(undefined);
// No need to check for undefined!
```

### Handle Errors Gracefully

Use error callbacks and error boundaries:

```typescript
const useCreateUser = createRpcMutation(rpc.user.mutations.createUser, {
  invalidate: [rpc.user.queries.listUsers],
  onError: (error) => {
    if (error.response?.status === 409) {
      toast.error('User already exists');
    } else {
      toast.error('Failed to create user');
    }
  },
});
```

## 💻 Client Best Practices

### Import Type Only (Not the Object)

**⚠️ CRITICAL:** Always use `import type` when importing the `Manifest` type from the server. Do **NOT** import the manifest object itself, as this will cause the frontend to try to evaluate backend code and result in errors.

```typescript
// ✅ Correct: Import type only
import type { Manifest } from '../server/nest-rpc.config';

// ❌ Wrong: Importing the object will cause errors
import { manifest } from '../server/nest-rpc.config'; // DON'T DO THIS
```

### Create Single Client Instance

Create one client instance and export it:

```typescript
// rpc-client.ts
import { RpcClient } from '@nestjs-rpc/client';
import type { Manifest } from '../server/nest-rpc.config'; // ✅ Use 'import type'

export const rpcClient = new RpcClient<Manifest>({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  apiPrefix: 'nestjs-rpc',
});

export const rpc = rpcClient.routers();
```

### Use Router Constants

Create stable router constants for better organization:

```typescript
export const rpc = rpcClient.routers();

// ✅ Recommended: Create router constants
export const userRepo = rpc.user;
export const filesRepo = rpc.files;

// Usage
const { data: user } = await userRepo.queries.getUser({ id: '1' });
const { data: files } = await filesRepo.listFiles();
```

### Environment-Based Configuration

Use environment variables for different environments:

```typescript
export const rpcClient = new RpcClient<Manifest>({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  apiPrefix: 'nestjs-rpc',
  requestOptions: {
    headers: {
      'X-Client-Version': import.meta.env.VITE_APP_VERSION,
    },
  },
});
```

### Handle Errors Gracefully

Use try/catch or error boundaries:

```typescript
async function loadUser(id: string) {
  try {
    const { data: user } = await userRepo.queries.getUser({ id });
    return { success: true, user };
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 404) {
        return { success: false, error: 'User not found' };
      }
      return { success: false, error: error.response?.data?.message || 'Unknown error' };
    }
    return { success: false, error: 'Network error' };
  }
}
```

### File Upload Best Practices

```typescript
// ✅ Validate files client-side before uploading
function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 5MB limit' };
  }

  const allowedTypes = ['image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }

  return { valid: true };
}

// ✅ Upload with validation
async function uploadFileSafely(file: File) {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  try {
    const { data } = await filesRepo.uploadFile(
      { description: 'User avatar' },
      { file }
    );
    return { success: true, data };
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}
```

### Use Per-Call Overrides Sparingly

Only use per-call overrides when necessary:

```typescript
// ✅ Good: Use for special cases
await userRepo.queries.getUser({ id: '1' }, {
  requestOptions: {
    headers: {
      'X-Trace': generateTraceId(),
    },
  },
});

// ❌ Avoid: Don't override for every call
// Instead, set default headers in client config
```

### Type Your Responses

Use destructuring for better types:

```typescript
// ✅ Good: Destructure data
const { data: user } = await userRepo.queries.getUser({ id: '1' });
// user is properly typed

// ❌ Avoid: Access response directly
const response = await userRepo.queries.getUser({ id: '1' });
const user = response.data; // Less clear
```

## 📁 Project Structure

Recommended project structure:

```
server/
  src/
    main.ts                    # nestRpcInit() here
    app.module.ts              # Register routers
    nest-rpc.config.ts         # manifest + Manifest type
    routers/
      user/
        user.queries.router.ts
        user.mutations.router.ts
      files/
        files.router.ts
    services/
      user.service.ts
      files.service.ts

client/
  src/
    rpc-client.ts              # RpcClient + routers() + router constants
    components/
      UserList.tsx
      FileUpload.tsx
```

## 🎯 Organization Patterns

### Nested Routers

Organize with nested routers for better structure:

```typescript
export const manifest = defineManifest({
  user: {
    queries: UserQueriesRouter,
    mutations: UserMutationsRouter,
  },
  admin: {
    users: AdminUsersRouter,
    settings: AdminSettingsRouter,
  },
  files: FilesRouter,
});
```

### Router Naming

Use descriptive names that match your domain:

```typescript
// ✅ Good: Clear and descriptive
UserQueriesRouter
UserMutationsRouter
FileUploadRouter

// ❌ Avoid: Generic names
Router1
MyRouter
DataRouter
```

### Method Naming

Use clear, action-oriented method names:

```typescript
// ✅ Good: Clear actions
getUserById
createUser
updateUser
deleteUser
uploadFile

// ❌ Avoid: Unclear names
get
create
update
delete
upload
```

## 🔒 Security Best Practices

### Validate All Inputs

Always validate inputs on the server:

```typescript
@Route()
async createUser(input: { name: string; email: string }) {
  // ✅ Validate inputs
  if (!input.name || input.name.length < 2) {
    throw new BadRequestException('Name must be at least 2 characters');
  }
  
  if (!isValidEmail(input.email)) {
    throw new BadRequestException('Invalid email format');
  }
  
  return this.userService.create(input);
}
```

### Sanitize File Names

Sanitize file names to prevent path traversal:

```typescript
import * as path from 'path';

@Route({ file: 'single' })
async uploadFile({}, file?: Express.Multer.File) {
  if (!file) throw new BadRequestException('No file');
  
  // ✅ Sanitize filename
  const sanitized = path.basename(file.originalname);
  
  // Process file...
}
```

### Use Authentication

Protect routes with authentication:

```typescript
@Router()
@UseGuards(AuthGuard) // ✅ Protect entire router
export class UserRouter {
  @Route()
  async getProfile(
    {},
    @CurrentUser() user: User, // ✅ Get authenticated user
  ) {
    return user;
  }
}
```

## 📚 Further Reading

- [Axios Documentation](https://axios-http.com)
- [NestJS Controllers](https://docs.nestjs.com/controllers)
- [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
- [NestJS Guards](https://docs.nestjs.com/guards)


