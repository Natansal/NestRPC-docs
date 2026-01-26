---
title: Advanced Features
description: Advanced React Query features. Additional query keys, manual invalidation, custom query clients, and more.
---

# Advanced Features

This guide covers advanced features and patterns for using `@nestjs-rpc/query` in production applications.

## 🔑 Additional Query Keys

Extend query keys for more granular cache control. Useful when you need to differentiate queries with the same body but different contexts.

### Using Arrays

```typescript
const { data } = useRpcQuery(
  rpc.user.queries.getUserById,
  { id: "123" },
  {
    useAdditionalQueryKey: ["admin-view"], // Adds to query key
  },
);
```

### Using Functions

Functions allow you to use hooks inside, enabling dynamic query keys:

```typescript
const { data } = useRpcQuery(
  rpc.user.queries.getUserById,
  { id: "123" },
  {
    useAdditionalQueryKey: () => {
      const { userRole } = useAuth(); // Can use hooks!
      return [userRole];
    },
  },
);
```

### In Factory Defaults

Set additional keys in factory defaults:

```typescript
const useUserById = createRpcQuery(rpc.user.queries.getUserById, {
  useAdditionalQueryKey: ["default"],
});

// Instance-level keys are merged with factory defaults
const { data } = useUserById(
  { id: "123" },
  {
    useAdditionalQueryKey: ["instance"], // Final key: ['default', 'instance']
  },
);
```

## 🔄 Manual Cache Invalidation

Use `useInvalidateRpcQuery` for manual cache invalidation:

```typescript
import { useInvalidateRpcQuery } from '@nestjs-rpc/query';
import { rpc } from './rpc-client';

function UserActions() {
  const invalidate = useInvalidateRpcQuery();

  const handleRefresh = () => {
    invalidate(rpc.user.queries.listUsers);
  };

  const handleRefreshAll = () => {
    // Invalidate all user queries
    invalidate(rpc.user.queries.listUsers, {
      exact: false, // Invalidate all queries starting with this path
    });
  };

  return (
    <div>
      <button onClick={handleRefresh}>Refresh Users</button>
      <button onClick={handleRefreshAll}>Refresh All User Queries</button>
    </div>
  );
}
```

### With Filters

Apply filters for more precise invalidation:

```typescript
const invalidate = useInvalidateRpcQuery();

// Invalidate only active queries
invalidate(rpc.user.queries.listUsers, {
  active: true,
});

// Invalidate with predicate
invalidate(rpc.user.queries.getUserById, {
  predicate: (query) => {
    const [, body] = query.queryKey;
    return body.id === 'specific-id';
  },
});
```

## 📤 File Uploads

### Single File Upload

```typescript
const mutation = useRpcMutation(rpc.files.uploadFile, {
  onSuccess: () => console.log("Uploaded!"),
});

const handleUpload = (file: File) => {
  mutation.mutate({
    body: { description: "My file" },
    file: file,
  });
};
```

### Multiple File Upload

```typescript
const mutation = useRpcMutation(rpc.files.uploadFiles, {
  invalidate: [rpc.files.listFiles],
});

const handleUpload = (files: File[]) => {
  mutation.mutate({
    body: { category: "documents" },
    files: files,
  });
};
```

### With Static RPC Options

Set default RPC options for file uploads:

```typescript
const useUploadFile = createRpcMutation(rpc.files.uploadFile, {
  invalidate: [rpc.files.listFiles],
  rpcOptions: {
    requestOptions: { timeout: 30000 }, // 30 second timeout
  },
});

// Use with file
const uploadFile = useUploadFile();
uploadFile.mutate({
  body: { description: "My file" },
  file: fileInput.files[0],
});
```

### Dynamic Options Override

Override static options per call:

```typescript
const useUploadFile = createRpcMutation(rpc.files.uploadFile, {
  rpcOptions: {
    requestOptions: { timeout: 30000 },
  },
});

const uploadFile = useUploadFile();
uploadFile.mutate({
  body: { description: "My file" },
  file: fileInput.files[0],
  rpcOptions: {
    requestOptions: { timeout: 60000 }, // Overrides the 30000 from hook
  },
});
```

