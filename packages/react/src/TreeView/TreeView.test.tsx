import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, test, expect, vi } from 'vitest';
import { TreeView, TreeItem } from './index';

expect.extend(toHaveNoViolations);

function FileTree(props: Partial<React.ComponentProps<typeof TreeView>> = {}) {
  return (
    <TreeView aria-label="Project files" defaultExpanded={['src']} {...props}>
      <TreeItem key="src" value="src" label="src">
        <TreeItem key="index.ts" value="index.ts" label="index.ts" />
        <TreeItem key="app.ts" value="app.ts" label="app.ts" />
      </TreeItem>
      <TreeItem key="package.json" value="package.json" label="package.json" />
    </TreeView>
  );
}

describe('TreeView — semantics', () => {
  test('renders tree, treeitem, and group roles', () => {
    render(<FileTree />);
    expect(screen.getByRole('tree', { name: 'Project files' })).toBeInTheDocument();
    expect(screen.getAllByRole('treeitem').length).toBeGreaterThanOrEqual(4);
    expect(screen.getAllByRole('group').length).toBeGreaterThanOrEqual(1);
  });

  test('branch item has aria-expanded, leaf item does not', () => {
    render(<FileTree />);
    expect(screen.getByRole('treeitem', { name: 'src' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('treeitem', { name: 'package.json' })).not.toHaveAttribute(
      'aria-expanded',
    );
  });

  test('aria-level reflects nesting depth', () => {
    render(<FileTree />);
    expect(screen.getByRole('treeitem', { name: 'src' })).toHaveAttribute('aria-level', '1');
    expect(screen.getByRole('treeitem', { name: 'index.ts' })).toHaveAttribute('aria-level', '2');
  });

  test('has no axe violations', async () => {
    const { container } = render(<FileTree />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('TreeView — expand/collapse', () => {
  test('clicking a branch toggles its expanded state and children visibility', async () => {
    const user = userEvent.setup();
    render(<FileTree />);
    const src = screen.getByRole('treeitem', { name: 'src' });
    expect(src).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('treeitem', { name: 'index.ts' })).toBeVisible();

    await user.click(src);
    expect(src).toHaveAttribute('aria-expanded', 'false');
  });

  test('children remain in the DOM while collapsed (not unmounted)', async () => {
    const user = userEvent.setup();
    render(<FileTree />);
    await user.click(screen.getByRole('treeitem', { name: 'src' }));
    // Still present in DOM (layout-stability contract), just inert/hidden via CSS.
    expect(screen.getByText('index.ts')).toBeInTheDocument();
  });
});

describe('TreeView — selection', () => {
  test('single selection: clicking a leaf selects only that item', async () => {
    const user = userEvent.setup();
    render(<FileTree />);
    await user.click(screen.getByRole('treeitem', { name: 'index.ts' }));
    expect(screen.getByRole('treeitem', { name: 'index.ts' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('treeitem', { name: 'app.ts' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  test('multiple selection mode allows several selected leaves', async () => {
    const user = userEvent.setup();
    render(<FileTree selectionMode="multiple" />);
    await user.click(screen.getByRole('treeitem', { name: 'index.ts' }));
    await user.click(screen.getByRole('treeitem', { name: 'app.ts' }));
    expect(screen.getByRole('treeitem', { name: 'index.ts' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('treeitem', { name: 'app.ts' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  test('onSelectedChange fires with the new value', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(<FileTree onSelectedChange={onSelectedChange} />);
    await user.click(screen.getByRole('treeitem', { name: 'index.ts' }));
    expect(onSelectedChange).toHaveBeenCalledWith('index.ts');
  });
});

describe('TreeView — disabled items', () => {
  test('disabled item cannot be selected via click', async () => {
    const user = userEvent.setup();
    render(
      <TreeView aria-label="Files" defaultExpanded={['src']}>
        <TreeItem key="src" value="src" label="src">
          <TreeItem key="locked" value="locked" label="locked" disabled />
        </TreeItem>
      </TreeView>,
    );
    const locked = screen.getByRole('treeitem', { name: 'locked' });
    expect(locked).toHaveAttribute('aria-disabled', 'true');
    await user.click(locked);
    expect(locked).toHaveAttribute('aria-selected', 'false');
  });
});

describe('TreeView — keyboard navigation', () => {
  test('roving tabindex: only one item has tabIndex 0', () => {
    render(<FileTree />);
    const items = screen.getAllByRole('treeitem');
    const zeroTabIndex = items.filter((el) => el.getAttribute('tabindex') === '0');
    expect(zeroTabIndex).toHaveLength(1);
  });

  test('ArrowDown moves focus from expanded branch into its first child', async () => {
    const user = userEvent.setup();
    render(<FileTree />);
    screen.getByRole('treeitem', { name: 'src' }).focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('treeitem', { name: 'index.ts' })).toHaveFocus();
  });

  test('ArrowRight expands a collapsed branch', async () => {
    const user = userEvent.setup();
    render(<FileTree defaultExpanded={[]} />);
    const src = screen.getByRole('treeitem', { name: 'src' });
    src.focus();
    expect(src).toHaveAttribute('aria-expanded', 'false');
    await user.keyboard('{ArrowRight}');
    expect(src).toHaveAttribute('aria-expanded', 'true');
  });

  test('ArrowLeft collapses an expanded branch', async () => {
    const user = userEvent.setup();
    render(<FileTree />);
    const src = screen.getByRole('treeitem', { name: 'src' });
    src.focus();
    await user.keyboard('{ArrowLeft}');
    expect(src).toHaveAttribute('aria-expanded', 'false');
  });

  test('Home/End move focus to first/last visible item', async () => {
    const user = userEvent.setup();
    render(<FileTree />);
    screen.getByRole('treeitem', { name: 'src' }).focus();
    await user.keyboard('{End}');
    expect(screen.getByRole('treeitem', { name: 'package.json' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('treeitem', { name: 'src' })).toHaveFocus();
  });

  test("collapsed branch's children are unreachable via ArrowDown", async () => {
    const user = userEvent.setup();
    render(<FileTree defaultExpanded={[]} />);
    screen.getByRole('treeitem', { name: 'src' }).focus();
    await user.keyboard('{ArrowDown}');
    // src collapsed -> next visible item is package.json, not index.ts
    expect(screen.getByRole('treeitem', { name: 'package.json' })).toHaveFocus();
  });
});

describe('TreeView — controlled expanded state', () => {
  test('controlled expanded prop drives visible state', () => {
    render(<FileTree expanded={[]} />);
    expect(screen.getByRole('treeitem', { name: 'src' })).toHaveAttribute('aria-expanded', 'false');
  });

  test('onExpandedChange fires when a branch is toggled', async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    render(<FileTree expanded={['src']} onExpandedChange={onExpandedChange} />);
    await user.click(screen.getByRole('treeitem', { name: 'src' }));
    expect(onExpandedChange).toHaveBeenCalledWith([]);
  });
});

describe('TreeView — layout stability', () => {
  test('expanding src does not change its own DOM position among following siblings', async () => {
    const user = userEvent.setup();
    render(<FileTree defaultExpanded={[]} />);
    const tree = screen.getByRole('tree');
    const srcBefore = screen.getByRole('treeitem', { name: 'src' });
    const indexInTreeBefore = Array.from(tree.querySelectorAll("[role='treeitem']")).indexOf(
      srcBefore,
    );

    await user.click(srcBefore);

    const srcAfter = screen.getByRole('treeitem', { name: 'src' });
    const indexInTreeAfter = Array.from(tree.querySelectorAll("[role='treeitem']")).indexOf(
      srcAfter,
    );
    expect(indexInTreeAfter).toBe(indexInTreeBefore); // same DOM node, same position
    expect(srcAfter).toBe(srcBefore); // literally the same element — never remounted
  });
});
