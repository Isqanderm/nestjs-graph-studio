import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import CustomEdge from '../CustomEdge';
import { Position } from 'reactflow';
import { EdgeKind } from '../../types';

describe('CustomEdge', () => {
  const baseProps = {
    id: 'edge-1',
    sourceX: 100,
    sourceY: 100,
    targetX: 200,
    targetY: 200,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    source: 'node-1',
    target: 'node-2',
    markerEnd: 'url(#arrow)',
  };

  it('should render edge with default kind', () => {
    const { container } = render(
      <svg>
        <CustomEdge {...baseProps} data={{ kind: 'default' as EdgeKind }} />
      </svg>
    );

    const edge = container.querySelector('.custom-edge');
    expect(edge).toBeTruthy();
    expect(edge?.classList.contains('edge-kind-default')).toBe(true);
  });

  it('should render edge with export kind', () => {
    const { container } = render(
      <svg>
        <CustomEdge {...baseProps} data={{ kind: 'export' }} />
      </svg>
    );

    const edge = container.querySelector('.custom-edge');
    expect(edge).toBeTruthy();
    expect(edge?.classList.contains('edge-kind-export')).toBe(true);
  });

  it('should render edge with import kind', () => {
    const { container } = render(
      <svg>
        <CustomEdge {...baseProps} data={{ kind: 'import' }} />
      </svg>
    );

    const edge = container.querySelector('.custom-edge');
    expect(edge).toBeTruthy();
    expect(edge?.classList.contains('edge-kind-import')).toBe(true);
  });

  it('should render edge with injects kind', () => {
    const { container } = render(
      <svg>
        <CustomEdge {...baseProps} data={{ kind: 'injects' }} />
      </svg>
    );

    const edge = container.querySelector('.custom-edge');
    expect(edge).toBeTruthy();
    expect(edge?.classList.contains('edge-kind-injects')).toBe(true);
  });

  it('should render edge with provides kind', () => {
    const { container } = render(
      <svg>
        <CustomEdge {...baseProps} data={{ kind: 'provides' }} />
      </svg>
    );

    const edge = container.querySelector('.custom-edge');
    expect(edge).toBeTruthy();
    expect(edge?.classList.contains('edge-kind-provides')).toBe(true);
  });

  it('should render edge with guards kind', () => {
    const { container } = render(
      <svg>
        <CustomEdge {...baseProps} data={{ kind: 'guards' }} />
      </svg>
    );

    const edge = container.querySelector('.custom-edge');
    expect(edge).toBeTruthy();
    expect(edge?.classList.contains('edge-kind-guards')).toBe(true);
  });

  it('should render edge with interceptors kind', () => {
    const { container } = render(
      <svg>
        <CustomEdge {...baseProps} data={{ kind: 'interceptors' }} />
      </svg>
    );

    const edge = container.querySelector('.custom-edge');
    expect(edge).toBeTruthy();
    expect(edge?.classList.contains('edge-kind-interceptors')).toBe(true);
  });

  it('should render edge with pipes kind', () => {
    const { container } = render(
      <svg>
        <CustomEdge {...baseProps} data={{ kind: 'pipes' }} />
      </svg>
    );

    const edge = container.querySelector('.custom-edge');
    expect(edge).toBeTruthy();
    expect(edge?.classList.contains('edge-kind-pipes')).toBe(true);
  });

  it('should render edge with filters kind', () => {
    const { container } = render(
      <svg>
        <CustomEdge {...baseProps} data={{ kind: 'filters' }} />
      </svg>
    );

    const edge = container.querySelector('.custom-edge');
    expect(edge).toBeTruthy();
    expect(edge?.classList.contains('edge-kind-filters')).toBe(true);
  });

  it('should render edge without data', () => {
    const { container } = render(
      <svg>
        <CustomEdge {...baseProps} data={undefined} />
      </svg>
    );

    const edge = container.querySelector('.custom-edge');
    expect(edge).toBeTruthy();
    expect(edge?.classList.contains('edge-kind-default')).toBe(true);
  });

  it('should render path element with correct id', () => {
    const { container } = render(
      <svg>
        <CustomEdge {...baseProps} data={{ kind: 'export' }} />
      </svg>
    );

    const path = container.querySelector(`#${baseProps.id}`);
    expect(path).toBeTruthy();
    expect(path?.tagName).toBe('path');
  });

  it('should render path with react-flow__edge-path class', () => {
    const { container } = render(
      <svg>
        <CustomEdge {...baseProps} data={{ kind: 'export' }} />
      </svg>
    );

    const path = container.querySelector('.react-flow__edge-path');
    expect(path).toBeTruthy();
  });

  it('should apply markerEnd to path', () => {
    const { container } = render(
      <svg>
        <CustomEdge {...baseProps} data={{ kind: 'export' }} />
      </svg>
    );

    const path = container.querySelector('path');
    expect(path?.getAttribute('marker-end')).toBe('url(#arrow)');
  });

  it('should render with different source and target positions', () => {
    const { container } = render(
      <svg>
        <CustomEdge
          {...baseProps}
          sourcePosition={Position.Bottom}
          targetPosition={Position.Top}
          data={{ kind: 'import' }}
        />
      </svg>
    );

    const edge = container.querySelector('.custom-edge');
    expect(edge).toBeTruthy();
  });

  it('should render with different coordinates', () => {
    const { container } = render(
      <svg>
        <CustomEdge
          {...baseProps}
          sourceX={50}
          sourceY={50}
          targetX={300}
          targetY={300}
          data={{ kind: 'injects' }}
        />
      </svg>
    );

    const path = container.querySelector('path');
    expect(path).toBeTruthy();
    expect(path?.getAttribute('d')).toBeTruthy();
  });

  it('should have displayName set', () => {
    expect(CustomEdge.displayName).toBe('CustomEdge');
  });

  it('should render edge with all position combinations', () => {
    const positions = [Position.Top, Position.Right, Position.Bottom, Position.Left];
    
    positions.forEach(sourcePos => {
      positions.forEach(targetPos => {
        const { container } = render(
          <svg>
            <CustomEdge
              {...baseProps}
              sourcePosition={sourcePos}
              targetPosition={targetPos}
              data={{ kind: 'export' }}
            />
          </svg>
        );

        const edge = container.querySelector('.custom-edge');
        expect(edge).toBeTruthy();
      });
    });
  });

  it('should render edge with zero coordinates', () => {
    const { container } = render(
      <svg>
        <CustomEdge
          {...baseProps}
          sourceX={0}
          sourceY={0}
          targetX={0}
          targetY={0}
          data={{ kind: 'export' }}
        />
      </svg>
    );

    const edge = container.querySelector('.custom-edge');
    expect(edge).toBeTruthy();
  });

  it('should render edge with negative coordinates', () => {
    const { container } = render(
      <svg>
        <CustomEdge
          {...baseProps}
          sourceX={-100}
          sourceY={-100}
          targetX={-200}
          targetY={-200}
          data={{ kind: 'import' }}
        />
      </svg>
    );

    const edge = container.querySelector('.custom-edge');
    expect(edge).toBeTruthy();
  });

  it('should render edge with large coordinates', () => {
    const { container } = render(
      <svg>
        <CustomEdge
          {...baseProps}
          sourceX={10000}
          sourceY={10000}
          targetX={20000}
          targetY={20000}
          data={{ kind: 'provides' }}
        />
      </svg>
    );

    const edge = container.querySelector('.custom-edge');
    expect(edge).toBeTruthy();
  });
});

