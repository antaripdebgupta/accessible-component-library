import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test, vi } from "vitest";
import { ToastProvider, useToast } from "./ToastProvider";
import { Button } from "../Button/Button";

expect.extend(toHaveNoViolations);

function Demo() {
    const { push } = useToast();
    return (
        <Button onClick={() => push({ title: "Saved", description: "Your changes were saved.", variant: "success" })}>
            Trigger
        </Button>
    );
}

test("pushing a toast renders role=status with title and description", async () => {
    render(<ToastProvider><Demo /></ToastProvider>);
    await userEvent.click(screen.getByRole("button", { name: "Trigger" }));

    const toast = await screen.findByRole("status");
    expect(toast).toHaveTextContent("Saved");
    expect(toast).toHaveTextContent("Your changes were saved.");
});

test("dismiss button removes the toast and is always present", async () => {
    render(<ToastProvider><Demo /></ToastProvider>);
    await userEvent.click(screen.getByRole("button", { name: "Trigger" }));

    const dismissBtn = await screen.findByRole("button", { name: "Dismiss notification" });
    await userEvent.click(dismissBtn);

    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
});

test("auto-dismisses after duration elapses", async () => {
    vi.useFakeTimers();
    render(<ToastProvider><Demo /></ToastProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Trigger" }));

    expect(screen.getByRole("status")).toBeInTheDocument();
    act(() => {
        vi.advanceTimersByTime(4500);
    });

    vi.useRealTimers();
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
});

test("has no axe violations", async () => {
    const { container } = render(<ToastProvider><Demo /></ToastProvider>);
    await userEvent.click(screen.getByRole("button", { name: "Trigger" }));
    await screen.findByRole("status");
    expect(await axe(container)).toHaveNoViolations();
});