import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeProvider, useTheme, getThemeScript, ThemeToggle } from './index';

expect.extend(toHaveNoViolations);

function TestConsumer() {
  const { mode, resolvedTheme, systemTheme, setMode, forced, ready } = useTheme();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <span data-testid="system">{systemTheme}</span>
      <span data-testid="forced">{forced ? 'true' : 'false'}</span>
      <span data-testid="ready">{ready ? 'true' : 'false'}</span>
      <button onClick={() => setMode('light')}>Set Light</button>
      <button onClick={() => setMode('dark')}>Set Dark</button>
      <button onClick={() => setMode('system')}>Set System</button>
    </div>
  );
}

describe('getThemeScript', () => {
  test('returns script string with default options', () => {
    const script = getThemeScript();
    expect(script).toContain('antarip-theme');
    expect(script).toContain('document.documentElement');
  });

  test('handles custom key and forced theme', () => {
    const script = getThemeScript({ storageKey: 'custom-key', forcedTheme: 'dark' });
    expect(script).toContain('custom-key');
    expect(script).toContain('"dark"');
  });
});

describe('ThemeProvider', () => {
  let mediaMatches = false;
  let listeners: Set<(e: MediaQueryListEvent) => void> = new Set();

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '';
    listeners = new Set();
    mediaMatches = false;

    vi.stubGlobal('matchMedia', (query: string) => ({
      get matches() {
        return mediaMatches;
      },
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: (_event: string, cb: (e: MediaQueryListEvent) => void) => {
        listeners.add(cb);
      },
      removeEventListener: (_event: string, cb: (e: MediaQueryListEvent) => void) => {
        listeners.delete(cb);
      },
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function triggerMatchMediaChange(matches: boolean) {
    mediaMatches = matches;
    act(() => {
      listeners.forEach((cb) => cb({ matches } as MediaQueryListEvent));
    });
  }

  test('1. Nothing stored, OS dark gives dark on <html>; OS light gives light', () => {
    mediaMatches = true;
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('mode').textContent).toBe('system');
    expect(screen.getByTestId('resolved').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  test('2. setMode("light") while OS dark gives light and stores light', async () => {
    const user = userEvent.setup();
    mediaMatches = true;
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Set Light' }));

    expect(screen.getByTestId('mode').textContent).toBe('light');
    expect(screen.getByTestId('resolved').textContent).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(localStorage.getItem('antarip-theme')).toBe('light');
  });

  test('3. mode === "system": dispatching a change event on matchMedia flips the class', () => {
    mediaMatches = false;
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('resolved').textContent).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);

    triggerMatchMediaChange(true);

    expect(screen.getByTestId('resolved').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('4. mode === "dark": matchMedia change event changes nothing', async () => {
    const user = userEvent.setup();
    mediaMatches = false;
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Set Dark' }));
    expect(screen.getByTestId('resolved').textContent).toBe('dark');

    triggerMatchMediaChange(false);
    expect(screen.getByTestId('resolved').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('5. forcedTheme="light" ignores stored dark and OS dark; forced is true', () => {
    localStorage.setItem('antarip-theme', 'dark');
    mediaMatches = true;

    render(
      <ThemeProvider forcedTheme="light">
        <TestConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('forced').textContent).toBe('true');
    expect(screen.getByTestId('resolved').textContent).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  test('6. enableSystem={false} with stored system normalizes to default', () => {
    localStorage.setItem('antarip-theme', 'system');
    render(
      <ThemeProvider enableSystem={false} defaultMode="light">
        <TestConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('mode').textContent).toBe('light');
    expect(screen.getByTestId('resolved').textContent).toBe('light');
  });

  test('7. Stored garbage and throwing localStorage do not crash; default is used', () => {
    localStorage.setItem('antarip-theme', 'invalid-garbage');
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Access denied');
    });

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('mode').textContent).toBe('system');
    getItemSpy.mockRestore();
  });

  test('8. Storage event from another tab updates mode', () => {
    render(
      <ThemeProvider storageKey="antarip-theme">
        <TestConsumer />
      </ThemeProvider>,
    );

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'antarip-theme',
          newValue: 'dark',
        }),
      );
    });

    expect(screen.getByTestId('mode').textContent).toBe('dark');
    expect(screen.getByTestId('resolved').textContent).toBe('dark');
  });

  test('9. ThemeToggle renders radio group and handles user interaction', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const lightRadio = screen.getByRole('radio', { name: 'Light' });
    const darkRadio = screen.getByRole('radio', { name: 'Dark' });
    const systemRadio = screen.getByRole('radio', { name: 'System' });

    expect(systemRadio).toBeChecked();

    await user.click(darkRadio);
    expect(darkRadio).toBeChecked();
    expect(localStorage.getItem('antarip-theme')).toBe('dark');

    await user.click(lightRadio);
    expect(lightRadio).toBeChecked();
    expect(localStorage.getItem('antarip-theme')).toBe('light');
  });

  test('ThemeToggle returns null when theme is forced', () => {
    const { container } = render(
      <ThemeProvider forcedTheme="dark">
        <ThemeToggle />
      </ThemeProvider>,
    );
    expect(container.firstChild).toBeNull();
  });

  test('useTheme throws error if used outside ThemeProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow('useTheme must be used within <ThemeProvider>');
    consoleError.mockRestore();
  });

  test('ThemeToggle has no axe accessibility violations', async () => {
    const { container } = render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
