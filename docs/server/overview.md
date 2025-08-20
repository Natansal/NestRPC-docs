---
title: Server Overview
description: Core concepts of @nestjs-rpc/server
---

This package provides the NestJS integration and runtime for defining and executing RPC routes.

- Decorators: `@Router()` for classes and `@Route()` for methods
- Param decorators: `createRouterParamDecorator()` plus built-ins `Req`, `Res`, `Next`, `Input`
- Module: `NestRPCModule.forRoot({ routes, apiPrefix })` to mount a dynamic controller
- Types: `defineAppRouter`, `InferNestRpcRouterApp`

Execution flow:
1) Client sends a batch POST to `<baseUrl>/<apiPrefix>?calls=...` with a body array of inputs.
2) Dynamic controller decodes the `calls` query, pairs each with its body input, and routes to a class/method.
3) Runtime compiles argument builders from metadata and resolves parameters per call, inserting the raw input at index 0.
4) Method executes and the result is returned as `{ response: { data } }` (errors mapped to `{ error }`).

Reserved parameter index: The first method parameter is the raw input and cannot be decorated. A runtime guard enforces this.

