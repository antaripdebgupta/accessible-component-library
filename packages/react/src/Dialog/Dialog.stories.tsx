import { useState, forwardRef, type ButtonHTMLAttributes } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from './index';

const meta: Meta<typeof Dialog> = { title: 'Components/Dialog', component: Dialog };
export default meta;
type Story = StoryObj<typeof Dialog>;

const TriggerButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children = 'Open dialog', className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={`rounded-control bg-surface-raised text-text-primary border-border hover:border-border-strong px-control-md py-control-sm border text-sm ${className ?? ''}`}
      {...props}
    >
      {children}
    </button>
  ),
);
TriggerButton.displayName = 'TriggerButton';

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger>
        <TriggerButton />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-3">
            <label className="block text-sm">
              <span className="text-text-primary mb-1 block font-medium">Name</span>
              <input
                type="text"
                defaultValue="Jane Doe"
                className="rounded-control border-border focus-ring-safe w-full border px-3 py-2 text-sm outline-none"
              />
            </label>
            <label className="block text-sm">
              <span className="text-text-primary mb-1 block font-medium">Email</span>
              <input
                type="email"
                defaultValue="jane@example.com"
                className="rounded-control border-border focus-ring-safe w-full border px-3 py-2 text-sm outline-none"
              />
            </label>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose className="rounded-control border-border px-control-md py-control-sm border text-sm">
            Cancel
          </DialogClose>
          <button
            type="button"
            className="rounded-control bg-accent-default px-control-md py-control-sm text-sm text-white"
          >
            Save changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const CloseButton: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger>
        <TriggerButton>Feedback</TriggerButton>
      </DialogTrigger>
      <DialogContent showCloseButton={true} size="sm">
        <DialogHeader>
          <DialogTitle>Send feedback</DialogTitle>
          <DialogDescription>
            Help us improve our products by sharing your feedback.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <input
            type="text"
            readOnly
            defaultValue="This is a read-only input field. You can select the text but not edit it."
            className="rounded-control border-border text-text-primary focus-ring-safe w-full border px-3 py-2 text-sm outline-none"
            onFocus={(e) => e.target.select()}
          />
        </DialogBody>
        <DialogFooter>
          <DialogClose className="rounded-control bg-accent-default px-control-md py-control-sm text-sm text-white">
            Close
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const NoCloseButton: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger>
        <TriggerButton>Open without close button</TriggerButton>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Confirm action</DialogTitle>
          <DialogDescription>
            This dialog has no "X" — use the buttons below, click the overlay, or press Escape.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose className="rounded-control border-border px-control-md py-control-sm border text-sm">
            Cancel
          </DialogClose>
          <DialogClose className="rounded-control bg-accent-default px-control-md py-control-sm text-sm text-white">
            Confirm
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const StickyFooter: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger>
        <TriggerButton>Open sticky-footer dialog</TriggerButton>
      </DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
          <DialogDescription>Scroll to read the full terms before accepting.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          {Array.from({ length: 12 }, (_, i) => (
            <p key={i} className="text-text-secondary mb-3 text-sm">
              Section {i + 1}: This is placeholder legal text demonstrating that the footer below
              stays pinned to the bottom of the dialog while this body content scrolls
              independently.
            </p>
          ))}
        </DialogBody>
        <DialogFooter>
          <DialogClose className="rounded-control border-border px-control-md py-control-sm border text-sm">
            Decline
          </DialogClose>
          <DialogClose className="rounded-control bg-accent-default px-control-md py-control-sm text-sm text-white">
            Accept
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const ScrollableContent: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger>
        <TriggerButton>Open scrollable dialog</TriggerButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Changelog</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="mb-4">
              <h3 className="text-text-primary mb-1 text-sm font-semibold">v1.{20 - i}.0</h3>
              <p className="text-text-secondary text-sm">
                Various fixes and improvements in this release.
              </p>
            </div>
          ))}
        </DialogBody>
      </DialogContent>
    </Dialog>
  ),
};

export const Controlled: Story = {
  render: function ControlledExample() {
    const [open, setOpen] = useState(false);
    return (
      <div className="space-y-2">
        <p className="text-text-secondary text-sm">Externally controlled — open: {String(open)}</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-control border-border px-control-md py-control-sm border text-sm"
        >
          Open programmatically
        </button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Controlled dialog</DialogTitle>
              <DialogDescription>
                Opened without a DialogTrigger — focus still restores correctly to the button above
                on close.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose className="rounded-control bg-accent-default px-control-md py-control-sm text-sm text-white">
                Close
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
};

export const RTL: Story = {
  render: () => (
    <div dir="rtl">
      <Dialog>
        <DialogTrigger>
          <TriggerButton>فتح الحوار</TriggerButton>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل الملف الشخصي</DialogTitle>
            <DialogDescription>قم بإجراء تغييرات على ملفك الشخصي هنا.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <label className="block text-sm">
              <span className="text-text-primary mb-1 block font-medium">الاسم</span>
              <input
                type="text"
                defaultValue="جين دو"
                className="rounded-control border-border focus-ring-safe w-full border px-3 py-2 text-sm outline-none"
              />
            </label>
          </DialogBody>
          <DialogFooter>
            <DialogClose className="rounded-control border-border px-control-md py-control-sm border text-sm">
              إلغاء
            </DialogClose>
            <DialogClose className="rounded-control bg-accent-default px-control-md py-control-sm text-sm text-white">
              حفظ
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  ),
};
