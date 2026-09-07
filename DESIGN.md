# Vijay Jangir Website Design System

## 1. Atmosphere & Identity

Quiet, technical, and high-trust. The site should read like an engineering portfolio for enterprise platform work: calm surfaces, strong typography, restrained motion, and evidence-forward content. The signature is structured credibility — precise copy, clean cards, and highlighted platform/AI keywords without startup-style hype.

## 2. Color

### Palette

| Role | Token | Light | Dark | Usage |
|------|-------|-------|------|-------|
| Surface/primary | --surface-primary | #f8fbff | #0f172a | Page background |
| Surface/secondary | --surface-secondary | #ffffff | #111827 | Cards, panels |
| Surface/elevated | --surface-elevated | #ffffff | #1f2937 | Strong emphasis cards |
| Text/primary | --text-primary | #0e1528 | #f8fafc | Headings |
| Text/secondary | --text-secondary | #475569 | #cbd5e1 | Body copy |
| Text/tertiary | --text-tertiary | #64748b | #94a3b8 | Supporting labels |
| Border/default | --border-default | #e2e8f0 | #334155 | Card borders |
| Border/subtle | --border-subtle | #f1f5f9 | #1e293b | Soft separators |
| Accent/primary | --accent-primary | #1f3b73 | #93c5fd | Eyebrows, links, keyword emphasis |
| Accent/hover | --accent-hover | #0f2d63 | #bfdbfe | Interactive hover |
| Status/success | --status-success | #166534 | #22c55e | Positive proof |
| Status/warning | --status-warning | #b45309 | #f59e0b | Cautionary messaging |
| Status/error | --status-error | #b91c1c | #ef4444 | Errors |
| Status/info | --status-info | #1d4ed8 | #60a5fa | Informational callouts |

### Rules
- Keep the page in a cool-slate family with navy emphasis; no extra accent ramps.
- Accent color is reserved for navigation cues, keywords, and focused CTAs.
- No raw hex values outside this file unless first added here.

## 3. Typography

### Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| Display | clamp(3rem, 6vw, 4.75rem) | 600 | 0.94 | -0.06em | Homepage hero title |
| H1 | 3rem | 600 | 1.02 | -0.05em | Major section titles |
| H2 | 2.25rem | 600 | 1.1 | -0.045em | Section headings |
| H3 | 1.875rem | 600 | 1.2 | -0.03em | Project card titles |
| Body/lg | 1.25rem | 400 | 1.7 | 0 | Hero subtitle |
| Body | 1rem | 400 | 1.75 | 0 | Default body text |
| Body/sm | 0.875rem | 400 | 1.7 | 0 | Supporting details |
| Caption | 0.75rem | 600 | 1.4 | 0.02em | Labels |
| Overline | 0.72rem | 600 | 1.3 | 0.24em | Eyebrows |

### Font Stack
- Primary: Inter Variable, system-ui, sans-serif
- Mono: IBM Plex Mono, monospace
- Serif: none

### Rules
- Headlines should stay punchy and usually land in 1-3 lines.
- Evidence blocks and metadata should use mono or tighter tracking, not louder color.
- Avoid oversized hero text that forces awkward wraps.

## 4. Spacing & Layout

### Base Unit
All spacing derives from **4px**.

| Token | Value | Usage |
|-------|-------|-------|
| --space-1 | 4px | Tight icon gaps |
| --space-2 | 8px | Small pill gaps |
| --space-3 | 12px | Dense control padding |
| --space-4 | 16px | Default compact spacing |
| --space-5 | 20px | Comfortable label/content gaps |
| --space-6 | 24px | Card padding |
| --space-8 | 32px | Section internals |
| --space-10 | 40px | Larger card and hero spacing |
| --space-12 | 48px | Section breaks |
| --space-16 | 64px | Major page rhythm |
| --space-20 | 80px | Hero vertical spacing |
| --space-24 | 96px | Maximum section separation |

### Grid
- Max content width: 82rem
- Column system: responsive cards with 24px gutters on desktop, 16px on mobile
- Breakpoints: sm 640px, md 768px, lg 1024px, xl 1280px, 2xl 1536px

### Rules
- Homepage sections should use the full width of the existing max container instead of narrow center columns wherever readability stays intact.
- Chip rows and metrics should wrap cleanly instead of forcing equal-width boxes.

## 5. Components

### Hero keyword strip
- **Structure**: eyebrow label + wrapped chip row under the hero subtitle
- **Variants**: default only
- **Spacing**: --space-2 between chips, --space-5 above subtitle
- **States**: default, hover, focus-visible for links only if interactive
- **Accessibility**: chips remain text-readable and not color-only
- **Motion**: enter with the same fade/rise sequence as the hero
- **Layout**: centered cluster that wraps across breakpoints

### Evidence highlight card
- **Structure**: value, label, supporting detail
- **Variants**: default only
- **Spacing**: --space-4 to --space-6 internal padding
- **States**: static content card
- **Accessibility**: label/value hierarchy must stay readable at mobile widths
- **Motion**: fade/rise on scroll
- **Layout**: 2x2 grid on desktop, 1-2 columns responsively

### Project skill pills
- **Structure**: wrapped inline labels inside each featured project card
- **Variants**: default only
- **Spacing**: --space-2 gap, --space-3 internal padding
- **States**: subtle hover only through parent card
- **Accessibility**: text stays readable without relying on tooltip or truncation
- **Motion**: none beyond parent card movement
- **Layout**: wrap naturally; do not force fixed three-column tiles

## 6. Motion & Interaction

### Timing

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | 120-150ms | ease-out | Button hover/press |
| Standard | 220-320ms | ease-in-out | Card and chip appearance |
| Emphasis | 420-700ms | cubic-bezier(0.22, 1, 0.36, 1) | Hero and section entrances |
| Scroll-driven | n/a | n/a | Not used on the homepage |

### Rules
- Motion stays subtle and directional; no decorative animation loops.
- Use transform/opacity only.
- Respect reduced motion via existing Framer Motion reduced-motion handling.

## 7. Depth & Surface

### Strategy
Mixed — tonal-shift plus restrained soft shadows.

| Level | Value | Usage |
|-------|-------|-------|
| Subtle | 0 14px 30px rgba(31, 44, 75, 0.08) | Pills, smaller cards |
| Default | 0 20px 56px rgba(31, 44, 75, 0.08) | Highlight grid |
| Prominent | 0 24px 70px rgba(31, 44, 75, 0.08) | Section card groups |

## 8. Accessibility Constraints & Accepted Debt

### Constraints
- WCAG target: 2.2 AA
- Maintain visible focus, readable chip contrast, and no critical information hidden behind hover.
- Homepage content must reflow to a single readable column at 375px without horizontal scroll.

### Accepted Debt
| Item | Location | Why accepted | Owner / Exit |
|------|----------|--------------|--------------|
| Existing font stack remains Inter-led | Global site styles | Preserves current shipped look and available dependencies | Revisit only during a deliberate typography refresh |
