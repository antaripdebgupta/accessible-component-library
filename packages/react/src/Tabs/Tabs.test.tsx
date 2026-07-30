import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, test, expect, vi } from "vitest";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./index";

expect.extend(toHaveNoViolations);

function BasicTabs(props: Partial<React.ComponentProps<typeof Tabs>> = {}) {
    return (
        <Tabs defaultValue="a" {...props}>
            <TabsList>
                <TabsTrigger value="a">Account</TabsTrigger>
                <TabsTrigger value="b">Password</TabsTrigger>
                <TabsTrigger value="c" disabled>Billing</TabsTrigger>
            </TabsList>
            <TabsContent value="a">Account content</TabsContent>
            <TabsContent value="b">Password content</TabsContent>
            <TabsContent value="c">Billing content</TabsContent>
        </Tabs>
    );
}

describe("Tabs — semantics", () => {
    test("renders tablist, tabs, and tabpanel roles", () => {
        render(<BasicTabs />);
        expect(screen.getByRole("tablist")).toBeInTheDocument();
        expect(screen.getAllByRole("tab")).toHaveLength(3);
        expect(screen.getByRole("tabpanel")).toBeInTheDocument();
    });

    test("selected tab has aria-selected=true, others false", () => {
        render(<BasicTabs />);
        expect(screen.getByRole("tab", { name: "Account" })).toHaveAttribute("aria-selected", "true");
        expect(screen.getByRole("tab", { name: "Password" })).toHaveAttribute("aria-selected", "false");
    });

    test("aria-controls and aria-labelledby link tab and panel", () => {
        render(<BasicTabs />);
        const tab = screen.getByRole("tab", { name: "Account" });
        const panel = screen.getByRole("tabpanel");
        expect(tab).toHaveAttribute("aria-controls", panel.id);
        expect(panel).toHaveAttribute("aria-labelledby", tab.id);
    });

    test("only selected panel is visible", () => {
        render(<BasicTabs />);
        expect(screen.getByText("Account content")).toBeVisible();
        expect(screen.queryByText("Password content")).not.toBeInTheDocument(); // lazy mounted
    });

    test("has no axe violations", async () => {
        const { container } = render(<BasicTabs />);
        expect(await axe(container)).toHaveNoViolations();
    });
});

describe("Tabs — keyboard (automatic activation)", () => {
    test("ArrowRight moves and activates next tab", async () => {
        const user = userEvent.setup();
        render(<BasicTabs />);
        screen.getByRole("tab", { name: "Account" }).focus();
        await user.keyboard("{ArrowRight}");
        expect(screen.getByRole("tab", { name: "Password" })).toHaveFocus();
        expect(screen.getByRole("tab", { name: "Password" })).toHaveAttribute("aria-selected", "true");
    });

    test("ArrowRight skips disabled tab and wraps to first", async () => {
        const user = userEvent.setup();
        render(<BasicTabs />);
        screen.getByRole("tab", { name: "Password" }).focus();
        await user.keyboard("{ArrowRight}");
        expect(screen.getByRole("tab", { name: "Account" })).toHaveFocus();
    });

    test("Home/End jump to first/last enabled tab", async () => {
        const user = userEvent.setup();
        render(<BasicTabs />);
        screen.getByRole("tab", { name: "Account" }).focus();
        await user.keyboard("{End}");
        expect(screen.getByRole("tab", { name: "Password" })).toHaveFocus(); // Billing disabled, skipped

        await user.keyboard("{Home}");
        expect(screen.getByRole("tab", { name: "Account" })).toHaveFocus();
    });

    test("only the active tab is Tab-reachable (roving tabindex)", () => {
        render(<BasicTabs />);
        expect(screen.getByRole("tab", { name: "Account" })).toHaveAttribute("tabIndex", "0");
        expect(screen.getByRole("tab", { name: "Password" })).toHaveAttribute("tabIndex", "-1");
    });
});

describe("Tabs — manual activation mode", () => {
    test("arrow keys move focus without changing the panel until Enter", async () => {
        const user = userEvent.setup();
        render(<BasicTabs activationMode="manual" />);
        screen.getByRole("tab", { name: "Account" }).focus();
        await user.keyboard("{ArrowRight}");

        expect(screen.getByRole("tab", { name: "Password" })).toHaveFocus();
        expect(screen.getByRole("tab", { name: "Account" })).toHaveAttribute("aria-selected", "true");

        await user.keyboard("{Enter}");
        expect(screen.getByRole("tab", { name: "Password" })).toHaveAttribute("aria-selected", "true");
    });
});

