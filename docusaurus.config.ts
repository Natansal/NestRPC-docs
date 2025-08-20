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

   url: "https://Natansal.github.io",
   baseUrl: "/nestjs-rpc/",

   organizationName: "Natansal",
   projectName: "NestRPC-docs",

   onBrokenLinks: "throw",
   onBrokenMarkdownLinks: "warn",

   i18n: {
      defaultLocale: "en",
      locales: ["en"],
   },
   presets: [
      [
         "classic",
         {
            docs: {
               sidebarPath: "./sidebars.ts",
               editUrl: "https://github.com/Natansal/NestRPC-docs.git",
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
               value: '<a class="navbar__icon-link" href="https://github.com/Natansal/NestRPC.git" aria-label="GitHub" target="_blank" rel="noopener"><img src="/img/github.svg" alt="GitHub" width="22" height="22"/></a>',
            },
            {
               type: "html",
               position: "right",
               value: '<a class="navbar__icon-link" href="https://www.linkedin.com/in/natan-salmon/" aria-label="LinkedIn" target="_blank" rel="noopener"><img src="/img/linkedin.svg" alt="LinkedIn" width="22" height="22"/></a>',
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
      trailingSlash: true,
   } satisfies Preset.ThemeConfig,
};

export default config;
