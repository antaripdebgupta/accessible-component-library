import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useInput } from './use-input';
import type { ChangeEvent } from 'react';

describe('useInput primitive hook', () => {
  it('handles uncontrolled value changes', () => {
    const { result } = renderHook(() => useInput({ defaultValue: 'test' }));
    expect(result.current.value).toBe('test');

    act(() => {
      result.current.getInputProps().onChange({
        target: { value: 'updated' },
      } as ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.value).toBe('updated');
  });

  it('handles controlled value changes', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(({ val }) => useInput({ value: val, onChange }), {
      initialProps: { val: 'controlled' },
    });

    expect(result.current.value).toBe('controlled');

    act(() => {
      result.current.getInputProps().onChange({
        target: { value: 'new text' },
      } as ChangeEvent<HTMLInputElement>);
    });

    expect(onChange).toHaveBeenCalledWith('new text', expect.anything());

    rerender({ val: 'new text' });
    expect(result.current.value).toBe('new text');
  });

  it('toggles password visibility between text and password types', () => {
    const { result } = renderHook(() => useInput({ type: 'password' }));

    expect(result.current.effectiveType).toBe('password');
    expect(result.current.showPassword).toBe(false);

    act(() => {
      result.current.togglePasswordVisibility();
    });

    expect(result.current.effectiveType).toBe('text');
    expect(result.current.showPassword).toBe(true);

    act(() => {
      result.current.togglePasswordVisibility();
    });

    expect(result.current.effectiveType).toBe('password');
    expect(result.current.showPassword).toBe(false);
  });
});
