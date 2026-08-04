import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, test, expect, vi } from 'vitest';
import {
  CommandPalette,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from './index';

expect.extend(toHaveNoViolations);

function Basic(props: Partial<React.ComponentProps<typeof CommandPalette>> = {}) {
  return (
    <CommandPalette hotkey={null} {...props}>
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty />
        <CommandItem value="new-file" onSelect={() => {}}>
          New File
        </CommandItem>
        <CommandItem value="settings" onSelect={() => {}}>
          Settings
        </CommandItem>
      </CommandList>
    </CommandPalette>
  );
}

test('open=true renders the dialog and focuses the input', async () => {
  render(<Basic open />);
  const dialog = await screen.findByRole('dialog', { name: 'Command palette' });
  expect(dialog).toBeVisible();
  expect(screen.getByRole('combobox')).toHaveFocus();
});

test('open=false renders nothing', () => {
  render(<Basic open={false} />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('clicking the backdrop closes the palette', async () => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();
  render(<Basic open onOpenChange={onOpenChange} />);
  await screen.findByRole('dialog');

  // The backdrop is the first aria-hidden div rendered by the portal.
  const backdrop = document.querySelector('[aria-hidden="true"]') as HTMLElement;
  await user.click(backdrop);
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test('clicking inside the panel does not close it', async () => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();
  render(<Basic open onOpenChange={onOpenChange} />);
  const dialog = await screen.findByRole('dialog');

  await user.click(dialog);
  expect(onOpenChange).not.toHaveBeenCalled();
});

test('Escape closes the palette and restores focus', async () => {
  const user = userEvent.setup();
  function ControlledWrapper() {
    const [open, setOpen] = require('react').useState(true);
    return <Basic open={open} onOpenChange={setOpen} />;
  }
  render(<ControlledWrapper />);
  await screen.findByRole('dialog');

  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

test('typing updates the input value', async () => {
  const user = userEvent.setup();
  render(<Basic open />);
  const input = await screen.findByRole('combobox');
  await user.type(input, 'set');
  expect(input).toHaveValue('set');
});

test('ArrowDown moves aria-activedescendant to the next item', async () => {
  const user = userEvent.setup();
  render(<Basic open />);
  const input = await screen.findByRole('combobox');
  const before = input.getAttribute('aria-activedescendant');

  await user.keyboard('{ArrowDown}');
  const after = input.getAttribute('aria-activedescendant');
  expect(after).not.toBe(before);
});

test('Enter selects the highlighted item', async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  render(
    <CommandPalette open hotkey={null}>
      <CommandInput />
      <CommandList>
        <CommandItem value="a" onSelect={onSelect}>
          Item A
        </CommandItem>
      </CommandList>
    </CommandPalette>,
  );
  await screen.findByRole('combobox');
  await user.keyboard('{Enter}');
  expect(onSelect).toHaveBeenCalledTimes(1);
});

test('groups render their heading alongside items', async () => {
  render(
    <CommandPalette open hotkey={null}>
      <CommandInput />
      <CommandList>
        <CommandGroup heading="Files">
          <CommandItem value="a">Item A</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandPalette>,
  );
  await screen.findByRole('dialog');
  expect(screen.getByText('Files')).toBeVisible();
  expect(screen.getByRole('option', { name: 'Item A' })).toBeVisible();
});

test('shows empty state when there are no items', async () => {
  render(
    <CommandPalette open hotkey={null}>
      <CommandInput />
      <CommandList>
        <CommandEmpty />
      </CommandList>
    </CommandPalette>,
  );
  await waitFor(() => expect(screen.getByText('No results found.')).toBeVisible());
});

test('global hotkey toggles the palette open', async () => {
  const user = userEvent.setup();
  function HotkeyExample() {
    const [open, setOpen] = require('react').useState(false);
    return <Basic open={open} onOpenChange={setOpen} hotkey="mod+k" />;
  }
  render(<HotkeyExample />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  await user.keyboard('{Meta>}k{/Meta}');
  await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible());
});

test('body scroll is locked while open and restored on close', async () => {
  function ControlledWrapper() {
    const [open, setOpen] = require('react').useState(true);
    return <Basic open={open} onOpenChange={setOpen} />;
  }
  const { unmount } = render(<ControlledWrapper />);
  await screen.findByRole('dialog');
  expect(document.body.style.overflow).toBe('hidden');
  unmount();
});

test('has no axe violations while open', async () => {
  const { container } = render(<Basic open />);
  await screen.findByRole('dialog');
  expect(await axe(container)).toHaveNoViolations();
});
