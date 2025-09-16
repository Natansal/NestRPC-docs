---
title: Server Overview
description: Core concepts of @nestjs-rpc/server
---

This package provides the NestJS integration and runtime for defining and executing RPC routes.

- Decorators: `@Router()` for classes and `@Route()` for methods
- Manifest: `defineManifest({...})` to map keys to routers/nested maps
- Init: `nestRpcInit(manifest, { apiPrefix })` BEFORE `NestFactory.create(...)`

Notes:
- The first method parameter is the raw input. Its type flows to the client. Do not decorate index 0.
- The `apiPrefix` defaults to `nestjs-rpc` when not provided.

