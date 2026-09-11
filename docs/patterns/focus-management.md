# Focus Management — Shared Contract

Every component with open/close or navigable state follows one of two models:

## 1. Roving tabindex (Tabs, Accordion, Menu, RadioGroup, TreeView, DataTable rows)

One item has `tabIndex={0}`, the rest `-1`. Implemented via `useRovingTabIndex`
in `@acl/utils`. Arrow keys move focus + the roving index together.

## 2. Focus trap + restoration (Dialog, CommandPalette, DropdownMenu, Combobox popover)

Implemented via `useFocusTrap` (traps Tab/Shift+Tab inside) and returns
focus to the trigger on close via `returnFocusRef`. Escape closes only the
topmost layer via the shared stack in `useEscapeKey`.

## Decision table

| Component | Model                | Notes                             |
| --------- | -------------------- | --------------------------------- |
| Tabs      | Roving               | Automatic/manual activation modes |
| Dialog    | Trap                 | inert background, scroll lock     |
| Menu      | Trap + roving inside | Submenus stack                    |
| ...       |                      |                                   |
