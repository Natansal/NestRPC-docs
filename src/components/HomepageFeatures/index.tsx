import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          <div className={clsx('col col--4')}>
            <Heading as="h3">Decorators</Heading>
            <p>Use <code>@Router()</code> and <code>@Route()</code> to expose methods. Keep modules and services intact.</p>
          </div>
          <div className={clsx('col col--4')}>
            <Heading as="h3">Typed Client</Heading>
            <p>Infer the client shape from your server map with <code>InferNestRpcRouterApp</code>.</p>
          </div>
          <div className={clsx('col col--4')}>
            <Heading as="h3">Batching</Heading>
            <p>Coalesce calls automatically with debouncing and URL-size guards. Configure or disable as needed.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
