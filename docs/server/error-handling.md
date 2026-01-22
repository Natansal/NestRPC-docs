---
title: Server Error Handling
description: How errors are surfaced to the client. Using NestJS exceptions, custom exception filters, and proper error responses.
---

# Server Error Handling

Throw inside a route method to trigger Nest's standard exception handling. The client receives the HTTP error mapped by Nest (e.g., 400/401/500) via Axios.

## 🎯 Basic Error Handling

Use NestJS built-in exceptions:

```typescript
import { Router, Route } from '@nestjs-rpc/server';
import { 
  BadRequestException, 
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';

@Router()
export class UserMutationsRouter {
  @Route()
  updateUser({ id, name }: { id: string; name: string }) {
    // ✅ Validate input
    if (!id) {
      throw new BadRequestException('id is required');
    }
    
    // ✅ Check existence
    const user = findUser(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    // ✅ Business logic validation
    if (name.length < 2) {
      throw new BadRequestException('Name must be at least 2 characters');
    }
    
    return saveUser({ ...user, name });
  }
}
```

## 📋 Common Exceptions

NestJS provides many built-in exceptions:

| Exception | HTTP Status | Use Case |
|-----------|-------------|----------|
| `BadRequestException` | 400 | Invalid input, validation errors |
| `UnauthorizedException` | 401 | Authentication required |
| `ForbiddenException` | 403 | Insufficient permissions |
| `NotFoundException` | 404 | Resource not found |
| `ConflictException` | 409 | Resource conflict (e.g., duplicate) |
| `InternalServerErrorException` | 500 | Server errors |
| `HttpException` | Custom | Custom status codes |

## 🎨 Custom Error Messages

Provide detailed error messages:

```typescript
@Route()
async createUser({ name, email }: { name: string; email: string }) {
  // ✅ Detailed validation
  if (!name || name.trim().length === 0) {
    throw new BadRequestException('Name is required and cannot be empty');
  }
  
  if (!isValidEmail(email)) {
    throw new BadRequestException(`Invalid email format: ${email}`);
  }
  
  // ✅ Check for duplicates
  const existing = await this.userService.findByEmail(email);
  if (existing) {
    throw new ConflictException(`User with email ${email} already exists`);
  }
  
  return this.userService.create({ name, email });
}
```

## 🔒 Authentication & Authorization Errors

```typescript
@Router()
export class UserRouter {
  @Route()
  async getProfile(
    {},
    @CurrentUser() user: User | null,
  ) {
    // ✅ Check authentication
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    
    return user;
  }
  
  @Route()
  async deleteUser(
    { id }: { id: string },
    @CurrentUser() user: User,
  ) {
    // ✅ Check authorization
    if (user.id !== id && !user.isAdmin) {
      throw new ForbiddenException('You do not have permission to delete this user');
    }
    
    return this.userService.delete(id);
  }
}
```

## 🎯 Custom Exception Filters

Create custom exception filters for consistent error responses:

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message || message;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

Apply globally:

```typescript
// main.ts
app.useGlobalFilters(new AllExceptionsFilter());
```

## 📤 File Upload Errors

Handle file upload errors specifically:

```typescript
@Route({ file: 'single' })
async uploadFile(
  { description }: { description?: string },
  file?: Express.Multer.File
) {
  // ✅ Check file presence
  if (!file) {
    throw new BadRequestException('No file provided');
  }

  // ✅ Validate file size
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new BadRequestException(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
  }

  // ✅ Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new BadRequestException(
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    );
  }

  // Process file...
  return { success: true, filename: file.originalname };
}
```

## 🔄 Error Propagation

**Note:** Each call executes independently; one failing call does not affect others. Errors are automatically converted to HTTP responses:

```typescript
// Server throws
throw new NotFoundException('User not found');

// Client receives
// Status: 404
// Body: { statusCode: 404, message: 'User not found' }
```

## 📚 Further Reading

- [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
- [NestJS Guards](https://docs.nestjs.com/guards)
- [Client Error Handling](/docs/client/error-handling) - How errors appear on the client

