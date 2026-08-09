import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import jestAxe from 'jest-axe';
import { expect, test, vi } from 'vitest';
import { RadioGroup } from './RadioGroup';
import { RadioGroupItem } from './RadioGroupItem';

const { axe, toHaveNoViolations } = jestAxe;
expect.extend(toHaveNoViolations);

test('renders with role="radiogroup" and legendary label', () => {
  render(
    <RadioGroup label="Select Option">
      <RadioGroupItem value="1" label="One" />
      <RadioGroupItem value="2" label="Two" />
    </RadioGroup>,
  );

  const group = screen.getByRole('radiogroup', { name: 'Select Option' });
  expect(group).toBeInTheDocument();
});

test('has no axe violations', async () => {
  const { container } = render(
    <RadioGroup label="Select Option">
      <RadioGroupItem value="1" label="One" />
      <RadioGroupItem value="2" label="Two" />
    </RadioGroup>,
  );
  expect(await axe(container)).toHaveNoViolations();
});

test('toggles selection on click', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <RadioGroup label="Select Option" onValueChange={onValueChange}>
      <RadioGroupItem value="1" label="One" />
      <RadioGroupItem value="2" label="Two" />
    </RadioGroup>,
  );

  const option1 = screen.getByRole('radio', { name: 'One' });
  const option2 = screen.getByRole('radio', { name: 'Two' });

  expect(option1).not.toBeChecked();
  expect(option2).not.toBeChecked();

  await user.click(option1);
  expect(onValueChange).toHaveBeenCalledWith('1');
  expect(option1).toBeChecked();

  await user.click(option2);
  expect(onValueChange).toHaveBeenCalledWith('2');
  expect(option2).toBeChecked();
});

test('keyboard navigation with arrow keys skips disabled option', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <RadioGroup label="Select Option" onValueChange={onValueChange} defaultValue="1">
      <RadioGroupItem value="1" label="One" />
      <RadioGroupItem value="2" label="Two" disabled />
      <RadioGroupItem value="3" label="Three" />
    </RadioGroup>,
  );

  const option1 = screen.getByRole('radio', { name: 'One' });
  const option2 = screen.getByRole('radio', { name: 'Two' });
  const option3 = screen.getByRole('radio', { name: 'Three' });

  expect(option1).toBeChecked();
  option1.focus();

  // Press ArrowDown -> should skip option 2 and select option 3
  await user.keyboard('{ArrowDown}');
  expect(onValueChange).toHaveBeenCalledWith('3');
  expect(option3).toBeChecked();
  expect(option3).toHaveFocus();
});

test('respects horizontal layout and RTL settings', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <RadioGroup
      label="Select Option"
      onValueChange={onValueChange}
      defaultValue="1"
      orientation="horizontal"
      dir="rtl"
    >
      <RadioGroupItem value="1" label="One" />
      <RadioGroupItem value="2" label="Two" />
    </RadioGroup>,
  );

  const option1 = screen.getByRole('radio', { name: 'One' });
  const option2 = screen.getByRole('radio', { name: 'Two' });

  option1.focus();

  // ArrowRight in RTL should select Two (which wraps backwards if 2 items, or acts as left)
  await user.keyboard('{ArrowRight}');
  expect(onValueChange).toHaveBeenCalledWith('2');
  expect(option2).toBeChecked();
});
