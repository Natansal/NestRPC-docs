---
title: Nest Integration
description: Initialize NestJS RPC before app creation and define the manifest
---

### Initialize before NestFactory.create

```ts
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { nestRpcInit } from '@nestjs-rpc/server';
import { manifest } from './nest-rpc.config';

async function bootstrap() {
  // Must be called BEFORE app creation so Nest can discover generated decorators
  nestRpcInit(manifest, { apiPrefix: 'nestjs-rpc' /* default */ });

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
```

### defineManifest()

`defineManifest()` preserves type information of your nested map so the client can infer method signatures and inputs.

