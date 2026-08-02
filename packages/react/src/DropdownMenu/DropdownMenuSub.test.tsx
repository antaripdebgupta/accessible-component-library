import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { test, expect } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './index';

function SubMenuFixture() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button type="button">Open</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Email</DropdownMenuItem>
            <DropdownMenuItem>Message</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem>Team</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

test('clicking sub trigger opens submenu', async () => {
  const user = userEvent.setup();
  render(<SubMenuFixture />);
  await user.click(screen.getByRole('button', { name: 'Open' }));
  await screen.findByRole('menu');

  await user.click(screen.getByRole('menuitem', { name: /Invite users/i }));

  const menus = screen.getAllByRole('menu');
  expect(menus).toHaveLength(2);
  expect(screen.getByRole('menuitem', { name: 'Email' })).toBeInTheDocument();
});

test('ArrowRight on sub trigger opens submenu and focuses first item', async () => {
  const user = userEvent.setup();
  render(<SubMenuFixture />);
  await user.click(screen.getByRole('button', { name: 'Open' }));
  await screen.findByRole('menu');

  await user.keyboard('{ArrowDown}');
  await user.keyboard('{ArrowDown}');
  await user.keyboard('{ArrowRight}');

  expect(screen.getByRole('menuitem', { name: 'Email' })).toHaveFocus();
});

test('ArrowDown inside submenu stays in submenu', async () => {
  const user = userEvent.setup();
  render(<SubMenuFixture />);
  await user.click(screen.getByRole('button', { name: 'Open' }));
  await screen.findByRole('menu');

  await user.keyboard('{ArrowDown}');
  await user.keyboard('{ArrowDown}');
  await user.keyboard('{ArrowRight}');
  await user.keyboard('{ArrowDown}');

  expect(screen.getByRole('menuitem', { name: 'Message' })).toHaveFocus();
});
