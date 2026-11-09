# EngramLoop — Product design system

> A calm, precise workspace for conversations that remember useful context and let people inspect, correct, and remove it.

**Product:** A conversational assistant with persistent, explainable memory.  
**Primary users:** Developers, students and researchers exploring memory systems, and knowledge workers who want continuity across chats.  
**Primary job:** Help a person continue a conversation with relevant context while keeping that context visible and under their control.

This document describes the intended dashboard experience. The repository is an early scaffold: some controls are previews or planned behavior, so the interface must not imply that unfinished capabilities are already active.

## Product principles

- **Make memory legible.** Show when saved context is being used and let people inspect its source.
- **Keep the conversation central.** Chat is the main working surface; memory supports it without crowding the transcript.
- **Give people control.** Editing and deleting memories should be easy to find and understand.
- **Use quiet structure.** Clear surfaces, restrained color, and consistent spacing support focused work.
- **Be honest about state.** Distinguish preview mode, unavailable services, and saved changes from active functionality.

## Brand identity

Use the project logo at **docs/assets/EngramLoop-Logo.png**. It combines a conversation/document motif with an infinity loop, expressing useful context carried from one conversation into another.

- Prefer the complete logo in the workspace navigation and sign-in experience when it fits.
- Preserve its proportions and transparent background. Use contain sizing; do not crop, recolor, distort, or recreate it with typed text or a substitute infinity glyph.
- Use a compact crop only if a dedicated, approved mark asset is added later.
- The logo’s blue, violet, and cyan provide the brand accents. Keep surrounding UI calm so the logo remains distinct.

The approved project mascot is **apps/web/public/assets/engramloop-mascot.png**. It is a small loop-shaped memory spirit in indigo, cyan, and violet. Use it in the landing-page memory illustration, the context-return step, and assistant avatars. Keep it a supporting character; it does not replace the EngramLoop logo or meaningful navigation icons. Preserve its transparent background and size it to remain recognizable at avatar scale.

## Color system

The dashboard uses cool, light surfaces with a deep indigo navigation rail. Indigo identifies primary actions and selected navigation; cyan signals memory and successful/active states. Semantic colors are reserved for their meaning.

| Name | Value | Token | Use |
|---|---|---|---|
| Canvas | #f5f7fc | --paper | Main application background |
| Surface | #ffffff | --surface | Conversation, memory, settings, and dialog surfaces |
| Ink | #171936 | --ink | Main text and headings |
| Soft ink | #464b67 | --ink-soft | Supporting text with stronger contrast than muted copy |
| Muted | #7c819a | --muted | Dates, helper text, secondary labels |
| Border | #e4e8f2 | --line | Default separators and outlines |
| Strong border | #d4daea | --line-strong | Input outlines and emphasized separation |
| Indigo | #4d45ed | --blue | Primary actions, links, active icons |
| Deep indigo | #3430bd | --blue-deep | Hover and pressed action states |
| Pale indigo | #eff1ff | --blue-pale | Soft selected and informational surfaces |
| Cyan | #15cbd8 | --cyan | Memory-related emphasis and positive/active status |
| Pale cyan | #e8fbfc | --mint-pale | Memory-use and success callouts |
| Navigation | #171938 | --sidebar | Desktop navigation rail |
| Navigation secondary | #afb2cf | --sidebar-muted | Unselected rail labels |
| Danger | #b43b53 | --danger | Delete and destructive feedback |

Use the canvas and white surfaces for most of the screen. Indigo should identify actions and current location, not decorate every panel. Keep cyan to small, meaningful memory cues. Do not use gradients as a default surface treatment or introduce the unrelated cream-and-pastel Hatch palette.

## Typography

Use the current interface family: Avenir Next, with Avenir, Segoe UI, and system sans-serif fallbacks. The logo supplies its own wordmark lettering.

