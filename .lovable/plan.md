

## Make Desktop Icons Draggable

All icons currently have `locked: true`, which prevents dragging. The fix is simple:

1. **`src/store/useSystemStore.ts`**: Remove `locked: true` from all entries in `defaultDesktopIcons` (or set to `false`).

That's it — the drag logic in `DesktopIcon.tsx` already works; it just checks `if (icon.locked) return` before enabling drag. Removing the lock re-enables dragging for everyone.

