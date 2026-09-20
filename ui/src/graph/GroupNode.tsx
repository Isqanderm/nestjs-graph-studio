import { memo } from 'react';
import styles from './GraphView.module.css';

interface GroupNodeData {
  label: string;
}

const GroupNode = memo(({ data }: { data: GroupNodeData }) => (
  <div className={styles.groupNode}>
    <div className={styles.groupNodeLabel}>{data.label}</div>
  </div>
));

GroupNode.displayName = 'GroupNode';

export default GroupNode;
