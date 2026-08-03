import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, test, expect, vi } from 'vitest';
import {
  Combobox,
  ComboboxInput,
  ComboboxTags,
  ComboboxContent,
  ComboboxItem,
  ComboboxGroup,
  ComboboxEmpty,
} from './index';

expect.extend(toHaveNoViolations);

const FRUITS = ['Apple', 'Banana', 'Cherry'];

function Basic(props: Partial<React.ComponentProps<typeof Combobox>> = {}) {
  return (
    <Combobox {...props}>
      <ComboboxInput placeholder="Select a fruit..." />
      <ComboboxContent>
        <ComboboxEmpty />
        {FRUITS.map((fruit) => (
          <ComboboxItem key={fruit} value={fruit}>
            {fruit}
          </ComboboxItem>
        ))}
      </ComboboxContent>
    </Combobox>
  );
}

test('focusing the input opens the listbox with all items visible', async () => {
  const user = userEvent.setup();
  render(<Basic />);

  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

  await user.click(screen.getByPlaceholderText('Select a fruit...'));
  await screen.findByRole('listbox');
  expect(screen.getByRole('option', { name: 'Apple' })).toBeVisible();
  expect(screen.getByRole('option', { name: 'Banana' })).toBeVisible();
  expect(screen.getByRole('option', { name: 'Cherry' })).toBeVisible();
});

test('typing filters the visible items', async () => {
  const user = userEvent.setup();
  render(<Basic />);
  const input = screen.getByPlaceholderText('Select a fruit...');
  await user.click(input);
  await user.type(input, 'ban');

  await waitFor(() => {
    expect(screen.queryByRole('option', { name: 'Apple' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Banana' })).toBeVisible();
  });
});

test('shows empty state when nothing matches', async () => {
  const user = userEvent.setup();
  render(<Basic />);
  const input = screen.getByPlaceholderText('Select a fruit...');
  await user.click(input);
  await user.type(input, 'xyz');

  await waitFor(() => expect(screen.getByText('No results found.')).toBeVisible());
});

test('selecting an item fills the input and closes the popup (single mode)', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<Basic onValueChange={onValueChange} />);
  const input = screen.getByPlaceholderText('Select a fruit...');
  await user.click(input);

  await user.click(screen.getByRole('option', { name: 'Banana' }));
  expect(onValueChange).toHaveBeenCalledWith('Banana');
  await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  expect(input).toHaveValue('Banana');
});

test('multiple mode: selecting adds a tag and keeps the popup open', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  function MultiExample() {
    return (
      <Combobox multiple value={[]} onValueChange={onValueChange}>
        <ComboboxInput placeholder="Add fruits..." />
        <ComboboxContent>
          {FRUITS.map((fruit) => (
            <ComboboxItem key={fruit} value={fruit}>
              {fruit}
            </ComboboxItem>
          ))}
        </ComboboxContent>
      </Combobox>
    );
  }
  render(<MultiExample />);
  const input = screen.getByPlaceholderText('Add fruits...');
  await user.click(input);
  await user.click(screen.getByRole('option', { name: 'Apple' }));

  expect(onValueChange).toHaveBeenCalledWith(['Apple']);
  expect(screen.getByRole('listbox')).toBeVisible();
});

test('multiple mode: tag remove button removes the value', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  function MultiExample() {
    return (
      <Combobox multiple value={['Apple', 'Banana']} onValueChange={onValueChange}>
        <ComboboxInput placeholder="Add fruits..." />
        <ComboboxContent>
          {FRUITS.map((fruit) => (
            <ComboboxItem key={fruit} value={fruit}>
              {fruit}
            </ComboboxItem>
          ))}
        </ComboboxContent>
      </Combobox>
    );
  }
  render(<MultiExample />);
  await user.click(screen.getByRole('button', { name: 'Remove Apple' }));
  expect(onValueChange).toHaveBeenCalledWith(['Banana']);
});

test('clear button resets the value', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<Basic value="Apple" onValueChange={onValueChange} />);

  await user.click(screen.getByRole('button', { name: 'Clear' }));
  expect(onValueChange).toHaveBeenCalledWith(undefined);
});

test('disabled combobox does not open on click', async () => {
  const user = userEvent.setup();
  render(<Basic disabled />);
  await user.click(screen.getByPlaceholderText('Select a fruit...'));
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
});

test('invalid prop sets aria-invalid on the input', () => {
  render(<Basic invalid />);
  expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
});

test('keyboard: ArrowDown then Enter selects the auto-highlighted item', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<Basic onValueChange={onValueChange} />);
  const input = screen.getByPlaceholderText('Select a fruit...');
  await user.click(input);
  await user.keyboard('{ArrowDown}{Enter}');

  expect(onValueChange).toHaveBeenCalledWith('Apple');
});

test('groups render their heading alongside items', async () => {
  const user = userEvent.setup();
  function GroupedExample() {
    return (
      <Combobox>
        <ComboboxInput placeholder="Select..." />
        <ComboboxContent>
          <ComboboxGroup heading="Fruits">
            <ComboboxItem value="apple">Apple</ComboboxItem>
          </ComboboxGroup>
          <ComboboxGroup heading="Vegetables">
            <ComboboxItem value="carrot">Carrot</ComboboxItem>
          </ComboboxGroup>
        </ComboboxContent>
      </Combobox>
    );
  }
  render(<GroupedExample />);
  await user.click(screen.getByPlaceholderText('Select...'));

  expect(screen.getByText('Fruits')).toBeVisible();
  expect(screen.getByText('Vegetables')).toBeVisible();
  expect(screen.getByRole('option', { name: 'Apple' })).toBeVisible();
  expect(screen.getByRole('option', { name: 'Carrot' })).toBeVisible();
});

test('has no axe violations while open', async () => {
  const user = userEvent.setup();
  const { container } = render(<Basic />);
  await user.click(screen.getByPlaceholderText('Select a fruit...'));
  await screen.findByRole('listbox');
  expect(await axe(container)).toHaveNoViolations();
});
