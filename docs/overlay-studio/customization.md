# Overlay Customization Guide

This guide provides detailed instructions for customizing your Tumulte overlay to match your stream's branding and style.

## Color Schemes

### Using the Color Picker

Every element in the Overlay Studio supports custom colors through the Inspector panel.

1. Select an element
2. Find the color property (Background Color, Text Color, etc.)
3. Click the color swatch to open the picker
4. Choose a color or enter a hex code
5. Adjust transparency with the alpha slider

### Recommended Color Palettes

**High Contrast** (for readability):
- Background: `#1a1a1a` (90% opacity)
- Text: `#ffffff`
- Accent: `#00ff88`
- Critical Success: `#00ff00`
- Critical Failure: `#ff0000`

**Soft Dark** (cinematic):
- Background: `#2a2a2a` (85% opacity)
- Text: `#e0e0e0`
- Accent: `#6c63ff`
- Critical Success: `#4caf50`
- Critical Failure: `#f44336`

**Fantasy** (medieval theme):
- Background: `#3e2723` (80% opacity)
- Text: `#ffd700`
- Accent: `#ff6f00`
- Critical Success: `#cddc39`
- Critical Failure: `#d32f2f`

**Sci-Fi** (cyberpunk theme):
- Background: `#0d1117` (90% opacity)
- Text: `#00ffff`
- Accent: `#ff00ff`
- Critical Success: `#00ff00`
- Critical Failure: `#ff0066`

## Typography

### Font Selection

The Overlay Studio supports web-safe fonts and Google Fonts.

**Available Font Families**:
- Sans-serif: `Inter`, `Roboto`, `Open Sans`
- Serif: `Merriweather`, `Playfair Display`
- Monospace: `Fira Code`, `Courier New`
- Display: `Bebas Neue`, `Righteous`

### Font Sizing

**Recommended Sizes** (for 1920x1080):
- Poll Question: 28-36px
- Poll Choices: 20-24px
- Dice Roll Result: 48-64px
- Dice Formula: 18-22px
- Character Name: 16-20px

### Font Weights

- **Light (300)**: Subtle text, secondary information
- **Regular (400)**: Body text, default
- **Medium (500)**: Emphasis
- **Bold (700)**: Headings, important information
- **Black (900)**: Extra emphasis, titles

## Layout Patterns

### Centered Layout

Position elements at the center of the screen for maximum visibility.

**Example: Poll Element**
- X: 960 (center horizontally: 1920 / 2)
- Y: 540 (center vertically: 1080 / 2)
- Width: 600
- Height: 400
- Anchor: Center

### Bottom Bar

Place elements at the bottom of the screen, similar to a stream ticker.

**Example: Dice Element**
- X: 960 (center)
- Y: 980 (near bottom)
- Width: 800
- Height: 100
- Anchor: Bottom Center

### Corner Widgets

Small, persistent elements in screen corners.

**Example: Top-Right Widget**
- X: 1820 (1920 - 100)
- Y: 100
- Width: 300
- Height: 200
- Anchor: Top Right

### Sidebar Layout

Vertical element arrangement on the left or right edge.

**Example: Right Sidebar**
- X: 1620 (1920 - 300)
- Y: 200
- Width: 280
- Height: 880
- Anchor: Top Right

## Animation Styles

### Entrance Animations

**Fade In** (subtle):
- Duration: 300ms
- Opacity: 0 → 100%
- Best for: Background elements, subtle updates

**Slide In** (dynamic):
- Duration: 400ms
- Direction: Bottom, Top, Left, or Right
- Best for: Polls, announcements

**Scale Up** (impactful):
- Duration: 350ms
- Scale: 0.8 → 1.0
- Best for: Critical hits, important events

**Bounce** (playful):
- Duration: 500ms
- Scale: 0 → 1.1 → 1.0
- Best for: Fun streams, rewards

### Exit Animations

**Fade Out**:
- Duration: 250ms
- Opacity: 100% → 0%

**Slide Out**:
- Duration: 350ms
- Direction: Opposite of entrance

**Scale Down**:
- Duration: 300ms
- Scale: 1.0 → 0.8

## Styling Properties

### Borders

**Border Width**:
- Subtle: 1-2px
- Standard: 3-4px
- Bold: 5-8px

**Border Radius**:
- Sharp: 0px (square corners)
- Slight: 4-8px
- Rounded: 12-16px
- Pill: 999px (fully rounded)

### Shadows

**Card Elevation**:
- Subtle: `0 2px 4px rgba(0,0,0,0.1)`
- Medium: `0 4px 8px rgba(0,0,0,0.2)`
- High: `0 8px 16px rgba(0,0,0,0.3)`
- Dramatic: `0 12px 24px rgba(0,0,0,0.5)`

### Opacity

