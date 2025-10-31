import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import CustomNode from '../CustomNode';
import { NodeType } from '../../types';

// Mock React Flow components
vi.mock('reactflow', () => ({
  Handle: ({ type, position, className }: any) => (
    <div data-testid={`handle-${type}`} className={className} data-position={position} />
  ),
  Position: {
    Left: 'left',
    Right: 'right',
    Top: 'top',
    Bottom: 'bottom',
  },
}));

describe('CustomNode', () => {
  const baseProps = {
    id: 'node-1',
    data: {
      label: 'Test Node',
      type: 'MODULE' as NodeType,
    },
    selected: false,
    isConnectable: true,
    xPos: 0,
    yPos: 0,
    dragging: false,
    zIndex: 0,
  };

  it('should render node with label', () => {
    const { container } = render(<CustomNode {...baseProps} />);
    
    const label = container.querySelector('.node-label');
    expect(label?.textContent).toBe('Test Node');
  });

  it('should apply type-specific className', () => {
    const { container } = render(<CustomNode {...baseProps} />);
    
    const node = container.querySelector('.custom-node');
    expect(node?.classList.contains('node-type-module')).toBe(true);
  });

  it('should apply selected className when selected', () => {
    const { container } = render(<CustomNode {...baseProps} selected={true} />);
    
    const node = container.querySelector('.custom-node');
    expect(node?.classList.contains('selected')).toBe(true);
  });

  it('should not apply selected className when not selected', () => {
    const { container } = render(<CustomNode {...baseProps} selected={false} />);
    
    const node = container.querySelector('.custom-node');
    expect(node?.classList.contains('selected')).toBe(false);
  });

  it('should apply highlight classes', () => {
    const { container } = render(
      <CustomNode
        {...baseProps}
        data={{
          ...baseProps.data,
          highlightClasses: 'highlight-primary highlight-active',
        }}
      />
    );
    
    const node = container.querySelector('.custom-node');
    expect(node?.classList.contains('highlight-primary')).toBe(true);
    expect(node?.classList.contains('highlight-active')).toBe(true);
  });

  it('should render execution order badge when provided', () => {
    const { container } = render(
      <CustomNode
        {...baseProps}
        data={{
          ...baseProps.data,
          executionOrder: 5,
        }}
      />
    );
    
    const badge = container.querySelector('.execution-order-badge');
    expect(badge?.textContent).toBe('5');
  });

  it('should not render execution order badge when undefined', () => {
    const { container } = render(<CustomNode {...baseProps} />);
    
    const badge = container.querySelector('.execution-order-badge');
    expect(badge).toBeFalsy();
  });

  it('should render execution order badge with zero', () => {
    const { container } = render(
      <CustomNode
        {...baseProps}
        data={{
          ...baseProps.data,
          executionOrder: 0,
        }}
      />
    );
    
    const badge = container.querySelector('.execution-order-badge');
    expect(badge?.textContent).toBe('0');
  });

  it('should render execution timing badge when provided', () => {
    const { container } = render(
      <CustomNode
        {...baseProps}
        data={{
          ...baseProps.data,
          executionTiming: 123.456,
        }}
      />
    );
    
    const badge = container.querySelector('.execution-timing-badge');
    expect(badge?.textContent).toBe('123.5ms');
  });

  it('should not render execution timing badge when undefined', () => {
    const { container } = render(<CustomNode {...baseProps} />);
    
    const badge = container.querySelector('.execution-timing-badge');
    expect(badge).toBeFalsy();
  });

  it('should not render execution timing badge when zero', () => {
    const { container } = render(
      <CustomNode
        {...baseProps}
        data={{
          ...baseProps.data,
          executionTiming: 0,
        }}
      />
    );
    
    const badge = container.querySelector('.execution-timing-badge');
    expect(badge).toBeFalsy();
  });

  it('should not render execution timing badge when negative', () => {
    const { container } = render(
      <CustomNode
        {...baseProps}
        data={{
          ...baseProps.data,
          executionTiming: -5,
        }}
      />
    );
    
    const badge = container.querySelector('.execution-timing-badge');
    expect(badge).toBeFalsy();
  });

  it('should format execution timing to one decimal place', () => {
    const { container } = render(
      <CustomNode
        {...baseProps}
        data={{
          ...baseProps.data,
          executionTiming: 45.6789,
        }}
      />
    );
    
    const badge = container.querySelector('.execution-timing-badge');
    expect(badge?.textContent).toBe('45.7ms');
  });

  it('should render both execution badges together', () => {
    const { container } = render(
      <CustomNode
        {...baseProps}
        data={{
          ...baseProps.data,
          executionOrder: 3,
          executionTiming: 78.9,
        }}
      />
    );
    
    const orderBadge = container.querySelector('.execution-order-badge');
    const timingBadge = container.querySelector('.execution-timing-badge');
    
    expect(orderBadge?.textContent).toBe('3');
    expect(timingBadge?.textContent).toBe('78.9ms');
  });

  it('should render handles', () => {
    const { container } = render(<CustomNode {...baseProps} />);
    
    const handles = container.querySelectorAll('.node-handle');
    expect(handles.length).toBe(2);
  });

  it('should render with PROVIDER type', () => {
    const { container } = render(
      <CustomNode
        {...baseProps}
        data={{
          ...baseProps.data,
          type: 'PROVIDER',
        }}
      />
    );
    
    const node = container.querySelector('.custom-node');
    expect(node?.classList.contains('node-type-provider')).toBe(true);
  });

  it('should render with CONTROLLER type', () => {
    const { container } = render(
      <CustomNode
        {...baseProps}
        data={{
          ...baseProps.data,
          type: 'CONTROLLER',
        }}
      />
    );
    
    const node = container.querySelector('.custom-node');
    expect(node?.classList.contains('node-type-controller')).toBe(true);
  });

  it('should render with ROUTE type', () => {
    const { container } = render(
      <CustomNode
        {...baseProps}
        data={{
          ...baseProps.data,
          type: 'ROUTE',
        }}
      />
    );
    
    const node = container.querySelector('.custom-node');
    expect(node?.classList.contains('node-type-route')).toBe(true);
  });

  it('should have displayName set', () => {
    expect(CustomNode.displayName).toBe('CustomNode');
  });

  it('should render with all optional data fields', () => {
    const { container } = render(
      <CustomNode
        {...baseProps}
        data={{
          label: 'Complex Node',
          type: 'CONTROLLER',
          scope: 'REQUEST',
          module: 'AppModule',
          route: {
            method: 'GET',
            path: '/api/users',
          },
          missing: {
            requiredBy: ['UserService'],
            suggestedFix: 'Import UserModule',
          },
          highlightClasses: 'highlight-error',
          executionOrder: 10,
          executionTiming: 250.5,
          executionStage: 'GUARDS',
        }}
        selected={true}
      />
    );
    
    const node = container.querySelector('.custom-node');
    expect(node).toBeTruthy();
    expect(node?.classList.contains('selected')).toBe(true);
    expect(node?.classList.contains('highlight-error')).toBe(true);
  });

  it('should render with empty label', () => {
    const { container } = render(
      <CustomNode
        {...baseProps}
        data={{
          ...baseProps.data,
          label: '',
        }}
      />
    );
    
    const label = container.querySelector('.node-label');
    expect(label?.textContent).toBe('');
  });

  it('should render with long label', () => {
    const longLabel = 'This is a very long node label that might need to be truncated';
    const { container } = render(
      <CustomNode
        {...baseProps}
        data={{
          ...baseProps.data,
          label: longLabel,
        }}
      />
    );
    
    const label = container.querySelector('.node-label');
    expect(label?.textContent).toBe(longLabel);
  });

  it('should render with special characters in label', () => {
    const { container } = render(
      <CustomNode
        {...baseProps}
        data={{
          ...baseProps.data,
          label: 'Node<>@#$%^&*()',
        }}
      />
    );
    
    const label = container.querySelector('.node-label');
    expect(label?.textContent).toBe('Node<>@#$%^&*()');
  });
});

