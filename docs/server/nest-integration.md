---
title: Nest Integration
description: Configure NestRPCModule and define the router map
---

### Module setup

```ts
import { Module } from '@nestjs/common';
import { NestRPCModule } from '@nestjs-rpc/server';
import { routes } from './nest-rpc.config';

@Module({
  imports: [
    NestRPCModule.forRoot({
      routes,
      apiPrefix: 'api', // default: "/nestjs-rpc"
      global: false,
    }),
  ],
})
export class AppModule {}
```

### defineAppRouter()

`defineAppRouter()` preserves type information of your nested map so the client can infer method signatures and inputs.

