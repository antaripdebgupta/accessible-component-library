import { forwardRef, useState, type ButtonHTMLAttributes } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  User,
  Settings,
  LogOut,
  CreditCard,
  Keyboard,
  Cloud,
  Mail,
  MessageSquare,
  PlusCircle,
  GitGraph,
  Trash2,
  Sun,
  Moon,
  Laptop,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './index';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
};
export default meta;
type Story = StoryObj<typeof DropdownMenu>;

const TriggerButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children = 'Open menu', className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className="rounded-control border-border px-control-md py-control-sm border text-sm"
      {...props}
    >
      {children}
    </button>
  ),
);
TriggerButton.displayName = 'TriggerButton';

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="bg-accent-default flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white">
      {initials}
    </span>
  );
}

export const Basic: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <TriggerButton />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => console.log('Profile')}>Profile</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => console.log('Billing')}>Billing</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => console.log('Team')}>Team</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>Invite users (disabled)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const Submenu: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <TriggerButton />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem icon={<Mail size={14} />}>Email</DropdownMenuItem>
            <DropdownMenuItem icon={<MessageSquare size={14} />}>Message</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem icon={<PlusCircle size={14} />}>More options</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem>Team</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const Shortcuts: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <TriggerButton />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem textValue="Profile">
          Profile
          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem textValue="Billing">
          Billing
          <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem textValue="Settings">
          Settings
          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem textValue="Log out">
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const Icon: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <TriggerButton />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem icon={<User size={14} />}>Profile</DropdownMenuItem>
        <DropdownMenuItem icon={<CreditCard size={14} />}>Billing</DropdownMenuItem>
        <DropdownMenuItem icon={<Settings size={14} />}>Settings</DropdownMenuItem>
        <DropdownMenuItem icon={<Keyboard size={14} />}>Keyboard shortcuts</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<LogOut size={14} />}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const Checkboxes: Story = {
  render: function CheckboxesExample() {
    const [showStatusBar, setShowStatusBar] = useState(true);
    const [showActivityBar, setShowActivityBar] = useState(false);
    const [showPanel, setShowPanel] = useState(false);
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <TriggerButton>View</TriggerButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>
            Status bar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showActivityBar} onCheckedChange={setShowActivityBar}>
            Activity bar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showPanel} onCheckedChange={setShowPanel}>
            Panel
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const CheckboxesIcons: Story = {
  render: function CheckboxesIconsExample() {
    const [cloud, setCloud] = useState(true);
    const [github, setGithub] = useState(false);
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <TriggerButton>Integrations</TriggerButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem
            checked={cloud}
            onCheckedChange={setCloud}
            icon={<Cloud size={14} />}
          >
            Cloud sync
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={github}
            onCheckedChange={setGithub}
            icon={<GitGraph size={14} />}
          >
            GitHub sync
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const RadioGroupStory: Story = {
  name: 'Radio Group',
  render: function RadioGroupExample() {
    const [position, setPosition] = useState('bottom');
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <TriggerButton>Panel position</TriggerButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
            <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const RadioIcons: Story = {
  render: function RadioIconsExample() {
    const [theme, setTheme] = useState('system');
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <TriggerButton>Theme</TriggerButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
            <DropdownMenuRadioItem value="light" icon={<Sun size={14} />}>
              Light
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark" icon={<Moon size={14} />}>
              Dark
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system" icon={<Laptop size={14} />}>
              System
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const Destructive: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <TriggerButton>
          <MoreHorizontal size={16} />
        </TriggerButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem icon={<User size={14} />}>Edit profile</DropdownMenuItem>
        <DropdownMenuItem icon={<Settings size={14} />}>Preferences</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive icon={<Trash2 size={14} />}>
          Delete account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const AvatarStory: Story = {
  name: 'Avatar',
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button type="button" className="focus-ring-safe rounded-full" aria-label="Open user menu">
          <Avatar initials="JD" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-text-primary text-sm font-medium">Jane Doe</span>
            <span className="text-text-secondary text-xs font-normal">jane@example.com</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<User size={14} />}>Profile</DropdownMenuItem>
        <DropdownMenuItem icon={<CreditCard size={14} />}>Billing</DropdownMenuItem>
        <DropdownMenuItem icon={<Settings size={14} />}>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<LogOut size={14} />}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const Complex: Story = {
  render: function ComplexExample() {
    const [showMinimap, setShowMinimap] = useState(true);
    const [wordWrap, setWordWrap] = useState(false);
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <TriggerButton>Complex Menu</TriggerButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>File</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem icon={<PlusCircle size={14} />} textValue="New Document">
              New Document
              <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem icon={<Cloud size={14} />} textValue="Import File">
              Import File
              <DropdownMenuShortcut>⌘I</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger icon={<GitGraph size={14} />}>
                Recent Files
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>report-draft.md</DropdownMenuItem>
                <DropdownMenuItem>roadmap.md</DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Shared with team</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>design-review.md</DropdownMenuItem>
                    <DropdownMenuItem>q3-notes.md</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuLabel>View</DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked={showMinimap} onCheckedChange={setShowMinimap}>
            Show minimap
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={wordWrap} onCheckedChange={setWordWrap}>
            Word wrap
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuItem icon={<User size={14} />}>Profile</DropdownMenuItem>
          <DropdownMenuItem icon={<Settings size={14} />}>Preferences</DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem destructive icon={<Trash2 size={14} />} textValue="Delete Workspace">
            Delete Workspace
            <DropdownMenuShortcut>⇧⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const RTL: Story = {
  render: () => (
    <div dir="rtl">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <TriggerButton>القائمة</TriggerButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem icon={<User size={14} />}>الملف الشخصي</DropdownMenuItem>
          <DropdownMenuItem icon={<CreditCard size={14} />}>الفواتير</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive icon={<Trash2 size={14} />}>
            حذف الحساب
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};
