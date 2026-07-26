import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';

const meta: Meta<typeof Alert> = {
    title: 'Components/Alert',
    component: Alert,
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Success: Story = {
    args: {
        variant: 'success',
        title: 'Success Tips',
        children:
            'Detailed description and advice about your submission.',
    },
};

export const Info: Story = {
    args: {
        variant: 'info',
        title: 'Informational Notes',
        children: 'Additional description and information.',
    },
};

export const Warning: Story = {
    args: {
        variant: 'warning',
        title: 'Warning',
        closable: true,
        children: 'This is a warning notice.',
    },
};

export const Danger: Story = {
    args: {
        variant: 'danger',
        title: 'Error',
        children: 'This is an error message.',
    },
};

export const Banner: Story = {
    args: {
        variant: 'warning',
        banner: true,
        closable: true,
        children: 'Display alert as a banner at top of page.',
    },
};

export const NoDescription: Story = {
    args: {
        variant: 'warning',
        title: 'Warning text without description',
    },
};

export const ClosableDismisses: Story = {
    args: {
        variant: 'warning',
        title: 'Warning',
        closable: true,
        children: 'Click close to dismiss.',
    },
};
