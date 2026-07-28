import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within, waitFor } from "@storybook/test";
import { ToastProvider, useToast } from "./ToastProvider";
import { Button } from "../Button/Button";

function Demo({ variant, title, description }: { variant: any; title?: string; description: string }) {
    const { push } = useToast();
    return (
        <Button onClick={() => push({ title, description, variant })}>
            Open the notification box
        </Button>
    );
}

const meta: Meta = {
    title: "Components/Toast",
    decorators: [(Story) => <ToastProvider><Story /></ToastProvider>],
};
export default meta;

function DefaultDemo() {
    const { push } = useToast();
    return (
        <div className="flex gap-2">
            <Button onClick={() => push({ title: "Success", description: "Your changes have been saved successfully.", variant: "success" })}>
                Success
            </Button>
            <Button onClick={() => push({ title: "Information", description: "Something you should know.", variant: "info" })}>
                Info
            </Button>
            <Button onClick={() => push({ title: "Warning", description: "Double check before continuing.", variant: "warning" })}>
                Warning
            </Button>
            <Button onClick={() => push({ title: "Error", description: "Something went wrong.", variant: "danger" })}>
                Error
            </Button>
        </div>
    );
}

export const Default: StoryObj = {
    render: () => <DefaultDemo />,
};

function PersistentDemo() {
    const { push } = useToast();
    return (
        <Button onClick={() => push({ title: "Persistent", description: "This will not close automatically.", variant: "info", duration: 0 })}>
            Show persistent notification
        </Button>
    );
}

export const Persistent: StoryObj = {
    render: () => <PersistentDemo />,
};

export const Success: StoryObj = {
    render: () => <Demo variant="success" title="Success" description="Your changes were saved." />,
};

export const Info: StoryObj = {
    render: () => <Demo variant="info" title="Informational" description="Something you should know." />,
};

export const Warning: StoryObj = {
    render: () => <Demo variant="warning" title="Warning" description="Double check before continuing." />,
};

export const Danger: StoryObj = {
    render: () => <Demo variant="danger" title="Error" description="Something went wrong." />,
};

export const LongContent: StoryObj = {
    render: () => (
        <Demo
            variant="info"
            title="Notification Title"
            description="I will never close automatically. This is a purposely very very long description that has many many characters and words."
        />
    ),
};

export const DismissesManually: StoryObj = {
    render: () => <Demo variant="success" title="Saved" description="Your changes were saved." />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole("button", { name: "Open the notification box" }));
        const dismissBtn = await canvas.findByRole("button", { name: "Dismiss notification" });
        await userEvent.click(dismissBtn);
        await waitFor(() => expect(canvas.queryByRole("status")).not.toBeInTheDocument());
    },
};

export const PausesOnFocus: StoryObj = {
    render: () => <Demo variant="info" title="Focus me" description="Tab onto this to pause its timer." />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole("button", { name: "Open the notification box" }));
        const toast = await canvas.findByRole("status");
        await expect(toast).toBeInTheDocument();
        const dismissBtn = within(toast).getByRole("button", { name: "Dismiss notification" });
        await userEvent.tab(); // moves focus toward the dismiss button
        await expect(dismissBtn).toBeVisible();
    },
};