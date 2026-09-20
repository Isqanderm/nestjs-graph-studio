import { RouteMeta } from '../types';
import styles from './RoutesView.module.css';

interface ChainColumnProps {
  label: string;
  items: string[];
}

function ChainColumn({ label, items }: ChainColumnProps) {
  if (items.length === 0) {
    return <div className={styles.chainEmptyChip}>• {label}</div>;
  }

  return (
    <div className={styles.chainColumn}>
      <div className={styles.chainColumnLabel}>{label}</div>
      <div className={styles.chainColumnItems}>
        {items.map((item) => (
          <div key={item} className={styles.chainNode}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChainArrow() {
  return (
    <span className={styles.chainArrow} aria-hidden="true">
      →
    </span>
  );
}

interface ExecutionChainDiagramProps {
  route: RouteMeta;
}

function ExecutionChainDiagram({ route }: ExecutionChainDiagramProps) {
  return (
    <div className={styles.chainDiagram}>
      <ChainColumn label="Guards" items={route.chain.guards} />
      <ChainArrow />
      <ChainColumn label="Interceptors" items={route.chain.interceptors} />
      <ChainArrow />
      <ChainColumn label="Pipes" items={route.chain.pipes} />
      <ChainArrow />
      <div className={styles.chainColumn}>
        <div className={styles.chainColumnLabel}>{route.controller}</div>
        <div className={styles.chainColumnItems}>
          <div className={`${styles.chainNode} ${styles.chainNodeActive}`}>
            {route.method} {route.path}
          </div>
        </div>
      </div>
      <ChainArrow />
      <ChainColumn label="Filters" items={route.chain.filters} />
    </div>
  );
}

export default ExecutionChainDiagram;
