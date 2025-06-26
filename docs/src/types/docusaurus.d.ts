declare module '@docusaurus/Link' {
  import type { ComponentType, AnchorHTMLAttributes } from 'react';
  
  export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    to: string;
    isNavLink?: boolean;
    activeClassName?: string;
    [key: string]: any;
  }
  
  const Link: ComponentType<LinkProps>;
  export default Link;
}

declare module '@docusaurus/useDocusaurusContext' {
  import type { Context } from 'react';
  
  export interface DocusaurusContext {
    siteConfig: {
      title: string;
      tagline: string;
      [key: string]: any;
    };
    [key: string]: any;
  }
  
  const context: Context<DocusaurusContext>;
  export default function useDocusaurusContext(): DocusaurusContext;
}

declare module '@theme/Layout' {
  import type { ComponentType, ReactNode } from 'react';
  
  export interface LayoutProps {
    children: ReactNode;
    title?: string;
    description?: string;
    [key: string]: any;
  }
  
  const Layout: ComponentType<LayoutProps>;
  export default Layout;
}

declare module '@docusaurus/module-type-aliases' {
  // No es necesario exportar nada aquí, solo necesitamos que TypeScript
  // sepa que este módulo existe
  const noTypesYet: never;
  export default noTypesYet;
}

declare module '@docusaurus/types' {
  // Tipos básicos para @docusaurus/types
  export interface DocusaurusConfig {
    title: string;
    tagline: string;
    [key: string]: any;
  }
  
  export interface PluginConfig {
    [key: string]: any;
  }
  
  export interface PresetConfig {
    [key: string]: any;
  }
  
  export type LoadedPlugin = any;
  export type LoadedPreset = any;
  export type Props = any;
  
  // Otros tipos que podrían ser necesarios
  export const DEFAULT_CONFIG: DocusaurusConfig;
}
