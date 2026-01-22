---
title: Error Handling
description: Handling HTTP and network errors in the client. Try/catch patterns, error types, and Axios interceptors.
---

# Client Error Handling

When the server returns an error for a call, Axios rejects the promise with an error containing the HTTP status and data. This guide covers how to handle these errors effectively.

## 🎯 Basic Error Handling

Handle errors with try/catch:

```typescript
import { rpc } from './rpc-client';
import { AxiosError } from 'axios';

try {
  const { data: user } = await rpc.user.queries.getUser({ id: 'missing' });
} catch (error) {
  if (error instanceof AxiosError) {
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    // { statusCode: 404, message: 'User not found' }
  }
}
```

## 📋 Error Sources

Errors can come from different sources:

| Source | Type | Example |
|--------|------|---------|
| Nest `HttpException` | `AxiosError` | `BadRequestException` → 400 |
| Network errors | `AxiosError` | Connection timeout, DNS failure |
| Request cancellation | `AxiosError` | Request aborted |

## 🔍 Error Type Checking

Check error types for appropriate handling:

```typescript
import { AxiosError } from 'axios';

async function getUserSafely(id: string) {
  try {
    const { data: user } = await rpc.user.queries.getUser({ id });
    return { success: true, user };
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 400:
            return { success: false, error: data.message || 'Bad request' };
          case 401:
            return { success: false, error: 'Unauthorized' };
          case 403:
            return { success: false, error: 'Forbidden' };
          case 404:
            return { success: false, error: 'Not found' };
          case 500:
            return { success: false, error: 'Server error' };
          default:
            return { success: false, error: 'Unknown error' };
        }
      } else if (error.request) {
        // Request made but no response
        return { success: false, error: 'Network error' };
      }
    }
    return { success: false, error: 'Unknown error' };
  }
}
```

## 🎨 React Error Handling

Handle errors in React components:

```typescript
import { useState } from 'react';
import { rpc } from './rpc-client';
import { AxiosError } from 'axios';

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        setError(null);
        const { data } = await rpc.user.queries.getUser({ id: userId });
        setUser(data);
      } catch (err) {
        if (err instanceof AxiosError) {
          if (err.response?.status === 404) {
            setError('User not found');
          } else {
            setError(err.response?.data?.message || 'Failed to load user');
          }
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No user found</div>;

  return <div>{user.name}</div>;
}
```

## 🔧 Axios Interceptors

Use interceptors for global error handling:

```typescript
import axios, { AxiosError } from 'axios';
import { RpcClient } from '@nestjs-rpc/client';
import type { Manifest } from '../server/nest-rpc.config';

const axiosInstance = axios.create();

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Handle forbidden
      console.error('Access forbidden');
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error:', error.response?.data);
    }
    return Promise.reject(error);
  }
);

const client = new RpcClient<Manifest>({
  baseUrl: 'http://localhost:3000',
  axiosInstance,
});

export const rpc = client.routers();
```

## 🎯 Error Helper Functions

Create reusable error handling utilities:

```typescript
import { AxiosError } from 'axios';

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      return error.response.data?.message || 'An error occurred';
    } else if (error.request) {
      return 'Network error. Please check your connection.';
    }
  }
  return 'An unexpected error occurred';
}

export function getErrorStatus(error: unknown): number | null {
  if (error instanceof AxiosError && error.response) {
    return error.response.status;
  }
  return null;
}

// Usage
try {
  await rpc.user.queries.getUser({ id: '1' });
} catch (error) {
  const message = getErrorMessage(error);
  const status = getErrorStatus(error);
  console.error(`Error ${status}: ${message}`);
}
```

## 🔄 Retry Logic

Implement retry logic for transient errors:

```typescript
async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Only retry on network errors or 5xx errors
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status && status >= 500) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
          continue;
        }
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
const { data } = await retryRequest(() => 
  rpc.user.queries.getUser({ id: '1' })
);
```

## 📚 Further Reading

- [Axios Error Handling](https://axios-http.com/docs/handling_errors)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [Server Error Handling](/docs/server/error-handling) - How errors are thrown on the server