| Role | Size guidance | Weight | Use |
|---|---:|---:|---|
| Page title | 20–24 px | 650–700 | Sticky header title |
| Section title | 14–18 px | 600–700 | Panels and page sections |
| Body | 13–15 px | 400–500 | Conversation, memory, and settings copy |
| Supporting text | 11–12 px | 400–500 | Source details, helper text, timestamps |
| Small status | 10–11 px | 600–700 | Preview and state labels |

Use sentence case and plain language. Keep paragraphs left aligned and usually under 80 characters per line. Chat text should be comfortable to scan, with a line height around 1.6–1.75. Use weight and placement to show hierarchy rather than all-caps labels or decorative display type.

## Layout and navigation

### Desktop workspace

At wide sizes, use a fixed-width navigation rail beside a flexible content column. Keep the rail approximately 230–250 px wide. It contains the logo, workspace label, links to Chat, Memories, and Settings, a short memory-control note, and sign-in or account status.

The page header sits at the top of the content column and stays visible while the page scrolls. Use a compact breadcrumb or product label, the current page title, and a right-aligned state indicator such as Preview mode. The page body scrolls below it.

Desktop page structure:

    ┌──────────────────┬────────────────────────────────────────────┐
    │ Logo             │ Current page                         State │
    │ Workspace        ├────────────────────────────────────────────┤
    │ Chat             │                                            │
    │ Memories         │ Page content                               │
    │ Settings         │                                            │
    │                  │                                            │
    │ Account / status │                                            │
    └──────────────────┴────────────────────────────────────────────┘

### Sticky header behavior

The workspace header must remain pinned to the top while the user scrolls on desktop and mobile. Use sticky positioning at the viewport top, a high stacking order, an opaque or nearly opaque surface, and a thin bottom border so content does not show through or compete with the title. Keep it in the page flow so it does not cover content. Avoid putting it inside a container that clips sticky positioning.

On desktop, the sidebar may remain independently pinned to the top of the viewport while its own navigation contents stay available. The main header remains pinned at the top of the content column.

On mobile, keep the compact app header pinned to the top as well. Account for the device safe-area inset. Give the first item below the header enough spacing that it is never obscured.

### Mobile navigation

At tablet and phone widths, replace the desktop rail and always-visible row of navigation links with a compact header and a hamburger menu.

- Show the EngramLoop logo or approved compact logo at the leading edge, the current page title when space allows, and a labeled menu button at the trailing edge.
- The menu button opens a navigation drawer or panel containing Chat, Memories, Settings, and the relevant sign-in/account status.
- Mark the current destination clearly. Selecting a destination closes the menu.
- The button must expose its expanded state to assistive technology, have a visible keyboard focus state, and be usable by touch. Close the menu with Escape and return focus to the menu button. Keep the open menu within the viewport and prevent it from being hidden behind the sticky header.
- Do not squeeze the desktop links into a tiny horizontal row on a phone.

Mobile shell:

    ┌──────────────────────────────────┐
    │ EngramLoop       Page title   ☰  │  Sticky header
    ├──────────────────────────────────┤
    │                                  │
    │ Page content                     │
    │                                  │
    └──────────────────────────────────┘

    Open menu:
    ┌──────────────────────────────────┐
    │ EngramLoop       Page title   ×  │  Sticky header
    ├──────────────────────────────────┤
    │ Chat                             │
    │ Memories                         │
    │ Settings                         │
    │ Sign in / account status         │
    └──────────────────────────────────┘

Use the existing 800 px breakpoint as the point where the rail becomes mobile navigation. At narrow phone widths, shorten or hide the page title before reducing the logo or menu button’s usable touch target.

## Page patterns

### Chat

Chat is the primary workspace. Give the transcript the largest area and keep the composer anchored at the bottom of the conversation surface. On wide screens, place a smaller context panel beside the conversation. On mobile, put the context panel after the transcript so the conversation stays first.

When relevant memories are used, show a concise, understandable summary and a path to inspect the memories. When no memories match, explain that in a quiet empty state; do not suggest that the assistant remembered something it did not retrieve. Show streaming and error states near the response or composer, with a clear next action.

### Memory library

