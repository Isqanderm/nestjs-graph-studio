import { useEffect, useState } from 'react';
import { fetchRoutes } from '../api';
import { RouteMeta } from '../types';
import styles from './RoutesView.module.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Badge,
} from '../components/ui';

function RoutesView() {
  const [routes, setRoutes] = useState<RouteMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<RouteMeta | null>(null);

  useEffect(() => {
    fetchRoutes()
      .then((data) => {
        setRoutes(data.routes);
      })
      .catch((error) => {
        console.error('Failed to fetch routes:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredRoutes = routes.filter((route) => {
    // Filter out routes with empty paths or methods
    if (!route.path || !route.method) {
      return false;
    }

    // Filter out GraphStudioController routes (safety measure, should be filtered on backend)
    if (route.controller === 'GraphStudioController' || route.path.startsWith('/graph-studio')) {
      return false;
    }

    const searchStr = `${route.method} ${route.path} ${route.controller} ${route.handler}`.toLowerCase();
    return searchStr.includes(filter.toLowerCase());
  });

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading routes...</div>
      </div>
    );
  }

  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewHeader}>
        <h2>Routes</h2>
        <p>All registered routes with their execution chains</p>
      </div>

      <div className={styles.filterContainer}>
        <input
          type="text"
          placeholder="Filter routes..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={styles.filterInput}
        />
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table} data-testid="routes-table">
          <thead>
            <tr>
              <th>Method</th>
              <th>Path</th>
              <th>Controller</th>
              <th>Handler</th>
              <th>Guards</th>
              <th>Pipes</th>
              <th>Interceptors</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoutes.map((route, idx) => (
              <tr key={idx}>
                <td>
                  <Badge variant={route.method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete'}>
                    {route.method}
                  </Badge>
                </td>
                <td className={styles.pathCell}>{route.path}</td>
                <td>{route.controller}</td>
                <td>{route.handler}</td>
                <td>{route.chain.guards.length || '-'}</td>
                <td>{route.chain.pipes.length || '-'}</td>
                <td>{route.chain.interceptors.length || '-'}</td>
                <td>
                  <Button onClick={() => setSelectedRoute(route)} variant="secondary" size="sm">
                    Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedRoute} onOpenChange={(open) => !open && setSelectedRoute(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Route Execution Chain</DialogTitle>
          </DialogHeader>

          {selectedRoute && (
            <div className="px-6 py-4">
              <div className="flex items-center gap-3 mb-6 p-3 bg-bg-tertiary rounded">
                <Badge variant={selectedRoute.method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete'}>
                  {selectedRoute.method}
                </Badge>
                <span className="font-mono text-sm text-text-primary">{selectedRoute.path}</span>
              </div>

              <div className="mb-5">
                <h4 className="text-sm font-semibold text-text-secondary uppercase mb-2">
                  Guards ({selectedRoute.chain.guards.length})
                </h4>
                {selectedRoute.chain.guards.length > 0 ? (
                  <ul className="space-y-1">
                    {selectedRoute.chain.guards.map((guard, idx) => (
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
                  Pipes ({selectedRoute.chain.pipes.length})
                </h4>
                {selectedRoute.chain.pipes.length > 0 ? (
                  <ul className="space-y-1">
                    {selectedRoute.chain.pipes.map((pipe, idx) => (
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
                  Interceptors ({selectedRoute.chain.interceptors.length})
                </h4>
                {selectedRoute.chain.interceptors.length > 0 ? (
                  <ul className="space-y-1">
                    {selectedRoute.chain.interceptors.map((interceptor, idx) => (
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
                <h4 className="text-sm font-semibold text-text-secondary uppercase mb-2">
                  Handler
                </h4>
                <p className="text-text-primary text-sm">
                  {selectedRoute.controller}.{selectedRoute.handler}()
                </p>
              </div>

              <div className="mb-5">
                <h4 className="text-sm font-semibold text-text-secondary uppercase mb-2">
                  Exception Filters ({selectedRoute.chain.filters.length})
                </h4>
                {selectedRoute.chain.filters.length > 0 ? (
                  <ul className="space-y-1">
                    {selectedRoute.chain.filters.map((filter, idx) => (
                      <li key={idx} className="px-3 py-2 bg-bg-tertiary rounded text-sm">
                        {filter}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-text-secondary italic text-sm">No filters</p>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={() => setSelectedRoute(null)} variant="secondary">
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

export default RoutesView;

