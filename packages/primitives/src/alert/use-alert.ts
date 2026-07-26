import { useState, useCallback } from "react";

export interface UseAlertOptions {
    urgency?: "polite" | "assertive" | "off";
    closable?: boolean;
    onClose?: () => void;
}

export function useAlert({ urgency = "assertive", closable = false, onClose }: UseAlertOptions = {}) {
    const [visible, setVisible] = useState(true);

    const close = useCallback(() => {
        setVisible(false);
        onClose?.();
    }, [onClose]);

    return {
        visible,
        close,
        alertProps: {
            role: urgency === "off" ? undefined : "alert",
            "aria-live": urgency === "off" ? undefined : urgency,
            "aria-atomic": urgency === "off" ? undefined : true,
        },
        closable,
    };
}