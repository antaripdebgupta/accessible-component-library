import type { Meta, StoryObj } from '@storybook/react';
import { Check, Crown } from 'lucide-react';
import { Avatar } from './Avatar';
import { AvatarStatusBadge } from './AvatarBadge';
import { AvatarGroup } from './AvatarGroup';
import { DropdownMenuItem } from '../DropdownMenu';
import { AvatarDropdown } from './AvatarDropdown';
import { expect, userEvent, within } from '@storybook/test';

const meta: Meta<typeof Avatar> = { title: 'Components/Avatar', component: Avatar };
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar src="https://i.pravatar.cc/150?img=1" name="Ada Lovelace" />
      <Avatar name="Grace Hopper" />
      <Avatar />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Avatar key={size} size={size} name="Ada Lovelace" src="https://i.pravatar.cc/150?img=1" />
      ))}
    </div>
  ),
};

export const Badge: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar
        name="Ada Lovelace"
        src="https://i.pravatar.cc/150?img=1"
        badge={<AvatarStatusBadge status="online" label="Online" className="h-full w-full" />}
      />
      <Avatar
        name="Grace Hopper"
        badge={<AvatarStatusBadge status="away" label="Away" className="h-full w-full" />}
      />
      <Avatar
        name="Alan Turing"
        badge={<AvatarStatusBadge status="busy" label="Busy" className="h-full w-full" />}
      />
    </div>
  ),
};

export const BadgeWithIcon: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar
        name="Ada Lovelace"
        src="https://i.pravatar.cc/150?img=1"
        size="xl"
        badgeIcon={<Crown aria-hidden="true" className="h-1/2 w-1/2" />}
      />
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <AvatarGroup aria-label="Project collaborators">
      <Avatar name="Ada Lovelace" src="https://i.pravatar.cc/150?img=1" />
      <Avatar name="Grace Hopper" src="https://i.pravatar.cc/150?img=2" />
      <Avatar name="Alan Turing" src="https://i.pravatar.cc/150?img=3" />
    </AvatarGroup>
  ),
};

export const GroupWithCount: Story = {
  render: () => (
    <AvatarGroup aria-label="Project collaborators" max={3}>
      <Avatar name="Ada Lovelace" src="https://i.pravatar.cc/150?img=1" />
      <Avatar name="Grace Hopper" src="https://i.pravatar.cc/150?img=2" />
      <Avatar name="Alan Turing" src="https://i.pravatar.cc/150?img=3" />
      <Avatar name="Katherine Johnson" />
      <Avatar name="Margaret Hamilton" />
      <Avatar name="Hedy Lamarr" />
    </AvatarGroup>
  ),
};

export const GroupWithIcon: Story = {
  render: () => (
    <AvatarGroup
      aria-label="Project collaborators"
      max={3}
      overflowIcon={<Crown aria-hidden="true" className="h-4 w-4" />}
    >
      <Avatar name="Ada Lovelace" src="https://i.pravatar.cc/150?img=1" />
      <Avatar name="Grace Hopper" src="https://i.pravatar.cc/150?img=2" />
      <Avatar name="Alan Turing" src="https://i.pravatar.cc/150?img=3" />
      <Avatar name="Katherine Johnson" />
      <Avatar name="Margaret Hamilton" />
    </AvatarGroup>
  ),
};

export const Dropdown: Story = {
  render: () => (
    <AvatarDropdown
      triggerLabel="Open account menu for Ada Lovelace"
      name="Ada Lovelace"
      src="https://i.pravatar.cc/150?img=1"
    >
      <DropdownMenuItem>Profile</DropdownMenuItem>
      <DropdownMenuItem>Settings</DropdownMenuItem>
      <DropdownMenuItem>Sign out</DropdownMenuItem>
    </AvatarDropdown>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Open account menu/ });
    await userEvent.click(trigger);
    await expect(canvas.getByRole('menu')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveFocus();
  },
};

export const RTL: Story = {
  render: () => (
    <div dir="rtl" className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar
          name="آدا لوفليس"
          src="https://i.pravatar.cc/150?img=1"
          badge={<AvatarStatusBadge status="online" label="متصل" className="h-full w-full" />}
        />
      </div>
      <AvatarGroup aria-label="المتعاونون في المشروع" max={3}>
        <Avatar name="آدا لوفليس" src="https://i.pravatar.cc/150?img=1" />
        <Avatar name="غريس هوبر" src="https://i.pravatar.cc/150?img=2" />
        <Avatar name="آلان تورينج" src="https://i.pravatar.cc/150?img=3" />
        <Avatar name="كاثرين جونسون" />
      </AvatarGroup>
    </div>
  ),
};
