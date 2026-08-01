import type { Meta, StoryObj } from '@storybook/react';
// import { expect, userEvent, within, waitFor } from "@storybook/test";
import { Tooltip, TooltipTrigger, TooltipContent } from './index';

const meta: Meta<typeof Tooltip> = { title: 'Components/Tooltip', component: Tooltip };
export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip delayDuration={0}>
      <TooltipTrigger>
        <button
          type="button"
          className="rounded-control border-border px-control-md py-control-sm border text-sm"
        >
          Hover or focus me
        </button>
      </TooltipTrigger>
      <TooltipContent>Saves your changes</TooltipContent>
    </Tooltip>
  ),
};

export const Placements: Story = {
  render: () => (
    <div className="flex gap-8 p-16">
      {(['left', 'top', 'bottom', 'right'] as const).map((placement) => (
        <Tooltip key={placement} delayDuration={0} placement={placement}>
          <TooltipTrigger>
            <button
              type="button"
              className="rounded-control border-border px-control-md py-control-sm border text-sm capitalize"
            >
              {placement}
            </button>
          </TooltipTrigger>
          <TooltipContent>{placement} tooltip</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};

export const HoverDelay: Story = {
  render: () => (
    <Tooltip delayDuration={600}>
      <TooltipTrigger>
        <button
          type="button"
          className="rounded-control border-border px-control-md py-control-sm border text-sm"
        >
          Hover and wait 600ms
        </button>
      </TooltipTrigger>
      <TooltipContent>Appeared after a delay</TooltipContent>
    </Tooltip>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Tooltip delayDuration={0} disabled>
      <TooltipTrigger>
        <button
          type="button"
          className="rounded-control border-border px-control-md py-control-sm border text-sm"
        >
          Tooltip disabled
        </button>
      </TooltipTrigger>
      <TooltipContent>You should never see this</TooltipContent>
    </Tooltip>
  ),
};

export const DisabledButton: Story = {
  render: () => (
    <div>
      <h3 className="mb-1 text-sm font-semibold">Disabled Button</h3>
      <p className="text-text-secondary mb-4 text-sm">
        Show a tooltip on a disabled button by wrapping it with a span.
      </p>
      <Tooltip delayDuration={0}>
        <TooltipTrigger>
          {/* Native `disabled` buttons fire no hover/focus events and
                        aren't focusable — the span, not the button, is the
                        real trigger here. */}
          <span tabIndex={0} className="inline-block cursor-not-allowed">
            <button
              type="button"
              disabled
              className="rounded-control border-border px-control-md py-control-sm pointer-events-none border text-sm opacity-50"
            >
              Disabled
            </button>
          </span>
        </TooltipTrigger>
        <TooltipContent>This feature is currently unavailable</TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const TextTrigger: Story = {
  render: () => (
    <p className="text-text-secondary max-w-sm text-sm">
      This component follows the{' '}
      <Tooltip delayDuration={0}>
        <TooltipTrigger>
          <span tabIndex={0} className="cursor-help underline decoration-dotted underline-offset-4">
            WAI-ARIA APG
          </span>
        </TooltipTrigger>
        <TooltipContent>Web Accessibility Initiative — Authoring Practices Guide</TooltipContent>
      </Tooltip>{' '}
      pattern for tabs, accordions, and tooltips alike.
    </p>
  ),
};

export const NoArrow: Story = {
  render: () => (
    <Tooltip delayDuration={0} showArrow={false}>
      <TooltipTrigger>
        <button
          type="button"
          className="rounded-control border-border px-control-md py-control-sm border text-sm"
        >
          No arrow
        </button>
      </TooltipTrigger>
      <TooltipContent>Plain tooltip, no pointer</TooltipContent>
    </Tooltip>
  ),
};

export const RTL: Story = {
  render: () => (
    <div dir="rtl" className="flex gap-3 p-16">
      {[
        { placement: 'right' as const, label: 'يمين' },
        { placement: 'top' as const, label: 'أعلى' },
        { placement: 'bottom' as const, label: 'أسفل' },
        { placement: 'left' as const, label: 'يسار' },
      ].map(({ placement, label }) => (
        <Tooltip key={placement} delayDuration={0} placement={placement}>
          <TooltipTrigger>
            <button
              type="button"
              className="rounded-control border-border px-control-md py-control-sm border text-sm"
            >
              {label}
            </button>
          </TooltipTrigger>
          <TooltipContent>إضافة إلى المكتبة</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};

/*export const KeyboardShowAndDismiss: Story = {
    ...Default,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.tab();
        const trigger = canvas.getByRole("button", { name: "Hover or focus me" });
        await expect(trigger).toHaveFocus();

        await waitFor(() => expect(canvas.getByRole("tooltip")).toBeVisible());

        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(canvas.queryByRole("tooltip")).not.toBeInTheDocument());
    },
};*/
