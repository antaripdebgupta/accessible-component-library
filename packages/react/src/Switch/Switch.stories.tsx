import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, fn } from '@storybook/test';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    a11y: { config: { rules: [] } },
  },
  args: { onCheckedChange: fn() },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    label: 'Dark Mode',
  },
};

export const Checked: Story = {
  args: {
    label: 'Notifications Enabled',
    defaultChecked: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Switch size="sm" label="Small Switch" />
      <Switch size="md" label="Medium Switch" />
      <Switch size="lg" label="Large Switch" />
    </div>
  ),
};

export const Pending: Story = {
  args: {
    label: 'Saving settings...',
    pending: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled setting',
    disabled: true,
  },
};

export const KeyboardInteraction: Story = {
  args: { label: 'Toggle Me' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch', { name: 'Toggle Me' });

    // Focus the switch
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    // Toggle using Space
    await userEvent.keyboard('[Space]');
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);

    // Wait for rapid toggle protection
    await new Promise((resolve) => setTimeout(resolve, 250));

    // Toggle using Enter
    await userEvent.keyboard('[Enter]');
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(false);
  },
};
