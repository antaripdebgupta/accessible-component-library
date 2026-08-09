import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, test, expect } from 'vitest';
import { DataTable, DataTableHeader, DataTableBody, type DataTableColumn } from './index';

expect.extend(toHaveNoViolations);

interface Row {
  id: string;
  name: string;
  email: string;
}

const rows: Row[] = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@example.com' },
  { id: '2', name: 'Grace Hopper', email: 'grace@example.com' },
  { id: '3', name: 'Alan Turing', email: 'alan@example.com' },
];

const columns: DataTableColumn<Row>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: (row) => row.name,
    sortable: true,
    sortValue: (row) => row.name,
  },
  { id: 'email', header: 'Email', cell: (row) => row.email },
];

function Basic(props: Partial<React.ComponentProps<typeof DataTable<Row>>> = {}) {
  return (
    <DataTable data={rows} columns={columns} getRowId={(r) => r.id} caption="Users" {...props}>
      <DataTableHeader />
      <DataTableBody />
    </DataTable>
  );
}

test('renders column headers and all rows', () => {
  render(<Basic />);
  expect(screen.getByRole('columnheader', { name: /Name/ })).toBeVisible();
  expect(screen.getByText('Ada Lovelace')).toBeVisible();
  expect(screen.getByText('Alan Turing')).toBeVisible();
});

test('clicking a sortable header cycles aria-sort and reorders rows', async () => {
  const user = userEvent.setup();
  render(<Basic />);
  const nameHeader = screen.getByRole('columnheader', { name: /Name/ });

  await user.click(screen.getByRole('button', { name: /Name/ }));
  expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');

  await waitFor(() => {
    const cells = screen.getAllByText(/Lovelace|Hopper|Turing/);
    expect(cells[0]).toHaveTextContent('Ada Lovelace');
    expect(cells[1]).toHaveTextContent('Alan Turing');
    expect(cells[2]).toHaveTextContent('Grace Hopper');
  });
});

test('row checkbox selection toggles aria-selected on the row', async () => {
  const user = userEvent.setup();
  render(<Basic selectable />);
  const checkbox = screen.getByRole('checkbox', { name: 'Select row 1' });
  const row = checkbox.closest('tr')!;

  expect(row).not.toHaveAttribute('aria-selected', 'true');
  await user.click(checkbox);
  expect(row).toHaveAttribute('aria-selected', 'true');
});

test('select-all checkbox selects/deselects every row on the page', async () => {
  const user = userEvent.setup();
  render(<Basic selectable />);
  const selectAll = screen.getByRole('checkbox', { name: 'Select all rows on this page' });

  await user.click(selectAll);
  expect(screen.getByRole('checkbox', { name: 'Select row 1' })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'Select row 3' })).toBeChecked();

  await user.click(selectAll);
  expect(screen.getByRole('checkbox', { name: 'Select row 1' })).not.toBeChecked();
});

test('select-all shows indeterminate state when some rows are selected', async () => {
  const user = userEvent.setup();
  render(<Basic selectable />);
  await user.click(screen.getByRole('checkbox', { name: 'Select row 1' }));

  const selectAll = screen.getByRole('checkbox', {
    name: 'Select all rows on this page',
  }) as HTMLInputElement;
  expect(selectAll.indeterminate).toBe(true);
});

test('expand button toggles expanded content visibility', async () => {
  const user = userEvent.setup();
  render(
    <DataTable data={rows} columns={columns} getRowId={(r) => r.id} caption="Users" expandable>
      <DataTableHeader />
      <DataTableBody renderExpanded={(row: Row) => <p>Full profile for {row.name}</p>} />
    </DataTable>,
  );

  expect(screen.queryByText('Full profile for Ada Lovelace')).not.toBeInTheDocument();

  const expandButton = screen.getByRole('button', { name: 'Expand row 1' });
  await user.click(expandButton);
  expect(screen.getByText('Full profile for Ada Lovelace')).toBeVisible();
  expect(expandButton).toHaveAttribute('aria-expanded', 'true');

  await user.click(screen.getByRole('button', { name: 'Collapse row 1' }));
  expect(screen.queryByText('Full profile for Ada Lovelace')).not.toBeInTheDocument();
});

test('shows empty state when there are no rows', () => {
  render(
    <DataTable data={[]} columns={columns} getRowId={(r: Row) => r.id} caption="Empty users">
      <DataTableHeader />
      <DataTableBody />
    </DataTable>,
  );
  expect(screen.getByText('No results found.')).toBeVisible();
});

test('pagination renders and navigates between pages', async () => {
  const user = userEvent.setup();
  render(<Basic pageSize={2} />);

  expect(screen.getByText('Ada Lovelace')).toBeVisible();
  expect(screen.queryByText('Alan Turing')).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Page 2' }));
  expect(await screen.findByText('Alan Turing')).toBeVisible();
  expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
});

test('pagination does not render when everything fits on one page', () => {
  render(<Basic pageSize={10} />);
  expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeInTheDocument();
});

test('ArrowDown moves focus to the same column control in the next row', async () => {
  const user = userEvent.setup();
  render(<Basic selectable />);
  const first = screen.getByRole('checkbox', { name: 'Select row 1' });
  const second = screen.getByRole('checkbox', { name: 'Select row 2' });

  first.focus();
  await user.keyboard('{ArrowDown}');
  expect(second).toHaveFocus();

  await user.keyboard('{ArrowUp}');
  expect(first).toHaveFocus();
});

test('has no axe violations', async () => {
  const { container } = render(<Basic selectable expandable pageSize={2} />);
  expect(await axe(container)).toHaveNoViolations();
});
