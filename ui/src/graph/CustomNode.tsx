import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeType } from '../types';

interface CustomNodeData {
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

const CustomNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => {
  const getNodeClassName = () => {
    const classes = ['custom-node', `node-type-${data.type.toLowerCase()}`];
    if (selected) classes.push('selected');
    if (data.highlightClasses) {
      classes.push(data.highlightClasses);
    }
    return classes.join(' ');
  };

  return (
    <div className={getNodeClassName()}>
      <Handle type="target" position={Position.Left} className="node-handle" />

      {/* Execution Order Badge */}
      {data.executionOrder !== undefined && (
        <div className="execution-order-badge">
          {data.executionOrder}
        </div>
      )}

      {/* Execution Timing Badge */}
      {data.executionTiming !== undefined && data.executionTiming > 0 && (
        <div className="execution-timing-badge">
          {data.executionTiming.toFixed(1)}ms
        </div>
      )}

      <div className="node-content">
        <div className="node-label">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Right} className="node-handle" />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;

