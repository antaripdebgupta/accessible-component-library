import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useTextarea, getGraphemeCount } from './use-textarea';
import type { ChangeEvent, KeyboardEvent } from 'react';

describe('getGraphemeCount', () => {
  it('counts basic ASCII string length', () => {
    expect(getGraphemeCount('hello')).toBe(5);
  });

  it('counts empty string as 0', () => {
    expect(getGraphemeCount('')).toBe(0);
  });

  it('correctly counts multi-byte surrogate pairs and emoji as single graphemes', () => {
    expect(getGraphemeCount('😀')).toBe(1);
    expect(getGraphemeCount('👨‍👩‍👧‍👦')).toBe(1);
    expect(getGraphemeCount('Hello World')).toBe(11);
  });
});

describe('useTextarea primitive hook', () => {
  it('handles uncontrolled state', () => {
    const { result } = renderHook(() => useTextarea({ defaultValue: 'initial' }));
    expect(result.current.value).toBe('initial');

    act(() => {
      const props = result.current.getTextareaProps();
      props.onChange({
        target: { value: 'updated' },
      } as ChangeEvent<HTMLTextAreaElement>);
    });

    expect(result.current.value).toBe('updated');
  });

  it('handles controlled state', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(({ val }) => useTextarea({ value: val, onChange }), {
      initialProps: { val: 'controlled' },
    });

    expect(result.current.value).toBe('controlled');

    act(() => {
      const props = result.current.getTextareaProps();
      props.onChange({
        target: { value: 'new value' },
      } as ChangeEvent<HTMLTextAreaElement>);
    });

    expect(onChange).toHaveBeenCalledWith('new value', expect.anything());

    rerender({ val: 'new value' });
    expect(result.current.value).toBe('new value');
  });

  it('calculates remainingCount, isOverCount, and isNearLimit', () => {
    const { result } = renderHook(() => useTextarea({ defaultValue: '12345678', maxCount: 10 }));

    expect(result.current.characterCount).toBe(8);
    expect(result.current.remainingCount).toBe(2);
    expect(result.current.isOverCount).toBe(false);
    expect(result.current.isNearLimit).toBe(true);

    // Over count state
    act(() => {
      result.current.getTextareaProps().onChange({
        target: { value: '123456789012' },
      } as ChangeEvent<HTMLTextAreaElement>);
    });

    expect(result.current.characterCount).toBe(12);
    expect(result.current.remainingCount).toBe(-2);
    expect(result.current.isOverCount).toBe(true);
    expect(result.current.isNearLimit).toBe(false);
  });

  it('triggers onSubmit on Enter when submitOnEnter is true', () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useTextarea({ defaultValue: 'test message', submitOnEnter: true, onSubmit }),
    );

    const preventDefault = vi.fn();
    const event = {
      key: 'Enter',
      shiftKey: false,
      nativeEvent: { isComposing: false },
      preventDefault,
    } as unknown as KeyboardEvent<HTMLTextAreaElement>;

    act(() => {
      result.current.getTextareaProps().onKeyDown(event);
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledWith('test message', event);
  });

  it('does NOT trigger onSubmit when Shift+Enter is pressed', () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useTextarea({ defaultValue: 'test message', submitOnEnter: true, onSubmit }),
    );

    const preventDefault = vi.fn();
    const event = {
      key: 'Enter',
      shiftKey: true,
      nativeEvent: { isComposing: false },
      preventDefault,
    } as unknown as KeyboardEvent<HTMLTextAreaElement>;

    act(() => {
      result.current.getTextareaProps().onKeyDown(event);
    });

    expect(preventDefault).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
