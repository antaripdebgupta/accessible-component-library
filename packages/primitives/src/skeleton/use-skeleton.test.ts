import { renderHook } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { useSkeleton } from './use-skeleton';

describe('useSkeleton — skeleton props', () => {
  test('skeleton props always mark the element as hidden/presentational', () => {
    const { result } = renderHook(() => useSkeleton());
    const props = result.current.getSkeletonProps();
    expect(props['aria-hidden']).toBe(true);
    expect(props.role).toBe('presentation');
  });

  test('skeleton props are identical regardless of loading state', () => {
    const { result: loadingTrue } = renderHook(() => useSkeleton({ loading: true }));
    const { result: loadingFalse } = renderHook(() => useSkeleton({ loading: false }));
    expect(loadingTrue.current.getSkeletonProps()).toEqual(loadingFalse.current.getSkeletonProps());
  });
});

describe('useSkeleton — container props', () => {
  test('loading=true sets role=status, aria-busy, and aria-label with default text', () => {
    const { result } = renderHook(() => useSkeleton({ loading: true }));
    const props = result.current.getContainerProps();
    expect(props.role).toBe('status');
    expect(props['aria-busy']).toBe(true);
    expect(props['aria-label']).toBe('Loading');
  });

  test('loading=true with custom label uses that label', () => {
    const { result } = renderHook(() => useSkeleton({ loading: true }));
    const props = result.current.getContainerProps('Loading profile');
    expect(props['aria-label']).toBe('Loading profile');
  });

  test('loading=false clears aria-busy and aria-label but keeps role=status', () => {
    const { result } = renderHook(() => useSkeleton({ loading: false }));
    const props = result.current.getContainerProps('Loading profile');
    expect(props['aria-busy']).toBeUndefined();
    expect(props['aria-label']).toBeUndefined();
    expect(props.role).toBe('status');
  });

  test('role is always status regardless of loading state — status is an implicit polite live region, so no separate aria-live is needed', () => {
    const { result: loading } = renderHook(() => useSkeleton({ loading: true }));
    const { result: loaded } = renderHook(() => useSkeleton({ loading: false }));
    expect(loading.current.getContainerProps().role).toBe('status');
    expect(loaded.current.getContainerProps().role).toBe('status');
  });
});

describe('useSkeleton — defaults', () => {
  test('loading defaults to true when no options are passed', () => {
    const { result } = renderHook(() => useSkeleton());
    expect(result.current.loading).toBe(true);
  });

  test('exposes prefersReducedMotion from the shared hook', () => {
    const { result } = renderHook(() => useSkeleton());
    expect(typeof result.current.prefersReducedMotion).toBe('boolean');
  });
});