## 🎯 Custom Query Client

Pass a custom `QueryClient` instance for isolated query management:

```typescript
import { QueryClient } from '@tanstack/react-query';

const customQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
    },
  },
});

const { data } = useRpcQuery(
  rpc.user.queries.listUsers,
  undefined,
  {},
  customQueryClient, // Use specific client
);
```

## 🔄 Optimistic Updates

Implement optimistic updates for better UX:

```typescript
const useUpdateUser = createRpcMutation(rpc.user.mutations.updateUser, {
  invalidate: [rpc.user.queries.listUsers],
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: [rpc.user.queries.listUsers] });

    // Snapshot previous value
    const previousUsers = queryClient.getQueryData([rpc.user.queries.listUsers]);

    // Optimistically update
    queryClient.setQueryData([rpc.user.queries.listUsers], (old: any) => {
      return old?.map((user: any) =>
        user.id === newData.body.id ? { ...user, ...newData.body } : user
      );
    });

    return { previousUsers };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData([rpc.user.queries.listUsers], context?.previousUsers);
  },
});
```

## 🎨 Error Handling

Handle errors at multiple levels:

```typescript
// Global error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error) => {
        // Global error handler
        console.error('Query error:', error);
      },
    },
    mutations: {
      onError: (error) => {
        // Global mutation error handler
        console.error('Mutation error:', error);
      },
    },
  },
});

// Hook-level error handling
const mutation = useRpcMutation(rpc.user.mutations.createUser, {
  onError: (error) => {
    if (error.response?.status === 409) {
      toast.error('User already exists');
    } else {
      toast.error('Failed to create user');
    }
  },
});

// Component-level error handling
const { error } = useRpcQuery(rpc.user.queries.getUser, { id: userId });
if (error) {
  return <ErrorBoundary error={error} />;
}
```

## 🔐 Authentication Patterns

Handle authentication with RPC options:

```typescript
// Create mutation with auth headers
const useCreateUser = createRpcMutation(rpc.user.mutations.createUser, {
  invalidate: [rpc.user.queries.listUsers],
  rpcOptions: {
    requestOptions: {
      headers: {
        get Authorization() {
          return `Bearer ${getAuthToken()}`;
        },
      },
    },
  },
});

// Or update dynamically
const createUser = useCreateUser();
createUser.mutate({
  body: { name: 'John' },
  rpcOptions: {
    requestOptions: {
      headers: {
        Authorization: `Bearer ${newToken}`,
      },
    },
  },
});
```

## 📊 Query Key Structure

Query keys are automatically generated as:

```typescript
[...path, body, rpcOptions, ...additionalKeys];
```

This ensures proper cache differentiation based on all parameters.

### Example Query Keys

```typescript
// Simple query
useRpcQuery(rpc.user.queries.listUsers, undefined);
// Key: ['user', 'queries', 'listUsers', undefined, {}, []]

// With body
useRpcQuery(rpc.user.queries.getUser, { id: '123' });
// Key: ['user', 'queries', 'getUser', { id: '123' }, {}, []]

// With additional keys
useRpcQuery(rpc.user.queries.getUser, { id: '123' }, {
  useAdditionalQueryKey: ['admin'],
});
// Key: ['user', 'queries', 'getUser', { id: '123' }, {}, ['admin']]
```

## 🎯 Best Practices

1. **Use additional query keys sparingly** - Only when you need context-specific caching
2. **Manual invalidation** - Use when automatic invalidation isn't sufficient
3. **Optimistic updates** - Improve perceived performance for mutations
4. **Error boundaries** - Handle errors gracefully at multiple levels
5. **Custom query clients** - Use for isolated query management when needed

## 📚 Related

- [Query Hooks](/docs/query/queries) - Basic query usage
- [Mutation Hooks](/docs/query/mutations) - Basic mutation usage
- [React Query Docs](https://tanstack.com/query/latest) - Complete React Query documentation
