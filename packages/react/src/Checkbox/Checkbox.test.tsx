import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import jestAxe from 'jest-axe';
import { expect, test, vi } from 'vitest';
import { Checkbox } from './Checkbox';

const { axe, toHaveNoViolations } = jestAxe;
expect.extend(toHaveNoViolations);

test('renders with role="checkbox" and reflects checked state', () => {
  render(<Checkbox label="Accept Terms" defaultChecked />);
  const checkbox = screen.getByRole('checkbox', { name: 'Accept Terms' });
  expect(checkbox).toBeInTheDocument();
  expect(checkbox).toBeChecked();
});

test('has no axe violations', async () => {
  const { container } = render(<Checkbox label="Accept Terms" />);
  expect(await axe(container)).toHaveNoViolations();
});

test('toggles on click and space key press', async () => {
  const user = userEvent.setup();
  const onCheckedChange = vi.fn();
  render(<Checkbox label="Accept Terms" onCheckedChange={onCheckedChange} />);
  const checkbox = screen.getByRole('checkbox', { name: 'Accept Terms' });

  expect(checkbox).not.toBeChecked();

  await user.click(checkbox);
  expect(onCheckedChange).toHaveBeenLastCalledWith(true);

  checkbox.focus();
  await user.keyboard(' ');
  expect(onCheckedChange).toHaveBeenLastCalledWith(false);
});

test('indeterminate state sets element.indeterminate and moves to checked on click', async () => {
  const user = userEvent.setup();
  const onCheckedChange = vi.fn();
  const { container } = render(
    <Checkbox label="Accept Terms" checked="indeterminate" onCheckedChange={onCheckedChange} />,
  );
  const checkbox = screen.getByRole('checkbox', { name: 'Accept Terms' }) as HTMLInputElement;

  expect(checkbox.indeterminate).toBe(true);

  await user.click(checkbox);
  expect(onCheckedChange).toHaveBeenLastCalledWith(true);
});

test('disabled checkbox cannot be toggled', async () => {
  const user = userEvent.setup();
  const onCheckedChange = vi.fn();
  render(<Checkbox label="Accept Terms" disabled onCheckedChange={onCheckedChange} />);
  const checkbox = screen.getByRole('checkbox', { name: 'Accept Terms' });

  expect(checkbox).toBeDisabled();
  await user.click(checkbox);
  expect(onCheckedChange).not.toHaveBeenCalled();
});

test('supports description and error message via aria-describedby', () => {
  render(
    <Checkbox
      label="Accept Terms"
      description="Read terms carefully"
      error="You must accept terms"
    />,
  );
  const checkbox = screen.getByRole('checkbox', { name: 'Accept Terms' });

  const describedBy = checkbox.getAttribute('aria-describedby');
  expect(describedBy).toContain('description');
  expect(describedBy).toContain('error');
  expect(screen.getByText('Read terms carefully')).toBeInTheDocument();
  expect(screen.getByText('You must accept terms')).toBeInTheDocument();
});

test('clicking the label wraps input and text does not double fire', async () => {
  const user = userEvent.setup();
  const onCheckedChange = vi.fn();
  render(<Checkbox label="Accept Terms" onCheckedChange={onCheckedChange} />);
  const labelText = screen.getByText('Accept Terms');

  await user.click(labelText);
  expect(onCheckedChange).toHaveBeenCalledTimes(1);
  expect(onCheckedChange).toHaveBeenLastCalledWith(true);
});
