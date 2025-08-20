import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
   title: "NestJS RPC",
   tagline: "Type-safe RPC for NestJS with zero boilerplate and smart batching",
   favicon: "img/favicon.ico",

   // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
   future: {
      v4: true, // Improve compatibility with the upcoming Docusaurus v4
   },

   // Set the production url of your site here
   url: "https://Natansal.github.io",
   // Set the /<baseUrl>/ pathname under which your site is served
   // For GitHub pages deployment, it is often '/<projectName>/'
   baseUrl: "/nestjs-rpc/",

   // GitHub pages deployment config.
   // If you aren't using GitHub pages, you don't need these.
   organizationName: "Natansal",
   projectName: "nestjs-rpc",

   onBrokenLinks: "throw",
   onBrokenMarkdownLinks: "warn",

   // Even if you don't use internationalization, you can use this field to set
   // useful metadata like html lang. For example, if your site is Chinese, you
   // may want to replace "en" with "zh-Hans".
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
               // Please change this to your repo.
               // Remove this to remove the "edit this page" links.
               editUrl: "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
            },
            blog: {
               showReadingTime: true,
               feedOptions: {
                  type: ["rss", "atom"],
                  xslt: true,
               },
               // Please change this to your repo.
               // Remove this to remove the "edit this page" links.
               editUrl: "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
               // Useful options to enforce blogging best practices
               onInlineTags: "warn",
               onInlineAuthors: "warn",
               onUntruncatedBlogPosts: "warn",
            },
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
      // Replace with your project's social card
      image: "img/docusaurus-social-card.jpg",
      navbar: {
         title: "NestJS RPC",
         logo: {
            alt: "NestJS RPC Logo",
            src: "img/logo-light.svg",
            srcDark: "img/logo-dark.svg",
         },
         items: [
            { type: "docSidebar", sidebarId: "tutorialSidebar", position: "left", label: "Docs" },
            { type: "search", position: "right" },
            {
               type: "html",
               position: "right",
               value: '<a class="navbar__icon-link" href="https://github.com/Natansal/NestRPC" aria-label="GitHub" target="_blank" rel="noopener"><img src="/img/github.svg" alt="GitHub" width="22" height="22"/></a>',
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
               items: [
                  {
                     label: "Quick Start",
                     to: "/docs/quick-start",
                  },
               ],
            },
            {
               title: "Community",
               items: [
                  {
                     label: "LinkedIn",
                     href: "https://www.linkedin.com/in/natan-salmon/",
                  },
               ],
            },
            {
               title: "More",
               items: [
                  {
                     label: "GitHub",
                     href: "https://github.com/Natansal/NestRPC",
                  },
               ],
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
