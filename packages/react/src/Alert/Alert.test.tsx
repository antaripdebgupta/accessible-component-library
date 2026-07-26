import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { expect, test, vi } from "vitest";
import { Alert } from "./Alert";
import userEvent from '@testing-library/user-event';

expect.extend(toHaveNoViolations);

test("renders with role=alert and aria-live=assertive by default", () => {
    render(<Alert title="Error">Something failed</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
});

test("urgency='polite' downgrades to aria-live polite, keeps role", () => {
    render(<Alert urgency="polite" title="Note">FYI</Alert>);
    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "polite");
});

test("has no axe violations", async () => {
    const { container } = render(<Alert title="Error">Something failed</Alert>);
    expect(await axe(container)).toHaveNoViolations();
});

test("closable renders a labeled close button that removes the alert", async () => {
    const onClose = vi.fn();
    render(<Alert title="Warning" closable onClose={onClose}>Careful</Alert>);
    const closeBtn = screen.getByRole("button", { name: "Close alert" });
    await userEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});