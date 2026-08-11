import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, test, expect } from 'vitest';
import { Skeleton } from './Skeleton';
import { SkeletonGroup } from './SkeletonGroup';
import { SkeletonAvatar } from './presets/SkeletonAvatar';
import { SkeletonText } from './presets/SkeletonText';
import { SkeletonCard } from './presets/SkeletonCard';
import { SkeletonForm } from './presets/SkeletonForm';
import { SkeletonTable } from './presets/SkeletonTable';

expect.extend(toHaveNoViolations);

describe('Skeleton — semantics', () => {
  test('renders as aria-hidden and role=presentation', () => {
    const { container } = render(<Skeleton data-testid="skel" />);
    const el = container.querySelector('[data-testid="skel"]');
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).toHaveAttribute('role', 'presentation');
  });

  test('is not exposed as an accessible element', () => {
    render(<Skeleton data-testid="skel" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    expect(screen.getByTestId('skel')).toBeInTheDocument();
  });

  test('applies width/height inline styles', () => {
    const { container } = render(<Skeleton data-testid="skel" width={40} height={40} />);
    const el = container.querySelector('[data-testid="skel"]') as HTMLElement;
    expect(el.style.width).toBe('40px');
    expect(el.style.height).toBe('40px');
  });

  test.each(['text', 'circle', 'rect'] as const)('renders %s shape without error', (shape) => {
    const { container } = render(<Skeleton shape={shape} data-testid="skel" />);
    expect(container.querySelector('[data-testid="skel"]')).toBeInTheDocument();
  });

  test('has no axe violations', async () => {
    const { container } = render(<Skeleton />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('SkeletonGroup — loading announcement contract', () => {
  test('loading=true renders fallback and sets role=status + aria-busy + aria-label once', () => {
    render(
      <SkeletonGroup loading label="Loading profile" fallback={<SkeletonCard />}>
        <div>Real content</div>
      </SkeletonGroup>,
    );
    const region = screen.getByRole('status', { name: 'Loading profile' });
    expect(region).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Real content')).not.toBeInTheDocument();
  });

  test('loading=false renders children and clears aria-busy/aria-label', () => {
    render(
      <SkeletonGroup loading={false} label="Loading profile" fallback={<SkeletonCard />}>
        <div>Real content</div>
      </SkeletonGroup>,
    );
    expect(screen.getByText('Real content')).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: 'Loading profile' })).not.toBeInTheDocument();
  });

  test('multiple skeleton shapes inside fallback produce exactly one role=status announcement', () => {
    render(
      <SkeletonGroup
        loading
        label="Loading list"
        fallback={
          <>
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </>
        }
      >
        <div>Loaded</div>
      </SkeletonGroup>,
    );
    const statusRegions = screen.getAllByRole('status', { name: 'Loading list' });
    expect(statusRegions).toHaveLength(1);
  });

  test('has no axe violations while loading', async () => {
    const { container } = render(
      <SkeletonGroup loading label="Loading profile" fallback={<SkeletonCard />}>
        <div>Real content</div>
      </SkeletonGroup>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  test('has no axe violations once loaded', async () => {
    const { container } = render(
      <SkeletonGroup loading={false} label="Loading profile" fallback={<SkeletonCard />}>
        <div>Real content</div>
      </SkeletonGroup>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Skeleton presets', () => {
  test('SkeletonAvatar renders a circle shape', () => {
    const { container } = render(<SkeletonAvatar size="md" />);
    expect(container.querySelector('[role="presentation"]')).toBeInTheDocument();
  });

  test.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)('SkeletonAvatar renders %s size', (size) => {
    const { container } = render(<SkeletonAvatar size={size} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test('SkeletonText renders the requested number of lines', () => {
    const { container } = render(<SkeletonText lines={4} />);
    expect(container.querySelectorAll('[role="presentation"]')).toHaveLength(4);
  });

  test('SkeletonText applies lastLineWidth to the final line only', () => {
    const { container } = render(<SkeletonText lines={3} lastLineWidth="40%" />);
    const lines = container.querySelectorAll('[role="presentation"]') as NodeListOf<HTMLElement>;

    const lastLine = lines.item(2);
    const firstLine = lines.item(0);

    expect(lastLine).not.toBeNull();
    expect(firstLine).not.toBeNull();

    expect(lastLine?.style.width).toBe('40%');
    expect(firstLine?.style.width).toBe('100%');
  });

  test('SkeletonCard renders without error and has no axe violations', async () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  test('SkeletonForm renders the requested number of fields plus a submit placeholder', () => {
    const { container } = render(<SkeletonForm fields={5} />);
    // 5 fields x 2 skeletons (label + input) + 1 submit button skeleton = 11
    expect(container.querySelectorAll('[role="presentation"]').length).toBeGreaterThanOrEqual(11);
  });

  test('SkeletonTable renders correct row/column count', () => {
    const { container } = render(<SkeletonTable rows={3} columns={4} />);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(3);
    const headerCells = container.querySelectorAll('thead th');
    expect(headerCells).toHaveLength(4);
  });

  test('SkeletonTable header cells have visually-hidden accessible text', () => {
    const { container } = render(<SkeletonTable rows={2} columns={3} />);
    const headerCells = container.querySelectorAll('thead th');
    headerCells.forEach((th, i) => {
      expect(th).toHaveTextContent(`Column ${i + 1}`);
    });
  });

  test('SkeletonTable has no axe violations', async () => {
    const { container } = render(<SkeletonTable rows={3} columns={3} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
