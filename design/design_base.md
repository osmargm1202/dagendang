---
name: Premium Editorial
colors:
  surface: '#fcf8f9'
  surface-dim: '#dcd9da'
  surface-bright: '#fcf8f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f4'
  surface-container: '#f0edee'
  surface-container-high: '#eae7e8'
  surface-container-highest: '#e5e2e3'
  on-surface: '#1b1b1c'
  on-surface-variant: '#43474f'
  inverse-surface: '#303031'
  inverse-on-surface: '#f3f0f1'
  outline: '#737780'
  outline-variant: '#c3c6d1'
  surface-tint: '#3a5f94'
  primary: '#001e40'
  on-primary: '#ffffff'
  primary-container: '#003366'
  on-primary-container: '#799dd6'
  inverse-primary: '#a7c8ff'
  secondary: '#b6171e'
  on-secondary: '#ffffff'
  secondary-container: '#da3433'
  on-secondary-container: '#fffbff'
  tertiary: '#001d42'
  on-tertiary: '#ffffff'
  tertiary-container: '#003268'
  on-tertiary-container: '#669cf1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#a7c8ff'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#1f477b'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb3ac'
  on-secondary-fixed: '#410003'
  on-secondary-fixed-variant: '#930010'
  tertiary-fixed: '#d6e3ff'
  tertiary-fixed-dim: '#a9c7ff'
  on-tertiary-fixed: '#001b3d'
  on-tertiary-fixed-variant: '#00468c'
  background: '#fcf8f9'
  on-background: '#1b1b1c'
  surface-variant: '#e5e2e3'
  ivory-bg: '#FCFBF9'
  dark-bg: '#0B111B'
  dark-surface: '#161F2C'
  border-light: '#E5E3E0'
  border-dark: '#2D3748'
typography:
  display-xl:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 30px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-padding: 64px
---

## Brand & Style

This design system is engineered for a premium digital newspaper, prioritizing authority, clarity, and an international editorial aesthetic. The brand personality is serious and intellectual, mirroring the prestige of legacy broadsheets while embracing a digital-first, high-performance interface.

The design style is **Minimalist / High-Contrast Editorial**. It leverages expansive white space (or deep navy in dark mode) to let photography and journalism command attention. The visual language is defined by structural integrity, using subtle 1px borders to delineate content sections rather than heavy shadows or decorative gradients. The result is a sophisticated, "news-first" environment that feels both contemporary and timeless.

## Colors

The palette is rooted in traditional journalistic colors—Deep Navy and Accent Red—refined for digital legibility. 

- **Light Mode:** Uses an Ivory background (`#FCFBF9`) to reduce eye strain compared to pure white, paired with Dark Text (`#1A1A1B`) for maximum contrast.
- **Dark Mode:** Transitions to a Deep Navy-Black (`#0B111B`) with a "Dark Surface" tier for cards and navigation. The Soft Blue accent is reserved for interactive elements and metadata in dark mode to ensure visibility against the navy depths.
- **Borders:** Subtle 1px strokes are critical for the editorial structure. In light mode, use a warm gray-tinted border; in dark mode, a muted navy-gray.

## Typography

The typographic system relies on the interplay between a classic Serif and a functional Sans-Serif.

- **Headlines:** Playfair Display is used for all editorial titles. It provides the "premium" feel associated with high-end publishing. Large display sizes should use tighter letter-spacing to maintain a compact, impactful look.
- **Body & UI:** Inter is used for article body text and all interface elements. It provides exceptional legibility at small sizes and maintains a neutral, objective tone.
- **Article Body:** For long-form reading, `body-lg` uses a generous 1.6x line height to improve reading stamina.
- **Labels:** Meta-information (Categories, By-lines, Timestamps) should use `label-md` with uppercase styling and increased tracking to differentiate UI from content.

## Layout & Spacing

This design system utilizes a **Fixed Grid** approach for desktop to mirror the structured columns of a physical newspaper, while transitioning to a **Fluid Grid** for mobile devices.

- **Desktop:** A 12-column grid with a 1280px max-width. Content is often organized into asymmetric layouts (e.g., a 8-column main story paired with a 4-column sidebar).
- **Rhythm:** A strict 8px baseline grid ensures vertical harmony. Headlines and body text should follow consistent "Stack" tokens to maintain the hierarchy.
- **Negative Space:** Generous margins and section padding (`64px`) are used to prevent the high-density information common in news sites from becoming overwhelming.

## Elevation & Depth

To maintain the premium editorial feel, this design system avoids heavy drop shadows and skeuomorphism. Depth is achieved through:

1.  **Low-Contrast Outlines:** The primary method for separating content. 1px borders in `border-light` or `border-dark` define the boundaries of cards, navigation bars, and section dividers.
2.  **Tonal Layers:** In Dark Mode, the background is `dark-bg`, while interactive components like cards or menus sit on `dark-surface`. This creates a subtle sense of elevation without relying on shadows.
3.  **Flat Hierarchy:** Most elements are perceived as being on the same plane, much like ink on paper. Elevation is only used for temporary overlays like modals or dropdown menus, which should use a very soft, high-diffusion shadow (0px 10px 30px rgba(0,0,0,0.1)).

## Shapes

The shape language is crisp and professional. 

- **Roundedness:** A "Soft" (`0.25rem`) corner radius is applied to buttons and input fields to modernise the UI slightly without losing the serious, structural feel of a newspaper. 
- **Images:** Editorial photography should remain sharp (0px radius) to maintain a clean, "cut" edge against the layout. 
- **Interactive Elements:** Small chips or tags may use `rounded-lg` for distinct visual separation from the rigid grid.

## Components

- **Buttons:**
    - *Primary:* Solid Deep Navy with White text. Sharp corners (4px).
    - *Secondary:* Ghost style with 1px Deep Navy border.
    - *Tertiary:* Accent Red used sparingly for "Breaking News" or urgent "Subscribe" calls-to-action.
- **Cards:**
    - Feature cards use a vertical stack: Category (Label SM), Headline (Headline MD), Excerpt (Body MD), and Byline. 
    - Separated by 1px horizontal dividers rather than boxes where possible to maintain the "flow" of the page.
- **Chips:**
    - Used for article tags. Subtle gray background in light mode; navy-surface in dark mode. No borders.
- **Inputs:**
    - 1px border on all sides. When focused, the border color shifts to Deep Navy (Light) or Soft Blue (Dark). 
- **Lists:**
    - "Latest News" lists use a 1px bottom border for every item except the last one.
- **Navigation:**
    - Top-tier navigation uses uppercase `label-md` for a clean, professional header. 
    - Sticky navigation should transition to a 1px bottom border on scroll for clear separation from content.