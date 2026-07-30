import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Settings, CreditCard, User, Bell } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./index";

const meta: Meta<typeof Tabs> = { title: "Components/Tabs", component: Tabs };
export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
    render: () => (
        <Tabs defaultValue="account" className="w-96">
            <TabsList>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>
            <TabsContent value="account">Manage your account settings here.</TabsContent>
            <TabsContent value="password">Change your password here.</TabsContent>
            <TabsContent value="team">Manage team members here.</TabsContent>
        </Tabs>
    ),
};

export const ManualActivation: Story = {
    render: () => (
        <Tabs defaultValue="a" activationMode="manual" className="w-96">
            <TabsList>
                <TabsTrigger value="a">Tab A</TabsTrigger>
                <TabsTrigger value="b">Tab B</TabsTrigger>
                <TabsTrigger value="c">Tab C</TabsTrigger>
            </TabsList>
            <TabsContent value="a">Arrow keys move focus only — press Enter or Space to activate.</TabsContent>
            <TabsContent value="b">Content B</TabsContent>
            <TabsContent value="c">Content C</TabsContent>
        </Tabs>
    ),
};

export const AutomaticActivation: Story = { ...Default, args: {} };

export const Vertical: Story = {
    render: () => (
        <Tabs defaultValue="general" orientation="vertical" className="w-[28rem]">
            <TabsList>
                <TabsTrigger value="general" icon={<Settings size={16} />}>General</TabsTrigger>
                <TabsTrigger value="profile" icon={<User size={16} />}>Profile</TabsTrigger>
                <TabsTrigger value="billing" icon={<CreditCard size={16} />}>Billing</TabsTrigger>
                <TabsTrigger value="notifications" icon={<Bell size={16} />}>Notifications</TabsTrigger>
            </TabsList>
            <div className="flex-1">
                <TabsContent value="general">General settings content.</TabsContent>
                <TabsContent value="profile">Profile settings content.</TabsContent>
                <TabsContent value="billing">Billing settings content.</TabsContent>
                <TabsContent value="notifications">Notification preferences.</TabsContent>
            </div>
        </Tabs>
    ),
};

export const Horizontal: Story = Default;

export const DisabledTabs: Story = {
    render: () => (
        <Tabs defaultValue="a" className="w-96">
            <TabsList>
                <TabsTrigger value="a">Available</TabsTrigger>
                <TabsTrigger value="b" disabled>Locked</TabsTrigger>
                <TabsTrigger value="c">Available 2</TabsTrigger>
            </TabsList>
            <TabsContent value="a">This tab is available.</TabsContent>
            <TabsContent value="b">You shouldn't be able to reach this via keyboard.</TabsContent>
            <TabsContent value="c">Also available — arrow keys skip the locked tab.</TabsContent>
        </Tabs>
    ),
};

export const Controlled: Story = {
    render: function ControlledExample() {
        const [value, setValue] = React.useState("a");
        return (
            <div className="space-y-2">
                <p className="text-sm text-text-secondary">Externally controlled — current: {value}</p>
                <Tabs value={value} onValueChange={setValue} className="w-96">
                    <TabsList>
                        <TabsTrigger value="a">A</TabsTrigger>
                        <TabsTrigger value="b">B</TabsTrigger>
                    </TabsList>
                    <TabsContent value="a">Content A</TabsContent>
                    <TabsContent value="b">Content B</TabsContent>
                </Tabs>
            </div>
        );
    },
};

export const Uncontrolled: Story = Default;

export const WithIconsAndBadges: Story = {
    render: () => (
        <Tabs defaultValue="inbox" className="w-96">
            <TabsList>
                <TabsTrigger value="inbox" icon={<Bell size={16} />} badge="12">Inbox</TabsTrigger>
                <TabsTrigger value="sent" icon={<User size={16} />}>Sent</TabsTrigger>
            </TabsList>
            <TabsContent value="inbox">12 unread messages.</TabsContent>
            <TabsContent value="sent">Sent items.</TabsContent>
        </Tabs>
    ),
};

export const LoadingState: Story = {
    render: () => (
        <Tabs defaultValue="data" className="w-96">
            <TabsList>
                <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>
            <TabsContent value="data">
                <div aria-busy="true" className="animate-pulse motion-reduce:animate-none space-y-2">
                    <div className="h-4 w-3/4 bg-surface-raised" />
                    <div className="h-4 w-1/2 bg-surface-raised" />
                </div>
            </TabsContent>
        </Tabs>
    ),
};

