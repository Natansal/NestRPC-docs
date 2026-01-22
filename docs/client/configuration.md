---
title: Client Configuration
description: Configure RpcClient with base URL, API prefix, custom Axios instances, and dynamic configuration updates.
---

# Client Configuration

The `RpcClient` accepts a configuration object that controls how requests are made. This guide covers all configuration options and patterns.

## 🎯 Basic Configuration

```typescript
import { RpcClient } from '@nestjs-rpc/client';
import type { Manifest } from '../server/nest-rpc.config';

const client = new RpcClient<Manifest>({
  baseUrl: 'http://localhost:3000',
  apiPrefix: 'nestjs-rpc', // Optional, defaults to 'nestjs-rpc'
});
```

### Configuration Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `baseUrl` | `string` | Server origin, e.g. `http://localhost:3000` | Required |
| `apiPrefix` | `string` | Controller mount path | `'nestjs-rpc'` |
| `requestOptions` | `AxiosRequestConfig` | Merged into each request | `{}` |
| `axiosInstance` | `AxiosInstance` | Custom Axios instance | `axios` |

## ⚙️ Advanced Configuration

### Custom Request Options

Add default headers, timeouts, and other Axios options:

```typescript
const client = new RpcClient<Manifest>({
  baseUrl: 'https://api.example.com',
  apiPrefix: 'nestjs-rpc',
  requestOptions: {
    timeout: 10000,
    headers: {
      'Authorization': 'Bearer token',
      'X-Custom-Header': 'value',
    },
  },
});
```

### Custom Axios Instance

Use a custom Axios instance for more control:

```typescript
import axios from 'axios';

const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    'X-Custom-Header': 'value',
  },
});

// Add interceptors
axiosInstance.interceptors.request.use((config) => {
  // Modify request
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors
    return Promise.reject(error);
  }
);

const client = new RpcClient<Manifest>({
  baseUrl: 'https://api.example.com',
  apiPrefix: 'nestjs-rpc',
  axiosInstance, // Use custom instance
});
```

### Environment-Based Configuration

Use different configurations for different environments:

```typescript
const client = new RpcClient<Manifest>({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  apiPrefix: 'nestjs-rpc',
  requestOptions: {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
    },
  },
});
```

## 🔄 Dynamic Configuration

Update configuration at runtime:

### Update Single Property

```typescript
// Update base URL
client.$setConfigProperty('baseUrl', 'https://api.production.com');

// Update API prefix
client.$setConfigProperty('apiPrefix', 'api/v1');

// Update request options
client.$setConfigProperty('requestOptions', {
  headers: {
    Authorization: `Bearer ${newToken}`,
  },
});
```

### Update Entire Config

```typescript
client.$setConfig({
  baseUrl: 'https://api.production.com',
  apiPrefix: 'nestjs-rpc',
  requestOptions: {
    headers: {
      Authorization: `Bearer ${newToken}`,
    },
  },
});
```

### Read Current Config

```typescript
const config = client.$config;
console.log(config.baseUrl); // 'http://localhost:3000'
console.log(config.apiPrefix); // 'nestjs-rpc'
```

## 🎯 Per-Call Overrides

Override configuration for individual calls:

### Custom Headers

```typescript
// Add custom headers for this call
const { data } = await rpc.user.getUserById('123', {
  requestOptions: {
    headers: {
      Authorization: 'Bearer custom-token',
      'X-Trace': 'abc123',
    },
  },
});
```

### Custom Axios Instance

```typescript
// Use different Axios instance for this call
const { data } = await rpc.user.getUserById('123', {
  axiosInstance: customAxiosInstance,
});
```

### Complete Override Example

```typescript
const { data } = await rpc.user.getUserById('123', {
  requestOptions: {
    headers: {
      Authorization: 'Bearer token',
      'X-Custom-Header': 'value',
    },
    timeout: 5000,
  },
  axiosInstance: customAxiosInstance,
});
```

## 🔐 Authentication Patterns

### Token-Based Authentication

```typescript
let authToken: string | null = null;

const client = new RpcClient<Manifest>({
  baseUrl: 'https://api.example.com',
  requestOptions: {
    headers: {
      get Authorization() {
        return authToken ? `Bearer ${authToken}` : undefined;
      },
    },
  },
});

// Update token
function setAuthToken(token: string) {
  authToken = token;
}

// Clear token
function clearAuthToken() {
  authToken = null;
}
```

### Dynamic Token Updates

```typescript
const client = new RpcClient<Manifest>({
  baseUrl: 'https://api.example.com',
});

// Update token dynamically
function updateAuthToken(token: string) {
  client.$setConfigProperty('requestOptions', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
```

### Token Refresh Pattern

```typescript
import axios, { AxiosError } from 'axios';

const client = new RpcClient<Manifest>({
  baseUrl: 'https://api.example.com',
  axiosInstance: axios.create(),
});

// Add response interceptor for token refresh
client.$config.axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Refresh token
      const newToken = await refreshToken();
      
      // Update client config
      client.$setConfigProperty('requestOptions', {
        headers: {
          Authorization: `Bearer ${newToken}`,
        },
      });
      
      // Retry original request
      if (error.config) {
        return client.$config.axiosInstance.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);
```

## 🌍 Multi-Environment Setup

### Development/Production

```typescript
const isDevelopment = import.meta.env.DEV;

const client = new RpcClient<Manifest>({
  baseUrl: isDevelopment 
    ? 'http://localhost:3000'
    : 'https://api.production.com',
  apiPrefix: 'nestjs-rpc',
  requestOptions: {
    headers: {
      'X-Environment': isDevelopment ? 'development' : 'production',
    },
  },
});
```

### Multiple API Endpoints

```typescript
// Main API
export const apiClient = new RpcClient<Manifest>({
  baseUrl: 'https://api.example.com',
  apiPrefix: 'nestjs-rpc',
});

// Admin API
export const adminClient = new RpcClient<AdminManifest>({
  baseUrl: 'https://admin-api.example.com',
  apiPrefix: 'nestjs-rpc',
});
```

## 📝 Complete Example

Here's a complete example with all configuration patterns:

```typescript
import { RpcClient } from '@nestjs-rpc/client';
import axios from 'axios';
import type { Manifest } from '../server/nest-rpc.config';

// Create custom Axios instance
const axiosInstance = axios.create({
  timeout: 10000,
});

// Add request interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh
      const newToken = await refreshToken();
      localStorage.setItem('authToken', newToken);
      // Retry request
      return axiosInstance.request(error.config);
    }
    return Promise.reject(error);
  }
);

// Create client
export const rpcClient = new RpcClient<Manifest>({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  apiPrefix: 'nestjs-rpc',
  axiosInstance,
  requestOptions: {
    headers: {
      'X-Client-Version': '1.0.0',
    },
  },
});

// Export routers
export const rpc = rpcClient.routers();

// Helper to update auth token
export function updateAuthToken(token: string) {
  rpcClient.$setConfigProperty('requestOptions', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
```

## 📚 Further Reading

- [Axios Request Config](https://axios-http.com/docs/req_config)
- [Axios Instance](https://axios-http.com/docs/instance)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [Error Handling](/docs/client/error-handling) - Error handling patterns
