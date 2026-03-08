
## Problem Analysis

There are two bugs:

1. **Clock, Calculator, Notepad, Calendar don't show their content when clicked in the taskbar.** These are initialized as windows in `useWindowStore` with type `'finder'`, so they render as Finder windows instead of their actual widget content. Meanwhile, the real widgets live in a separate system (`useSystemStore.widgets` + `DraggableWidget`).

2. **Taskbar minimize doesn't work properly.** Clicking an active (non-minimized) window's taskbar button should minimize it, but currently it only calls `focusWindow` — it never minimizes.

## Plan

### 1. Remove fake default windows from `useWindowStore`
Remove the 5 pre-loaded entries (clock, calculator, notepad, calendar, music) from the `windows` array default state in `useWindowStore.ts`. These were creating Finder-type windows that don't match the actual widget components.

### 2. Make taskbar buttons toggle widgets
In `MenuBar.tsx`, update the taskbar click handler: when clicking a taskbar button for a window that is currently focused and not minimized, minimize it instead of just focusing it. This fixes the standard window minimize-on-click behavior.

### 3. Add widget entries to the taskbar
In `MenuBar.tsx`, add taskbar buttons for the widgets (Clock, Calculator, Notepad, Calendar) that toggle their visibility via `useSystemStore.toggleWidget()` instead of going through the window system.

### Technical Details

**`src/store/useWindowStore.ts`** — Change `windows` default to `[]` (remove lines 19-24).

**`src/components/Desktop/MenuBar.tsx`** — 
- Import `toggleWidget`/`widgets` from `useSystemStore`
- In the running-apps section, add buttons for widgets that toggle visibility
- Fix taskbar click: if window is focused and visible, minimize it; if minimized, restore; otherwise focus