Make search and filters easy to reach. Each memory entry should show its content, type, and useful date or source context. Keep edit and delete actions associated with the memory they affect. Source details may expand inline. Deletion should be clear and deliberate, with accessible confirmation and feedback.

Empty state copy should guide the person toward the next useful step, such as starting a conversation. Do not populate the interface with invented memories that could be mistaken for real user data.

### Settings

Group preferences by purpose, explain their effect in plain language, and show whether each setting is available. Retention controls must not look saved or active unless the API persists them. Mark unfinished settings as unavailable or preview-only instead of presenting a misleading active toggle.

### Sign in

Keep authentication focused: show the EngramLoop logo, a short explanation, and the identity provider flow. Use the same canvas, ink, indigo, and cyan palette as the workspace. Do not add unrelated marketing content.

## Components, surfaces, and spacing

- **Primary button:** Indigo fill with white text; clear hover, pressed, disabled, and focus-visible states.
- **Secondary button:** White or transparent surface with a light border and ink text.
- **Destructive button:** Use the danger color and name the action clearly.
- **Navigation link:** Minimum 44 px target height, icon plus readable label, muted at rest and visibly selected on the active page.
- **Cards and panels:** White surface, light border, 12–16 px radius. Use a subtle shadow only for floating or overlay surfaces; ordinary cards rely on surface contrast and borders.
- **Inputs:** White surface, strong border, visible focus ring, and clear labels. Never rely on placeholder text as the only label.
- **Status pills:** Small, high-contrast labels for preview, connected, or unavailable states. Do not rely on color alone.
- **Spacing:** Use a 4 px base scale. Common gaps are 8, 12, 16, 20, and 24 px. Page padding is about 24–58 px on desktop and 12–20 px on phones.
- **Content width:** Let conversation and memory text remain readable; avoid stretching long-form text across very wide displays.

## Interaction and accessibility

- Use semantic navigation, main, header, buttons, and form labels.
- Support keyboard navigation and show a high-contrast focus ring.
- Provide accessible names for icon-only controls, including the hamburger.
- Keep text and controls legible against every surface, and do not use color as the sole state indicator.
- Respect reduced-motion preferences. Keep transitions brief and tied to user actions; avoid decorative entrance animations.
- Preserve chat composer usability when the mobile keyboard opens. Ensure the send action and latest response remain reachable.
- Show useful loading, empty, success, and error states. Errors should identify what failed and give the user a next step.
- Confirm destructive changes and report when the change has completed.

## Do and avoid

### Do

- Use the supplied EngramLoop logo and the existing indigo/cyan visual identity.
- Keep the conversation visually primary and memory sources easy to inspect.
- Make the sticky page header and mobile hamburger behavior consistent across Chat, Memories, and Settings.
- Reuse the same navigation labels, button styles, spacing, and status language throughout the app.
- Make preview-only and unavailable functionality explicit.

### Avoid

- Do not retain the Hatch brand name, Recoleta/Lota typography, cream paper palette, mint CTAs, confetti, or hand-drawn swashes from the old design document.
- Do not use the mascot in place of the EngramLoop logo or where a semantic icon helps people navigate.
- Do not replace the logo with a text wordmark plus an infinity character.
- Do not let the header disappear during page scroll or turn the mobile navigation into a cramped link row.
- Do not imply that planned retention, evaluation, or account features are working when they are only scaffolded.
- Do not add decorative graphics that compete with the conversation or memory content.

## Quick reference

- **Brand asset:** docs/assets/EngramLoop-Logo.png
- **Mascot asset:** apps/web/public/assets/engramloop-mascot.png
- **Canvas / surface:** #f5f7fc / #ffffff
- **Text:** #171936 primary, #464b67 supporting
- **Primary action / active link:** #4d45ed
- **Memory / active accent:** #15cbd8
- **Desktop navigation:** dark indigo left rail
- **Header:** sticky at viewport top on desktop and mobile
- **Phone navigation:** hamburger opens Chat, Memories, Settings, and account status
- **Typeface:** Avenir Next with system sans-serif fallbacks

