import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['!autodocs'],
  args: {
    placeholder: 'Enter text here...',
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: 'Type your response...',
  },
};

export const Field: Story = {
  args: {
    label: 'User Feedback',
    description: 'Please provide detailed comments about your experience.',
    placeholder: 'Write your feedback...',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Archived Notes',
    value: 'This note is archived and cannot be edited.',
    disabled: true,
  },
};

export const Invalid: Story = {
  args: {
    label: 'Bio',
    defaultValue: 'This bio contains restricted terms.',
    error: 'Bio contains invalid characters or forbidden terms.',
  },
};

export const AutoResize: Story = {
  render: () => {
    return (
      <Textarea
        label="Auto-resizing Textarea"
        description="Type multiple lines to see height adjust automatically up to 6 rows."
        autoResize
        maxRows={6}
        placeholder="Press enter multiple times to test auto-resize..."
      />
    );
  },
};

export const CharacterCount: Story = {
  args: {
    label: 'Short Post',
    description: 'Maximum 140 characters.',
    maxCount: 140,
    defaultValue: 'This is a sample post content.',
  },
};

export const ButtonVariant: Story = {
  render: function ChatInputStory() {
    const [messages, setMessages] = useState<string[]>([]);

    return (
      <div className="flex w-full max-w-md flex-col gap-4">
        <div className="bg-surface-subtle border-border flex min-h-[100px] flex-col gap-2 rounded-md border p-3">
          {messages.length === 0 ? (
            <span className="text-text-muted text-xs">No messages sent yet.</span>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className="bg-surface border-border rounded border p-2 text-xs">
                {msg}
              </div>
            ))
          )}
        </div>

        <Textarea
          label="Chat Input"
          placeholder="Write a message... (Press Enter to send)"
          submitOnEnter
          autoResize
          maxRows={4}
          onSubmit={(val, e) => {
            if (val.trim()) {
              setMessages((prev) => [...prev, val]);
            }
          }}
          actionButton={
            <button
              type="button"
              className="bg-accent-default text-text-inverse hover:bg-accent-hover focus-ring-safe rounded px-3 py-1 text-xs font-medium"
            >
              Send
            </button>
          }
        />
      </div>
    );
  },
};

export const RTL: Story = {
  args: {
    label: 'الملاحظات (Feedback in Arabic)',
    description: 'يرجى تقديم ملاحظاتك التفصيلية هنا.',
    dir: 'rtl',
    placeholder: 'اكتب نصك هنا...',
    maxCount: 200,
  },
};
