import type { Meta, StoryObj } from '@storybook/react';
import { Slash, ArrowRight } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator } from './index';

const sampleItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Categories', href: '/products/categories' },
  { label: 'Electronics', href: '/products/categories/electronics' },
  { label: 'Headphones', href: '/products/categories/electronics/headphones' },
  {
    label: 'Wireless Noise Canceling',
    href: '/products/categories/electronics/headphones/wireless-nc',
  },
];

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  tags: ['!autodocs'],
  args: {
    items: sampleItems.slice(0, 4),
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  args: {
    items: sampleItems.slice(0, 4),
  },
};

export const CustomSeparator: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={sampleItems.slice(0, 4)} separator={<Slash size={14} />} />
      <Breadcrumb items={sampleItems.slice(0, 4)} separator={<ArrowRight size={14} />} />
      <Breadcrumb items={sampleItems.slice(0, 4)} separator=">" />
    </div>
  ),
};

export const Collapsed: Story = {
  args: {
    items: sampleItems,
    maxItems: 3,
  },
};

export const Dropdown: Story = {
  render: () => (
    <Breadcrumb items={sampleItems} maxItems={2} itemsBeforeCollapse={1} itemsAfterCollapse={1} />
  ),
};

export const LinkComponent: Story = {
  render: () => {
    const NextLinkMock = ({ href, children, ...props }: any) => (
      <a href={href} data-next-link="true" className="text-accent-default font-medium" {...props}>
        {children}
      </a>
    );

    return <Breadcrumb items={sampleItems.slice(0, 4)} as={NextLinkMock} />;
  },
};

export const Composition: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem href="/">Store</BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem href="/category">Apparel</BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem href="/category/jackets">Jackets</BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem isCurrent>Winter Parka</BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const RTL: Story = {
  args: {
    items: [
      { label: 'الصفحة الرئيسية (Home)', href: '/' },
      { label: 'المنتجات (Products)', href: '/products' },
      { label: 'الإلكترونيات (Electronics)', href: '/electronics' },
      { label: 'سماعات الرأس (Headphones)', href: '/headphones' },
    ],
    dir: 'rtl',
  },
};
