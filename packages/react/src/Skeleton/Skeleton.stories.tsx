import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect } from 'react';
import { Skeleton } from './Skeleton';
import { SkeletonGroup } from './SkeletonGroup';
import { SkeletonAvatar } from './presets/SkeletonAvatar';
import { SkeletonText } from './presets/SkeletonText';
import { SkeletonCard } from './presets/SkeletonCard';
import { SkeletonForm } from './presets/SkeletonForm';
import { SkeletonTable } from './presets/SkeletonTable';

const meta: Meta<typeof Skeleton> = { title: 'Components/Skeleton', component: Skeleton };
export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-3">
      <Skeleton shape="rect" className="h-24 w-full" />
      <Skeleton shape="text" width="80%" />
      <Skeleton shape="text" width="60%" />
    </div>
  ),
};

export const Avatar: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <SkeletonAvatar size="xs" />
      <SkeletonAvatar size="sm" />
      <SkeletonAvatar size="md" />
      <SkeletonAvatar size="lg" />
      <SkeletonAvatar size="xl" />
    </div>
  ),
};

export const Card: Story = { render: () => <SkeletonCard /> };

export const Text: Story = {
  render: () => (
    <div className="w-80">
      <SkeletonText lines={4} lastLineWidth="45%" />
    </div>
  ),
};

export const Form: Story = { render: () => <SkeletonForm fields={4} /> };

export const Table: Story = { render: () => <SkeletonTable rows={5} columns={4} /> };

export const LoadingToLoadedTransition: Story = {
  render: function Demo() {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      const t = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(t);
    }, []);

    return (
      <SkeletonGroup loading={loading} label="Loading profile" fallback={<SkeletonCard />}>
        <div className="rounded-popover border-border bg-surface w-full max-w-sm border p-4">
          <img
            src="https://picsum.photos/seed/acl/400/160"
            alt=""
            className="rounded-control mb-4 h-40 w-full object-cover"
          />
          <div className="flex items-center gap-3">
            <div className="bg-accent-subtle h-8 w-8 rounded-full" />
            <div>
              <p className="text-text-primary font-medium">Ada Lovelace</p>
              <p className="text-text-secondary text-xs">Software Engineer</p>
            </div>
          </div>
        </div>
      </SkeletonGroup>
    );
  },
};

export const ActiveAnimation: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="text-text-secondary mb-2 text-sm font-medium">
          Shimmer sweep — actively animating
        </p>
        <div className="flex w-80 flex-col gap-3">
          <Skeleton shape="rect" className="h-32 w-full" />
          <div className="flex items-center gap-3">
            <SkeletonAvatar size="md" />
            <div className="flex-1 space-y-2">
              <Skeleton shape="text" width="70%" />
              <Skeleton shape="text" width="45%" height={12} />
            </div>
          </div>
          <SkeletonText lines={3} lastLineWidth="55%" />
        </div>
      </div>

      <div>
        <p className="text-text-secondary mb-2 text-sm font-medium">
          Reduced-motion equivalent (static, animation removed)
        </p>
        <div className="flex w-80 flex-col gap-3 opacity-70 motion-reduce:opacity-70 [&_*]:before:!hidden [&_*]:before:!animate-none">
          <Skeleton shape="rect" className="h-32 w-full" />
          <div className="flex items-center gap-3">
            <SkeletonAvatar size="md" />
            <div className="flex-1 space-y-2">
              <Skeleton shape="text" width="70%" />
              <Skeleton shape="text" width="45%" height={12} />
            </div>
          </div>
          <SkeletonText lines={3} lastLineWidth="55%" />
        </div>
      </div>
    </div>
  ),
};

export const RTL: Story = {
  render: () => (
    <div dir="rtl" className="space-y-6">
      <SkeletonCard />
      <div className="max-w-md">
        <SkeletonForm fields={3} />
      </div>
    </div>
  ),
};
