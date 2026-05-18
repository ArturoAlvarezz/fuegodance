# 🔥 Fuego Dance — Design System

## Visual Identity
**Vibe:** Oscuro y caliente — sensación de fiesta nocturna, pasión latina, fuego en la pista.

## Color Palette

### Primary (Fire)
| Token           | Hex       | Usage                          |
|-----------------|-----------|--------------------------------|
| `fire-red`      | `#E63946` | CTAs, highlights, accents      |
| `fire-orange`   | `#F77F00` | Hover states, secondary accent |
| `fire-gold`     | `#FCBF49` | Badges, stars, subtle accents  |
| `fire-yellow`   | `#FFD166` | Glow effects, warm highlights  |

### Neutral (Dark)
| Token           | Hex       | Usage                          |
|-----------------|-----------|--------------------------------|
| `obsidian`      | `#0D0D0D` | Page background                |
| `charcoal`      | `#1A1A2E` | Card backgrounds, sections     |
| `slate`         | `#16213E` | Nav, footer, elevated surfaces |
| `ash`           | `#2A2A3E` | Borders, dividers              |

### Text
| Token           | Hex       | Usage                          |
|-----------------|-----------|--------------------------------|
| `white`         | `#FFFFFF` | Primary text                   |
| `silver`        | `#C4C4C4` | Secondary text, descriptions   |
| `muted`         | `#8888A0` | Disabled, timestamps, meta     |

## Typography

### Headings
- **Font:** `Bebas Neue` (Google Fonts) — bold, condensed, impact
- **Alternative:** `Oswald` for variety
- **Weight:** 700
- **Sizes:** 48/36/28/24/20px (h1-h5)

### Body
- **Font:** `Inter` (Google Fonts) — clean, modern, excellent readability
- **Weight:** 400 (body), 600 (emphasis)
- **Sizes:** 16/14/12px

### Accent
- **Font:** `Dancing Script` — for decorative elements (quotes, headers on photos)

## Spacing & Layout
- **Max width:** 1200px
- **Section padding:** 80px vertical (desktop), 48px (mobile)
- **Card gap:** 24px
- **Border radius:** 12px (cards), 8px (buttons), 50% (avatars)

## Components Style

### Cards
- Dark background (`charcoal`) with subtle border (`ash`)
- Hover: glow effect with `fire-orange`, slight scale (1.02)
- Border radius: 12px
- Overflow hidden for image cards

### Buttons
- Primary: `fire-red` bg, white text, rounded
- Hover: `fire-orange` bg, subtle glow shadow
- Secondary: transparent bg, `fire-red` border, `fire-red` text

### Navigation
- Fixed top, semi-transparent `slate` with backdrop-blur
- Logo left, nav links center, CTA button right
- Mobile: hamburger with slide-in drawer

### Hero Section
- Full viewport height
- Background: gradient from `obsidian` to `charcoal`
- Animated fire particles or subtle ember effect
- Large heading + tagline + CTA buttons
- Logo centered or top-left

### Photo Gallery
- Masonry grid layout
- Hover: zoom + overlay with event name
- Click: fullscreen lightbox with arrows

### Video Cards (Figures)
- Thumbnail with play button overlay
- Category badge (e.g., "Básico", "Intermedio", "Avanzado")
- Duration indicator
- Hover: glow, play icon pulse

### Instagram Feed
- Grid of latest 6-9 posts
- Hover: overlay with likes/comments count
- Link to Instagram profile

## Animations
- Page transitions: fade-in
- Cards: hover lift + glow
- Fire particles on hero (CSS or lightweight JS)
- Scroll-triggered fade-up for sections
- Video play button: pulse animation

## Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Icons
- **Set:** Lucide React (consistent, modern)
- **Style:** Outline, 20-24px, `silver` color

## Page Structure
```
/                  → Home (Hero + About + Features + IG Feed)
/galeria           → Photo Gallery (socials & events)
/figuras           → Video Figures (categorized by level)
/contacto          → Contact & Location
```
