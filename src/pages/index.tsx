import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

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

function Features() {
   return (
      <section className="container margin-vert--md">
         <div className="row">
            <div className={clsx("col col--4")}>
               <Heading as="h3">Zero Boilerplate</Heading>
               <p>
                  Use <code>@Router()</code> and <code>@Route()</code>. No DTOs. No manual clients.
               </p>
            </div>
            <div className={clsx("col col--4")}>
               <Heading as="h3">End-to-End Types</Heading>
               <p>First param is the input. The client type is inferred automatically.</p>
            </div>
            <div className={clsx("col col--4")}>
               <Heading as="h3">Smart Batching</Heading>
               <p>Multiple calls are combined into a single request. Defaults included.</p>
            </div>
         </div>
      </section>
   );
}

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
            <Features />
         </section>
      </Layout>
   );
}
