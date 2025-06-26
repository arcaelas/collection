import type {ReactNode, ComponentType} from 'react';
import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

// Tipos para el componente Heading
type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface HeadingProps {
  as?: HeadingTag;
  children?: ReactNode;
  className?: string;
  [key: string]: unknown;
}

const Heading: React.FC<HeadingProps> = ({
  as: Tag = 'h2',
  children,
  ...props
}) => {
  const Component = Tag as unknown as ComponentType<{
    className?: string;
    children?: ReactNode;
  }>;
  
  return <Component {...props}>{children}</Component>;
};

type FeatureItem = {
  title: string;
  description: ReactNode;
  href?: string;
};

// Importar las imágenes
const CollectionImage = require('@site/static/img/foot-card-1.png').default;
const TypeImage = require('@site/static/img/foot-card-2.png').default;
const SpeedImage = require('@site/static/img/foot-card-3.png').default;

const FeatureList: FeatureItem[] = [
  {
    title: 'Potente API de Colecciones',
    description: (
      <>
        Manipula colecciones de datos con una API fluida y expresiva.
        Filtra, ordena y transforma tus datos con métodos encadenables.
      </>
    ),
    href: '/docs/intro',
  },
  {
    title: 'Tipado Fuerte',
    description: (
      <>
        Desarrollado con TypeScript para ofrecer autocompletado inteligente
        y detección temprana de errores en tiempo de desarrollo.
      </>
    ),
    href: '/docs/api',
  },
  {
    title: 'Ligero y Rápido',
    description: (
      <>
        Optimizado para rendimiento con cero dependencias externas.
        Ideal para aplicaciones que requieren alto rendimiento con colecciones de datos.
      </>
    ),
  },
];

function Feature({ title, description, href }: FeatureItem) {
  const isFirstFeature = title === 'Potente API de Colecciones';
  const isSecondFeature = title === 'Tipado Fuerte';
  const isThirdFeature = title === 'Ligero y Rápido';
  
  const content = (
    <>
      <div className="text--center">
        {isFirstFeature && (
          <img 
            src={CollectionImage} 
            alt={title} 
            className={styles.featureImage}
            loading="lazy"
          />
        )}
        {isSecondFeature && (
          <img 
            src={TypeImage} 
            alt={title} 
            className={styles.featureImage}
            loading="lazy"
          />
        )}
        {isThirdFeature && (
          <img 
            src={SpeedImage} 
            alt={title} 
            className={styles.featureImage}
            loading="lazy"
          />
        )}
      </div>
      <div className="text--center">
        <h3 className={styles.featureTitle}>{title}</h3>
        <p className={styles.featureDescription}>{description}</p>
      </div>
    </>
  );

  return (
    <div className={clsx('col col--4')}>
      {href ? (
        <a href={href} className={clsx(styles.feature, styles.featureLink)}>
          {content}
        </a>
      ) : (
        <div className={styles.feature}>
          {content}
        </div>
      )}
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className={styles.container}>
        <div className={styles.row}>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
