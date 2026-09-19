import { useEffect, useState } from 'react';
import { fetchGraphQLOperations } from './api';
import { GraphQLOperationMeta } from './types';
import styles from '../routes/RoutesView.module.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Badge,
} from '../components/ui';

const KIND_BADGE_VARIANT: Record<GraphQLOperationMeta['kind'], 'info' | 'warning' | 'success' | 'secondary'> = {
  QUERY: 'info',
  MUTATION: 'warning',
  SUBSCRIPTION: 'success',
  FIELD: 'secondary',
};

function GraphQLView() {
  const [operations, setOperations] = useState<GraphQLOperationMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedOperation, setSelectedOperation] = useState<GraphQLOperationMeta | null>(null);

  useEffect(() => {
    fetchGraphQLOperations()
      .then((data) => {
        setOperations(data.operations);
      })
      .catch((error) => {
        console.error('Failed to fetch GraphQL operations:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredOperations = operations.filter((operation) => {
    const searchStr = `${operation.kind} ${operation.typeName} ${operation.fieldName} ${operation.resolverClass} ${operation.methodName}`.toLowerCase();
    return searchStr.includes(filter.toLowerCase());
  });

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading GraphQL operations...</div>
      </div>
    );
  }

  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewHeader}>
        <h2>GraphQL</h2>
        <p>All registered queries, mutations, subscriptions and field resolvers</p>
      </div>

      <div className={styles.filterContainer}>
        <input
          type="text"
          placeholder="Filter operations..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={styles.filterInput}
        />
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table} data-testid="graphql-table">
          <thead>
            <tr>
              <th>Kind</th>
              <th>Field</th>
              <th>Resolver</th>
              <th>Method</th>
              <th>Guards</th>
              <th>Pipes</th>
              <th>Interceptors</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOperations.map((operation, idx) => (
              <tr key={idx}>
                <td>
                  <Badge variant={KIND_BADGE_VARIANT[operation.kind]}>{operation.kind}</Badge>
                </td>
                <td className={styles.pathCell}>
                  {operation.typeName}.{operation.fieldName}
                </td>
                <td>{operation.resolverClass}</td>
                <td>{operation.methodName}</td>
                <td>{operation.chain.guards.length || '-'}</td>
                <td>{operation.chain.pipes.length || '-'}</td>
                <td>{operation.chain.interceptors.length || '-'}</td>
                <td>
                  <Button onClick={() => setSelectedOperation(operation)} variant="secondary" size="sm">
                    Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedOperation} onOpenChange={(open) => !open && setSelectedOperation(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>GraphQL Execution Chain</DialogTitle>
          </DialogHeader>

          {selectedOperation && (
            <div className="px-6 py-4">
              <div className="flex items-center gap-3 mb-6 p-3 bg-bg-tertiary rounded">
                <Badge variant={KIND_BADGE_VARIANT[selectedOperation.kind]}>{selectedOperation.kind}</Badge>
                <span className="font-mono text-sm text-text-primary">
                  {selectedOperation.typeName}.{selectedOperation.fieldName}
                </span>
              </div>

              <div className="mb-5">
                <h4 className="text-sm font-semibold text-text-secondary uppercase mb-2">
                  Guards ({selectedOperation.chain.guards.length})
                </h4>
                {selectedOperation.chain.guards.length > 0 ? (
                  <ul className="space-y-1">
                    {selectedOperation.chain.guards.map((guard, idx) => (
                      <li key={idx} className="px-3 py-2 bg-bg-tertiary rounded text-sm">
                        {guard}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-text-secondary italic text-sm">No guards</p>
                )}
              </div>

              <div className="mb-5">
                <h4 className="text-sm font-semibold text-text-secondary uppercase mb-2">
                  Pipes ({selectedOperation.chain.pipes.length})
                </h4>
                {selectedOperation.chain.pipes.length > 0 ? (
                  <ul className="space-y-1">
                    {selectedOperation.chain.pipes.map((pipe, idx) => (
                      <li key={idx} className="px-3 py-2 bg-bg-tertiary rounded text-sm">
                        {pipe}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-text-secondary italic text-sm">No pipes</p>
                )}
              </div>

              <div className="mb-5">
                <h4 className="text-sm font-semibold text-text-secondary uppercase mb-2">
                  Interceptors ({selectedOperation.chain.interceptors.length})
                </h4>
                {selectedOperation.chain.interceptors.length > 0 ? (
                  <ul className="space-y-1">
                    {selectedOperation.chain.interceptors.map((interceptor, idx) => (
                      <li key={idx} className="px-3 py-2 bg-bg-tertiary rounded text-sm">
                        {interceptor}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-text-secondary italic text-sm">No interceptors</p>
                )}
              </div>

              <div className="mb-5">
                <h4 className="text-sm font-semibold text-text-secondary uppercase mb-2">Resolver</h4>
                <p className="text-text-primary text-sm">
                  {selectedOperation.resolverClass}.{selectedOperation.methodName}()
                </p>
              </div>

              <div className="mb-5">
                <h4 className="text-sm font-semibold text-text-secondary uppercase mb-2">
                  Exception Filters ({selectedOperation.chain.filters.length})
                </h4>
                {selectedOperation.chain.filters.length > 0 ? (
                  <ul className="space-y-1">
                    {selectedOperation.chain.filters.map((filterName, idx) => (
                      <li key={idx} className="px-3 py-2 bg-bg-tertiary rounded text-sm">
                        {filterName}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-text-secondary italic text-sm">No filters</p>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={() => setSelectedOperation(null)} variant="secondary">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default GraphQLView;
