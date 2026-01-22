---
title: Client Overview
description: Create a typed RPC client and call routes like local functions. Full type safety, file uploads, and framework-agnostic.
---

# Client Overview

The `@nestjs-rpc/client` package provides a type-safe client that mirrors your server router map using TypeScript inference. Call your server methods like local functions with full autocomplete and type checking.

## 🎯 Core Concepts

### Type Safety

**⚠️ IMPORTANT:** Always use `import type` when importing the `Manifest` type from the server. Do **NOT** import the manifest object itself, as this will cause the frontend to try to evaluate backend code and result in errors.

The client automatically infers types from your server's manifest:

```typescript
import { RpcClient } from '@nestjs-rpc/client';
import type { Manifest } from '../server/nest-rpc.config'; // ✅ Use 'import type'

const client = new RpcClient<Manifest>({
  baseUrl: 'http://localhost:3000',
  apiPrefix: 'nestjs-rpc',
});

const rpc = client.routers();
```

### Response Format

Responses are Axios `AxiosResponse`, so destructure `data` from the result:

```typescript
// Server method signature:
@Route()
async getUserById(id: string): Promise<User> {
  return { id, name: 'John', email: 'john@example.com' };
}

// Client automatically gets:
const { data: user } = await rpc.user.getUserById('123');
//    ^? { id: string; name: string; email: string }
//    ^? id parameter is typed as string
//    ^? Full autocomplete for User properties
```

**If your server types change, your client code will show TypeScript errors immediately!**

## 🚀 Basic Usage

### Create Client

**⚠️ IMPORTANT:** Always use `import type` when importing the `Manifest` type. Do **NOT** import the manifest object:

```typescript
import { RpcClient } from '@nestjs-rpc/client';
import type { Manifest } from '../server/nest-rpc.config'; // ✅ Correct: 'import type'
// ❌ Wrong: import { manifest } from '../server/nest-rpc.config'; // DON'T DO THIS

const client = new RpcClient<Manifest>({
  baseUrl: 'http://localhost:3000',
  apiPrefix: 'nestjs-rpc', // Optional, defaults to 'nestjs-rpc'
});
```

### Get Routers

```typescript
// Get all routers
const rpc = client.routers();

// Use with full type safety
const { data: user } = await rpc.user.queries.getUser({ id: '1' });
const { data: all } = await rpc.user.queries.listUsers();
```

### Router Constants (Recommended)

Create stable router constants for better organization:

```typescript
export const rpc = client.routers();
export const userRepo = rpc.user;
export const filesRepo = rpc.files;

// Usage
const { data: user } = await userRepo.queries.getUser({ id: '1' });
const { data: files } = await filesRepo.listFiles();
```

## 📤 File Uploads

NestRPC client has built-in file upload support. See the [File Uploads](/docs/client/file-uploads) guide for details:

```typescript
// Single file upload
const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');

const { data } = await rpc.files.uploadFile(
  { description: 'My avatar' },
  { file: fileInput.files[0] }
);

// Multiple file upload
const { data: result } = await rpc.files.uploadFiles(
  { category: 'documents' },
  { files: Array.from(fileInput.files || []) }
);
```

## 🎨 Framework Examples

### React

```typescript
import { useState, useEffect } from 'react';
import { rpc } from './rpc-client';

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    rpc.user.queries.listUsers().then(({ data }) => setUsers(data));
  }, []);

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Vue 3

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { rpc } from './rpc-client';

const users = ref([]);

onMounted(async () => {
  const { data } = await rpc.user.queries.listUsers();
  users.value = data;
});
</script>

<template>
  <ul>
    <li v-for="user in users" :key="user.id">{{ user.name }}</li>
  </ul>
</template>
```

### Angular

```typescript
import { Component, OnInit } from '@angular/core';
import { rpc } from './rpc-client';

@Component({
  selector: 'app-user-list',
  template: `
    <ul>
      <li *ngFor="let user of users">{{ user.name }}</li>
    </ul>
  `,
})
export class UserListComponent implements OnInit {
  users: any[] = [];

  async ngOnInit() {
    const { data } = await rpc.user.queries.listUsers();
    this.users = data;
  }
}
```

### Vanilla TypeScript

```typescript
import { rpc } from './rpc-client';

async function loadUsers() {
  const { data: users } = await rpc.user.queries.listUsers();
  console.log('Users:', users);
}

loadUsers();
```

## 🔧 Error Handling

Errors surface through the HTTP client (Axios) as usual. Handle with try/catch or interceptors:

```typescript
try {
  const { data: user } = await rpc.user.queries.getUser({ id: 'missing' });
} catch (error) {
  if (error instanceof AxiosError) {
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
  }
}
```

See [Error Handling](/docs/client/error-handling) for more details.

## ⚙️ Configuration

The client supports extensive configuration options. See [Configuration](/docs/client/configuration) for details:

```typescript
const client = new RpcClient<Manifest>({
  baseUrl: 'http://localhost:3000',
  apiPrefix: 'nestjs-rpc',
  requestOptions: {
    headers: {
      Authorization: 'Bearer token',
    },
  },
  axiosInstance: customAxiosInstance, // Optional custom Axios instance
});
```

## 🎯 Best Practices

1. **Import type only** - Always use `import type { Manifest }` from the server. Never import the manifest object itself, as it will cause the frontend to try to evaluate backend code.
2. **Export manifest type** - Make sure your server exports `export type Manifest = typeof manifest`
3. **Centralize client** - Create one client instance and export it
4. **Use environment variables** - Use different base URLs for dev/prod
5. **Handle errors** - Wrap calls in try-catch or use error boundaries
6. **Type your responses** - Use `const { data }` destructuring for better types

## 📚 Next Steps

- Learn about [file uploads](/docs/client/file-uploads) in detail
- Explore [configuration options](/docs/client/configuration)
- Understand [error handling](/docs/client/error-handling) patterns
- Check out [best practices](/docs/best-practices) for organizing your code

