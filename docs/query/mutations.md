---
title: Mutation Hooks
description: Type-safe mutation hooks with automatic cache invalidation. Direct hooks and factory pattern for reusable mutations.
---

# Mutation Hooks

Mutation hooks are used for creating, updating, and deleting data. They support automatic cache invalidation, file uploads, and full type safety.

## 🎯 useRpcMutation

Direct hook for one-off RPC mutations. Supports automatic cache invalidation.

### Basic Usage

```typescript
import { useRpcMutation } from '@nestjs-rpc/query';
import { rpc } from './rpc-client';

function CreateUser() {
  const mutation = useRpcMutation(rpc.user.mutations.createUser, {
    invalidate: [rpc.user.queries.listUsers], // Auto-invalidate after success
    onSuccess: (data) => {
      console.log('User created:', data);
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
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

### Automatic Cache Invalidation

Mutations can automatically invalidate related queries:

```typescript
const mutation = useRpcMutation(rpc.user.mutations.createUser, {
  invalidate: [
    rpc.user.queries.listUsers, // Invalidate list
    rpc.user.queries.getUserById, // Invalidate detail queries
  ],
});

// After successful mutation, all queries for these routes are invalidated
```

### File Uploads

Upload files directly in mutation variables:

```typescript
// Single file upload
const mutation = useRpcMutation(rpc.files.uploadFile, {
  onSuccess: () => console.log("Uploaded!"),
});

mutation.mutate({
  body: { description: "My file" },
  file: fileInput.files[0],
});

// Multiple files
mutation.mutate({
  body: { category: "documents" },
  files: Array.from(fileInput.files),
});
```

### With RPC Options

Pass custom RPC options per mutation call:

```typescript
mutation.mutate({
  body: { name: 'John' },
  rpcOptions: {
    requestOptions: {
      headers: { 'X-Custom-Header': 'value' },
    },
  },
});
```

## 🏭 createRpcMutation

Factory function to create reusable mutation hooks with default options.

### Basic Usage

```typescript
import { createRpcMutation } from '@nestjs-rpc/query';
import { rpc } from './rpc-client';

// Create reusable mutation hook
const useCreateUser = createRpcMutation(rpc.user.mutations.createUser, {
  invalidate: [rpc.user.queries.listUsers],
  onSuccess: () => {
    console.log('User created successfully');
  },
});

// Use in components
function CreateUserForm() {
  const createUser = useCreateUser({
    onSuccess: (data) => {
      // Additional per-component logic
      navigate(`/users/${data.id}`);
    },
  });

  return (
    <button onClick={() => createUser.mutate({ body: { name: 'John', email: 'john@example.com' } })}>
      Create
    </button>
  );
}
```

### Static RPC Options

Set RPC options that apply to all mutations from the hook:

```typescript
const useUploadFile = createRpcMutation(rpc.files.uploadFile, {
  invalidate: [rpc.files.listFiles],
  rpcOptions: {
    requestOptions: { timeout: 30000 },
  },
});

// Dynamic options override static ones
const uploadFile = useUploadFile();
uploadFile.mutate({
  body: { description: "My file" },
  file: fileInput.files[0],
  rpcOptions: {
    requestOptions: { timeout: 60000 }, // Overrides the 30000 from hook
  },
});
```

### Multiple Invalidation Routes

Invalidate multiple query routes:

```typescript
const useCreateUser = createRpcMutation(rpc.user.mutations.createUser, {
  invalidate: [
    rpc.user.queries.listUsers,
    rpc.user.queries.getUserById,
    rpc.admin.queries.getAllUsers,
  ],
});
```

## 📋 Complete Example

```typescript
import { createRpcMutation } from '@nestjs-rpc/query';
import { rpc } from './rpc-client';

// Create reusable mutation hooks
const useCreateUser = createRpcMutation(rpc.user.mutations.createUser, {
  invalidate: [rpc.user.queries.listUsers],
});

const useUpdateUser = createRpcMutation(rpc.user.mutations.updateUser, {
  invalidate: [rpc.user.queries.listUsers],
});

const useDeleteUser = createRpcMutation(rpc.user.mutations.deleteUser, {
  invalidate: [rpc.user.queries.listUsers],
});

const useUploadFile = createRpcMutation(rpc.files.uploadFile, {
  invalidate: [rpc.files.listFiles],
});

function UserManagement() {
  const createUser = useCreateUser({
    onSuccess: () => {
      toast.success('User created!');
    },
  });

  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const uploadFile = useUploadFile();

  const handleCreate = () => {
    createUser.mutate({
      body: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    });
  };

  const handleUpdate = (id: string, name: string) => {
    updateUser.mutate({
      body: { id, name },
    });
  };

  const handleDelete = (id: string) => {
    deleteUser.mutate({ body: { id } });
  };

  const handleUpload = (file: File) => {
    uploadFile.mutate({
      body: { description: 'User avatar' },
      file,
    });
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={createUser.isPending}>
        {createUser.isPending ? 'Creating...' : 'Create User'}
      </button>
      {/* ... */}
    </div>
  );
}
```

## 🎯 Mutation Variables

Mutations accept `RpcMutationBody<TBody>` which includes:

- `body: TBody` - The request body (required if TBody is required, optional otherwise)
- `file?: File` - Single file to upload
- `files?: File[]` - Multiple files to upload
- `rpcOptions?: Omit<RpcMethodOptions, "file" | "files">` - Per-call RPC options (overrides static options)

### Optional Body Types

For methods with no body (void, never, or explicitly undefined):

```typescript
// Method signature: @Route() async clearAll(): Promise<void>

const mutation = useRpcMutation(rpc.files.clearAll);

// Can pass undefined or nothing
mutation.mutate(); // ✅
mutation.mutate(undefined); // ✅
```

## 🎯 Best Practices

1. **Use factory pattern for reusable mutations** - Create hooks once, use everywhere
2. **Auto-invalidate related queries** - Use `invalidate` option to keep cache fresh
3. **Handle success and error** - Provide user feedback with callbacks
4. **Use static RPC options** - Set default options in factory for consistency
5. **Override per call** - Use dynamic options when needed

## 📚 API Reference

### useRpcMutation

```typescript
function useRpcMutation<TBody, TRet, TOnMutateResult = unknown>(
  method: RpcMethod<TBody, TRet> & { [PathSymbol]: string[] },
  options?: RpcMutationOptions<TBody, TRet, TOnMutateResult>,
): UseMutationResult<TRet, AxiosError, RpcMutationBody<TBody>, TOnMutateResult>;
```

### createRpcMutation

```typescript
function createRpcMutation<TBody, TRet, TOnMutateResult = unknown>(
  method: RpcMethod<TBody, TRet> & { [PathSymbol]: string[] },
  defaultOptions?: RpcMutationOptions<TBody, TRet, TOnMutateResult>,
): (
  options?: RpcMutationOptions<TBody, TRet, TOnMutateResultOverride>,
) => UseMutationResult<TRet, AxiosError, RpcMutationBody<TBody>, TOnMutateResultOverride>;
```

### Mutation Options

All standard React Query mutation options are supported, plus:

- `invalidate?: { [PathSymbol]: string[] }[]` - Routes to invalidate after success
- `rpcOptions?: Omit<RpcMethodOptions, "file" | "files">` - Static RPC options applied to all mutations (can be overridden per call)

## 🔗 Related

- [Query Hooks](/docs/query/queries) - Fetching data with queries
- [Advanced Features](/docs/query/advanced) - Additional features and patterns
