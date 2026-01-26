---
title: Query Hooks
description: Type-safe query hooks for fetching data. Direct hooks and factory pattern for reusable queries.
---

# Query Hooks

Query hooks are used for fetching data from your RPC endpoints. They provide automatic caching, background refetching, and full type safety.

## 🎯 useRpcQuery

Direct hook for one-off RPC queries. Automatically handles query key generation, caching, and type inference.

### Basic Usage

```typescript
import { useRpcQuery } from '@nestjs-rpc/query';
import { rpc } from './rpc-client';

function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = useRpcQuery(
    rpc.user.queries.getUser,
    { id: userId }, // Request body
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No user found</div>;

  return <div>{data.name} - {data.email}</div>;
}
```

### With Optional Body

For methods that don't require a body (or have optional body):

```typescript
function UserList() {
  const { data: users = [] } = useRpcQuery(
    rpc.user.queries.listUsers,
    undefined, // No body needed
  );

  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

### With Options

Pass React Query options for fine-grained control:

```typescript
function UserProfile({ userId }: { userId: string }) {
  const { data } = useRpcQuery(
    rpc.user.queries.getUser,
    { id: userId },
    {
      staleTime: 5000, // Consider data fresh for 5 seconds
      enabled: !!userId, // Only run when userId is provided
      refetchInterval: 30000, // Refetch every 30 seconds
      onSuccess: (data) => {
        console.log('User loaded:', data);
      },
    },
  );

  return <div>{data?.name}</div>;
}
```

### Conditional Queries

Use the `enabled` option to conditionally run queries:

```typescript
function UserProfile({ userId }: { userId: string | null }) {
  const { data } = useRpcQuery(
    rpc.user.queries.getUser,
    { id: userId! }, // Non-null assertion needed when enabled is false
    {
      enabled: !!userId, // Only run when userId is truthy
    },
  );

  if (!userId) return <div>No user selected</div>;
  return <div>{data?.name}</div>;
}
```

## 🏭 createRpcQuery

Factory function to create reusable query hooks with default options. Perfect for creating domain-specific hooks.

### Basic Usage

```typescript
import { createRpcQuery } from '@nestjs-rpc/query';
import { rpc } from './rpc-client';

// Create a reusable hook with defaults
const useUserList = createRpcQuery(rpc.user.queries.listUsers, {
  staleTime: 60000, // 1 minute
  refetchOnWindowFocus: false,
  placeholderData: [], // Guaranteed non-undefined
});

// Use it in components
function UserList() {
  const { data: users = [] } = useUserList(undefined);
  // ...
}

// Override options per usage
function AnotherComponent() {
  const { data: users } = useUserList(undefined, {
    refetchInterval: 10000, // Override default
  });
}
```

### With Required Body

```typescript
const useUserById = createRpcQuery(rpc.user.queries.getUser, {
  staleTime: 30000,
});

function UserProfile({ userId }: { userId: string }) {
  const { data: user } = useUserById({ id: userId });
  return <div>{user?.name}</div>;
}
```

### Advanced: Additional Query Keys

Extend query keys for more granular cache control:

```typescript
// Using array
const { data } = useRpcQuery(
  rpc.user.queries.getUserById,
  { id: "123" },
  {
    useAdditionalQueryKey: ["admin-view"], // Adds to query key
  },
);

// Using function (allows using hooks inside)
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

// In factory defaults
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

## 📋 Complete Example

```typescript
import { createRpcQuery, useRpcQuery } from '@nestjs-rpc/query';
import { rpc } from './rpc-client';

// Create reusable hooks
const useUserList = createRpcQuery(rpc.user.queries.listUsers, {
  staleTime: 30000,
  refetchOnWindowFocus: false,
  placeholderData: [],
});

const useUserById = createRpcQuery(rpc.user.queries.getUser, {
  staleTime: 60000,
});

function UserManagement() {
  const { data: users = [], isLoading } = useUserList(undefined);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Conditional query
  const { data: selectedUser } = useUserById(
    { id: selectedUserId! },
    {
      enabled: !!selectedUserId,
    },
  );

  return (
    <div>
      <h2>Users</h2>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {users.map(user => (
            <li key={user.id} onClick={() => setSelectedUserId(user.id)}>
              {user.name}
            </li>
          ))}
        </ul>
      )}

      {selectedUser && (
        <div>
          <h3>Selected User</h3>
          <p>Name: {selectedUser.name}</p>
          <p>Email: {selectedUser.email}</p>
        </div>
      )}
    </div>
  );
}
```

## 🎯 Best Practices

1. **Use factory pattern for reusable queries** - Create hooks once, use everywhere
2. **Set appropriate staleTime** - Balance freshness with performance
3. **Use placeholderData** - Provide default values for better UX
4. **Conditional queries** - Use `enabled` option to prevent unnecessary requests
5. **Handle loading and error states** - Always provide user feedback

## 📚 API Reference

### useRpcQuery

```typescript
function useRpcQuery<TBody, TRet, TData = TRet>(
  method: RpcMethod<TBody, TRet> & { [PathSymbol]: string[] },
  body: TBody,
  options?: RpcQueryOptions<UseQueryOptions<TRet, AxiosError, TData, QueryKey>>,
  queryClient?: QueryClient,
): UseQueryResult<TData, AxiosError>;
```

### createRpcQuery

```typescript
function createRpcQuery<TBody, TRet, TData = TRet>(
  method: RpcMethod<TBody, TRet> & { [PathSymbol]: string[] },
  defaultOptions?: RpcQueryOptions<UseQueryOptions<TRet, AxiosError, TData>>,
): RpcQueryHook<TBody, TRet, TData>;
```

### Query Options

All standard React Query options are supported, except:
- `queryKey` - Automatically generated
- `queryFn` - Automatically generated
- `meta` - Automatically generated

Plus RPC-specific options:
- `useAdditionalQueryKey?: unknown[] | (() => unknown[])` - Extend query key
- `rpcOptions?: RpcMethodOptions` - RPC-specific options

## 🔗 Related

- [Mutation Hooks](/docs/query/mutations) - Mutations with automatic cache invalidation
- [Advanced Features](/docs/query/advanced) - Additional query keys, file uploads, and more
