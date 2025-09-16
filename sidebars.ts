import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    { type: 'doc', id: 'quick-start' },
    { type: 'doc', id: 'best-practices' },
    {
      type: 'category',
      label: 'Server (nestjs-rpc/server)',
      items: [
        'server/overview',
        'server/routers-and-routes',
        'server/execution-context',
        'server/nest-integration',
        'server/error-handling',
      ],
    },
    {
      type: 'category',
      label: 'Client (nestjs-rpc/client)',
      items: [
        'client/overview',
        'client/configuration',
        'client/error-handling',
      ],
    },
    { type: 'doc', id: 'faq' },
  ],
};

export default sidebars;
