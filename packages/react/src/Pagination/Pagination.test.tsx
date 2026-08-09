import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, test, expect, vi } from 'vitest';
import { Pagination } from './index';

expect.extend(toHaveNoViolations);

describe('Pagination Component', () => {
  test('renders page numbers and control buttons', () => {
    render(<Pagination currentPage={1} pageCount={5} onPageChange={() => {}} />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 5' })).toBeInTheDocument();
  });

  test('calls onPageChange when a page number is clicked', async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();
    render(<Pagination currentPage={1} pageCount={5} onPageChange={handlePageChange} />);

    await user.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  test('calls onPageChange when next or prev buttons are clicked', async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();
    render(<Pagination currentPage={2} pageCount={5} onPageChange={handlePageChange} />);

    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(handlePageChange).toHaveBeenCalledWith(3);

    await user.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(handlePageChange).toHaveBeenCalledWith(1);
  });

  test('disables previous and next buttons at boundaries', () => {
    const { rerender } = render(
      <Pagination currentPage={1} pageCount={5} onPageChange={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).not.toBeDisabled();

    rerender(<Pagination currentPage={5} pageCount={5} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  test('renders ellipsis for long ranges', () => {
    render(
      <Pagination
        currentPage={5}
        pageCount={10}
        siblingCount={1}
        boundaryCount={1}
        onPageChange={() => {}}
      />,
    );
    // Page list: 1, ellipsis, 4, 5, 6, ellipsis, 10
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 5' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 6' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 10' })).toBeInTheDocument();
    // Ellipses elements
    const ellipses = screen.getAllByText('…');
    expect(ellipses.length).toBe(2);
  });

  test('sets aria-current="page" on the active page button', () => {
    render(<Pagination currentPage={3} pageCount={5} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Page 1' })).not.toHaveAttribute('aria-current');
  });

  test('has no axe accessibility violations', async () => {
    const { container } = render(
      <Pagination currentPage={1} pageCount={5} onPageChange={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
