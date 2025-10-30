import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '../Dialog';

describe('Dialog', () => {
  it('should render dialog trigger', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
      </Dialog>
    );

    expect(screen.getByText('Open Dialog')).toBeTruthy();
  });

  it('should open dialog when trigger is clicked', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog content</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByText('Open'));
    expect(screen.getByText('Dialog Title')).toBeTruthy();
    expect(screen.getByText('Dialog content')).toBeTruthy();
  });

  it('should render dialog header', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Header Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByText('Open'));
    expect(screen.getByText('Header Title')).toBeTruthy();
  });

  it('should render dialog footer', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogFooter>
            <button>Cancel</button>
            <button>Confirm</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByText('Open'));
    expect(screen.getByText('Cancel')).toBeTruthy();
    expect(screen.getByText('Confirm')).toBeTruthy();
  });

  it('should close dialog when Escape key is pressed', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Content</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByText('Open'));
    expect(screen.getByText('Title')).toBeTruthy();

    // Press Escape to close
    await user.keyboard('{Escape}');

    // Dialog should be closed
    expect(screen.queryByText('Title')).toBeFalsy();
  });

  it('should support controlled mode', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    const { rerender } = render(
      <Dialog open={false} onOpenChange={onOpenChange}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    expect(screen.queryByText('Title')).toBeFalsy();

    await user.click(screen.getByText('Open'));
    expect(onOpenChange).toHaveBeenCalledWith(true);

    rerender(
      <Dialog open={true} onOpenChange={onOpenChange}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Title')).toBeTruthy();
  });

  it('should apply custom className to DialogHeader', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader className="custom-header">
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByText('Open'));
    const header = screen.getByText('Title').parentElement;
    expect(header?.classList.contains('custom-header')).toBe(true);
  });

  it('should apply custom className to DialogFooter', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogFooter className="custom-footer">
            <button>Action</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByText('Open'));
    const footer = screen.getByText('Action').parentElement;
    expect(footer?.classList.contains('custom-footer')).toBe(true);
  });

  it('should apply custom className to DialogTitle', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle className="custom-title">Custom Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByText('Open'));
    const title = screen.getByText('Custom Title');
    expect(title.classList.contains('custom-title')).toBe(true);
  });

  it('should apply custom className to DialogDescription', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription className="custom-description">
            Custom Description
          </DialogDescription>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByText('Open'));
    const description = screen.getByText('Custom Description');
    expect(description.classList.contains('custom-description')).toBe(true);
  });

  it('should have correct displayNames', () => {
    expect(DialogHeader.displayName).toBe('DialogHeader');
    expect(DialogFooter.displayName).toBe('DialogFooter');
  });

  it('should render multiple buttons in footer', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogFooter>
            <button>Button 1</button>
            <button>Button 2</button>
            <button>Button 3</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByText('Open'));
    expect(screen.getByText('Button 1')).toBeTruthy();
    expect(screen.getByText('Button 2')).toBeTruthy();
    expect(screen.getByText('Button 3')).toBeTruthy();
  });

  it('should render dialog with only title', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Only Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByText('Open'));
    expect(screen.getByText('Only Title')).toBeTruthy();
  });

  it('should render dialog with title and description', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description text</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByText('Open'));
    expect(screen.getByText('Title')).toBeTruthy();
    expect(screen.getByText('Description text')).toBeTruthy();
  });

  it('should render complex dialog structure', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open Complex Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complex Dialog</DialogTitle>
            <DialogDescription>This is a complex dialog with all components</DialogDescription>
          </DialogHeader>
          <div>Dialog body content</div>
          <DialogFooter>
            <button>Cancel</button>
            <button>Save</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByText('Open Complex Dialog'));
    expect(screen.getByText('Complex Dialog')).toBeTruthy();
    expect(screen.getByText('This is a complex dialog with all components')).toBeTruthy();
    expect(screen.getByText('Dialog body content')).toBeTruthy();
    expect(screen.getByText('Cancel')).toBeTruthy();
    expect(screen.getByText('Save')).toBeTruthy();
  });
});

