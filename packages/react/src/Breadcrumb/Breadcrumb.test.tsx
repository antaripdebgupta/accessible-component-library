import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import jestAxe from 'jest-axe';
import { describe, expect, test, vi } from 'vitest';
import { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator, BreadcrumbEllipsis } from './index';

const { axe, toHaveNoViolations } = jestAxe;
expect.extend(toHaveNoViolations);

const sampleItems = [
  { label: 'Home', href: '/' },
  { label: 'Components', href: '/components' },
  { label: 'Navigation', href: '/components/navigation' },
  { label: 'Breadcrumb', href: '/components/navigation/breadcrumb' },
];

describe('Breadcrumb component', () => {
  test('renders semantic nav and ol structure with current page non-link indicator', () => {
    render(<Breadcrumb items={sampleItems} />);

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toBeInTheDocument();

    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveAttribute('href', '/');

    // Last item should be current page span, NOT a clickable link
    const currentItem = screen.getByText('Breadcrumb');
    expect(currentItem).toHaveAttribute('aria-current', 'page');
    expect(currentItem.tagName.toLowerCase()).toBe('span');
  });

  test('has no axe violations across all variants', async () => {
    const { container: defaultView } = render(<Breadcrumb items={sampleItems} />);
    expect(await axe(defaultView)).toHaveNoViolations();

    const { container: customSepView } = render(<Breadcrumb items={sampleItems} separator="/" />);
    expect(await axe(customSepView)).toHaveNoViolations();

    const { container: collapsedView } = render(<Breadcrumb items={sampleItems} maxItems={2} />);
    expect(await axe(collapsedView)).toHaveNoViolations();

    const { container: rtlView } = render(<Breadcrumb items={sampleItems} dir="rtl" />);
    expect(await axe(rtlView)).toHaveNoViolations();
  });

  test('renders single-item breadcrumb cleanly without dangling separators', () => {
    const { container } = render(
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }]} />,
    );

    expect(screen.getByText('Dashboard')).toHaveAttribute('aria-current', 'page');
    const listItems = container.querySelectorAll('li');
    expect(listItems.length).toBe(1);
  });

  test('collapses middle items into focusable ellipsis menu trigger', async () => {
    const user = userEvent.setup();
    render(<Breadcrumb items={sampleItems} maxItems={2} />);

    // First item and last item should be visible
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByText('Breadcrumb')).toBeInTheDocument();

    // Ellipsis trigger button
    const ellipsisButton = screen.getByRole('button', {
      name: 'Show hidden breadcrumb items',
    });
    expect(ellipsisButton).toBeInTheDocument();

    // Click trigger to open dropdown
    await user.click(ellipsisButton);

    // Hidden middle items appear inside menu
    expect(screen.getByText('Components')).toBeInTheDocument();
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  test('supports custom Link component via as prop', () => {
    const CustomLink = ({ href, children, ...props }: any) => (
      <a data-custom-link="true" href={href} {...props}>
        {children}
      </a>
    );

    render(<Breadcrumb items={sampleItems} as={CustomLink} />);

    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toHaveAttribute('data-custom-link', 'true');
  });

  test('composable subcomponents render correctly', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbItem isCurrent>Current Page</BreadcrumbItem>
      </Breadcrumb>,
    );

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByText('/')).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toHaveAttribute('aria-current', 'page');
  });

  test('returns null when items array is empty', () => {
    const { container } = render(<Breadcrumb items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test('supports custom itemsBeforeCollapse and itemsAfterCollapse values', () => {
    render(
      <Breadcrumb
        items={sampleItems}
        maxItems={3}
        itemsBeforeCollapse={2}
        itemsAfterCollapse={1}
      />,
    );

    // First two items visible, middle collapsed, last item visible
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Components' })).toBeInTheDocument();
    expect(screen.getByText('Breadcrumb')).toBeInTheDocument();
  });
});
