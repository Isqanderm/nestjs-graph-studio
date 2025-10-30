import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useStore } from '../store';
import ReactFlow, {
  Node,
  Edge,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  getRectOfNodes,
  getTransformForBounds,
} from 'reactflow';
import 'reactflow/dist/style.css';
import styles from './GraphView.module.css';
import { GraphNode, NodeType, EdgeKind } from '../types';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import { getLayoutedElements } from './layoutUtils';
import { toPng } from 'html-to-image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  Button,
  Badge,
  Checkbox,
} from '../components/ui';

// Type definitions for custom node and edge data
export interface CustomNodeData {
  label: string;
  type: NodeType;
  scope?: string;
  module?: string;
  route?: {
    method: string;
    path: string;
  };
  missing?: {
    requiredBy: string[];
    suggestedFix?: string;
  };
  highlightClasses?: string;
  executionOrder?: number;
  executionTiming?: number;
  executionStage?: string;
}

export interface CustomEdgeData {
  kind: EdgeKind;
}

// Node types for React Flow
const nodeTypes = {
  custom: CustomNode,
};

// Edge types for React Flow
const edgeTypes = {
  custom: CustomEdge,
};



// Modules to exclude from the graph visualization
const EXCLUDED_MODULES = [
  'GraphStudioModule',      // Our library module
  'InternalCoreModule',     // NestJS internal core
  'DiscoveryModule',        // NestJS discovery module
];

// Helper function to check if a node should be filtered out
function shouldFilterNode(node: GraphNode): boolean {
  // Filter by module name
  if (node.module && EXCLUDED_MODULES.includes(node.module)) {
    return true;
  }

  // Filter module nodes themselves
  if (node.type === 'MODULE' && EXCLUDED_MODULES.includes(node.name)) {
    return true;
  }

  return false;
}

// Graph settings interface
interface GraphSettings {
  highlightRequestScoped: boolean;
  highlightImplicitRequestScoped: boolean;
  detectCircularDeps: boolean;
  lockNodes: boolean;
}

// Default settings
const DEFAULT_SETTINGS: GraphSettings = {
  highlightRequestScoped: false,
  highlightImplicitRequestScoped: false,
  detectCircularDeps: false,
  lockNodes: false,
};

// Load settings from localStorage
function loadSettings(): GraphSettings {
  try {
    const saved = localStorage.getItem('graphSettings');
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('Failed to load graph settings:', error);
  }
  return DEFAULT_SETTINGS;
}

// Save settings to localStorage
function saveSettings(settings: GraphSettings): void {
  try {
    localStorage.setItem('graphSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save graph settings:', error);
  }
}

interface SearchSuggestion {
  id: string;
  name: string;
  type: string;
}

