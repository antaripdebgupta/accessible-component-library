import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, test, expect, vi } from 'vitest';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from './index';

expect.extend(toHaveNoViolations);

function Basic(props: Partial<React.ComponentProps<typeof Dialog>> = {}) {
  return (
    <Dialog {...props}>
      <DialogTrigger>
        <button type="button">Open dialog</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Make changes to your profile.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <input type="text" defaultValue="Jane Doe" aria-label="Name" />
          <button type="button">Inner action</button>
        </DialogBody>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <button type="button">Save</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

test('clicking the trigger opens the dialog and focuses the panel', async () => {
  const user = userEvent.setup();
  render(<Basic />);

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Open dialog' }));
  const dialog = await screen.findByRole('dialog');
  expect(dialog).toBeVisible();
  expect(dialog).toHaveFocus();
});

test('dialog is labelled and described correctly', async () => {
  const user = userEvent.setup();
  render(<Basic />);
  await user.click(screen.getByRole('button', { name: 'Open dialog' }));

  const dialog = await screen.findByRole('dialog');
  const title = screen.getByText('Edit profile');
  const description = screen.getByText('Make changes to your profile.');

  expect(dialog).toHaveAttribute('aria-labelledby', title.id);
  expect(dialog).toHaveAttribute('aria-describedby', description.id);
  expect(dialog).toHaveAttribute('aria-modal', 'true');
});

test('Escape closes the dialog and restores focus to the trigger', async () => {
  const user = userEvent.setup();
  render(<Basic />);
  const trigger = screen.getByRole('button', { name: 'Open dialog' });
  await user.click(trigger);
  await screen.findByRole('dialog');

  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(trigger).toHaveFocus();
});

test('DialogClose button closes the dialog', async () => {
  const user = userEvent.setup();
  render(<Basic />);
  await user.click(screen.getByRole('button', { name: 'Open dialog' }));
  await screen.findByRole('dialog');

  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

test('built-in close button (X) closes the dialog', async () => {
  const user = userEvent.setup();
  render(<Basic />);
  await user.click(screen.getByRole('button', { name: 'Open dialog' }));
  await screen.findByRole('dialog');

  await user.click(screen.getByRole('button', { name: 'Close' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

test('showCloseButton=false hides the built-in close button', async () => {
  const user = userEvent.setup();
  render(
    <Dialog>
      <DialogTrigger>
        <button type="button">Open dialog</button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>No close button</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>,
  );
  await user.click(screen.getByRole('button', { name: 'Open dialog' }));
  await screen.findByRole('dialog');

  expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
});

test('Tab wraps focus within the dialog (focus trap)', async () => {
  const user = userEvent.setup();
  render(<Basic />);
  await user.click(screen.getByRole('button', { name: 'Open dialog' }));
  await screen.findByRole('dialog');

  const nameInput = screen.getByLabelText('Name');
  const innerAction = screen.getByRole('button', { name: 'Inner action' });
  const cancelButton = screen.getByRole('button', { name: 'Cancel' });
  const saveButton = screen.getByRole('button', { name: 'Save' });
  const closeX = screen.getByRole('button', { name: 'Close' });

  // Focus lands on the panel itself first; Tab moves into the first
  // focusable descendant.
  nameInput.focus();
  await user.tab();
  expect(innerAction).toHaveFocus();

  await user.tab();
  expect(cancelButton).toHaveFocus();

  await user.tab();
  expect(saveButton).toHaveFocus();

  await user.tab();
  expect(closeX).toHaveFocus();

  // Wraps back to the first focusable element.
  await user.tab();
  expect(nameInput).toHaveFocus();
});

test('Shift+Tab wraps focus backwards within the dialog', async () => {
  const user = userEvent.setup();
  render(<Basic />);
  await user.click(screen.getByRole('button', { name: 'Open dialog' }));
  await screen.findByRole('dialog');

  const nameInput = screen.getByLabelText('Name');
  const closeX = screen.getByRole('button', { name: 'Close' });

  nameInput.focus();
  await user.tab({ shift: true });
  expect(closeX).toHaveFocus();
});

test('body scroll is locked while open and restored on close', async () => {
  const user = userEvent.setup();
  render(<Basic />);
  expect(document.body.style.overflow).not.toBe('hidden');

  await user.click(screen.getByRole('button', { name: 'Open dialog' }));
  await screen.findByRole('dialog');
  expect(document.body.style.overflow).toBe('hidden');

  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(document.body.style.overflow).not.toBe('hidden');
});

test('has no axe violations while open', async () => {
  const user = userEvent.setup();
  const { container } = render(<Basic />);
  await user.click(screen.getByRole('button', { name: 'Open dialog' }));
  await screen.findByRole('dialog');
  expect(await axe(container)).toHaveNoViolations();
});
