import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from './index';
import { expect, userEvent, within } from '@storybook/test';

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  argTypes: {
    pageCount: { control: 'number' },
    currentPage: { control: 'number' },
    siblingCount: { control: 'number' },
    boundaryCount: { control: 'number' },
  },
};
export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <div className="space-y-4">
        <p className="text-text-secondary text-sm">Active Page: {page}</p>
        <Pagination currentPage={page} pageCount={5} onPageChange={setPage} />
      </div>
    );
  },
};

export const Interaction: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const next = canvas.getByRole('button', { name: 'Next page' });
    await userEvent.click(next);
    await expect(canvas.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
};

export const WithEllipsis: Story = {
  render: () => {
    const [page, setPage] = useState(5);
    return (
      <div className="space-y-4">
        <p className="text-text-secondary text-sm">Active Page: {page} / 10</p>
        <Pagination
          currentPage={page}
          pageCount={10}
          onPageChange={setPage}
          siblingCount={1}
          boundaryCount={1}
        />
      </div>
    );
  },
};

export const CustomBoundaries: Story = {
  render: () => {
    const [page, setPage] = useState(8);
    return (
      <div className="space-y-4">
        <p className="text-text-secondary text-sm">
          Active Page: {page} (2 boundaries, 2 siblings)
        </p>
        <Pagination
          currentPage={page}
          pageCount={15}
          onPageChange={setPage}
          siblingCount={2}
          boundaryCount={2}
        />
      </div>
    );
  },
};

const MOCK_ITEMS = [
  {
    id: 1,
    title: 'Introduction to Accessibility',
    category: 'A11y',
    desc: 'Learn the core principles of web accessibility.',
  },
  {
    id: 2,
    title: 'WAI-ARIA Roles Demystified',
    category: 'A11y',
    desc: 'Understanding when and how to use ARIA roles.',
  },
  {
    id: 3,
    title: 'Keyboard Navigation Basics',
    category: 'UX',
    desc: 'Designing interfaces navigable solely by keyboard.',
  },
  {
    id: 4,
    title: 'Color Contrast Guidelines',
    category: 'Design',
    desc: 'Satisfying WCAG contrast ratios for text and UI.',
  },
  {
    id: 5,
    title: 'Screen Reader Testing',
    category: 'QA',
    desc: 'Setting up and using popular screen readers.',
  },
  {
    id: 6,
    title: 'Semantic HTML Elements',
    category: 'HTML',
    desc: 'Why using standard HTML elements is key.',
  },
  {
    id: 7,
    title: 'Focus Ring Strategies',
    category: 'CSS',
    desc: 'Styling focus rings without ruining UX.',
  },
  {
    id: 8,
    title: 'Accessible Form Controls',
    category: 'Forms',
    desc: 'Creating forms that work for everyone.',
  },
  {
    id: 9,
    title: 'Dynamic Content & Live Regions',
    category: 'React',
    desc: 'Using aria-live to announce page changes.',
  },
  {
    id: 10,
    title: 'Building Custom Comboboxes',
    category: 'Components',
    desc: 'Step-by-step accessible combobox patterns.',
  },
];

export const PaginatedContent: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const [displayPage, setDisplayPage] = useState(1);
    const [visible, setVisible] = useState(true);
    const itemsPerPage = 3;
    const pageCount = Math.ceil(MOCK_ITEMS.length / itemsPerPage);

    const handlePageChange = (newPage: number) => {
      setVisible(false);
      setTimeout(() => {
        setDisplayPage(newPage);
        setPage(newPage);
        setVisible(true);
      }, 120);
    };

    const startIndex = (displayPage - 1) * itemsPerPage;
    const currentItems = MOCK_ITEMS.slice(startIndex, startIndex + itemsPerPage);

    return (
      <div className="max-w-md space-y-6">
        <div
          className={`duration-fast ease-out-soft space-y-3 transition-all motion-reduce:transition-none ${
            visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-98 opacity-0'
          }`}
        >
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="rounded-popover border-border bg-surface border p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="bg-accent-subtle text-accent-default rounded px-2 py-0.5 text-xs font-semibold">
                {item.category}
              </span>
              <h4 className="text-text-primary mt-2 text-sm font-medium">{item.title}</h4>
              <p className="text-text-secondary mt-1 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="border-border flex items-center justify-between border-t pt-4">
          <p className="text-text-secondary text-xs">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, MOCK_ITEMS.length)} of{' '}
            {MOCK_ITEMS.length}
          </p>
          <Pagination currentPage={page} pageCount={pageCount} onPageChange={handlePageChange} />
        </div>
      </div>
    );
  },
};