function GraphViewInner() {
  const graph = useStore((state) => state.graph);
  const reactFlowInstance = useReactFlow();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<CustomNodeData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [settings, setSettings] = useState<GraphSettings>(loadSettings);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  // Update settings and save to localStorage
  const updateSetting = (key: keyof GraphSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Generate search suggestions based on search term
  const generateSuggestions = (term: string) => {
    if (!filteredData || !term.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const lowerTerm = term.toLowerCase();
    const matchingNodes = filteredData.nodes
      .filter((node) => node.name.toLowerCase().includes(lowerTerm))
      .slice(0, 10)
      .map((node) => ({
        id: node.id,
        name: node.name,
        type: node.type,
      }));

    setSuggestions(matchingNodes);
    setShowSuggestions(matchingNodes.length > 0);
  };

  // Handle search input change with debouncing
  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      generateSuggestions(value);
    }, 200);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    // Find the node in the React Flow nodes
    const node = nodes.find(n => n.id === suggestion.id);
    if (node) {
      // Set the selected node data for the details panel
      setSelectedNode({
        id: node.id,
        name: node.data.label,
        type: node.data.type,
        scope: node.data.scope,
        module: node.data.module,
        route: node.data.route,
        missing: node.data.missing,
      });

      // Select the node in React Flow (this triggers the .selected class)
      // and temporarily highlight it while dimming others
      setNodes((nds) =>
        nds.map((n) => {
          const baseClass = n.className?.replace(/\s*(highlighted|dimmed)/g, '').trim() || '';
          const isSelectedNode = n.id === suggestion.id;
          return {
            ...n,
            selected: isSelectedNode, // This is the key property that triggers React Flow's selection
            className: `${baseClass} ${isSelectedNode ? 'highlighted' : 'dimmed'}`.trim(),
          };
        })
      );

      // Highlight the edges connected to the selected node
      setEdges((eds) =>
        eds.map((edge) => {
          const baseClass = edge.className?.replace(/\s*(highlighted|dimmed)/g, '').trim() || '';
          const isConnected = edge.source === suggestion.id || edge.target === suggestion.id;
          return {
            ...edge,
            className: `${baseClass} ${isConnected ? 'highlighted' : 'dimmed'}`.trim(),
          };
        })
      );

      // Center the view on the node
      reactFlowInstance?.setCenter(node.position.x, node.position.y, {
        zoom: 1.5,
        duration: 800,
      });

      // Clear temporary highlighting after 3 seconds, but keep the node selected
      setTimeout(() => {
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            className: n.className?.replace(/\s*(highlighted|dimmed)/g, '').trim() || '',
            // Keep the selected state for the clicked node
            selected: n.id === suggestion.id,
          }))
        );
        setEdges((eds) =>
          eds.map((edge) => ({
            ...edge,
            className: edge.className?.replace(/\s*(highlighted|dimmed)/g, '').trim() || '',
          }))
        );
      }, 3000);
    }

    setSearchTerm(suggestion.name);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Click outside handler for settings panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsPanelRef.current &&
        !settingsPanelRef.current.contains(event.target as Node) &&
        showSettingsPanel
      ) {
        setShowSettingsPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsPanel]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Filter nodes and edges to exclude library and core framework components
  const filteredData = useMemo(() => {
    if (!graph) return null;

    // Filter nodes
    const filteredNodes = graph.nodes.filter((node) => !shouldFilterNode(node));

    // Create a Set of visible node IDs for efficient lookup
    const visibleNodeIds = new Set(filteredNodes.map((node) => node.id));

    // Filter edges to only include those connecting visible nodes
    const filteredEdges = graph.edges.filter(
      (edge) => visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to)
    );

    // Recalculate stats based on filtered nodes
    const filteredStats = {
      modules: filteredNodes.filter((n) => n.type === 'MODULE').length,
      providers: filteredNodes.filter((n) => n.type === 'PROVIDER').length,
      controllers: filteredNodes.filter((n) => n.type === 'CONTROLLER').length,
      routes: filteredNodes.filter((n) => n.type === 'ROUTE').length,
    };

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
      stats: filteredStats,
    };
  }, [graph]);

  // Calculate missing dependencies
  const missingDependencies = useMemo(() => {
    if (!filteredData) return [];

    return filteredData.nodes.filter((n) => n.type === 'MISSING');
  }, [filteredData]);

  // Helper function to find all nodes that depend on request-scoped nodes (implicit request-scoped)
  const findImplicitRequestScoped = useMemo(() => {
    if (!filteredData || !settings.highlightImplicitRequestScoped) return new Set<string>();

    const requestScopedIds = new Set<string>();
    const implicitRequestScopedIds = new Set<string>();

    // First, find all explicitly request-scoped nodes
    filteredData.nodes.forEach((node) => {
      if (node.scope === 'REQUEST') {
        requestScopedIds.add(node.id);
      }
    });

    // Then, find all nodes that inject request-scoped dependencies
    const hasRequestScopedDependency = (nodeId: string, visited = new Set<string>()): boolean => {
      if (visited.has(nodeId)) return false;
      visited.add(nodeId);

      if (requestScopedIds.has(nodeId)) return true;

      // Check all edges where this node is the source (i.e., it injects dependencies)
      // Edge direction: from (consumer) -> to (dependency)
      const dependencies = filteredData.edges.filter(
        (edge) => edge.from === nodeId && edge.kind === 'injects'
      );

      for (const dep of dependencies) {
        if (hasRequestScopedDependency(dep.to, visited)) {
          return true;
        }
      }

      return false;
    };

    filteredData.nodes.forEach((node) => {
      if (!requestScopedIds.has(node.id) && hasRequestScopedDependency(node.id)) {
        implicitRequestScopedIds.add(node.id);
      }
    });

    return implicitRequestScopedIds;
  }, [filteredData, settings.highlightImplicitRequestScoped]);

  // Detect circular dependencies using DFS (both module-level and provider-level)
  const circularDependencies = useMemo(() => {
    if (!filteredData || !settings.detectCircularDeps) {
      return {
        providerNodes: new Set<string>(),
        providerEdges: new Set<string>(),
        moduleNodes: new Set<string>(),
        moduleEdges: new Set<string>(),
      };
    }

    const providerCycles = { nodes: new Set<string>(), edges: new Set<string>() };
    const moduleCycles = { nodes: new Set<string>(), edges: new Set<string>() };

    // Detect provider-level circular dependencies (injects edges)
    const detectProviderCycles = () => {
      const visited = new Set<string>();
      const recursionStack = new Set<string>();
      const edgeMap = new Map<string, string[]>();

      // Build adjacency list for injects edges only
      filteredData.edges.forEach((edge) => {
        if (edge.kind === 'injects') {
          if (!edgeMap.has(edge.from)) {
            edgeMap.set(edge.from, []);
          }
          edgeMap.get(edge.from)!.push(edge.to);
        }
      });

      const detectCycle = (nodeId: string, path: string[] = []): boolean => {
        if (recursionStack.has(nodeId)) {
          // Found a cycle - mark all nodes and edges in the cycle
          const cycleStartIndex = path.indexOf(nodeId);
          for (let i = cycleStartIndex; i < path.length; i++) {
            providerCycles.nodes.add(path[i]);
            if (i < path.length - 1) {
              providerCycles.edges.add(`${path[i]}-${path[i + 1]}`);
            }
          }
          providerCycles.edges.add(`${path[path.length - 1]}-${nodeId}`);
          return true;
        }

        if (visited.has(nodeId)) {
          return false;
        }

        visited.add(nodeId);
        recursionStack.add(nodeId);
        path.push(nodeId);

        const neighbors = edgeMap.get(nodeId) || [];
        for (const neighbor of neighbors) {
          detectCycle(neighbor, [...path]);
        }

        recursionStack.delete(nodeId);
        return false;
      };

      // Check all nodes
      filteredData.nodes.forEach((node) => {
        if (!visited.has(node.id)) {
          detectCycle(node.id);
        }
      });
    };

    // Detect module-level circular dependencies (import edges)
    const detectModuleCycles = () => {
      const visited = new Set<string>();
      const recursionStack = new Set<string>();
      const edgeMap = new Map<string, string[]>();

      // Build adjacency list for import edges only
      filteredData.edges.forEach((edge) => {
        if (edge.kind === 'import') {
          if (!edgeMap.has(edge.from)) {
            edgeMap.set(edge.from, []);
          }
          edgeMap.get(edge.from)!.push(edge.to);
        }
      });

      const detectCycle = (nodeId: string, path: string[] = []): boolean => {
        if (recursionStack.has(nodeId)) {
          // Found a cycle - mark all nodes and edges in the cycle
          const cycleStartIndex = path.indexOf(nodeId);
          for (let i = cycleStartIndex; i < path.length; i++) {
            moduleCycles.nodes.add(path[i]);
            if (i < path.length - 1) {
              moduleCycles.edges.add(`${path[i]}-${path[i + 1]}`);
            }
          }
          moduleCycles.edges.add(`${path[path.length - 1]}-${nodeId}`);
          return true;
        }

        if (visited.has(nodeId)) {
          return false;
        }

        visited.add(nodeId);
        recursionStack.add(nodeId);
        path.push(nodeId);

        const neighbors = edgeMap.get(nodeId) || [];
        for (const neighbor of neighbors) {
          detectCycle(neighbor, [...path]);
        }

        recursionStack.delete(nodeId);
        return false;
      };

      // Check all module nodes
      filteredData.nodes.forEach((node) => {
        if (node.type === 'MODULE' && !visited.has(node.id)) {
          detectCycle(node.id);
        }
      });
    };

    detectProviderCycles();
    detectModuleCycles();

    return {
      providerNodes: providerCycles.nodes,
      providerEdges: providerCycles.edges,
      moduleNodes: moduleCycles.nodes,
      moduleEdges: moduleCycles.edges,
    };
  }, [filteredData, settings.detectCircularDeps]);

  // Convert graph data to React Flow nodes and edges
  useEffect(() => {
    if (!filteredData) return;

    // Create React Flow nodes with initial highlighting classes based on settings
    const flowNodes: Node<CustomNodeData>[] = filteredData.nodes.map((node) => {
      let highlightClasses = '';

      // Apply request-scoped highlighting
      if (settings.highlightRequestScoped && node.scope === 'REQUEST') {
        highlightClasses = `${highlightClasses} request-scoped`.trim();
      }

      // Apply implicit request-scoped highlighting
      if (settings.highlightImplicitRequestScoped && findImplicitRequestScoped.has(node.id)) {
        highlightClasses = `${highlightClasses} implicit-request-scoped`.trim();
      }

      // Apply circular dependency highlighting
      if (settings.detectCircularDeps) {
        if (circularDependencies.providerNodes.has(node.id)) {
          highlightClasses = `${highlightClasses} circular-dependency-provider`.trim();
        }
        if (circularDependencies.moduleNodes.has(node.id)) {
          highlightClasses = `${highlightClasses} circular-dependency-module`.trim();
        }
      }

      return {
        id: node.id,
        type: 'custom',
        position: { x: 0, y: 0 }, // Will be set by layout
        data: {
          label: node.name,
          type: node.type,
          scope: node.scope,
          module: node.module,
          route: node.route,
          missing: node.missing,
          highlightClasses,
        },
      };
    });

    // Create React Flow edges with initial className based on settings
    const flowEdges: Edge<CustomEdgeData>[] = filteredData.edges.map((edge, idx) => {
      let className = '';

      // Apply circular dependency highlighting for edges
      if (settings.detectCircularDeps) {
        const edgeKey = `${edge.from}-${edge.to}`;
        if (circularDependencies.providerEdges.has(edgeKey)) {
          className = `${className} circular-dependency-provider`.trim();
        }
        if (circularDependencies.moduleEdges.has(edgeKey)) {
          className = `${className} circular-dependency-module`.trim();
        }
      }

      return {
        id: `edge-${idx}`,
        source: edge.from,
        target: edge.to,
        type: 'custom',
        data: {
          kind: edge.kind,
        },
        markerEnd: {
          type: 'arrowclosed',
          width: 15,
          height: 15,
        },
        className,
      };
    });

    // Apply dagre layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      flowNodes,
      flowEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    // Fit view after layout
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2 });
    }, 0);
  }, [filteredData, reactFlowInstance, setNodes, setEdges, settings, findImplicitRequestScoped, circularDependencies]);



  // Apply request-scoped highlighting (when settings change)
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        let highlightClasses = node.data.highlightClasses?.replace(/\s*(request-scoped|implicit-request-scoped)/g, '').trim() || '';

        if (settings.highlightRequestScoped && node.data.scope === 'REQUEST') {
          highlightClasses = `${highlightClasses} request-scoped`.trim();
        }

        if (settings.highlightImplicitRequestScoped && findImplicitRequestScoped.has(node.id)) {
          highlightClasses = `${highlightClasses} implicit-request-scoped`.trim();
        }

        return {
          ...node,
          data: {
            ...node.data,
            highlightClasses,
          },
        };
      })
    );
  }, [settings.highlightRequestScoped, settings.highlightImplicitRequestScoped, findImplicitRequestScoped, setNodes]);

  // Apply circular dependency highlighting (when settings change)
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        let highlightClasses = node.data.highlightClasses?.replace(/\s*(circular-dependency-provider|circular-dependency-module)/g, '').trim() || '';

        if (settings.detectCircularDeps) {
          if (circularDependencies.providerNodes.has(node.id)) {
            highlightClasses = `${highlightClasses} circular-dependency-provider`.trim();
          }
          if (circularDependencies.moduleNodes.has(node.id)) {
            highlightClasses = `${highlightClasses} circular-dependency-module`.trim();
          }
        }

        return {
          ...node,
          data: {
            ...node.data,
            highlightClasses,
          },
        };
      })
    );

    setEdges((eds) =>
      eds.map((edge) => {
        let className = edge.className?.replace(/\s*(circular-dependency-provider|circular-dependency-module)/g, '').trim() || '';

        if (settings.detectCircularDeps) {
          const edgeKey = `${edge.source}-${edge.target}`;
          if (circularDependencies.providerEdges.has(edgeKey)) {
            className = `${className} circular-dependency-provider`.trim();
          }
          if (circularDependencies.moduleEdges.has(edgeKey)) {
            className = `${className} circular-dependency-module`.trim();
          }
        }

        return {
          ...edge,
          className,
        };
      })
    );
  }, [settings.detectCircularDeps, circularDependencies, setNodes, setEdges]);

  // Highlight nodes with missing dependencies
  useEffect(() => {
    if (!filteredData) return;

    const missingNodes = filteredData.nodes.filter((n) => n.type === 'MISSING');
    const nodesWithMissingDeps = new Set<string>();

    if (missingNodes.length > 0) {
      missingNodes.forEach((missingNode) => {
        const incomingEdges = filteredData.edges.filter(
          (e) => e.to === missingNode.id && e.kind === 'missing'
        );
        incomingEdges.forEach((edge) => {
          nodesWithMissingDeps.add(edge.from);
        });
      });
    }

    setNodes((nds) =>
      nds.map((node) => {
        let className = node.className?.replace(/\s*has-missing-dependency/g, '').trim() || '';
        if (nodesWithMissingDeps.has(node.id)) {
          className = `${className} has-missing-dependency`.trim();
        }
        return {
          ...node,
          className,
        };
      })
    );
  }, [filteredData, setNodes]);

  const handleSearch = () => {
    if (!searchTerm) return;

    const matchingNodes = nodes.filter((node) =>
      node.data.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (matchingNodes.length > 0) {
      const matchingNodeIds = new Set(matchingNodes.map(n => n.id));

      // Highlight matching nodes and dim others
      setNodes((nds) =>
        nds.map((node) => {
          const isMatch = matchingNodeIds.has(node.id);
          const baseClass = node.className?.replace(/\s*(highlighted|dimmed)/g, '').trim() || '';
          return {
            ...node,
            className: `${baseClass} ${isMatch ? 'highlighted' : 'dimmed'}`.trim(),
          };
        })
      );

      // Highlight edges connected to matching nodes
      setEdges((eds) =>
        eds.map((edge) => {
          const baseClass = edge.className?.replace(/\s*(highlighted|dimmed)/g, '').trim() || '';
          const isConnected = matchingNodeIds.has(edge.source) || matchingNodeIds.has(edge.target);
          return {
            ...edge,
            className: `${baseClass} ${isConnected ? 'highlighted' : 'dimmed'}`.trim(),
          };
        })
      );

      reactFlowInstance.fitView({ nodes: matchingNodes, padding: 0.2 });

      // Clear highlighting after 3 seconds
      setTimeout(() => {
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            className: n.className?.replace(/\s*(highlighted|dimmed)/g, '').trim() || '',
          }))
        );
        setEdges((eds) =>
          eds.map((edge) => ({
            ...edge,
            className: edge.className?.replace(/\s*(highlighted|dimmed)/g, '').trim() || '',
          }))
        );
      }, 3000);
    }
  };

  const handleExportPNG = useCallback(() => {
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!viewport) return;

    const nodesBounds = getRectOfNodes(nodes);
    const transform = getTransformForBounds(
      nodesBounds,
      nodesBounds.width,
      nodesBounds.height,
      0.5,
      2
    );

    toPng(viewport, {
      backgroundColor: '#1a202c',
      width: nodesBounds.width,
      height: nodesBounds.height,
      style: {
        width: `${nodesBounds.width}px`,
        height: `${nodesBounds.height}px`,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    }).then((dataUrl) => {
      const link = document.createElement('a');
      link.download = 'graph.png';
      link.href = dataUrl;
      link.click();
    });
  }, [nodes]);



  const handleReset = () => {
    reactFlowInstance.fitView({ padding: 0.2 });
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        className: node.className?.replace(/\s*(highlighted|dimmed)/g, '').trim() || '',
      }))
    );
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        className: edge.className?.replace(/\s*(highlighted|dimmed)/g, '').trim() || '',
      }))
    );
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node<CustomNodeData>) => {
    setSelectedNode(node.data);
  }, []);

  if (!filteredData) {
    return <div className={styles.loading}>Loading graph...</div>;
  }

  return (
    <div className={styles.viewContainer}>
      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
          <div className={styles.searchInputWrapper}>
            <svg
              className={styles.searchIcon}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                  setShowSuggestions(false);
                }
              }}
              onFocus={() => {
                if (searchTerm.trim() && suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              className={styles.searchInput}
            />
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={searchDropdownRef}
              className={styles.searchSuggestions}
            >
              {suggestions.map((suggestion) => {
                const getNodeIcon = (type: string) => {
                  switch (type) {
                    case 'module':
                      return '📦';
                    case 'controller':
                      return '🎮';
                    case 'provider':
                      return '⚙️';
                    case 'route':
                      return '🔗';
                    default:
                      return '📄';
                  }
                };

                return (
                  <div
                    key={suggestion.id}
                    className={styles.searchSuggestionItem}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className={styles.suggestionContent}>
                      <span className={styles.suggestionIcon}>
                        {getNodeIcon(suggestion.type)}
                      </span>
                      <span className={styles.suggestionName}>{suggestion.name}</span>
                    </div>
                    <span
                      className={styles.suggestionType}
                      data-type={suggestion.type}
                    >
                      {suggestion.type}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <Button onClick={handleSearch} variant="secondary">Search</Button>
        <Button onClick={handleReset} variant="secondary">Reset</Button>
        <Button onClick={handleExportPNG} variant="secondary">Export PNG</Button>

        {/* Settings Dropdown Menu */}
        <DropdownMenu open={showSettingsPanel} onOpenChange={setShowSettingsPanel}>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" title="Graph Settings">
              ⚙️ Settings
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent ref={settingsPanelRef} align="end" className={`w-80 ${styles.settingsDropdown}`}>
            <DropdownMenuLabel className={styles.settingsHeader}>
              <span className={styles.settingsHeaderIcon}>⚙️</span>
              Graph Options
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <div className={styles.settingsContent}>
              <label className={styles.settingItem}>
                <Checkbox
                  checked={settings.highlightRequestScoped}
                  onCheckedChange={(checked) => updateSetting('highlightRequestScoped', checked as boolean)}
                  className={styles.settingCheckbox}
                />
                <div className={styles.settingInfo}>
                  <div className={styles.settingLabel}>
                    <span className={styles.settingIcon}>🎯</span>
                    <span>Highlight request-scoped</span>
                  </div>
                  <span className={styles.settingDescription}>
                    Highlight explicitly or implicitly request-scoped classes.
                  </span>
                </div>
              </label>

              <label className={styles.settingItem}>
                <Checkbox
                  checked={settings.detectCircularDeps}
                  onCheckedChange={(checked) => updateSetting('detectCircularDeps', checked as boolean)}
                  className={styles.settingCheckbox}
                />
                <div className={styles.settingInfo}>
                  <div className={styles.settingLabel}>
                    <span className={styles.settingIcon}>🔄</span>
                    <span>Detect circular dependencies</span>
                  </div>
                  <span className={styles.settingDescription}>
                    Find and fix circular dependencies in your graph.
                  </span>
                </div>
              </label>

              <label className={styles.settingItem}>
                <Checkbox
                  checked={settings.lockNodes}
                  onCheckedChange={(checked) => updateSetting('lockNodes', checked as boolean)}
                  className={styles.settingCheckbox}
                />
                <div className={styles.settingInfo}>
                  <div className={styles.settingLabel}>
                    <span className={styles.settingIcon}>🔒</span>
                    <span>Lock nodes</span>
                  </div>
                  <span className={styles.settingDescription}>
                    Make nodes non-movable.
                  </span>
                </div>
              </label>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Error Count Badge */}
        {missingDependencies.length > 0 ? (
          <Badge
            variant="error"
            className="ml-2 cursor-pointer px-3 py-1.5 text-sm"
            onClick={() => setShowDiagnosticsModal(true)}
            title="Click to view missing dependencies"
          >
            ⚠️ {missingDependencies.length} {missingDependencies.length === 1 ? 'Error' : 'Errors'}
          </Badge>
        ) : (
          <Badge variant="success" className="ml-2 px-3 py-1.5 text-sm">
            ✓ No errors
          </Badge>
        )}

      </div>

      <div className={styles.graphWithPanel}>
        <div className={styles.graphContainer}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            nodesDraggable={!settings.lockNodes}
            nodesConnectable={false}
            elementsSelectable={true}
            minZoom={0.1}
            maxZoom={2}
          >
            <Background />
            <MiniMap
              nodeColor={(node) => {
                const type = (node.data as CustomNodeData).type;
                switch (type) {
                  case 'MODULE': return '#4a5568';
                  case 'CONTROLLER': return '#4a4a5e';
                  case 'PROVIDER': return '#3e4451';
                  case 'ROUTE': return '#424856';
                  case 'MISSING': return '#DC2626';
                  default: return '#3e4451';
                }
              }}
              maskColor="rgba(26, 32, 44, 0.8)"
            />
          </ReactFlow>
        {selectedNode && (
          <div className={styles.nodeDetails}>
            <h3>Node Details</h3>
            <div className={styles.detailRow}>
              <span className="label">Name:</span>
              <span className="value">{selectedNode.label}</span>
            </div>
            <div className={styles.detailRow}>
              <span className="label">Type:</span>
              <span className="value">{selectedNode.type}</span>
            </div>
            {selectedNode.scope && (
              <div className={styles.detailRow}>
                <span className="label">Scope:</span>
                <span className="value">{selectedNode.scope}</span>
              </div>
            )}
            {selectedNode.module && (
              <div className={styles.detailRow}>
                <span className="label">Module:</span>
                <span className="value">{selectedNode.module}</span>
              </div>
            )}
            {selectedNode.route && (
              <div className={styles.detailRow}>
                <span className="label">Route:</span>
                <span className="value">
                  {selectedNode.route.method} {selectedNode.route.path}
                </span>
              </div>
            )}
            {selectedNode.missing && (
              <>
                <div className={`${styles.detailRow} ${styles.missingDependencySection}`}>
                  <span className={`label ${styles.missingDependencyLabel}`}>⚠️ Missing Dependency</span>
                </div>
                <div className={styles.detailRow}>
                  <span className="label">Required By:</span>
                  <div className={`value ${styles.missingDependencyList}`}>
                    {selectedNode.missing.requiredBy.map((nodeId: string) => {
                      const node = filteredData?.nodes.find((n) => n.id === nodeId);
                      return (
                        <span key={nodeId} className={styles.missingDependencyItem}>
                          • {node?.name || nodeId}
                        </span>
                      );
                    })}
                  </div>
                </div>
                {selectedNode.missing.suggestedFix && (
                  <div className={styles.detailRow}>
                    <span className="label">Suggested Fix:</span>
                    <span className={`value ${styles.suggestedFix}`}>
                      {selectedNode.missing.suggestedFix}
                    </span>
                  </div>
                )}
              </>
            )}
            <button className={styles.nodeDetailsCloseButton} onClick={() => {
              setSelectedNode(null);
              // Deselect all nodes in React Flow
              setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
            }}>Close</button>
          </div>
        )}
        </div>
      </div>

      {/* Diagnostics Modal */}
      <Dialog open={showDiagnosticsModal} onOpenChange={setShowDiagnosticsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className={styles.diagnosticsTitle}>
              ⚠️ Graph Diagnostics
            </DialogTitle>
          </DialogHeader>

          <div className={styles.diagnosticsContent}>
            <p className={styles.diagnosticsDescription}>
              Found <strong>{missingDependencies.length}</strong> missing{' '}
              {missingDependencies.length === 1 ? 'dependency' : 'dependencies'}:
            </p>

            <div className={styles.diagnosticsList}>
              {missingDependencies.map((missingNode, index) => {
                const requiredByNodes = missingNode.missing?.requiredBy.map((nodeId) =>
                  filteredData?.nodes.find((n) => n.id === nodeId)
                ).filter(Boolean);

                return (
                  <div
                    key={missingNode.id}
                    className={styles.diagnosticItem}
                  >
                    <div className={styles.diagnosticItemHeader}>
                      <span className={styles.diagnosticItemType}>
                        {index + 1}.
                      </span>
                      <span className={styles.diagnosticItemTitle}>
                        {missingNode.name}
                      </span>
                    </div>

                    <div className={styles.diagnosticItemRequiredBy}>
                      <span className={styles.diagnosticItemRequiredByTitle}>Required by:</span>
                      <div className={styles.diagnosticItemRequiredByList}>
                        {requiredByNodes?.map((node) => (
                          <div
                            key={node?.id}
                            className={styles.diagnosticItemRequiredByItem}
                          >
                            {node?.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    {missingNode.missing?.suggestedFix && (
                      <div className={styles.diagnosticItemSuggestedFix}>
                        <span className={styles.diagnosticItemSuggestedFixLabel}>💡 Suggested Fix:</span>
                        <div className={styles.diagnosticItemSuggestedFixText}>
                          {missingNode.missing.suggestedFix}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.diagnosticsActions}>
              <Button
                onClick={() => setShowDiagnosticsModal(false)}
                variant="secondary"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Wrapper component with ReactFlowProvider
function GraphView() {
  return (
    <ReactFlowProvider>
      <GraphViewInner />
    </ReactFlowProvider>
  );
}

export default GraphView;
