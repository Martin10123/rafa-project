---
name: apple-ui
description: >-
  UI constraints for the Rafa manillas storefront: shadcn/ui (Nova), Inter,
  light cool palette, titles with text-xs / text-sm / text-base. Use when
  building or editing any UI, layout, Tailwind, component, or page in rafa-project.
---

# UI — Rafa (shadcn)

## Stack

MUST use shadcn/ui components from `src/components/ui` (style: base-nova).
MUST use Inter Variable as the only UI font.
SHOULD keep light mode as the default storefront look.

## Typography

MUST use Tailwind sizes for titles and body:
- Page eyebrow / labels: `text-xs`
- Secondary titles / nav: `text-sm`
- Primary titles (h1, card titles): `text-base`
NEVER use oversized display sizes (51px, 43px, 27px) for storefront chrome.
SHOULD use `text-balance` on headings and `text-pretty` on supporting copy.
SHOULD use `tabular-nums` for prices.

## Color

Use shadcn semantic tokens only: `background`, `foreground`, `card`, `muted`,
`primary`, `border`, `destructive`, etc.
SHOULD keep a cool (blue-tinted) light palette.
NEVER invent parallel color systems (`surface-base`, `text-16`, etc.).

## Layout

MUST use `h-dvh` for full-height shells (never `h-screen`).
SHOULD keep content in `max-w-5xl` with `px-4`.
Header height around `h-12`, border-bottom, subtle backdrop blur.
MUST respect `safe-area-inset` on fixed/sticky headers.

## Components

- Buttons: `@/components/ui/button`
- Dialogs / auth modals: `@/components/ui/dialog`
- Forms: `@/components/ui/input` + `@/components/ui/label`
- Catalog tiles: `@/components/ui/card`
Auth is optional; login/register open from the navbar as a Dialog.

## Interaction

MUST show errors next to the field/action.
MUST add `aria-label` to icon-only buttons.
SHOULD use structural skeletons for loading.
NEVER block paste in inputs.

## Animation

Prefer the built-in shadcn/dialog motion only.
NEVER add extra animation unless the user asks.
SHOULD respect `prefers-reduced-motion`.