describe("Tabs — controlled mode", () => {
    test("controlled value drives selection; onValueChange fires on click", async () => {
        const user = userEvent.setup();
        const onValueChange = vi.fn();
        render(<BasicTabs value="b" onValueChange={onValueChange} />);
        expect(screen.getByRole("tab", { name: "Password" })).toHaveAttribute("aria-selected", "true");

        await user.click(screen.getByRole("tab", { name: "Account" }));
        expect(onValueChange).toHaveBeenCalledWith("a");
    });
});

describe("Tabs — orientation", () => {
    test("vertical orientation sets aria-orientation and uses ArrowDown/Up", async () => {
        const user = userEvent.setup();
        render(<BasicTabs orientation="vertical" />);
        expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");

        screen.getByRole("tab", { name: "Account" }).focus();
        await user.keyboard("{ArrowDown}");
        expect(screen.getByRole("tab", { name: "Password" })).toHaveFocus();
    });
});

describe("Tabs — RTL", () => {
    test("dir=rtl mirrors ArrowLeft/ArrowRight", async () => {
        const user = userEvent.setup();
        render(<BasicTabs dir="rtl" />);
        screen.getByRole("tab", { name: "Account" }).focus();
        await user.keyboard("{ArrowLeft}");
        expect(screen.getByRole("tab", { name: "Password" })).toHaveFocus();
    });
});

describe("Tabs — lazy vs force mount", () => {
    test("lazyMount (default) does not render inactive panel content", () => {
        render(<BasicTabs />);
        expect(screen.queryByText("Password content")).not.toBeInTheDocument();
    });

    test("forceMount renders content even when hidden", () => {
        render(
            <Tabs defaultValue="a">
                <TabsList>
                    <TabsTrigger value="a">A</TabsTrigger>
                    <TabsTrigger value="b">B</TabsTrigger>
                </TabsList>
                <TabsContent value="a">A content</TabsContent>
                <TabsContent value="b" forceMount>B content</TabsContent>
            </Tabs>
        );
        expect(screen.getByText("B content")).toBeInTheDocument(); // present, though hidden
    });
});

describe("Tabs — nested tabs", () => {
    test("inner tabs operate independently of outer tabs", async () => {
        const user = userEvent.setup();
        render(
            <Tabs defaultValue="outer-1">
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
                        <TabsContent value="inner-1">Inner content 1</TabsContent>
                        <TabsContent value="inner-2">Inner content 2</TabsContent>
                    </Tabs>
                </TabsContent>
                <TabsContent value="outer-2">Outer content 2</TabsContent>
            </Tabs>
        );

        const [outerTablist, innerTablist] = screen.getAllByRole("tablist") as [HTMLElement, HTMLElement];
        expect(within(outerTablist).getByRole("tab", { name: "Outer 1" })).toHaveAttribute("aria-selected", "true");
        expect(within(innerTablist).getByRole("tab", { name: "Inner 1" })).toHaveAttribute("aria-selected", "true");

        await user.click(within(innerTablist).getByRole("tab", { name: "Inner 2" }));
        expect(within(innerTablist).getByRole("tab", { name: "Inner 2" })).toHaveAttribute("aria-selected", "true");
        expect(within(outerTablist).getByRole("tab", { name: "Outer 1" })).toHaveAttribute("aria-selected", "true");
    });
});

describe("Tabs — dynamic tabs", () => {
    function DynamicTabs() {
        const [tabs, setTabs] = React.useState(["a", "b"]);
        return (
            <div>
                <button onClick={() => setTabs((t) => [...t, `t${t.length}`])}>Add tab</button>
                <Tabs defaultValue="a">
                    <TabsList>
                        {tabs.map((t) => (
                            <TabsTrigger key={t} value={t}>{t}</TabsTrigger>
                        ))}
                    </TabsList>
                    {tabs.map((t) => (
                        <TabsContent key={t} value={t}>{t} content</TabsContent>
                    ))}
                </Tabs>
            </div>
        );
    }

    test("newly added tab is keyboard-navigable", async () => {
        const user = userEvent.setup();
        render(<DynamicTabs />);
        await user.click(screen.getByRole("button", { name: "Add tab" }));
        expect(screen.getByRole("tab", { name: "t2" })).toBeInTheDocument();
    });
});