export const ErrorState: Story = {
    render: () => (
        <Tabs defaultValue="data" className="w-96">
            <TabsList>
                <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>
            <TabsContent value="data">
                <p role="alert" className="text-danger-default text-sm">Failed to load data. Please retry.</p>
            </TabsContent>
        </Tabs>
    ),
};

export const Scrollable: Story = {
    render: () => (
        <Tabs defaultValue="tab-1" className="w-72">
            <TabsList scrollable>
                {Array.from({ length: 12 }, (_, i) => (
                    <TabsTrigger key={i} value={`tab-${i + 1}`}>Tab {i + 1}</TabsTrigger>
                ))}
            </TabsList>
            {Array.from({ length: 12 }, (_, i) => (
                <TabsContent key={i} value={`tab-${i + 1}`}>Content for tab {i + 1}</TabsContent>
            ))}
        </Tabs>
    ),
};

export const Overflow: Story = Scrollable;

export const NestedTabs: Story = {
    render: () => (
        <Tabs defaultValue="outer-1" className="w-[28rem]">
            <TabsList>
                <TabsTrigger value="outer-1">Outer 1</TabsTrigger>
                <TabsTrigger value="outer-2">Outer 2</TabsTrigger>
            </TabsList>
            <TabsContent value="outer-1">
                <Tabs defaultValue="inner-1">
                    <TabsList>
                        <TabsTrigger value="inner-1">Inner 1</TabsTrigger>
                        <TabsTrigger value="inner-2">Inner 2</TabsTrigger>
                    </TabsList>
                    <TabsContent value="inner-1">Nested content 1</TabsContent>
                    <TabsContent value="inner-2">Nested content 2</TabsContent>
                </Tabs>
            </TabsContent>
            <TabsContent value="outer-2">Outer content 2</TabsContent>
        </Tabs>
    ),
};

export const RTL: Story = {
    render: () => (
        <Tabs defaultValue="a" dir="rtl" className="w-96">
            <TabsList>
                <TabsTrigger value="a">حساب</TabsTrigger>
                <TabsTrigger value="b">كلمة المرور</TabsTrigger>
            </TabsList>
            <TabsContent value="a">محتوى الحساب</TabsContent>
            <TabsContent value="b">محتوى كلمة المرور</TabsContent>
        </Tabs>
    ),
};

/** export const DarkMode: Story = {
    render: () => (
        <div className="dark bg-surface-inverse p-4 ">
            <Tabs defaultValue="a" className="w-96">
                <TabsList>
                    <TabsTrigger value="a">Account</TabsTrigger>
                    <TabsTrigger value="b">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="a" className="text-text-inverse">Dark mode content.</TabsContent>
                <TabsContent value="b" className="text-text-inverse">Password content.</TabsContent>
            </Tabs>
        </div>
    ),
};

export const HighContrast: Story = {
    ...Default,
    parameters: { backgrounds: { default: "dark" } },
};

export const Responsive: Story = {
    render: () => (
        <Tabs defaultValue="a" className="w-full max-w-full">
            <TabsList scrollable className="flex-wrap sm:flex-nowrap">
                <TabsTrigger value="a">Overview</TabsTrigger>
                <TabsTrigger value="b">Analytics</TabsTrigger>
                <TabsTrigger value="c">Reports</TabsTrigger>
                <TabsTrigger value="d">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="a">Resize the viewport to see wrapping/scroll behavior.</TabsContent>
            <TabsContent value="b">Analytics content.</TabsContent>
            <TabsContent value="c">Reports content.</TabsContent>
            <TabsContent value="d">Settings content.</TabsContent>
        </Tabs>
    ),
};

export const KeyboardDemo: Story = {
    render: () => (
        <div className="space-y-2">
            <p className="text-sm text-text-secondary">
                Tab to focus the tablist, then use Arrow keys, Home, End.
            </p>
            {Default.render?.({}, {} as any)}
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.tab();
        const firstTab = canvas.getByRole("tab", { name: "Account" });
        await expect(firstTab).toHaveFocus();
        await userEvent.keyboard("{ArrowRight}");
        await expect(canvas.getByRole("tab", { name: "Password" })).toHaveFocus();
        await expect(canvas.getByRole("tab", { name: "Password" })).toHaveAttribute("aria-selected", "true");
    },
};

export const AccessibilityDemo: Story = {
    render: () => (
        <Tabs defaultValue="a" className="w-96">
            <TabsList aria-label="Settings sections">
                <TabsTrigger value="a">Account</TabsTrigger>
                <TabsTrigger value="b">Password</TabsTrigger>
            </TabsList>
            <TabsContent value="a">Inspect the Accessibility panel below for a full axe-core report.</TabsContent>
            <TabsContent value="b">Password content.</TabsContent>
        </Tabs>
    ),
}; **/