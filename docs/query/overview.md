---
title: React Query Integration Overview
description: Type-safe React Query hooks for NestRPC. Automatic caching, background refetching, and cache invalidation.
---

# React Query Integration Overview

The `@nestjs-rpc/query` package provides type-safe React Query hooks that seamlessly integrate your RPC endpoints with TanStack Query. Get powerful caching, synchronization, and state management with zero boilerplate.

## 🎯 Why @nestjs-rpc/query?

**Stop managing API state manually.** This package gives you:

- 🔒 **End-to-End Type Safety** - Full TypeScript inference from RPC methods to React hooks
- ⚡ **Automatic Caching** - Built on TanStack Query with intelligent cache management
- 🔄 **Auto Invalidation** - Automatically invalidate related queries after mutations
- 🎯 **Zero Boilerplate** - No manual query key management or cache invalidation logic
- 🧩 **Factory Pattern** - Create reusable hooks with default options
- 📤 **File Upload Support** - Works seamlessly with RPC file uploads

## 📦 Installation

```bash
npm install @nestjs-rpc/query @nestjs-rpc/client @tanstack/react-query react
# or
pnpm add @nestjs-rpc/query @nestjs-rpc/client @tanstack/react-query react
# or
yarn add @nestjs-rpc/query @nestjs-rpc/client @tanstack/react-query react
```

**Peer Dependencies:**
- `@nestjs-rpc/client` - The RPC client library
- `react` - React 18.0.0 or higher
- `@tanstack/react-query` - React Query 5.0.0 or higher

## 🚀 Quick Start

### 1. Setup QueryClientProvider

Wrap your app with `QueryClientProvider`:

```typescript
// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RpcClient } from '@nestjs-rpc/client';
import type { Manifest } from './path-to-your-manifest';

// Create your RPC client
const rpcClient = new RpcClient<Manifest>({
  baseUrl: 'http://localhost:3000',
});
export const rpc = rpcClient.routers();

// Create React Query client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app components */}
    </QueryClientProvider>
  );
}
```

### 2. Use RPC Queries

```typescript
import { useRpcQuery } from '@nestjs-rpc/query';
import { rpc } from './rpc-client';

function UserList() {
  const { data, isLoading, error } = useRpcQuery(
    rpc.user.queries.listUsers,
    undefined, // body (optional for methods with no body)
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 3. Use RPC Mutations

```typescript
import { useRpcMutation } from '@nestjs-rpc/query';
import { rpc } from './rpc-client';

function CreateUser() {
  const mutation = useRpcMutation(rpc.user.mutations.createUser, {
    invalidate: [rpc.user.queries.listUsers], // Auto-invalidate after success
    onSuccess: (data) => {
      console.log('User created:', data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      body: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

**That's it!** You get:
- ✅ Full TypeScript autocomplete
- ✅ Automatic query key generation
- ✅ Intelligent caching
- ✅ Automatic cache invalidation

## 🎨 Core Concepts

### Direct Hooks vs Factory Pattern

**Direct Hooks** (`useRpcQuery`, `useRpcMutation`):
- Use for one-off queries/mutations
- No default options
- Simple and straightforward

**Factory Pattern** (`createRpcQuery`, `createRpcMutation`):
- Create reusable hooks with default options
- Perfect for domain-specific hooks
- Override options per usage

```typescript
// Direct hook - one-off usage
const { data } = useRpcQuery(rpc.user.getUserById, { id: '123' });

// Factory pattern - reusable hook
const useUserById = createRpcQuery(rpc.user.getUserById, {
  staleTime: 60000,
});

// Use the reusable hook
const { data } = useUserById({ id: '123' });
```

### Automatic Cache Invalidation

Mutations can automatically invalidate related queries:

```typescript
const useCreateUser = createRpcMutation(rpc.user.mutations.createUser, {
  invalidate: [
    rpc.user.queries.listUsers, // Invalidate list
    rpc.user.queries.getUserById, // Invalidate detail queries
  ],
});

// After successful mutation, all queries for these routes are invalidated
```

### Type Safety

The hooks automatically infer types from your RPC manifest:

```typescript
// Server method signature:
@Route()
async getUserById(id: string): Promise<User> {
  return { id, name: 'John', email: 'john@example.com' };
}

// Client automatically gets:
const { data } = useRpcQuery(rpc.user.getUserById, { id: '123' });
//    ^? { data: User }
//    ^? body parameter is typed as { id: string }
//    ^? Full autocomplete for User properties
```

**If your server types change, your client code will show TypeScript errors immediately!**

## 📚 What's Next?

- Learn about [Query Hooks](/docs/query/queries) in detail
- Explore [Mutation Hooks](/docs/query/mutations) with automatic invalidation
- Discover [Advanced Features](/docs/query/advanced) like additional query keys and file uploads
- See the [complete example](https://github.com/Natansal/NestRPC/tree/main/example) with React Query integration

## 🆚 Comparison: Raw RPC vs React Query

| Feature | Raw RPC | React Query |
|---------|---------|-------------|
| Type Safety | ✅ Full | ✅ Full |
| Caching | ❌ Manual | ✅ Automatic |
| Background Refetching | ❌ No | ✅ Yes |
| Cache Invalidation | ❌ Manual | ✅ Automatic |
| Loading States | ❌ Manual | ✅ Built-in |
| Error States | ❌ Manual | ✅ Built-in |
| Optimistic Updates | ❌ Manual | ✅ Supported |

For React applications, React Query integration is highly recommended!
