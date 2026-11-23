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

## Component ownership and variants
- A module declares only field semantics and behavior: native control type (`text`, `email`, `password`, `number`, `file`, etc.), name/id, value, validation, options, and event handling.
- Appearance is selected only by the shared component class: `ui-input`, `ui-select`, `ui-textarea`, `ui-checkbox`, `ui-radio`, `ui-button`, and `ui-form-field`.
- Never create module/page-specific input, select, textarea, checkbox, radio, button, or form-field CSS.
- The same component has one shared base style everywhere. The old `ui-form-submit` class is a temporary compatibility alias to the shared button, not an independent style. Do not create Home/Dashboard, Intro/Module, or other context-specific versions.
- Only semantic variants are permitted (for example button `primary` or `danger`); variants are centrally defined and express purpose, not location. Layout utilities such as full-width may change placement, not visual design.
- Do not introduce another variant with a new value when an existing shared semantic variant already covers the need.

## Shared components
Reuse global classes: `ui-container`, `ui-section`, `ui-card`, `ui-tile`, `ui-item-card`, `ui-button`, `ui-button-primary`, `ui-button-danger`, `ui-button-block`, `ui-button-group`, `ui-input`, `ui-select`, `ui-textarea`, `ui-form`, `ui-form-field`, `ui-form-label`, `ui-checkbox`, `ui-radio`, `ui-form-actions`, `ui-visibility-list`, `ui-visibility-option`, `ui-status`, `ui-form-card`, `ui-admin-panel`, `ui-admin-list`, `ui-admin-image-preview`, `ui-admin-preview`, `ui-dashboard-sections`, `ui-content-details`, and `ui-content-message`.

A shared component must be implemented once in Global Standards (or a shared component module when behavior is required).
- Shared behavior components: `components/visibility.js` owns role visibility rendering/selection; `components/module-dashboard.js` owns the shared CRUD dashboard form and list behavior; `components/content-module-view.js` owns reusable homepage cards, detail views, and their mounting behavior; `components/image-upload.js` owns the shared file-selection, upload, preview, and status flow.
- `services/content-module.js` owns common Supabase CRUD, role loading, slug generation, image upload, and public image URL behavior. Module adapters provide only table, storage folder, and labels.
- New pages/modules must use these shared components and services wherever their behavior matches. Add a shared capability first when the same behavior appears in more than one place. Module code may provide data, events, and module-specific content, but must not restyle or recreate shared component structure.

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
3. Confirm controls use semantic Global classes and native field types only; reject module/page-specific appearance classes or values.
4. Confirm there is only one base style per component and only approved semantic variants, never context-based variants.
5. Check desktop, tablet, and mobile layouts.
6. Check light and dark modes.
7. Verify keyboard focus, disabled states, and status/loading feedback.
8. Verify that data, authentication, permissions, and navigation behavior remain unchanged.
