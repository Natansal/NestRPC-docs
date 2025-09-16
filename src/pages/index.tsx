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
            <p className="hero__subtitle">
               Call Nest methods like local functions. Zero boilerplate. End-to-end types.
            </p>
            <div className={styles.buttons}>
               <Link
                  className="button button--primary button--lg"
                  to="/docs/quick-start"
               >
                  Get Started
               </Link>
               <Link
                  className="button button--secondary button--lg"
                  to="https://github.com/Natansal/NestRPC.git"
               >
                  GitHub
               </Link>
            </div>
         </div>
      </section>
   );
}

function CodeShowcase() {
   const serverCode = `import { Module } from '@nestjs/common';
import { Router, Route, defineManifest } from '@nestjs-rpc/server';

@Router()
export class UsersRouter {
  @Route()
  getUser({ id }: { id: string }) {
    return { id, name: 'Ada Lovelace' };
  }
}

export const manifest = defineManifest({
  users: UsersRouter,
});

export type Manifest = typeof manifest;

@Module({ controllers: [UsersRouter] })
export class AppModule {}`;

   const clientCode = `import { RpcClient } from '@nestjs-rpc/client';
import type { Manifest } from '../server/nest-rpc.config';

const client = new RpcClient<Manifest>({
  baseUrl: 'https://api.example.com',
  apiPrefix: 'nestjs-rpc',
});

const rpc = client.routers();
const { data: user } = await rpc.users.getUser({ id: '1' });
console.log(user.name); // "Ada Lovelace"

// Router constants
export const userRepo = client.route('users');

// Calls
const { data: one } = await userRepo.getUser({ id: '1' });


`;

   return (
      <section className={`container margin-vert--lg ${styles.codeSection}`}>
         <div className="row">
            <div className="col col--6">
               <Heading as="h3">Server · Router</Heading>
               <CodeBlock
                  language="ts"
                  title="server/app.router.ts"
                  showLineNumbers
               >
                  {serverCode}
               </CodeBlock>
            </div>
            <div className="col col--6">
               <Heading as="h3">Client · Typed usage</Heading>
               <CodeBlock
                  language="ts"
                  title="client/rpc.ts"
                  showLineNumbers
               >
                  {clientCode}
               </CodeBlock>
            </div>
         </div>
      </section>
   );
}

function Features() {
   return (
      <section className={styles.section}>
         <div className="container">
            <div className={styles.features}>
               <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>🔗</div>
                  <Heading as="h3">Nest-native</Heading>
                  <p>Routers are just classes. Methods are just Nest handlers, discovered via decorators.</p>
               </div>
               <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>🧠</div>
                  <Heading as="h3">Type-safe</Heading>
                  <p>Input types flow from server to client. Call methods with full IntelliSense.</p>
               </div>
               <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>⚡</div>
                  <Heading as="h3">Zero boilerplate</Heading>
                  <p>
                     Define once with <code>@Router</code> and <code>@Route</code>. Use everywhere via{" "}
                     <code>RpcClient</code>.
                  </p>
               </div>
            </div>
         </div>
      </section>
   );
}

function HowItWorks() {
   return (
      <section className={styles.sectionAlt}>
         <div className="container">
            <Heading
               as="h2"
               className={styles.center}
            >
               How it works
            </Heading>
            <ol className={styles.howList}>
               <li>
                  <strong>Define</strong> routers with <code>@Router()</code> and methods with <code>@Route()</code>.
               </li>
               <li>
                  <strong>Declare</strong> a <code>manifest</code> with <code>defineManifest(...)</code> and export{" "}
                  <code>type Manifest</code>.
               </li>
               <li>
                  <strong>Init</strong> with <code>nestRpcInit(manifest)</code> inside the{" "}
                  <code>bootstrap() {"{ ... }"}</code>, then call from the client via <code>RpcClient</code>.
               </li>
            </ol>
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
         description="Type-safe RPC for NestJS with decorators and zero boilerplate"
      >
         <main>
            <Hero />
         </main>
         <Features />
         <CodeShowcase />
         <HowItWorks />
      </Layout>
   );
}
