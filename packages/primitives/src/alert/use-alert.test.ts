import { useCallback, useState } from 'react';

export interface UseAlertOptions {
    urgency?: 'polite' | 'assertive' | 'off';
    closable?: boolean;
    onClose?: () => void;
}

export function useAlert({
    urgency = 'assertive',
    closable = false,
    onClose,
}: UseAlertOptions = {}) {
    const [visible, setVisible] = useState(true);

    const close = useCallback(() => {
        setVisible(false);
        onClose?.();
    }, [onClose]);

    const isLiveRegion = urgency !== 'off';

    return {
        visible,
        close,
        closable,
        alertProps: {
            role: isLiveRegion ? 'alert' : undefined,
            'aria-live': isLiveRegion ? urgency : undefined,
            'aria-atomic': isLiveRegion ? true : undefined,
        },
    };
}