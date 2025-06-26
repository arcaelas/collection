import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import { FiArrowRight, FiGithub, FiCode } from 'react-icons/fi';

import styles from './index.module.css';

interface ButtonProps {
  to: string;
  variant?: 'primary' | 'outline';
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

const Button = ({
  to,
  variant = 'primary',
  children,
  icon,
  className = ''
}: ButtonProps) => (
  <Link
    to={to}
    className={clsx(
      styles.button,
      variant === 'primary' ? styles.primaryButton : styles.outlineButton,
      className
    )}
  >
    {children}
    {icon && <span className={styles.buttonIcon}>{icon}</span>}
  </Link>
);

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  
  return (
    <header className={styles.heroBanner}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.hero__title}>
            {siteConfig.title.split(' ').map((word: string, i: number) => (
              <span key={i} className={styles.titleWord}>
                {word}
              </span>
            ))}
          </h1>
          <p className={styles.hero__subtitle}>
            {siteConfig.tagline}
          </p>
          
          <div className={styles.buttons}>
            <Button 
              to="/docs/intro" 
              variant="primary"
              icon={<FiArrowRight />}
            >
              Comenzar
            </Button>
            <Button 
              to="https://github.com/arcaelas/collection" 
              variant="outline"
              icon={<FiGithub />}
              className={styles.githubButton}
            >
              Ver en GitHub
            </Button>
          </div>
          
          <div className={styles.codeExample}>
            <div className={styles.codeHeader}>
              <span className={styles.codeIcon}>
                <FiCode />
              </span>
              <span>Instalación</span>
            </div>
            <pre className={styles.codeBlock}>
              <code>npm install @arcaelas/collection</code>
            </pre>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  
  return (
    <Layout
      title={siteConfig.title}
      description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
