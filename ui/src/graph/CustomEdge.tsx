import { memo } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { EdgeKind } from '../types';

interface CustomEdgeData {
  kind: EdgeKind;
}

const CustomEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps<CustomEdgeData>) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeClassName = `custom-edge edge-kind-${data?.kind || 'default'}`;

  return (
    <g className={edgeClassName}>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
    </g>
  );
});

CustomEdge.displayName = 'CustomEdge';

export default CustomEdge;

