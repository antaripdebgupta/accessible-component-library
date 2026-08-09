import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { DataTable, DataTableHeader, DataTableBody, type DataTableColumn } from './index';
import { useDataTableContext } from './DataTable';

const meta: Meta<typeof DataTable> = { title: 'Components/DataTable', component: DataTable };
export default meta;
type Story = StoryObj<typeof DataTable>;

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'invited' | 'suspended';
  joined: string;
}

const USERS: User[] = [
  {
    id: '1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: 'Admin',
    status: 'active',
    joined: '2024-01-15',
  },
  {
    id: '2',
    name: 'Sam Rivera',
    email: 'sam@example.com',
    role: 'Editor',
    status: 'invited',
    joined: '2024-03-02',
  },
  {
    id: '3',
    name: 'Alex Kim',
    email: 'alex@example.com',
    role: 'Viewer',
    status: 'active',
    joined: '2023-11-20',
  },
  {
    id: '4',
    name: 'Priya Patel',
    email: 'priya@example.com',
    role: 'Editor',
    status: 'suspended',
    joined: '2024-02-10',
  },
  {
    id: '5',
    name: 'Chris Lee',
    email: 'chris@example.com',
    role: 'Viewer',
    status: 'active',
    joined: '2024-04-18',
  },
  {
    id: '6',
    name: 'Morgan Diaz',
    email: 'morgan@example.com',
    role: 'Admin',
    status: 'active',
    joined: '2023-09-05',
  },
  {
    id: '7',
    name: 'Taylor Wu',
    email: 'taylor@example.com',
    role: 'Viewer',
    status: 'invited',
    joined: '2024-05-01',
  },
  {
    id: '8',
    name: 'Jordan Ng',
    email: 'jordan@example.com',
    role: 'Editor',
    status: 'active',
    joined: '2024-01-30',
  },
];

const baseColumns: DataTableColumn<User>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: (row) => row.name,
    sortable: true,
    sortValue: (row) => row.name,
  },
  {
    id: 'email',
    header: 'Email',
    cell: (row) => row.email,
    sortable: true,
    sortValue: (row) => row.email,
  },
  {
    id: 'role',
    header: 'Role',
    cell: (row) => row.role,
    sortable: true,
    sortValue: (row) => row.role,
  },
];

export const Default: Story = {
  render: () => (
    <DataTable data={USERS} columns={baseColumns} getRowId={(row) => row.id} caption="Users">
      <DataTableHeader />
      <DataTableBody />
    </DataTable>
  ),
};

export const Sortable: Story = {
  render: () => (
    <div className="space-y-2">
      <p className="text-text-secondary text-sm">
        Click a column header to sort — cycles asc → desc → unsorted.
      </p>
      <DataTable
        data={USERS}
        columns={baseColumns}
        getRowId={(row) => row.id}
        caption="Sortable users table"
      >
        <DataTableHeader />
        <DataTableBody />
      </DataTable>
    </div>
  ),
};

function RowSelectionExample() {
  const [data] = useState(USERS);
  return <RowSelectionInner data={data} />;
}

function RowSelectionInner({ data }: { data: User[] }) {
  return (
    <DataTable
      data={data}
      columns={baseColumns}
      getRowId={(row) => row.id}
      caption="Selectable users table"
      selectable
    >
      <DataTableHeader />
      <DataTableBody />
      <SelectionCount />
    </DataTable>
  );
}

function SelectionCount() {
  const { selectedIds } = useDataTableContext<User>();
  return <p className="text-text-secondary mt-2 text-sm">Selected: {selectedIds.size}</p>;
}

export const RowSelection: Story = { render: () => <RowSelectionExample /> };

function SelectionWatcher({ onCount }: { onCount: (n: number) => void }) {
  const { useDataTableContext } = require('./DataTable');
  const { selectedIds } = useDataTableContext();
  onCount(selectedIds.size);
  const { DataTableBody } = require('./DataTableBody');
  return <DataTableBody />;
}

export const Pagination: Story = {
  render: () => (
    <DataTable
      data={USERS}
      columns={baseColumns}
      getRowId={(row) => row.id}
      caption="Paginated users table"
      pageSize={3}
    >
      <DataTableHeader />
      <DataTableBody />
    </DataTable>
  ),
};

export const StickyHeader: Story = {
  render: () => (
    <div className="rounded-popover border-border max-h-64 overflow-y-auto border">
      <DataTable
        data={[...USERS, ...USERS.map((u) => ({ ...u, id: `${u.id}-b` }))]}
        columns={baseColumns}
        getRowId={(row) => row.id}
        caption="Users table with a sticky header"
        className="[&_thead]:bg-surface [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10"
      >
        <DataTableHeader />
        <DataTableBody />
      </DataTable>
    </div>
  ),
};

