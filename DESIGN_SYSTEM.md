# 3B TECH HUB — Global Design System

## Source of truth
- `themes/classic/standards.css` owns shared design tokens and global component styles.
- `themes/classic/light.css` and `themes/classic/dark.css` own theme-specific values only.
- Theme-independent component structure and behavior must not be duplicated in page or module CSS.

## Tokens
Use the existing tokens for spacing, sizing, typography, color, borders, radii, shadows, layout widths, and icons. Prefer:
- `--space-*`, `--space-element`, `--space-section`
- `--size-control`, `--size-icon-*`, `--icon-size`
- `--font-size-*`, `--font-weight-*`, `--line-height-*`
- `--content-width-*`, `--page-padding`
- `--border-width`, `--radius-*`, `--color-*`, `--shadow-card`

Do not add raw spacing, typography, border, radius, color, shadow, or common dimensions to page/module CSS when a global token exists. A genuinely unique visual dimension may remain local only when it is intrinsic to that module's content (for example, a media crop limit), not a shared UI convention.

## Shared components
Reuse global classes: `ui-container`, `ui-section`, `ui-card`, `ui-tile`, `ui-item-card`, `ui-button`, `ui-button-group`, `ui-input`, `ui-select`, `ui-textarea`, `ui-form`, `ui-form-field`, `ui-form-label`, `ui-form-control`, `ui-form-actions`, `ui-visibility-list`, `ui-visibility-option`, `ui-status`, and `ui-form-card`.

A shared component must be implemented once in Global Standards (or a shared component module when behavior is required). Module code may provide data, events, and module-specific content, but must not restyle or recreate shared component structure.

## Module boundaries
Module styles may cover module-specific layout and content only. Do not define a second card, tile, form field, visibility selector, button, status, or loading system in a module. Keep data access, permissions, and business behavior unchanged when changing presentation.

## Loading and themes
- `loader.js` is the single resource-loading entry point.
- Global theme styles must be ready before contexts mount.
- Do not load the same resource twice or reveal partially initialized pages.
- Theme variants may change tokens, not shared component markup or behavior.

## Required review before merging a page/module
1. Search for duplicate shared component markup and CSS.
2. Search for raw spacing and other design values; replace them with tokens where applicable.
3. Check desktop, tablet, and mobile layouts.
4. Check light and dark modes.
5. Verify keyboard focus, disabled states, and status/loading feedback.
6. Verify that data, authentication, permissions, and navigation behavior remain unchanged.
