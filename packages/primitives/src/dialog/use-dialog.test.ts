import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { useDialog } from './use-dialog';

describe('useDialog — open/close', () => {
  test('starts closed by default', () => {
    const { result } = renderHook(() => useDialog());
    expect(result.current.open).toBe(false);
  });

  test('respects defaultOpen', () => {
    const { result } = renderHook(() => useDialog({ defaultOpen: true }));
    expect(result.current.open).toBe(true);
  });

  test('trigger click opens the dialog', () => {
    const { result } = renderHook(() => useDialog());
    act(() => result.current.getTriggerProps().onClick());
    expect(result.current.open).toBe(true);
  });

  test('close() closes the dialog', () => {
    const { result } = renderHook(() => useDialog({ defaultOpen: true }));
    act(() => result.current.close());
    expect(result.current.open).toBe(false);
  });

  test('show() opens the dialog', () => {
    const { result } = renderHook(() => useDialog());
    act(() => result.current.show());
    expect(result.current.open).toBe(true);
  });
});

describe('useDialog — controlled mode', () => {
  test('controlled open drives state; onOpenChange fires on trigger click', () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useDialog({ open: false, onOpenChange }));
    act(() => result.current.getTriggerProps().onClick());
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});

describe('useDialog — overlay click', () => {
  test('overlay click closes by default', () => {
    const { result } = renderHook(() => useDialog({ defaultOpen: true }));
    act(() => result.current.getOverlayProps().onClick());
    expect(result.current.open).toBe(false);
  });

  test('closeOnOverlayClick=false keeps the dialog open on overlay click', () => {
    const { result } = renderHook(() =>
      useDialog({ defaultOpen: true, closeOnOverlayClick: false }),
    );
    act(() => result.current.getOverlayProps().onClick());
    expect(result.current.open).toBe(true);
  });
});

describe('useDialog — description registration', () => {
  test('aria-describedby is undefined until a description registers', () => {
    const { result } = renderHook(() => useDialog({ defaultOpen: true }));
    expect(result.current.getContentProps()['aria-describedby']).toBeUndefined();

    act(() => {
      result.current.registerDescription();
    });
    expect(result.current.getContentProps()['aria-describedby']).toBe(result.current.descriptionId);
  });

  test('unregistering a description clears aria-describedby', () => {
    const { result } = renderHook(() => useDialog({ defaultOpen: true }));
    let unregister: () => void = () => {};
    act(() => {
      unregister = result.current.registerDescription();
    });
    expect(result.current.getContentProps()['aria-describedby']).toBeDefined();

    act(() => unregister());
    expect(result.current.getContentProps()['aria-describedby']).toBeUndefined();
  });
});

describe('useDialog — ids', () => {
  test('trigger aria-controls only set while open', () => {
    const { result } = renderHook(() => useDialog());
    expect(result.current.getTriggerProps()['aria-controls']).toBeUndefined();

    act(() => result.current.show());
    expect(result.current.getTriggerProps()['aria-controls']).toBe(result.current.contentId);
  });

  test('content role/aria-modal/aria-labelledby are always set', () => {
    const { result } = renderHook(() => useDialog());
    const props = result.current.getContentProps();
    expect(props.role).toBe('dialog');
    expect(props['aria-modal']).toBe(true);
    expect(props['aria-labelledby']).toBe(result.current.titleId);
  });
});

describe('useDialog — close button', () => {
  test('close button props call close on click', () => {
    const { result } = renderHook(() => useDialog({ defaultOpen: true }));
    act(() => result.current.getCloseButtonProps().onClick());
    expect(result.current.open).toBe(false);
  });
});
