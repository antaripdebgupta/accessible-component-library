import { describe, expect, it, vi } from 'vitest';
import { useButton } from './use-button';

describe('useButton', () => {
    it('returns the default button type', () => {
        const { buttonProps } = useButton({});

        expect(buttonProps.type).toBe('button');
    });

    it('sets aria-disabled when disabled', () => {
        const { buttonProps, isDisabled } = useButton({ disabled: true });

        expect(isDisabled).toBe(true);
        expect(buttonProps['aria-disabled']).toBe(true);
    });

    it('sets aria-busy and disabled state when loading', () => {
        const { buttonProps, isDisabled } = useButton({ loading: true });

        expect(isDisabled).toBe(true);
        expect(buttonProps['aria-busy']).toBe(true);
        expect(buttonProps['aria-disabled']).toBe(true);
    });

    it('prevents click events when disabled', () => {
        const { buttonProps } = useButton({ disabled: true });
        const stopPropagation = vi.fn();
        const preventDefault = vi.fn();

        buttonProps.onClick?.({
            preventDefault,
            stopPropagation,
        } as never);

        expect(preventDefault).toHaveBeenCalled();
        expect(stopPropagation).toHaveBeenCalled();
    });

    it('does not prevent click events when enabled', () => {
        const { buttonProps } = useButton({});

        const preventDefault = vi.fn();
        const stopPropagation = vi.fn();

        buttonProps.onClick?.({
            preventDefault,
            stopPropagation,
        } as never);

        expect(preventDefault).not.toHaveBeenCalled();
        expect(stopPropagation).not.toHaveBeenCalled();
    });
});