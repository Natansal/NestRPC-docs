---
sidebar_position: 1
title: Introduction
description: Type-safe RPC for NestJS — call server methods like local functions
---

NestJS RPC is a lightweight RPC layer for NestJS that lets you call server-side methods as if they were local async functions — with full end-to-end type safety.

- Define routers with `@Router()` and methods with `@Route()`
- Declare a manifest with `defineManifest(...)` and export `type Manifest = typeof manifest`
- Initialize on the server with `nestRpcInit(manifest, { apiPrefix })` before `NestFactory.create(...)`
- Use a typed client with `new RpcClient<Manifest>(...).routers()` or `client.route('...')`

Head to the Quick Start to build your first RPC in minutes.

[Get started →](/docs/quick-start)
