import type { Meta, StoryObj } from '@storybook/react';
import { Folder, File } from 'lucide-react';
import { TreeView, TreeItem } from './index';

const meta: Meta<typeof TreeView> = { title: 'Components/TreeView', component: TreeView };
export default meta;
type Story = StoryObj<typeof TreeView>;

function FileTree() {
  return (
    <TreeView aria-label="Project files" defaultExpanded={['src', 'components']} className="w-80">
      <TreeItem key="src" value="src" label="src" icon={<Folder size={16} />}>
        <TreeItem
          key="components"
          value="components"
          label="components"
          icon={<Folder size={16} />}
        >
          <TreeItem
            key="Button.tsx"
            value="Button.tsx"
            label="Button.tsx"
            icon={<File size={16} />}
          />
          <TreeItem key="Tabs.tsx" value="Tabs.tsx" label="Tabs.tsx" icon={<File size={16} />} />
        </TreeItem>
        <TreeItem key="index.ts" value="index.ts" label="index.ts" icon={<File size={16} />} />
      </TreeItem>
      <TreeItem
        key="package.json"
        value="package.json"
        label="package.json"
        icon={<File size={16} />}
      />
      <TreeItem key="README.md" value="README.md" label="README.md" icon={<File size={16} />} />
    </TreeView>
  );
}

export const Default: Story = { render: () => <FileTree /> };

export const MultiSelect: Story = {
  render: () => (
    <TreeView
      aria-label="Project files"
      selectionMode="multiple"
      defaultExpanded={['src']}
      className="w-80"
    >
      <TreeItem key="src" value="src" label="src" icon={<Folder size={16} />}>
        <TreeItem key="index.ts" value="index.ts" label="index.ts" icon={<File size={16} />} />
        <TreeItem key="app.ts" value="app.ts" label="app.ts" icon={<File size={16} />} />
      </TreeItem>
      <TreeItem
        key="package.json"
        value="package.json"
        label="package.json"
        icon={<File size={16} />}
      />
    </TreeView>
  ),
};

export const WithDisabledNode: Story = {
  render: () => (
    <TreeView aria-label="Project files" defaultExpanded={['src']} className="w-80">
      <TreeItem key="src" value="src" label="src" icon={<Folder size={16} />}>
        <TreeItem
          key="locked.ts"
          value="locked.ts"
          label="locked.ts (no access)"
          icon={<File size={16} />}
          disabled
        />
        <TreeItem key="index.ts" value="index.ts" label="index.ts" icon={<File size={16} />} />
      </TreeItem>
    </TreeView>
  ),
};

export const RTL: Story = {
  render: () => (
    <div dir="rtl">
      <TreeView aria-label="ملفات المشروع" defaultExpanded={['src', 'components']} className="w-80">
        <TreeItem key="src" value="src" label="المصدر" icon={<Folder size={16} />}>
          <TreeItem
            key="components"
            value="components"
            label="المكونات"
            icon={<Folder size={16} />}
          >
            <TreeItem
              key="Button.tsx"
              value="Button.tsx"
              label="Button.tsx"
              icon={<File size={16} />}
            />
            <TreeItem key="Tabs.tsx" value="Tabs.tsx" label="Tabs.tsx" icon={<File size={16} />} />
          </TreeItem>
          <TreeItem key="index.ts" value="index.ts" label="index.ts" icon={<File size={16} />} />
        </TreeItem>
        <TreeItem
          key="package.json"
          value="package.json"
          label="package.json"
          icon={<File size={16} />}
        />
      </TreeView>
    </div>
  ),
};
