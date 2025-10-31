import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { useStore } from './store';
import { fetchGraph } from './api';
import GraphView from './graph/GraphView';
import RoutesView from './routes/RoutesView';

function App() {
  const { setGraph, setLoading, setError } = useStore();

  useEffect(() => {
    // Load initial graph
    setLoading(true);
    fetchGraph()
      .then((graph) => {
        setGraph(graph);
        setError(null);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setGraph, setLoading, setError]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-devtools-bg">
        {/* Header - Minimal, only logo */}
        <header className="flex items-center justify-between h-12 px-4 bg-devtools-header-bg border-b border-devtools-border flex-shrink-0">
          <div className="flex items-center">
            <svg width="28" height="28" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M128 0C57.3 0 0 57.3 0 128s57.3 128 128 128 128-57.3 128-128S198.7 0 128 0zm0 234.7c-58.9 0-106.7-47.8-106.7-106.7S69.1 21.3 128 21.3s106.7 47.8 106.7 106.7-47.8 106.7-106.7 106.7z" fill="#E0234E"/>
              <path d="M128 42.7c-47.1 0-85.3 38.2-85.3 85.3s38.2 85.3 85.3 85.3 85.3-38.2 85.3-85.3-38.2-85.3-85.3-85.3zm42.7 128L128 149.3 85.3 170.7l21.4-42.7-21.4-42.7L128 106.7l42.7-21.4-21.4 42.7 21.4 42.7z" fill="#E0234E"/>
            </svg>
          </div>
        </header>

        {/* App Body - Sidebar + Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar Navigation - Modern Flat Design */}
          <aside className="w-[85px] bg-devtools-sidebar-bg border-r border-devtools-border flex flex-col flex-shrink-0 overflow-y-auto">
            <nav className="flex flex-col gap-2 p-2">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `group relative flex flex-col items-center justify-center gap-2 px-3 py-4 text-xs font-medium rounded-lg transition-all duration-200 ease-in-out ${
                    isActive
                      ? 'bg-gradient-to-br from-accent/15 to-accent/5 text-accent shadow-sm'
                      : 'text-devtools-icon-inactive hover:bg-devtools-hover-bg hover:text-devtools-icon-hover hover:shadow-sm'
                  }`
                }
                title="Graph"
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full" />
                    )}
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}
                    >
                      <circle cx="12" cy="12" r="3"/>
                      <circle cx="6" cy="6" r="2"/>
                      <circle cx="18" cy="6" r="2"/>
                      <circle cx="6" cy="18" r="2"/>
                      <circle cx="18" cy="18" r="2"/>
                      <line x1="8" y1="7" x2="10" y2="11"/>
                      <line x1="16" y1="7" x2="14" y2="11"/>
                      <line x1="8" y1="17" x2="10" y2="13"/>
                      <line x1="16" y1="17" x2="14" y2="13"/>
                    </svg>
                    <span className={`text-center leading-tight max-w-full overflow-hidden text-ellipsis whitespace-nowrap transition-all duration-200 ${isActive ? 'font-semibold' : ''}`}>
                      Graph
                    </span>
                  </>
                )}
              </NavLink>
              <NavLink
                to="/routes"
                className={({ isActive }) =>
                  `group relative flex flex-col items-center justify-center gap-2 px-3 py-4 text-xs font-medium rounded-lg transition-all duration-200 ease-in-out ${
                    isActive
                      ? 'bg-gradient-to-br from-accent/15 to-accent/5 text-accent shadow-sm'
                      : 'text-devtools-icon-inactive hover:bg-devtools-hover-bg hover:text-devtools-icon-hover hover:shadow-sm'
                  }`
                }
                title="Routes"
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full" />
                    )}
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}
                    >
                      <path d="M3 3h18v18H3z"/>
                      <path d="M3 9h18"/>
                      <path d="M9 3v18"/>
                    </svg>
                    <span className={`text-center leading-tight max-w-full overflow-hidden text-ellipsis whitespace-nowrap transition-all duration-200 ${isActive ? 'font-semibold' : ''}`}>
                      Routes
                    </span>
                  </>
                )}
              </NavLink>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto bg-devtools-bg">
            <Routes>
              <Route path="/" element={<GraphView />} />
              <Route path="/routes" element={<RoutesView />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;

