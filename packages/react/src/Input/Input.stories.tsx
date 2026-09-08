import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Search, Mail, Lock, Copy } from 'lucide-react';
import { useState } from 'react';
import { Input, InputGroup, FieldGroup, FileInput } from './index';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['!autodocs'],
  args: {
    placeholder: 'Enter text...',
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Standard input placeholder',
  },
};

export const Field: Story = {
  args: {
    label: 'Email Address',
    type: 'email',
    description: 'We will never share your email with third parties.',
    placeholder: 'alex@example.com',
  },
};

export const FieldGroupVariant: Story = {
  render: () => (
    <FieldGroup legend="Date of Birth" description="Enter day, month, and year">
      <Input label="Day" placeholder="DD" className="w-20" />
      <Input label="Month" placeholder="MM" className="w-20" />
      <Input label="Year" placeholder="YYYY" className="w-28" />
    </FieldGroup>
  ),
};

export const Disabled: Story = {
  args: {
    label: 'License Key',
    value: 'XXXX-XXXX-XXXX-XXXX',
    disabled: true,
  },
};

export const Invalid: Story = {
  args: {
    label: 'Username',
    defaultValue: 'admin',
    error: 'This username is reserved. Please choose another.',
  },
};

export const File: Story = {
  render: () => (
    <FileInput
      label="Document Upload"
      description="Upload PDF or DOCX files up to 10MB"
      accept=".pdf,.docx"
    />
  ),
};

export const Inline: Story = {
  args: {
    label: 'Subdomain',
    layout: 'inline',
    placeholder: 'my-company',
    suffix: '.app.com',
  },
};

export const Grid: Story = {
  render: () => (
    <div className="grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
      <Input label="First Name" placeholder="Jane" />
      <Input label="Last Name" placeholder="Doe" />
      <Input label="Email" type="email" placeholder="jane@example.com" className="md:col-span-2" />
    </div>
  ),
};

export const Require: Story = {
  args: {
    label: 'Full Name',
    required: true,
    showRequiredIndicator: true,
    placeholder: 'John Smith',
  },
};

export const Badge: Story = {
  args: {
    label: 'Price',
    badge: 'USD',
    placeholder: '0.00',
  },
};

export const InputGroupVariant: Story = {
  args: {
    label: 'Search Documents',
    prefix: <Search size={16} />,
    placeholder: 'Type to search...',
  },
};

export const ButtonGroupVariant: Story = {
  render: () => {
    return (
      <div className="flex max-w-md flex-col gap-4">
        <Input label="Account Password" type="password" defaultValue="SuperSecretP@ss" />

        <div className="flex flex-col gap-1.5">
          <label className="text-text-primary text-sm font-medium">Referral Link</label>
          <InputGroup>
            <Input value="https://acl.design/ref/12345" readOnly className="rounded-e-none" />
            <button
              type="button"
              className="bg-accent-default text-text-inverse hover:bg-accent-hover focus-ring-safe shrink-0 rounded-e-md px-4 py-2 text-xs font-medium"
              onClick={() => alert('Copied to clipboard!')}
            >
              <Copy size={14} className="me-1 inline" />
              Copy
            </button>
          </InputGroup>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const copyBtn = canvas.getByRole('button', { name: /Copy/ });
    await expect(copyBtn).toBeInTheDocument();
    await userEvent.click(copyBtn);
  },
};

export const FormComposition: Story = {
  render: function FullFormExample() {
    const [submitted, setSubmitted] = useState(false);

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="border-border bg-surface flex w-full max-w-md flex-col gap-4 rounded-xl border p-6 shadow-xs"
      >
        <h2 className="text-text-primary text-lg font-bold">Create Account</h2>

        <Input label="Full Name" required showRequiredIndicator placeholder="Alex Morgan" />
        <Input
          label="Email Address"
          type="email"
          required
          showRequiredIndicator
          prefix={<Mail size={16} />}
          placeholder="alex@example.com"
        />
        <Input label="Password" type="password" required showRequiredIndicator />

        <FileInput label="Profile Photo (Optional)" accept="image/*" />

        <button
          type="submit"
          className="bg-accent-default text-text-inverse hover:bg-accent-hover focus-ring-safe mt-2 w-full rounded-md py-2.5 font-medium"
        >
          Register
        </button>

        {submitted && (
          <p className="text-accent-default text-center text-xs font-semibold">
            Form submitted successfully!
          </p>
        )}
      </form>
    );
  },
};

export const RTL: Story = {
  args: {
    label: 'اسم المستخدم (Username)',
    dir: 'rtl',
    placeholder: 'ادخل اسم المستخدم...',
    prefix: <Search size={16} />,
    badge: 'SAR',
    required: true,
  },
};
