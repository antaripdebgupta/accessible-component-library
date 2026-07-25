import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, fn } from '@storybook/test';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    a11y: { config: { rules: [] } },
  },
  args: { onClick: fn() },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Save changes',
    variant: 'primary',
    loadingText: 'loading...',
  },
};

export const Secondary: Story = {
  args: { children: 'Cancel', variant: 'secondary' },
};

export const Danger: Story = {
  args: { children: 'Delete account', variant: 'danger' },
};

export const Loading: Story = {
  args: { children: 'Save changes', loading: true, loadingText: 'Saving…' },
};

export const Disabled: Story = {
  args: { children: 'Submit', disabled: true },
};

export const KeyboardInteraction: Story = {
  args: { children: 'Submit' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Submit' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('[Enter]');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('[Space]');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const DisabledDoesNotFire: Story = {
  args: { children: 'Submit', disabled: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Submit' });
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
