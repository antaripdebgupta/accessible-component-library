import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useInput } from './use-input';
import type { ChangeEvent } from 'react';

describe('useInput primitive hook', () => {
  it('handles uncontrolled value changes', () => {
    const { result } = renderHook(() => useInput({ defaultValue: 'test' }));
    expect(result.current.value).toBe('test');

    act(() => {
      result.current
        .getInputProps()
        .onChange({ target: { value: 'updated' } } as ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.value).toBe('updated');
  });

  it('defaults to empty string when no defaultValue is given', () => {
    const { result } = renderHook(() => useInput());
    expect(result.current.value).toBe('');
  });

  it('handles controlled value changes', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(({ val }) => useInput({ value: val, onChange }), {
      initialProps: { val: 'controlled' },
    });

    expect(result.current.value).toBe('controlled');

    act(() => {
      result.current
        .getInputProps()
        .onChange({ target: { value: 'new text' } } as ChangeEvent<HTMLInputElement>);
    });

    expect(onChange).toHaveBeenCalledWith('new text', expect.anything());

    rerender({ val: 'new text' });
    expect(result.current.value).toBe('new text');
  });

  it('getInputProps reflects disabled, readOnly, and required flags', () => {
    const { result } = renderHook(() =>
      useInput({ disabled: true, readOnly: true, required: true }),
    );
    const props = result.current.getInputProps();
    expect(props.disabled).toBe(true);
    expect(props.readOnly).toBe(true);
    expect(props.required).toBe(true);
  });

  it('non-password type is unaffected by showPassword state', () => {
    const { result } = renderHook(() => useInput({ type: 'email' }));
    expect(result.current.effectiveType).toBe('email');
    act(() => result.current.togglePasswordVisibility());
    // Toggling has no meaningful effect on a non-password type's effectiveType.
    expect(result.current.effectiveType).toBe('email');
  });

  it('toggles password visibility between text and password types', () => {
    const { result } = renderHook(() => useInput({ type: 'password' }));

    expect(result.current.effectiveType).toBe('password');
    expect(result.current.showPassword).toBe(false);

    act(() => result.current.togglePasswordVisibility());

    expect(result.current.effectiveType).toBe('text');
    expect(result.current.showPassword).toBe(true);

    act(() => result.current.togglePasswordVisibility());

    expect(result.current.effectiveType).toBe('password');
    expect(result.current.showPassword).toBe(false);
  });

  describe('togglePasswordVisibility — cursor/selection preservation', () => {
    let rafSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      rafSpy = vi
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation((cb: FrameRequestCallback) => {
          cb(0);
          return 0;
        });
    });
    afterEach(() => {
      rafSpy.mockRestore();
    });

    it('restores selectionRange on the input ref after toggling, when start/end are set', () => {
      const { result } = renderHook(() =>
        useInput({ type: 'password', defaultValue: 'secret123' }),
      );
      const setSelectionRange = vi.fn();
      // Simulate a real input element with a cursor selection.
      result.current.inputRef.current = {
        selectionStart: 2,
        selectionEnd: 5,
        setSelectionRange,
      } as unknown as HTMLInputElement;

      act(() => result.current.togglePasswordVisibility());

      expect(setSelectionRange).toHaveBeenCalledWith(2, 5);
    });

    it('does nothing when inputRef.current is null', () => {
      const { result } = renderHook(() => useInput({ type: 'password' }));
      result.current.inputRef.current = null;
      expect(() => act(() => result.current.togglePasswordVisibility())).not.toThrow();
    });

    it('swallows an error if setSelectionRange throws (unsupported on this input type)', () => {
      const { result } = renderHook(() => useInput({ type: 'password' }));
      const setSelectionRange = vi.fn(() => {
        throw new Error('not supported');
      });
      result.current.inputRef.current = {
        selectionStart: 0,
        selectionEnd: 0,
        setSelectionRange,
      } as unknown as HTMLInputElement;

      expect(() => act(() => result.current.togglePasswordVisibility())).not.toThrow();
    });

    it('does not call setSelectionRange when selectionStart/End are null', () => {
      const { result } = renderHook(() => useInput({ type: 'password' }));
      const setSelectionRange = vi.fn();
      result.current.inputRef.current = {
        selectionStart: null,
        selectionEnd: null,
        setSelectionRange,
      } as unknown as HTMLInputElement;

      act(() => result.current.togglePasswordVisibility());
      expect(setSelectionRange).not.toHaveBeenCalled();
    });
  });

  it('setValue updates value directly (uncontrolled)', () => {
    const { result } = renderHook(() => useInput({ defaultValue: 'a' }));
    act(() => result.current.setValue('b'));
    expect(result.current.value).toBe('b');
  });

  it('getInputProps id is stable across re-renders', () => {
    const { result, rerender } = renderHook(() => useInput());
    const firstId = result.current.getInputProps().id;
    rerender();
    expect(result.current.getInputProps().id).toBe(firstId);
  });
});
