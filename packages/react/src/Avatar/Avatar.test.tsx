import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { Avatar } from './Avatar';
import { AvatarStatusBadge } from './AvatarBadge';
import { AvatarGroup } from './AvatarGroup';

expect.extend(toHaveNoViolations);

describe('Avatar — fallback rendering', () => {
  test('renders initials when name is provided without src', () => {
    render(<Avatar name="Ada Lovelace" />);
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument();
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  test('renders generic accessible name when neither src nor name is provided', () => {
    render(<Avatar />);
    expect(screen.getByRole('img', { name: 'User avatar' })).toBeInTheDocument();
  });

  test('alt prop overrides the accessible name', () => {
    render(<Avatar name="Ada Lovelace" alt="Team lead" />);
    expect(screen.getByRole('img', { name: 'Team lead' })).toBeInTheDocument();
  });

  test('has no axe violations', async () => {
    const { container } = render(<Avatar name="Ada Lovelace" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Avatar — image loading', () => {
  let originalImage: typeof Image;

  beforeEach(() => {
    originalImage = global.Image;
    class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    // @ts-expect-error test mock
    global.Image = MockImage;
  });

  afterEach(() => {
    global.Image = originalImage;
  });

  test('shows the image and hides initials once loaded', async () => {
    render(<Avatar name="Ada Lovelace" src="https://example.com/a.png" />);
    await waitFor(() => {
      const img = screen.getByRole('img', { name: 'Ada Lovelace' }).querySelector('img');
      expect(img).toBeInTheDocument();
    });
    expect(screen.queryByText('AL')).not.toBeInTheDocument();
  });

  test("inner image is decorative (alt='') to avoid double announcement", async () => {
    render(<Avatar name="Ada Lovelace" src="https://example.com/a.png" />);
    await waitFor(() => {
      const img = screen.getByRole('img', { name: 'Ada Lovelace' }).querySelector('img');
      expect(img).toHaveAttribute('alt', '');
    });
  });
});

describe('Avatar — badges', () => {
  test('status badge includes a visually-hidden text label alongside the dot', () => {
    render(
      <Avatar
        name="Ada Lovelace"
        badge={<AvatarStatusBadge status="online" label="Online" className="h-full w-full" />}
      />,
    );
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  test('badgeIcon renders inside the avatar', () => {
    render(<Avatar name="Ada Lovelace" badgeIcon={<span data-testid="crown-icon">👑</span>} />);
    expect(screen.getByTestId('crown-icon')).toBeInTheDocument();
  });
});

describe('Avatar — sizes', () => {
  test.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)('renders %s size without error', (size) => {
    render(<Avatar name="Ada Lovelace" size={size} />);
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument();
  });
});

describe('AvatarGroup', () => {
  function Group(props: Partial<React.ComponentProps<typeof AvatarGroup>> = {}) {
    return (
      <AvatarGroup aria-label="Project collaborators" {...props}>
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Alan Turing" />
        <Avatar name="Katherine Johnson" />
        <Avatar name="Margaret Hamilton" />
      </AvatarGroup>
    );
  }

  test('renders role=group with a required aria-label', () => {
    render(<Group />);
    expect(screen.getByRole('group', { name: 'Project collaborators' })).toBeInTheDocument();
  });

  test('renders all avatars when under max', () => {
    render(<Group max={10} />);
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Margaret Hamilton' })).toBeInTheDocument();
  });

  test('collapses overflow into a labeled summary avatar', () => {
    render(<Group max={3} />);
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Margaret Hamilton' })).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: '2 more, 5 total' })).toBeInTheDocument();
  });

  test('overflow renders as a real button when onOverflowClick is provided', async () => {
    const user = userEvent.setup();
    const onOverflowClick = vi.fn();
    render(<Group max={3} onOverflowClick={onOverflowClick} />);

    const overflowButton = screen.getByRole('button', { name: 'Show 2 more, 5 total' });
    await user.click(overflowButton);
    expect(onOverflowClick).toHaveBeenCalled();
  });

  test('overflow button is keyboard activatable', async () => {
    const user = userEvent.setup();
    const onOverflowClick = vi.fn();
    render(<Group max={3} onOverflowClick={onOverflowClick} />);

    const overflowButton = screen.getByRole('button', { name: /Show 2 more/ });
    overflowButton.focus();
    await user.keyboard('{Enter}');
    expect(onOverflowClick).toHaveBeenCalled();
  });

  test('has no axe violations with overflow present', async () => {
    const { container } = render(<Group max={3} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
