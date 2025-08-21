import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import CodeBlock from "@theme/CodeBlock";

import styles from "./index.module.css";

function Hero() {
   return (
      <section className={styles.heroBanner}>
         <div className="container">
            <Heading
               as="h1"
               className="hero__title"
            >
               Type-safe RPC for NestJS
            </Heading>
            <p className="hero__subtitle">Call Nest methods like local functions. Zero boilerplate. Smart batching.</p>
            <div className={styles.buttons}>
               <Link
                  className="button button--primary button--lg"
                  to="/docs/quick-start"
               >
                  Get Started
               </Link>
            </div>
         </div>
      </section>
   );
}

function CodeShowcase() {
   const serverCode = `import { Module } from '@nestjs/common';
import { Router, Route, defineAppRouter } from '@nestjs-rpc/server';

@Router()
export class UsersRouter {
  @Route()
  getUser({ id }: { id: string }) {
    return { id, name: 'Ada Lovelace' };
  }
}

export const appRouter = defineAppRouter({
  users: UsersRouter,
});

@Module({ providers: [UsersRouter] })
export class AppModule {}`;

   const clientCode = `import { createRpcClient } from '@nestjs-rpc/client';

// Tip: export your router type from a shared package and use it here
type RpcApp = typeof appRouter; // e.g. import type { RpcApp } from '@acme/shared'

const client = createRpcClient<RpcApp>({
  baseUrl: 'https://api.example.com',
  apiPrefix: 'api',
});

const user = await client.users.getUser({ id: '1' });
console.log(user.name); // "Ada Lovelace"`;

   return (
      <section className="container margin-vert--lg">
         <div className="row">
            <div className="col col--6">
               <Heading as="h3">Server · Router</Heading>
               <CodeBlock language="ts" title="server/app.router.ts" showLineNumbers>
                  {serverCode}
               </CodeBlock>
            </div>
            <div className="col col--6">
               <Heading as="h3">Client · Typed usage</Heading>
               <CodeBlock language="ts" title="client/rpc.ts" showLineNumbers>
                  {clientCode}
               </CodeBlock>
            </div>
         </div>
      </section>
   );
}

/**
 * 🏠 Home page component.
 *
 * ✨ Renders the hero section and a side‑by‑side code showcase for the
 * server router and the typed client usage.
 *
 * @returns 🎯 The landing page layout.
 */
export default function Home(): ReactNode {
   return (
      <Layout
         title="NestJS RPC"
         description="Type-safe RPC for NestJS with decorators, batching, and zero boilerplate"
      >
         <main>
            <Hero />
         </main>
         <section>
            <CodeShowcase />
         </section>
      </Layout>
   );
}
