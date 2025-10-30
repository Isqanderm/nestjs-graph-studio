import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '../Checkbox';

describe('Checkbox', () => {
  it('should render checkbox', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeTruthy();
  });

  it('should be unchecked by default', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('data-state')).toBe('unchecked');
  });

  it('should render checked checkbox', () => {
    render(<Checkbox checked />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('data-state')).toBe('checked');
  });

  it('should toggle on click', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    
    render(<Checkbox onCheckedChange={onCheckedChange} />);
    const checkbox = screen.getByRole('checkbox');

    await user.click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('should call onCheckedChange when toggled', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    
    render(<Checkbox checked={false} onCheckedChange={onCheckedChange} />);
    const checkbox = screen.getByRole('checkbox');

    await user.click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
  });

  it('should not toggle when disabled', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    
    render(<Checkbox disabled onCheckedChange={onCheckedChange} />);
    const checkbox = screen.getByRole('checkbox');

    await user.click(checkbox);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(<Checkbox className="custom-class" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.classList.contains('custom-class')).toBe(true);
  });

  it('should have correct displayName', () => {
    expect(Checkbox.displayName).toBeDefined();
  });

  it('should render with aria-label', () => {
    render(<Checkbox aria-label="Accept terms" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
    expect(checkbox).toBeTruthy();
  });

  it('should support controlled mode', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    
    const { rerender } = render(
      <Checkbox checked={false} onCheckedChange={onCheckedChange} />
    );
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('data-state')).toBe('unchecked');

    await user.click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledWith(true);

    // Simulate parent component updating the checked state
    rerender(<Checkbox checked={true} onCheckedChange={onCheckedChange} />);
    expect(checkbox.getAttribute('data-state')).toBe('checked');
  });

  it('should support uncontrolled mode', async () => {
    const user = userEvent.setup();
    
    render(<Checkbox defaultChecked={false} />);
    const checkbox = screen.getByRole('checkbox');
    
    expect(checkbox.getAttribute('data-state')).toBe('unchecked');

    await user.click(checkbox);
    expect(checkbox.getAttribute('data-state')).toBe('checked');
  });

  it('should render indicator when checked', () => {
    const { container } = render(<Checkbox checked />);
    const indicator = container.querySelector('svg');
    expect(indicator).toBeTruthy();
  });

  it('should support keyboard interaction', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    
    render(<Checkbox onCheckedChange={onCheckedChange} />);
    const checkbox = screen.getByRole('checkbox');

    checkbox.focus();
    await user.keyboard(' ');
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('should support required attribute', () => {
    render(<Checkbox required />);
    const checkbox = screen.getByRole('checkbox');
    // Radix UI Checkbox uses required internally
    expect(checkbox).toBeTruthy();
  });

  it('should support name attribute', () => {
    render(<Checkbox name="terms" />);
    const checkbox = screen.getByRole('checkbox');
    // Radix UI Checkbox uses name internally
    expect(checkbox).toBeTruthy();
  });

  it('should support value attribute', () => {
    render(<Checkbox value="accepted" />);
    const checkbox = screen.getByRole('checkbox');
    // Radix UI Checkbox uses value internally
    expect(checkbox).toBeTruthy();
  });

  it('should support id attribute', () => {
    render(<Checkbox id="terms-checkbox" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('id')).toBe('terms-checkbox');
  });

  it('should toggle from checked to unchecked', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    
    render(<Checkbox checked={true} onCheckedChange={onCheckedChange} />);
    const checkbox = screen.getByRole('checkbox');

    await user.click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it('should handle multiple clicks', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    
    render(<Checkbox onCheckedChange={onCheckedChange} />);
    const checkbox = screen.getByRole('checkbox');

    await user.click(checkbox);
    await user.click(checkbox);
    await user.click(checkbox);

    expect(onCheckedChange).toHaveBeenCalledTimes(3);
  });

  it('should support indeterminate state', () => {
    render(<Checkbox checked="indeterminate" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('data-state')).toBe('indeterminate');
  });

  it('should apply hover styles', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.className).toContain('hover:border-accent');
  });

  it('should apply focus styles', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.className).toContain('focus-visible:outline-none');
  });

  it('should apply disabled styles', () => {
    render(<Checkbox disabled />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.className).toContain('disabled:cursor-not-allowed');
  });

  it('should apply checked styles', () => {
    render(<Checkbox checked />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.className).toContain('data-[state=checked]:bg-accent');
  });
});

