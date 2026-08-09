import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, fn } from '@storybook/test';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    a11y: { config: { rules: [] } },
  },
  args: { onCheckedChange: fn() },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    label: 'Subscribe to newsletter',
    description: 'We will send you updates once a week.',
  },
};

export const Checked: Story = {
  args: {
    label: 'Accept terms and conditions',
    defaultChecked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    label: 'Select all features',
    defaultChecked: 'indeterminate',
  },
};

export const Error: Story = {
  args: {
    label: 'I agree to the privacy policy',
    error: 'You must agree to the privacy policy to proceed.',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Beta features',
    disabled: true,
    description: 'Currently unavailable in your region.',
  },
};

export const KeyboardInteraction: Story = {
  args: { label: 'Toggle me with space' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: 'Toggle me with space' });

    // Focus the checkbox
    await userEvent.tab();
    await expect(checkbox).toHaveFocus();
    await expect(checkbox).not.toBeChecked();

    // Toggle using Space
    await userEvent.keyboard('[Space]');
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);

    // Toggle again
    await userEvent.keyboard('[Space]');
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(false);
  },
};
