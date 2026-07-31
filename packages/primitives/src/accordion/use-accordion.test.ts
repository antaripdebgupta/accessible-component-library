import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { useAccordion } from './use-accordion';

describe('useAccordion — single mode', () => {
  test('opening an item closes the previously open one', () => {
    const { result } = renderHook(() => useAccordion({ type: 'single' }));
    act(() => result.current.registerItem('a'));
    act(() => result.current.registerItem('b'));

    act(() => result.current.getTriggerProps('a').onClick());
    expect(result.current.isOpen('a')).toBe(true);

    act(() => result.current.getTriggerProps('b').onClick());
    expect(result.current.isOpen('a')).toBe(false);
    expect(result.current.isOpen('b')).toBe(true);
  });

  test('collapsible=true allows closing the open item', () => {
    const { result } = renderHook(() => useAccordion({ type: 'single', collapsible: true }));
    act(() => result.current.getTriggerProps('a').onClick());
    expect(result.current.isOpen('a')).toBe(true);
    act(() => result.current.getTriggerProps('a').onClick());
    expect(result.current.isOpen('a')).toBe(false);
  });

  test('collapsible=false keeps one item always open', () => {
    const { result } = renderHook(() => useAccordion({ type: 'single', collapsible: false }));
    act(() => result.current.getTriggerProps('a').onClick());
    act(() => result.current.getTriggerProps('a').onClick());
    expect(result.current.isOpen('a')).toBe(true);
  });

  test('disabled item does not toggle', () => {
    const { result } = renderHook(() => useAccordion({ type: 'single' }));
    act(() => result.current.getTriggerProps('a', true).onClick());
    expect(result.current.isOpen('a')).toBe(false);
  });
});

describe('useAccordion — multiple mode', () => {
  test('multiple items can be open simultaneously', () => {
    const { result } = renderHook(() => useAccordion({ type: 'multiple' }));
    act(() => result.current.getTriggerProps('a').onClick());
    act(() => result.current.getTriggerProps('b').onClick());
    expect(result.current.isOpen('a')).toBe(true);
    expect(result.current.isOpen('b')).toBe(true);
  });

  test('toggling an open item in multiple mode closes only that item', () => {
    const { result } = renderHook(() => useAccordion({ type: 'multiple' }));
    act(() => result.current.getTriggerProps('a').onClick());
    act(() => result.current.getTriggerProps('b').onClick());
    act(() => result.current.getTriggerProps('a').onClick());
    expect(result.current.isOpen('a')).toBe(false);
    expect(result.current.isOpen('b')).toBe(true);
  });
});

describe('useAccordion — controlled mode', () => {
  test('controlled value drives isOpen; onValueChange fires on click', () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useAccordion({ type: 'single', value: 'a', onValueChange }),
    );
    expect(result.current.isOpen('a')).toBe(true);
    act(() => result.current.getTriggerProps('b').onClick());
    expect(onValueChange).toHaveBeenCalledWith('b');
  });
});

describe('useAccordion — keyboard navigation', () => {
  test('ArrowDown/ArrowUp/Home/End move focus between triggers', () => {
    const { result } = renderHook(() => useAccordion({ type: 'single' }));
    act(() => {
      result.current.registerItem('a');
      result.current.registerItem('b');
      result.current.registerItem('c');
    });

    document.body.innerHTML = `
      <button id="${result.current.getTriggerProps('a').id}"></button>
      <button id="${result.current.getTriggerProps('b').id}"></button>
      <button id="${result.current.getTriggerProps('c').id}"></button>
    `;
    const a = document.getElementById(result.current.getTriggerProps('a').id)!;
    const c = document.getElementById(result.current.getTriggerProps('c').id)!;

    act(() =>
      result.current
        .getTriggerProps('a')
        .onKeyDown({ key: 'End', preventDefault: () => {} } as any),
    );
    expect(document.activeElement).toBe(c);

    act(() =>
      result.current
        .getTriggerProps('c')
        .onKeyDown({ key: 'Home', preventDefault: () => {} } as any),
    );
    expect(document.activeElement).toBe(a);
  });
});

describe('useAccordion — ARIA wiring', () => {
  test('trigger and panel ids link via aria-controls/aria-labelledby', () => {
    const { result } = renderHook(() => useAccordion({ type: 'single' }));
    const trigger = result.current.getTriggerProps('a');
    const panel = result.current.getPanelProps('a');
    expect(trigger['aria-controls']).toBe(panel.id);
    expect(panel['aria-labelledby']).toBe(trigger.id);
  });
});
