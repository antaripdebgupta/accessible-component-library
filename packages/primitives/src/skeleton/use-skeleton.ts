import { useReducedMotion } from '@acl/utils';

export interface UseSkeletonOptions {
  loading?: boolean;
}

export function useSkeleton({ loading = true }: UseSkeletonOptions = {}) {
  const prefersReducedMotion = useReducedMotion();

  const getSkeletonProps = () => ({
    'aria-hidden': true as const,
    role: 'presentation' as const,
  });

  const getContainerProps = (label = 'Loading') => ({
    role: 'status' as const,
    'aria-busy': loading || undefined,
    'aria-label': loading ? label : undefined,
  });

  return { loading, prefersReducedMotion, getSkeletonProps, getContainerProps };
}

export type UseSkeletonReturn = ReturnType<typeof useSkeleton>;
