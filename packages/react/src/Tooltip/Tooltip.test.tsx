import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { test, expect, vi, afterEach } from 'vitest';
import { Tooltip, TooltipTrigger, TooltipContent } from './index';

expect.extend(toHaveNoViolations);

function Basic(props: Partial<React.ComponentProps<typeof Tooltip>> = {}) {
  return (
    <Tooltip delayDuration={0} {...props}>
      <TooltipTrigger>
        <button type="button">Save</button>
      </TooltipTrigger>
      <TooltipContent>Saves your changes</TooltipContent>
    </Tooltip>
  );
}

afterEach(() => {
  vi.useRealTimers();
});

test('shows on focus, hides on blur', async () => {
  const user = userEvent.setup();
  render(<Basic />);
  const trigger = screen.getByRole('button', { name: 'Save' });

  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

  await user.tab();
  expect(trigger).toHaveFocus();
  expect(await screen.findByRole('tooltip')).toBeVisible();

  await user.tab();
  await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
});

test('shows on hover after delayDuration', async () => {
  vi.useFakeTimers();
  render(<Basic delayDuration={300} />);
  const trigger = screen.getByRole('button', { name: 'Save' });

  await act(async () => {
    fireEvent.mouseEnter(trigger);
  });
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

  await act(async () => {
    await vi.advanceTimersByTimeAsync(300);
  });
  expect(screen.getByRole('tooltip')).toBeVisible();
});

test('Escape dismisses an open tooltip', async () => {
  const user = userEvent.setup();
  render(<Basic />);
  await user.tab();
  expect(await screen.findByRole('tooltip')).toBeVisible();

  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
});

test('disabled tooltip never shows', async () => {
  const user = userEvent.setup();
  render(<Basic disabled />);
  await user.tab();
  await new Promise((r) => setTimeout(r, 50));
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
});

test('trigger has aria-describedby only while open', async () => {
  const user = userEvent.setup();
  render(<Basic />);
  const trigger = screen.getByRole('button', { name: 'Save' });
  expect(trigger).not.toHaveAttribute('aria-describedby');

  await user.tab();
  const tooltip = await screen.findByRole('tooltip');
  expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
});

test('has no axe violations while open', async () => {
  const user = userEvent.setup();
  const { container } = render(<Basic />);
  await user.tab();
  await screen.findByRole('tooltip');
  expect(await axe(container)).toHaveNoViolations();
});
