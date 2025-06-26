import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

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
  docsSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introducción',
      // type: 'link',
      // href: '/docs/intro',
      // label: 'Introducción',
      // link:{
      //   type:'doc',
      //   id:'intro'
      // }
    },
    'guia-inicio',
    {
      type: 'category',
      label: 'Referencia de API',
      link: {
        type: 'doc',
        id: 'api/index',
      },
      items: [
        'api/filtrado-busqueda',
        'api/transformacion-mapeo',
        'api/agrupacion-conteo',
        'api/manipulacion-elementos',
        'api/utilidades',
      ],
    },
    'casos-uso',
  ],
};

export default sidebars;
