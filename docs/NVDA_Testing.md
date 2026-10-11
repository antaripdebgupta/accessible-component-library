## 1. Setup

**Install NVDA** (free): https://www.nvaccess.org/download/

**Get Storybook running** so you have real components to test against:

```bash
pnpm dev
```

Open `http://localhost:6006` in **Firefox** (NVDA + Firefox is the combination you already documented in every `.a11y.md`, and historically the most reliable NVDA pairing).

## 2. Essential NVDA commands before you start

| Key                   | Action                                    |
| --------------------- | ----------------------------------------- |
| `Ctrl`                | Silence current speech                    |
| `Insert + Down Arrow` | Read from current position downward       |
| `Insert + T`          | Read page title                           |
| `Insert + F7`         | List all links/headings/landmarks on page |
| `Tab` / `Shift+Tab`   | Move focus forward/backward               |
| `Insert + Space`      | Toggle between Browse mode and Focus mode |
| `H` (browse mode)     | Jump to next heading                      |
| `D` (browse mode)     | Jump to next landmark/region              |

**Browse mode vs Focus mode** matters a lot: NVDA auto-switches to Focus mode when you Tab into an interactive widget (Dialog, Combobox, etc.), but for static content (Alert, Breadcrumb, Skeleton) you'll be in Browse mode using arrow keys, not Tab.

## 3. Testing workflow per component

For every component, follow this same loop:

1. Navigate to the component's Storybook story (use the sidebar or `Ctrl+L` in URL bar for direct iframe links).
2. Turn NVDA on (`Insert` key is your NVDA modifier — confirm NVDA is running via the system tray icon).
3. Press `Tab` from the top of the page until you reach the component.
4. **Listen and write down exactly what NVDA says** — this is what goes in your `.a11y.md` "Screen reader behavior" section.
5. Exercise every keyboard interaction listed in that component's own `.a11y.md` keyboard table.
6. Note anything that doesn't match what you documented — that's a real bug to fix, not just a doc gap.

## 4. Component-by-component test scripts

### Button

- Tab to it → expect: "**[Label], button**"
- Test `Disabled` story → expect: "**[Label], button, dimmed**" (still reachable)
- Test `Loading` story → expect: "**[loadingText], button, busy**"

### Alert

- Open story fresh (reload page so mount-triggers-announcement) → expect immediate interruption with the alert text (assertive) or no interruption (polite)
- Verify icon is silent

### Accordion

- Tab to first trigger → expect: "**[Label], button, collapsed, heading level 3**"
- Press `Enter` → expect: "**expanded**"
- `Insert+Down` to read panel content
- Tab to a `disabled` item → expect "**dimmed**"

### Avatar

- `Insert+F7` → check "Graphics" list shows the avatar with correct name
- Test `BadgeWithIcon`/`Badge` stories — confirm status label is read after the name

### Breadcrumb

- `D` (browse mode) → jump to the nav landmark → expect "**navigation, Breadcrumb**"
- Arrow through — confirm separators are silent, current page is NOT a link
- Tab to ellipsis (Collapsed story) → `Enter` → confirm focus moves into opened menu

### Carousel

- Tab into viewport → `ArrowRight` → listen for "**Slide 2 of 5**" live announcement
- Tab to Prev/Next/dots/play-pause — confirm each has a distinct label

### Checkbox

- Tab to it → expect "**[Label], checkbox, not checked**"
- Click the _label text_ (not the box) — confirm single toggle, no double announcement
- Test indeterminate story → expect "**partially checked**"

### Combobox

- Tab into input → type a letter → listen for live-region result count
- `ArrowDown`/`ArrowUp` through results — confirm position is announced
- `Enter` to select — confirm new value is announced

### CommandPalette

- Open trigger (usually Cmd/Ctrl+K in the story or a button) → confirm focus lands in input
- Arrow through grouped results — confirm group label announced once per group

### DataTable

- `D` → jump to table → expect "**table, [caption], N columns, M rows**"
- Tab to a sortable header button → `Enter` → expect updated `aria-sort` announcement
- Tab to a row checkbox → expect "**Select row: [Name], checkbox**"

### Dialog

- Open it → confirm NVDA announces "**dialog, [title]**" and switches to focus mode
- Try arrowing in browse mode — background content should be unreachable
- Tab repeatedly — confirm it wraps inside the dialog only
- `Escape` → confirm focus returns to trigger

### DropdownMenu

- Tab to trigger → `Enter` → confirm first item is focused and announced with position ("1 of 5")
- Arrow through — check disabled items are skipped
- Test a checkbox/radio item — confirm checked state announced

### Input

- Tab in → expect "**[Label], edit**"
- Test `Invalid` story → expect "**invalid**" + error message
- Test password toggle → confirm "Show password"/"Hide password" swap

### Menu

- Right-click to open (context menu story) → confirm immediate announcement, no delay
- Test submenu hover-then-arrow behavior

### Pagination

- `D` → landmark → "**navigation, Pagination**"
- Tab to current page button → expect "**current page**"

### RadioGroup

- Tab in → lands on checked (or first) option → expect "**checked, 1 of 3**"
- Arrow through — confirm disabled options skipped
- Test story with no `defaultValue` — confirm nothing is falsely pre-selected

### Skeleton

- Browse over shimmer shapes → confirm total silence
- Test `LoadingToLoadedTransition` story → confirm single "Loading profile" announcement, then real content reads naturally after

### Switch

- Tab to it → expect "**[Label], switch, off**"
- Toggle → confirm state flips in announcement
- Test `pending` story → expect "**busy**"

### Tabs

- Tab into tablist → arrow through → confirm name + selected state each stop
- Test Manual Activation story → confirm no premature "selected" announcement before Enter

### Textarea

- Tab in → "**multi-line**" should be part of the announcement
- Type near character limit → confirm throttled "X characters remaining"

### Toast

- Trigger one → confirm live-region announcement without focus stealing
- Tab to dismiss button → confirm pauses timer

### Tooltip

- Tab to trigger (keyboard only) → confirm trigger name + tooltip content both read
- Hover with mouse only (no Tab) → confirm nothing announced

### TreeView

- Tab in → expect "**tree, [label]**" then item with level/position
- `ArrowRight` to expand → confirm "expanded" with no positional jump
- Arrow into newly visible children → confirm level updates correctly

## 5. Recording your findings

For each component, paste your actual observed announcements into that component's `.a11y.md` under "Screen reader behavior" — replacing/confirming the draft versions from earlier. If NVDA says something different than documented, that's the source of truth — fix either the component or the doc.

## 6. Time-boxing this realistically

Testing all 22 thoroughly takes a few hours. If short on time, prioritize the 5 components already flagged as "core" in your README: **Dialog, Menu, Combobox, Tabs, DataTable** — these have the most complex focus/keyboard logic and the highest risk of real bugs.