export const ExpandableRows: Story = {
  render: () => (
    <DataTable
      data={USERS}
      columns={baseColumns}
      getRowId={(row) => row.id}
      caption="Users table with expandable rows"
      expandable
    >
      <DataTableHeader />
      <DataTableBody<User>
        renderExpanded={(row) => (
          <div className="text-text-secondary text-sm">
            <p>
              <span className="text-text-primary font-medium">Joined:</span> {row.joined}
            </p>
            <p>
              <span className="text-text-primary font-medium">Status:</span> {row.status}
            </p>
          </div>
        )}
      />
    </DataTable>
  ),
};

export const LoadingState: Story = {
  render: () => (
    <DataTable
      data={[]}
      columns={baseColumns}
      getRowId={(row) => row.id}
      caption="Loading users table"
      loading
    >
      <DataTableHeader />
      <DataTableBody />
    </DataTable>
  ),
};

export const EmptyState: Story = {
  render: () => (
    <DataTable
      data={[]}
      columns={baseColumns}
      getRowId={(row) => row.id}
      caption="Empty users table"
    >
      <DataTableHeader />
      <DataTableBody emptyMessage="No users match your filters." />
    </DataTable>
  ),
};

export const Responsive: Story = {
  render: () => (
    <div className="space-y-2">
      <p className="text-text-secondary text-sm">
        Resize the viewport below the "md" breakpoint — rows collapse into cards with inline labels.
      </p>
      <DataTable
        data={USERS.slice(0, 4)}
        columns={baseColumns}
        getRowId={(row) => row.id}
        caption="Responsive users table"
        selectable
      >
        <DataTableHeader />
        <DataTableBody />
      </DataTable>
    </div>
  ),
};

const statusStyles: Record<
  User['status'],
  { icon: typeof CheckCircle2; className: string; label: string }
> = {
  active: { icon: CheckCircle2, className: 'text-success-default', label: 'Active' },
  invited: { icon: Clock, className: 'text-warning-default', label: 'Invited' },
  suspended: { icon: XCircle, className: 'text-danger-default', label: 'Suspended' },
};

export const CustomCells: Story = {
  render: () => {
    const columns: DataTableColumn<User>[] = [
      ...baseColumns,
      {
        id: 'status',
        header: 'Status',
        sortable: true,
        sortValue: (row) => row.status,
        cell: (row) => {
          const { icon: Icon, className, label } = statusStyles[row.status];
          return (
            <span className={`inline-flex items-center gap-1.5 font-medium ${className}`}>
              <Icon size={14} aria-hidden="true" />
              {label}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        align: 'right',
        cell: (row) => (
          <button
            type="button"
            onClick={() => alert(`Edit ${row.name}`)}
            className="rounded-control border-border text-text-primary hover:bg-surface-raised border px-2 py-1 text-xs"
          >
            Edit
          </button>
        ),
      },
    ];
    return (
      <DataTable
        data={USERS}
        columns={columns}
        getRowId={(row) => row.id}
        caption="Users table with custom cell renderers"
      >
        <DataTableHeader />
        <DataTableBody />
      </DataTable>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="pointer-events-none opacity-50">
      <DataTable
        data={USERS.slice(0, 3)}
        columns={baseColumns}
        getRowId={(row) => row.id}
        caption="Disabled users table"
        selectable
      >
        <DataTableHeader />
        <DataTableBody />
      </DataTable>
    </div>
  ),
};

const USERS_AR: User[] = [
  {
    id: '1',
    name: 'سارة أحمد',
    email: 'sara@example.com',
    role: 'مسؤول',
    status: 'active',
    joined: '2024-01-15',
  },
  {
    id: '2',
    name: 'خالد محمد',
    email: 'khaled@example.com',
    role: 'محرر',
    status: 'invited',
    joined: '2024-03-02',
  },
  {
    id: '3',
    name: 'ليلى حسن',
    email: 'layla@example.com',
    role: 'مشاهد',
    status: 'active',
    joined: '2023-11-20',
  },
];

export const RTL: Story = {
  render: () => {
    const columns: DataTableColumn<User>[] = [
      {
        id: 'name',
        header: 'الاسم',
        cell: (row) => row.name,
        sortable: true,
        sortValue: (row) => row.name,
      },
      { id: 'email', header: 'البريد الإلكتروني', cell: (row) => row.email },
      { id: 'role', header: 'الدور', cell: (row) => row.role },
    ];
    return (
      <div dir="rtl">
        <DataTable
          data={USERS_AR}
          columns={columns}
          getRowId={(row) => row.id}
          caption="جدول المستخدمين"
        >
          <DataTableHeader />
          <DataTableBody />
        </DataTable>
      </div>
    );
  },
};
