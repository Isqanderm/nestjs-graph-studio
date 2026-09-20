import { useState } from 'react';
import { DependencyTree as DependencyTreeData, DependencyTreeNode } from './buildDependencyTree';
import styles from './GraphView.module.css';

interface DependencyTreeProps {
  tree: DependencyTreeData;
  onSelectNode: (id: string) => void;
}

interface TreeRowProps {
  node: DependencyTreeNode;
  path: string;
  expanded: Set<string>;
  toggle: (path: string) => void;
  onSelectNode: (id: string) => void;
}

function TreeRow({ node, path, expanded, toggle, onSelectNode }: TreeRowProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expanded.has(path);

  return (
    <li className={styles.treeNode}>
      <div className={styles.treeNodeRow}>
        {hasChildren ? (
          <button
            className={styles.treeToggle}
            onClick={() => toggle(path)}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className={styles.treeToggleSpacer} />
        )}
        {node.isCycle ? (
          <span className={styles.treeNodeCycle}>↩ {node.name} (circular reference)</span>
        ) : (
          <button className={styles.treeNodeName} onClick={() => onSelectNode(node.id)}>
            {node.name}
          </button>
        )}
      </div>
      {hasChildren && isExpanded && (
        <ul className={styles.treeChildren}>
          {node.children.map((child, i) => (
            <TreeRow
              key={`${path}.${i}.${child.id}`}
              node={child}
              path={`${path}.${i}.${child.id}`}
              expanded={expanded}
              toggle={toggle}
              onSelectNode={onSelectNode}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function DependencyTree({ tree, onSelectNode }: DependencyTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(['dependsOn', 'usedBy'])
  );

  const toggle = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  return (
    <div className={styles.treePane}>
      <div className={styles.treeRoot}>{tree.root.name}</div>

      <button className={styles.treeSectionLabel} onClick={() => toggle('dependsOn')}>
        {expanded.has('dependsOn') ? '▾' : '▸'} Depends on ({tree.dependsOn.length})
      </button>
      {expanded.has('dependsOn') && (
        <ul className={styles.treeChildren}>
          {tree.dependsOn.length === 0 ? (
            <li className={styles.treeEmpty}>Nothing</li>
          ) : (
            tree.dependsOn.map((child, i) => (
              <TreeRow
                key={`dependsOn.${i}.${child.id}`}
                node={child}
                path={`dependsOn.${i}.${child.id}`}
                expanded={expanded}
                toggle={toggle}
                onSelectNode={onSelectNode}
              />
            ))
          )}
        </ul>
      )}

      <button className={styles.treeSectionLabel} onClick={() => toggle('usedBy')}>
        {expanded.has('usedBy') ? '▾' : '▸'} Used by ({tree.usedBy.length})
      </button>
      {expanded.has('usedBy') && (
        <ul className={styles.treeChildren}>
          {tree.usedBy.length === 0 ? (
            <li className={styles.treeEmpty}>Nothing</li>
          ) : (
            tree.usedBy.map((child, i) => (
              <TreeRow
                key={`usedBy.${i}.${child.id}`}
                node={child}
                path={`usedBy.${i}.${child.id}`}
                expanded={expanded}
                toggle={toggle}
                onSelectNode={onSelectNode}
              />
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default DependencyTree;
