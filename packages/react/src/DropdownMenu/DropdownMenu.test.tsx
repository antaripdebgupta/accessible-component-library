import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, test, expect, vi } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from './index';

expect.extend(toHaveNoViolations);

function Basic() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button type="button">Open menu</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem disabled>Team (disabled)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

test('clicking the trigger opens the menu and focuses the first item', async () => {
  const user = userEvent.setup();
  render(<Basic />);

  expect(screen.queryByRole('menu')).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Open menu' }));
  const menu = await screen.findByRole('menu');
  expect(menu).toBeVisible();
  expect(screen.getByRole('menuitem', { name: 'Profile' })).toHaveFocus();
});

test('ArrowDown moves focus to the next item', async () => {
  const user = userEvent.setup();
  render(<Basic />);
  await user.click(screen.getByRole('button', { name: 'Open menu' }));

  await user.keyboard('{ArrowDown}');
  expect(screen.getByRole('menuitem', { name: 'Billing' })).toHaveFocus();
});

test('Escape closes the menu and returns focus to the trigger', async () => {
  const user = userEvent.setup();
  render(<Basic />);
  const trigger = screen.getByRole('button', { name: 'Open menu' });
  await user.click(trigger);
  await screen.findByRole('menu');

  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  expect(trigger).toHaveFocus();
});

test('clicking an item selects it and closes the menu', async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  render(
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button type="button">Open menu</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={onSelect}>Profile</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  await user.click(screen.getByRole('button', { name: 'Open menu' }));
  await user.click(screen.getByRole('menuitem', { name: 'Profile' }));

  expect(onSelect).toHaveBeenCalledTimes(1);
  await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
});

test('disabled item cannot be selected', async () => {
  const user = userEvent.setup();
  render(<Basic />);
  await user.click(screen.getByRole('button', { name: 'Open menu' }));

  const disabledItem = screen.getByRole('menuitem', { name: 'Team (disabled)' });
  expect(disabledItem).toHaveAttribute('aria-disabled', 'true');
  await user.click(disabledItem);
  expect(screen.getByRole('menu')).toBeVisible();
});

test('checkbox item toggles without closing the menu', async () => {
  const user = userEvent.setup();
  function CheckboxExample() {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button type="button">Open menu</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked={false} onCheckedChange={() => {}}>
            Status bar
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  render(<CheckboxExample />);
  await user.click(screen.getByRole('button', { name: 'Open menu' }));

  const checkbox = screen.getByRole('menuitemcheckbox', { name: 'Status bar' });
  expect(checkbox).toHaveAttribute('aria-checked', 'false');
  await user.click(checkbox);
  expect(screen.getByRole('menu')).toBeVisible();
});

test('radio group only allows one selected item', async () => {
  const user = userEvent.setup();
  function RadioExample() {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button type="button">Open menu</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="light" onValueChange={() => {}}>
            <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  render(<RadioExample />);
  await user.click(screen.getByRole('button', { name: 'Open menu' }));

  expect(screen.getByRole('menuitemradio', { name: 'Light' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  expect(screen.getByRole('menuitemradio', { name: 'Dark' })).toHaveAttribute(
    'aria-checked',
    'false',
  );
});

test('has no axe violations while open', async () => {
  const user = userEvent.setup();
  const { container } = render(<Basic />);
  await user.click(screen.getByRole('button', { name: 'Open menu' }));
  await screen.findByRole('menu');
  expect(await axe(container)).toHaveNoViolations();
});
