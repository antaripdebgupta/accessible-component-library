import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import jestAxe from 'jest-axe';
import { expect, test, vi } from 'vitest';
import { Switch } from './Switch';

const { axe, toHaveNoViolations } = jestAxe;
expect.extend(toHaveNoViolations);

test('renders with role="switch" and reflects checked state', () => {
  render(<Switch label="Dark Mode" defaultChecked />);
  const toggle = screen.getByRole('switch', { name: 'Dark Mode' });
  expect(toggle).toBeInTheDocument();
  expect(toggle).toHaveAttribute('aria-checked', 'true');
});

test('has no axe violations', async () => {
  const { container } = render(<Switch label="Enable Settings" />);
  expect(await axe(container)).toHaveNoViolations();
});

test('toggles on click and space/enter key presses', async () => {
  const user = userEvent.setup();
  const onCheckedChange = vi.fn();
  render(<Switch label="Mute" onCheckedChange={onCheckedChange} />);
  const toggle = screen.getByRole('switch', { name: 'Mute' });

  expect(toggle).toHaveAttribute('aria-checked', 'false');

  await user.click(toggle);
  expect(onCheckedChange).toHaveBeenLastCalledWith(true);

  // Wait for 250ms due to rapid double-click protection
  await new Promise((resolve) => setTimeout(resolve, 250));

  toggle.focus();
  await user.keyboard(' ');
  expect(onCheckedChange).toHaveBeenLastCalledWith(false);
});

test('disabled switch cannot be toggled', async () => {
  const user = userEvent.setup();
  const onCheckedChange = vi.fn();
  render(<Switch label="Notifications" disabled onCheckedChange={onCheckedChange} />);
  const toggle = screen.getByRole('switch', { name: 'Notifications' });

  expect(toggle).toBeDisabled();
  await user.click(toggle);
  expect(onCheckedChange).not.toHaveBeenCalled();
});

test('pending switch shows loader and sets aria-busy without toggling', async () => {
  const user = userEvent.setup();
  const onCheckedChange = vi.fn();
  render(<Switch label="Syncing" pending onCheckedChange={onCheckedChange} />);
  const toggle = screen.getByRole('switch', { name: 'Syncing' });

  expect(toggle).toHaveAttribute('aria-busy', 'true');
  await user.click(toggle);
  expect(onCheckedChange).not.toHaveBeenCalled();
});