**Background Opacity**:
- Transparent: 0-30%
- Semi-transparent: 40-70%
- Mostly opaque: 80-95%
- Solid: 100%

**Overlay Best Practice**: Use 80-90% opacity for readability while maintaining visual depth.

## Poll Element Styling

### Question Display

**Default Style**:
```
Font: Inter Bold, 32px
Color: #ffffff
Background: #2a2a2a (85% opacity)
Padding: 20px
Border Radius: 12px
```

### Choice Cards

**Horizontal Layout**:
- Width: Auto (fill container)
- Height: 60px
- Gap: 12px between choices
- Hover effect: Background lightens

**Vertical Layout**:
- Width: 100% of container
- Height: 50px per choice
- Stacking: Top to bottom

**Grid Layout** (for many choices):
- Columns: 2 or 3
- Row height: 50px
- Gap: 12px horizontal, 8px vertical

### Results Display

**Percentage Mode**:
- Show percentage in choice card: "Choice A (45%)"
- Optional progress bar behind text

**Count Mode**:
- Show vote count: "Choice A (23 votes)"
- Useful for small audiences

**Hidden Mode**:
- Don't show results until poll closes
- Prevents vote following

## Dice Element Styling

### Dice Box

The animated dice rolling area.

**Standard Configuration**:
- Size: 200x200px
- Animation: 3D rotation (if available)
- Background: Semi-transparent
- Shadow: Medium elevation

### Dice HUD

The information panel showing roll details.

**Layout**:
```
┌────────────────────────┐
│ Gimli                  │  ← Character name (18px)
│ 1d20+5                 │  ← Formula (16px)
│ ┌────┐                 │
│ │ 18 │                 │  ← Result (48px bold)
│ └────┘                 │
│ [13] +5                │  ← Individual dice (14px)
└────────────────────────┘
```

### Critical Hit Styling

**Critical Success**:
- Background: Gradient from green
- Border: Glowing effect
- Animation: Pulse or sparkle
- Sound: Optional success chime

**Critical Failure**:
- Background: Gradient from red
- Animation: Shake or flash
- Sound: Optional failure sound

## Responsive Adjustments

### Desktop (1920x1080)

Use full canvas space, larger elements.

**Recommended Element Sizes**:
- Poll: 600x400px
- Dice: 400x300px
- Text: 24-36px

### Tablet (768x1024)

Scale elements down proportionally.

**Adjustments**:
- Poll: 500x350px
- Dice: 350x250px
- Text: 18-28px

### Mobile (375x667)

Not recommended for Overlay Studio editing, but overlays will display if configured on desktop.

## Brand Integration

### Adding Your Logo

1. Create an Image element (coming soon)
2. Upload your logo (PNG with transparency)
3. Position in a corner (e.g., top-left: 50, 50)
4. Size: 100-150px width
5. Opacity: 90% for subtle branding

### Using Brand Colors

Extract colors from your logo or brand guide:

1. Use an color picker tool to get hex codes
2. Apply to overlay elements:
   - Primary color: Accent, borders
   - Secondary color: Backgrounds
   - Text color: High contrast with background

### Custom Fonts

If using a custom brand font:

1. Host the font file (WOFF2 format)
2. Use custom CSS (coming soon) to import
3. Apply to text elements

## Advanced Customization

### CSS Variables

Future feature: Define global CSS variables for consistent styling.

**Example**:
```css
:root {
  --primary-color: #6c63ff;
  --background-color: #2a2a2a;
  --text-color: #ffffff;
  --border-radius: 12px;
}
```

### Animation Keyframes

Future feature: Create custom animations with CSS keyframes.

### Conditional Styling

Future feature: Change element appearance based on conditions:
- Critical hit: Apply special styling
- Low vote count: Pulse effect
- Poll ending soon: Warning color

## Examples

### Minimal Clean Overlay

- **Background**: 90% transparent black
- **Font**: Inter Regular, 24px
- **Colors**: White text, subtle blue accent
- **Borders**: 2px, 8px radius
- **Animation**: Fade in/out, 300ms

### Bold Fantasy Theme

- **Background**: Dark brown with texture, 85% opacity
- **Font**: Bebas Neue, 32px
- **Colors**: Gold text, orange accents
- **Borders**: 4px gold, 16px radius
- **Animation**: Slide in from bottom, 500ms

### Cyberpunk Style

- **Background**: Dark blue/black gradient, 90% opacity
- **Font**: Roboto Mono, 28px
- **Colors**: Cyan text, magenta accents
- **Borders**: 2px cyan glow, 4px radius
- **Animation**: Glitch effect, 400ms

## Next Steps

- [Overlay Studio Overview](overview.md)
- [OBS Integration Guide](../guides/obs-integration.md)
- [VTT Integration](../vtt-integration/overview.md)
