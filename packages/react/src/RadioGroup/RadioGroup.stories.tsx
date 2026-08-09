import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, fn } from '@storybook/test';
import { RadioGroup } from './RadioGroup';
import { RadioGroupItem } from './RadioGroupItem';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  parameters: {
    a11y: { config: { rules: [] } },
  },
  args: { onValueChange: fn() },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args} label="Select a shipping method">
      <RadioGroupItem
        value="standard"
        label="Standard Shipping"
        description="Delivery in 5-7 business days."
      />
      <RadioGroupItem
        value="express"
        label="Express Shipping"
        description="Delivery in 2-3 business days."
      />
      <RadioGroupItem
        value="overnight"
        label="Overnight Shipping"
        description="Delivery next business day."
      />
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
  render: (args) => (
    <RadioGroup {...args} label="Choose a layout">
      <RadioGroupItem value="grid" label="Grid View" />
      <RadioGroupItem value="list" label="List View" />
      <RadioGroupItem value="compact" label="Compact View" />
    </RadioGroup>
  ),
};

export const Responsive: Story = {
  args: {
    orientation: 'horizontal',
    responsive: true,
  },
  render: (args) => (
    <RadioGroup {...args} label="Responsive Layout (stacks on mobile)">
      <RadioGroupItem value="yes" label="Yes, enable responsive styling" />
      <RadioGroupItem value="no" label="No, keep horizontal always" />
    </RadioGroup>
  ),
};

export const DisabledItems: Story = {
  render: (args) => (
    <RadioGroup {...args} label="Select a payment method">
      <RadioGroupItem value="credit-card" label="Credit Card" />
      <RadioGroupItem
        value="paypal"
        label="PayPal"
        disabled
        description="Currently undergoing maintenance."
      />
      <RadioGroupItem value="apple-pay" label="Apple Pay" />
    </RadioGroup>
  ),
};

export const KeyboardInteraction: Story = {
  args: { defaultValue: 'standard' },
  render: (args) => (
    <RadioGroup {...args} label="Shipping Method">
      <RadioGroupItem value="standard" label="Standard" />
      <RadioGroupItem value="express" label="Express" />
      <RadioGroupItem value="overnight" label="Overnight" />
    </RadioGroup>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const firstRadio = canvas.getByRole('radio', { name: 'Standard' });
    const secondRadio = canvas.getByRole('radio', { name: 'Express' });

    // Focus group
    await userEvent.tab();
    await expect(firstRadio).toHaveFocus();
    await expect(firstRadio).toBeChecked();

    // Navigate to next
    await userEvent.keyboard('[ArrowDown]');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('express');
    await expect(secondRadio).toHaveFocus();
    await expect(secondRadio).toBeChecked();
  },
};
