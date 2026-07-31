import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, test, expect } from 'vitest';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './index';

expect.extend(toHaveNoViolations);

// All items enabled — used for tests that assert on full traversal (Home/End/Arrow).
function Basic(props: Partial<React.ComponentProps<typeof Accordion>> = {}) {
  return (
    <Accordion type="single" {...props}>
      <AccordionItem value="a">
        <AccordionTrigger>Question A</AccordionTrigger>
        <AccordionContent>Answer A</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Question B</AccordionTrigger>
        <AccordionContent>Answer B</AccordionContent>
      </AccordionItem>
      <AccordionItem value="c">
        <AccordionTrigger>Question C</AccordionTrigger>
        <AccordionContent>Answer C</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

// One disabled item — used specifically for disabled-behavior tests.
function BasicWithDisabled(props: Partial<React.ComponentProps<typeof Accordion>> = {}) {
  return (
    <Accordion type="single" {...props}>
      <AccordionItem value="a">
        <AccordionTrigger>Question A</AccordionTrigger>
        <AccordionContent>Answer A</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Question B</AccordionTrigger>
        <AccordionContent>Answer B</AccordionContent>
      </AccordionItem>
      <AccordionItem value="c" disabled>
        <AccordionTrigger>Question C</AccordionTrigger>
        <AccordionContent>Answer C</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

test('trigger toggles aria-expanded and opens only one item in single mode', async () => {
  const user = userEvent.setup();
  render(<Basic />);
  const a = screen.getByRole('button', { name: 'Question A' });
  const b = screen.getByRole('button', { name: 'Question B' });

  await user.click(a);
  expect(a).toHaveAttribute('aria-expanded', 'true');

  await user.click(b);
  expect(a).toHaveAttribute('aria-expanded', 'false');
  expect(b).toHaveAttribute('aria-expanded', 'true');
});

test('multiple mode allows more than one open item', async () => {
  const user = userEvent.setup();
  render(<Basic type="multiple" />);
  await user.click(screen.getByRole('button', { name: 'Question A' }));
  await user.click(screen.getByRole('button', { name: 'Question B' }));
  expect(screen.getByRole('button', { name: 'Question A' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  expect(screen.getByRole('button', { name: 'Question B' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
});

test('disabled item cannot be toggled', async () => {
  const user = userEvent.setup();
  render(<BasicWithDisabled />);
  const c = screen.getByRole('button', { name: 'Question C' });
  expect(c).toBeDisabled();
  await user.click(c);
  expect(c).toHaveAttribute('aria-expanded', 'false');
});

test('ArrowDown/ArrowUp/Home/End move focus between triggers', async () => {
  const user = userEvent.setup();
  render(<Basic />);
  screen.getByRole('button', { name: 'Question A' }).focus();
  await user.keyboard('{ArrowDown}');
  expect(screen.getByRole('button', { name: 'Question B' })).toHaveFocus();
  await user.keyboard('{End}');
  expect(screen.getByRole('button', { name: 'Question C' })).toHaveFocus();
  await user.keyboard('{Home}');
  expect(screen.getByRole('button', { name: 'Question A' })).toHaveFocus();
});

test('ArrowDown/End skip disabled items during keyboard navigation', async () => {
  const user = userEvent.setup();
  render(<BasicWithDisabled />);
  screen.getByRole('button', { name: 'Question A' }).focus();
  await user.keyboard('{End}');
  // Question C is disabled, so End should land on B — the last enabled item.
  expect(screen.getByRole('button', { name: 'Question B' })).toHaveFocus();
});

test('trigger and panel are linked via aria-controls/aria-labelledby', () => {
  render(<Basic />);
  const trigger = screen.getByRole('button', { name: 'Question A' });
  const panel = screen.getByRole('region', { name: 'Question A' });
  expect(trigger).toHaveAttribute('aria-controls', panel.id);
  expect(panel).toHaveAttribute('aria-labelledby', trigger.id);
});

test('has no axe violations', async () => {
  const { container } = render(<Basic />);
  expect(await axe(container)).toHaveNoViolations();
});
