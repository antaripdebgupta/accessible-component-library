import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import jestAxe from "jest-axe";
import { expect, test, vi } from "vitest";
import { Button } from "./Button";

const { axe, toHaveNoViolations } = jestAxe;

expect.extend(toHaveNoViolations);

test("renders with accessible name from children", () => {
  render(<Button>Save changes</Button>);
  expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
});

test("has no axe violations", async () => {
  const { container } = render(<Button>Save changes</Button>);
  expect(await axe(container)).toHaveNoViolations();
});

test("aria-disabled prevents onClick but keeps element focusable", async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();

  render(
    <Button disabled onClick={onClick}>
      Submit
    </Button>,
  );

  const button = screen.getByRole("button", { name: "Submit" });

  expect(button).toHaveAttribute("aria-disabled", "true");
  expect(button).not.toHaveAttribute("disabled");

  await user.click(button);
  expect(onClick).not.toHaveBeenCalled();

  button.blur();
  await user.tab();
  expect(button).toHaveFocus();
});

test("loading state sets aria-busy and keeps accessible name present", () => {
  render(
    <Button loading loadingText="Saving…">
      Save changes
    </Button>,
  );

  const button = screen.getByRole("button", { name: "Saving…" });

  expect(button).toHaveAttribute("aria-busy", "true");
});