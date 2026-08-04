import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FileText, Settings, User, Calculator, Calendar, Smile } from 'lucide-react';
import {
  CommandPalette,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
  CommandLoading,
  CommandShortcut,
} from './index';
import { useAsyncSearch } from '@acl/primitives';

const meta: Meta<typeof CommandPalette> = {
  title: 'Components/CommandPalette',
  component: CommandPalette,
};
export default meta;
type Story = StoryObj<typeof CommandPalette>;

function OpenButton({
  onClick,
  children = 'Open (or press ⌘K / Ctrl+K)',
}: {
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-control bg-surface-raised border-border px-control-md py-control-sm border text-sm"
    >
      {children}
    </button>
  );
}

export const Default: Story = {
  render: function DefaultExample() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <OpenButton onClick={() => setOpen(true)} />
        <CommandPalette open={open} onOpenChange={setOpen}>
          <CommandInput />
          <CommandList>
            <CommandEmpty />
            <CommandItem
              value="new-file"
              icon={<FileText size={16} />}
              onSelect={() => setOpen(false)}
            >
              New File
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem value="profile" icon={<User size={16} />} onSelect={() => setOpen(false)}>
              View Profile
            </CommandItem>
            <CommandItem
              value="settings"
              icon={<Settings size={16} />}
              onSelect={() => setOpen(false)}
            >
              Open Settings
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
          </CommandList>
        </CommandPalette>
      </>
    );
  },
};

export const Groups: Story = {
  render: function GroupsExample() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <OpenButton onClick={() => setOpen(true)}>Open grouped palette</OpenButton>
        <CommandPalette open={open} onOpenChange={setOpen}>
          <CommandInput />
          <CommandList>
            <CommandEmpty />
            <CommandGroup heading="Suggestions">
              <CommandItem
                value="calendar"
                icon={<Calendar size={16} />}
                onSelect={() => setOpen(false)}
              >
                Calendar
              </CommandItem>
              <CommandItem
                value="calculator"
                icon={<Calculator size={16} />}
                onSelect={() => setOpen(false)}
              >
                Calculator
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Settings">
              <CommandItem
                value="profile-2"
                icon={<User size={16} />}
                onSelect={() => setOpen(false)}
              >
                Profile
              </CommandItem>
              <CommandItem
                value="settings-2"
                icon={<Settings size={16} />}
                onSelect={() => setOpen(false)}
              >
                Preferences
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandPalette>
      </>
    );
  },
};

// ---- Simulated backend with deliberately-reordered response timing -------
// Short queries resolve SLOWLY, longer/more-specific queries resolve FAST —
// the opposite of realistic latency — specifically to prove that a fast
// response to a later keystroke isn't clobbered by a slow response to an
// earlier one arriving after it.
const ALL_ITEMS = [
  'Apple',
  'Application',
  'Apricot',
  'Banana',
  'Berry',
  'Cherry',
  'Date',
  'Elderberry',
];

function simulateBackendSearch(query: string): Promise<string[]> {
  const matches = query
    ? ALL_ITEMS.filter((i) => i.toLowerCase().includes(query.toLowerCase()))
    : ALL_ITEMS;
  // Shorter queries (broader results) are deliberately slower.
  const delay = Math.max(50, 600 - query.length * 150);
  return new Promise((resolve) => setTimeout(() => resolve(matches), delay));
}

export const AsyncSearch: Story = {
  render: function AsyncSearchExample() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const { results, loading } = useAsyncSearch({
      query,
      search: simulateBackendSearch,
      debounceMs: 100,
    });

    return (
      <>
        <OpenButton onClick={() => setOpen(true)}>Open async search palette</OpenButton>
        <p className="text-text-secondary mt-2 max-w-sm text-xs">
          Try typing quickly (e.g. "a" then immediately "ap") — shorter queries are deliberately
          made to resolve slower here, on purpose, to demonstrate that the final displayed list
          always matches your LATEST query, never a stale slower response landing after it.
        </p>
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          inputValue={query}
          onInputValueChange={setQuery}
        >
          <CommandInput placeholder="Search fruits..." />
          <CommandList>
            <CommandLoading loading={loading} />
            {!loading && <CommandEmpty />}
            {results.map((fruit) => (
              <CommandItem
                key={fruit}
                value={fruit}
                icon={<Smile size={16} />}
                onSelect={() => setOpen(false)}
              >
                {fruit}
              </CommandItem>
            ))}
          </CommandList>
        </CommandPalette>
      </>
    );
  },
};

export const RTL: Story = {
  render: function RTLExample() {
    const [open, setOpen] = useState(false);
    return (
      <div dir="rtl">
        <OpenButton onClick={() => setOpen(true)}>فتح لوحة الأوامر</OpenButton>
        <CommandPalette open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="ابحث عن أمر..." />
          <CommandList>
            <CommandEmpty />
            <CommandItem
              value="new-file-ar"
              icon={<FileText size={16} />}
              onSelect={() => setOpen(false)}
            >
              ملف جديد
            </CommandItem>
            <CommandItem
              value="settings-ar"
              icon={<Settings size={16} />}
              onSelect={() => setOpen(false)}
            >
              الإعدادات
            </CommandItem>
          </CommandList>
        </CommandPalette>
      </div>
    );
  },
};
