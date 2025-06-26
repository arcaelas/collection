import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Arcaelas Collection',
  tagline: 'Librería TypeScript para manipulación eficiente y tipada de colecciones de datos',
  favicon: 'https://raw.githubusercontent.com/arcaelas/dist/refs/heads/main/logo/png/32.png',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://collection.arcaelas.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',
  trailingSlash: true, // Usar URLs consistentes con barra al final
  
  // Configuración de CDN para recursos estáticos
  staticDirectories: ['static'],
  scripts: [
    // Carga diferida de scripts no críticos
    {
      src: 'https://cdn.jsdelivr.net/npm/prism-react-renderer@2.3.0/dist/index.min.js',
      async: true,
      defer: true,
    },
  ],

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'arcaelas', // Usually your GitHub org/user name.
  projectName: 'collection', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
  },

  presets: [
    [
      'classic',
      {
        pages: {
          path: 'src/pages',
          routeBasePath: '/',
        },
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/docs', // Servir la documentación en /docs
          // Remove the "edit this page" links
          editUrl: undefined,
          // Configuración de la barra lateral
          sidebarCollapsible: true,
          sidebarCollapsed: true,
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/arcaelas/collection/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Imagen para compartir en redes sociales
    image: 'img/arcaelas-social-card.jpg',
    // Script para datos estructurados (JSON-LD)
    headTags: [
      // Meta tags para descripción y SEO
      {
        tagName: 'meta',
        attributes: {
          name: 'description',
          content: 'Arcaelas Collection: librería TypeScript para manipulación eficiente de colecciones con filtrado avanzado, transformación de datos y tipado fuerte.',
        },
      },
      {
        tagName: 'meta',
        attributes: {
          property: 'og:description',
          content: 'Una biblioteca JavaScript para manipulación avanzada de colecciones de datos con una API fluida y expresiva.',
        },
      },
      {
        tagName: 'meta',
        attributes: {
          property: 'og:title',
          content: 'Arcaelas Collection | Manipulación de datos en JavaScript',
        },
      },
      {
        tagName: 'meta',
        attributes: {
          name: 'twitter:card',
          content: 'summary_large_image',
        },
      },
      {
        tagName: 'meta',
        attributes: {
          name: 'twitter:title',
          content: 'Arcaelas Collection | Potente API para colecciones en JavaScript',
        },
      },
      {
        tagName: 'meta',
        attributes: {
          name: 'twitter:description',
          content: 'Manipula colecciones de datos en JavaScript con una API fluida y tipado fuerte. Ideal para filtrado, ordenamiento y transformación de datos.',
        },
      },
      // Preload recursos críticos para reducir CLS
      {
        tagName: 'link',
        attributes: {
          rel: 'preload',
          href: '/img/webp/banner.webp',
          as: 'image',
          type: 'image/webp',
          fetchpriority: 'high',
        },
      },
      {
        tagName: 'link',
        attributes: {
          rel: 'preload',
          href: '/img/webp/foot-card-1.webp',
          as: 'image',
          type: 'image/webp',
        },
      },
      // Optimización para fuentes - mejora FCP y LCP
      {
        tagName: 'link',
        attributes: {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
          crossorigin: 'anonymous',
        },
      },
      {
        tagName: 'link',
        attributes: {
          rel: 'dns-prefetch',
          href: 'https://fonts.googleapis.com',
        },
      },
      // Prefetch para rutas comunes - mejora la navegación
      {
        tagName: 'link',
        attributes: {
          rel: 'prefetch',
          href: '/docs/api/filtrado-busqueda',
        },
      },
      {
        tagName: 'link',
        attributes: {
          rel: 'prefetch',
          href: '/docs/api/transformacion-mapeo',
        },
      },
      // JSON-LD para descripciones estructuradas
      {
        tagName: 'script',
        attributes: {
          type: 'application/ld+json',
        },
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          'name': 'Arcaelas Collection',
          'description': 'Una potente librería TypeScript para trabajar con colecciones de datos que ofrece filtrado avanzado, transformaciones y operaciones encadenadas con tipado fuerte.',
          'applicationCategory': 'DeveloperApplication',
          'operatingSystem': 'Any',
          'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD'
          },
          'author': {
            '@type': 'Organization',
            'name': 'Arcaelas Insiders, Inc.',
            'url': 'https://github.com/arcaelas'
          },
          'softwareVersion': '1.0.0',
          'fileSize': '50KB',
          'programmingLanguage': 'TypeScript'
        }),
      },
    ],
    metadata: [
      {
        name: "keywords",
        content: "typescript, colección, filtrado, transformación, manipulación datos, javascript, librería, tipado fuerte"
      },
      {
        name: "author",
        content: "Arcaelas Insiders, Inc."
      },
      {
        name: "google-adsense-account",
        content: "ca-pub-2819730910015409"
      },
      // Open Graph básico
      {
        property: "og:type",
        content: "website"
      },
      {
        property: "og:locale",
        content: "es_ES"
      },
      // Twitter Cards
      {
        name: "twitter:card",
        content: "summary_large_image"
      },
      {
        name: "twitter:site",
        content: "@arcaelas"
      },
    ],
    navbar: {
      title: 'Arcaelas Collection',
      logo: {
        alt: 'Arcaelas Collection Logo',
        src: 'https://raw.githubusercontent.com/arcaelas/dist/refs/heads/main/logo/png/32.png',
      },
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Documentación',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/arcaelas/collection',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Tutorial',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/arcaela',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/arcaelas',
            },
            {
              label: 'X',
              href: 'https://x.com/arcaelas',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/arcaelas/collection',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Arcaelas Insiders, Inc.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
