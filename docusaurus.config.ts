import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
   title: "@nestjs-rpc",
   tagline: "Type-safe RPC for NestJS with zero boilerplate and smart batching",
   favicon: "img/favicon.ico",

   future: {
      v4: true,
   },

   url: "https://natansal.github.io",
   baseUrl: "/NestRPC-docs/",

   organizationName: "Natansal",
   projectName: "NestRPC-docs",

   onBrokenLinks: "throw",
   onBrokenMarkdownLinks: "warn",

   i18n: {
      defaultLocale: "en",
      locales: ["en"],
   },
   // Ensure predictable URLs on GitHub Pages
   trailingSlash: true,
   presets: [
      [
         "classic",
         {
            docs: {
               sidebarPath: "./sidebars.ts",
               editUrl: "https://github.com/Natansal/NestRPC-docs/blob/main",
            },
            blog: false,
            theme: {
               customCss: "./src/css/custom.css",
            },
         } satisfies Preset.Options,
      ],
   ],

   plugins: [
      [
         require.resolve("@easyops-cn/docusaurus-search-local"),
         {
            hashed: true,
            indexDocs: true,
            indexBlog: false,
            highlightSearchTermsOnTargetPage: true,
         },
      ],
   ],

   themeConfig: {
      image: "img/docusaurus-social-card.jpg",
      navbar: {
         title: "@nestjs-rpc",
         logo: {
            alt: "NestJS RPC Logo",
            src: "img/logo-light.svg",
            srcDark: "img/logo-dark.svg",
         },
         items: [
            { type: "docSidebar", sidebarId: "tutorialSidebar", position: "left", label: "Docs" },
            {
               type: "html",
               position: "right",
               value: '<a class="navbar__icon-link" href="https://github.com/Natansal/NestRPC.git" aria-label="GitHub" target="_blank" rel="noopener"><img src="/NestRPC-docs/img/github.png" alt="GitHub" width="22" height="22"/></a>',
            },
            {
               type: "html",
               position: "right",
               value: '<a class="navbar__icon-link" href="https://www.linkedin.com/in/natan-salmon/" aria-label="LinkedIn" target="_blank" rel="noopener"><img src="/NestRPC-docs/img/linkedin.png" alt="LinkedIn" width="22" height="22"/></a>',
            },
         ],
      },
      footer: {
         style: "dark",
         links: [
            {
               title: "Docs",
               items: [{ label: "Quick Start", to: "/docs/quick-start" }],
            },
            {
               title: "Community",
               items: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/natan-salmon/" }],
            },
            {
               title: "More",
               items: [{ label: "GitHub", href: "https://github.com/Natansal/NestRPC.git" }],
            },
         ],
         copyright: `Copyright © ${new Date().getFullYear()} NestJS RPC. Built with Docusaurus.`,
      },
      prism: {
         theme: prismThemes.github,
         darkTheme: prismThemes.dracula,
      },
   } satisfies Preset.ThemeConfig,
};

export default config;
