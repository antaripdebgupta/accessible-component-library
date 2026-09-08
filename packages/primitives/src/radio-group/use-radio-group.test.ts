import { act, renderHook } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { useRadioGroup } from './use-radio-group';
import type { KeyboardEvent } from 'react';

function fakeRef() {
  return { current: { focus: vi.fn() } as unknown as HTMLInputElement };
}

test('initial uncontrolled state does not auto-select first item', () => {
  const { result } = renderHook(() => useRadioGroup());
  expect(result.current.value).toBeUndefined();
});

test('registering items and selecting updates state', () => {
  const { result } = renderHook(() => useRadioGroup());
  const ref1 = { current: null };
  const ref2 = { current: null };

  act(() => {
    result.current.registerItem('option-1', { disabled: false, ref: ref1 });
    result.current.registerItem('option-2', { disabled: false, ref: ref2 });
  });

  act(() => result.current.selectValue('option-1'));
  expect(result.current.value).toBe('option-1');
});

describe('useRadioGroup — disabled handling', () => {
  test('skips disabled options when navigating', () => {
    const { result } = renderHook(() => useRadioGroup({ orientation: 'vertical' }));
    const ref1 = fakeRef();
    const ref2 = fakeRef();
    const ref3 = fakeRef();

    act(() => {
      result.current.registerItem('a', { disabled: false, ref: ref1 });
      result.current.registerItem('b', { disabled: true, ref: ref2 });
      result.current.registerItem('c', { disabled: false, ref: ref3 });
    });

    const preventDefault = vi.fn();
    const event = {
      key: 'ArrowDown',
      preventDefault,
    } as unknown as KeyboardEvent<HTMLInputElement>;

    act(() => result.current.handleKeyDown(event, 'a'));

    expect(result.current.value).toBe('c');
    expect(ref3.current.focus).toHaveBeenCalled();
  });

  test('selectValue does nothing for a disabled individual item', () => {
    const { result } = renderHook(() => useRadioGroup());
    const ref = fakeRef();
    act(() => result.current.registerItem('a', { disabled: true, ref }));
    act(() => result.current.selectValue('a'));
    expect(result.current.value).toBeUndefined();
  });

  test('selectValue does nothing when the whole group is disabled', () => {
    const { result } = renderHook(() => useRadioGroup({ disabled: true }));
    const ref = fakeRef();
    act(() => result.current.registerItem('a', { disabled: false, ref }));
    act(() => result.current.selectValue('a'));
    expect(result.current.value).toBeUndefined();
  });

  test('selectValue on an unregistered value is a no-op', () => {
    const { result } = renderHook(() => useRadioGroup());
    expect(() => act(() => result.current.selectValue('ghost'))).not.toThrow();
    expect(result.current.value).toBeUndefined();
  });

  test('handleKeyDown with zero enabled items is a no-op', () => {
    const { result } = renderHook(() => useRadioGroup());
    const ref = fakeRef();
    act(() => result.current.registerItem('a', { disabled: true, ref }));
    const event = {
      key: 'ArrowDown',
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent<HTMLInputElement>;
    expect(() => act(() => result.current.handleKeyDown(event, 'a'))).not.toThrow();
  });

  test('handleKeyDown with a currentVal not in the enabled set is a no-op', () => {
    const { result } = renderHook(() => useRadioGroup());
    const ref = fakeRef();
    act(() => result.current.registerItem('a', { disabled: false, ref }));
    const event = {
      key: 'ArrowDown',
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent<HTMLInputElement>;
    expect(() => act(() => result.current.handleKeyDown(event, 'unregistered'))).not.toThrow();
    expect(result.current.value).toBeUndefined();
  });
});

describe('useRadioGroup — vertical orientation', () => {
  test('ArrowDown moves forward, ArrowUp moves backward, both wrapping', () => {
    const { result } = renderHook(() => useRadioGroup({ orientation: 'vertical' }));
    const refA = fakeRef();
    const refB = fakeRef();
    const refC = fakeRef();
    act(() => {
      result.current.registerItem('a', { disabled: false, ref: refA });
      result.current.registerItem('b', { disabled: false, ref: refB });
      result.current.registerItem('c', { disabled: false, ref: refC });
    });

    act(() =>
      result.current.handleKeyDown(
        { key: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent<HTMLInputElement>,
        'a',
      ),
    );
    expect(result.current.value).toBe('b');

    act(() =>
      result.current.handleKeyDown(
        { key: 'ArrowUp', preventDefault: vi.fn() } as unknown as KeyboardEvent<HTMLInputElement>,
        'b',
      ),
    );
    expect(result.current.value).toBe('a');

    // Wrap backward past first item
    act(() =>
      result.current.handleKeyDown(
        { key: 'ArrowUp', preventDefault: vi.fn() } as unknown as KeyboardEvent<HTMLInputElement>,
        'a',
      ),
    );
    expect(result.current.value).toBe('c');
  });

  test('ArrowLeft/ArrowRight are ignored in vertical orientation', () => {
    const { result } = renderHook(() => useRadioGroup({ orientation: 'vertical' }));
    const refA = fakeRef();
    const refB = fakeRef();
    act(() => {
      result.current.registerItem('a', { disabled: false, ref: refA });
      result.current.registerItem('b', { disabled: false, ref: refB });
    });
    const preventDefault = vi.fn();
    act(() =>
      result.current.handleKeyDown(
        { key: 'ArrowRight', preventDefault } as unknown as KeyboardEvent<HTMLInputElement>,
        'a',
      ),
    );
    expect(preventDefault).not.toHaveBeenCalled();
    expect(result.current.value).toBeUndefined();
  });
});

describe('useRadioGroup — horizontal orientation + RTL', () => {
  test('LTR: ArrowRight moves forward, ArrowLeft moves backward', () => {
    const { result } = renderHook(() => useRadioGroup({ orientation: 'horizontal', dir: 'ltr' }));
    const refA = fakeRef();
    const refB = fakeRef();
    act(() => {
      result.current.registerItem('a', { disabled: false, ref: refA });
      result.current.registerItem('b', { disabled: false, ref: refB });
    });

    act(() =>
      result.current.handleKeyDown(
        {
          key: 'ArrowRight',
          preventDefault: vi.fn(),
        } as unknown as KeyboardEvent<HTMLInputElement>,
        'a',
      ),
    );
    expect(result.current.value).toBe('b');
  });

  test('RTL: ArrowRight mirrors to move backward (wraps to last)', () => {
    const { result } = renderHook(() => useRadioGroup({ orientation: 'horizontal', dir: 'rtl' }));
    const refA = fakeRef();
    const refB = fakeRef();
    act(() => {
      result.current.registerItem('a', { disabled: false, ref: refA });
      result.current.registerItem('b', { disabled: false, ref: refB });
    });

    act(() =>
      result.current.handleKeyDown(
        {
          key: 'ArrowRight',
          preventDefault: vi.fn(),
        } as unknown as KeyboardEvent<HTMLInputElement>,
        'a',
      ),
    );
    expect(result.current.value).toBe('b'); // wraps backward from index 0 -> last index (1) = 'b'
  });

  test('RTL: ArrowLeft mirrors to move forward', () => {
    const { result } = renderHook(() => useRadioGroup({ orientation: 'horizontal', dir: 'rtl' }));
    const refA = fakeRef();
    const refB = fakeRef();
    act(() => {
      result.current.registerItem('a', { disabled: false, ref: refA });
      result.current.registerItem('b', { disabled: false, ref: refB });
    });

    act(() =>
      result.current.handleKeyDown(
        { key: 'ArrowLeft', preventDefault: vi.fn() } as unknown as KeyboardEvent<HTMLInputElement>,
        'a',
      ),
    );
    expect(result.current.value).toBe('b');
  });

  test('ArrowUp/ArrowDown are ignored in horizontal orientation', () => {
    const { result } = renderHook(() => useRadioGroup({ orientation: 'horizontal' }));
    const refA = fakeRef();
    const refB = fakeRef();
    act(() => {
      result.current.registerItem('a', { disabled: false, ref: refA });
      result.current.registerItem('b', { disabled: false, ref: refB });
    });
    const preventDefault = vi.fn();
    act(() =>
      result.current.handleKeyDown(
        { key: 'ArrowDown', preventDefault } as unknown as KeyboardEvent<HTMLInputElement>,
        'a',
      ),
    );
    expect(preventDefault).not.toHaveBeenCalled();
  });
});

describe('useRadioGroup — Home/End', () => {
  test('Home selects and focuses the first enabled item', () => {
    const { result } = renderHook(() => useRadioGroup());
    const refA = fakeRef();
    const refB = fakeRef();
    const refC = fakeRef();
    act(() => {
      result.current.registerItem('a', { disabled: false, ref: refA });
      result.current.registerItem('b', { disabled: false, ref: refB });
      result.current.registerItem('c', { disabled: false, ref: refC });
    });
    act(() =>
      result.current.handleKeyDown(
        { key: 'End', preventDefault: vi.fn() } as unknown as KeyboardEvent<HTMLInputElement>,
        'a',
      ),
    );
    expect(result.current.value).toBe('c');
    expect(refC.current.focus).toHaveBeenCalled();

    act(() =>
      result.current.handleKeyDown(
        { key: 'Home', preventDefault: vi.fn() } as unknown as KeyboardEvent<HTMLInputElement>,
        'c',
      ),
    );
    expect(result.current.value).toBe('a');
    expect(refA.current.focus).toHaveBeenCalled();
  });
});

describe('useRadioGroup — controlled mode', () => {
  test('controlled value drives state and onValueChange fires', () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() => useRadioGroup({ value: 'b', onValueChange }));
    const refA = fakeRef();
    const refB = fakeRef();
    act(() => {
      result.current.registerItem('a', { disabled: false, ref: refA });
      result.current.registerItem('b', { disabled: false, ref: refB });
    });
    expect(result.current.value).toBe('b');
    act(() => result.current.selectValue('a'));
    expect(onValueChange).toHaveBeenCalledWith('a');
  });
});

describe('useRadioGroup — focusValue', () => {
  test('focusValue calls focus() on the item ref and updates focusedValue', () => {
    const { result } = renderHook(() => useRadioGroup());
    const ref = fakeRef();
    act(() => result.current.registerItem('a', { disabled: false, ref }));
    act(() => result.current.focusValue('a'));
    expect(ref.current.focus).toHaveBeenCalled();
    expect(result.current.focusedValue).toBe('a');
  });

  test('focusValue on an unregistered item is a no-op', () => {
    const { result } = renderHook(() => useRadioGroup());
    expect(() => act(() => result.current.focusValue('ghost'))).not.toThrow();
  });

  test('focusValue on an item with a null ref.current is a no-op', () => {
    const { result } = renderHook(() => useRadioGroup());
    act(() => result.current.registerItem('a', { disabled: false, ref: { current: null } }));
    expect(() => act(() => result.current.focusValue('a'))).not.toThrow();
    expect(result.current.focusedValue).toBeUndefined();
  });
});

describe('useRadioGroup — cleanup', () => {
  test('unregistering an item removes it from order', () => {
    const { result } = renderHook(() => useRadioGroup());
    const ref = fakeRef();
    let cleanup: () => void = () => {};
    act(() => {
      cleanup = result.current.registerItem('temp', { disabled: false, ref });
    });
    act(() => cleanup());
    expect(result.current.order.current).not.toContain('temp');
  });
});
