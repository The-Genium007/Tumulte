# Overlay Studio Overview

The Overlay Studio is Tumulte's visual editor for creating custom streaming overlays. It provides a drag-and-drop interface to design overlays that display polls, dice rolls, and other game events on your stream.

## Features

### Visual Canvas Editor

- Drag-and-drop element positioning
- Real-time preview of overlay layout
- Responsive grid system
- Snap-to-grid alignment

### Element Types

#### Poll Element

Display active polls with voting options and real-time results.

**Properties**:
- Position (x, y coordinates)
- Size (width, height)
- Visibility (show/hide)
- Card styling (background, borders, shadows)
- Question display options
- Choice layout (vertical, horizontal, grid)
- Results display mode (hidden, percentage, count)

#### Dice Element

Display dice roll events from VTT integration or manual triggers.

**Properties**:
- Position and size
- Animation style (roll, fade, slide)
- Display duration
- Critical hit/failure styling
- Character name display
- Formula and result display

#### Text Element (Coming Soon)

Custom text overlays for announcements or persistent information.

#### Image Element (Coming Soon)

Static or animated images (logos, character portraits, etc.).

### Transform Gizmo

Interactive transform controls for selected elements:

- **Move**: Drag to reposition
- **Resize**: Drag corner/edge handles
- **Rotate**: Drag rotation handle (coming soon)
- **Delete**: Remove element button

### Inspector Panel

Detailed property editor for selected elements:

- Element-specific properties
- Styling options (colors, fonts, borders)
- Animation settings
- Visibility conditions

### Preview Modes

- **Edit Mode**: Full editor with gizmos and controls
- **Preview Mode**: See how overlay appears to viewers
- **Live Preview**: Test with real poll/dice data

## Using the Overlay Studio

### Creating an Overlay

1. Navigate to **Campaigns** → Select your campaign
2. Click **Overlay Studio**
3. You'll see a blank canvas representing your stream overlay

### Adding Elements

1. Click **Add Element** in the toolbar
2. Choose element type (Poll, Dice, etc.)
3. The element appears on the canvas
4. Drag to position, resize as needed

### Configuring Elements

1. Click an element to select it
2. The Inspector panel appears on the right
3. Adjust properties:
   - Position and size
   - Visual styling
   - Display options
   - Animation settings
4. Changes are saved automatically

### Preview Your Overlay

1. Click **Preview** in the toolbar
2. The overlay switches to viewer mode
3. Test with active polls or dice roll events
4. Click **Edit** to return to editor

### Using the Overlay in OBS

1. In the Overlay Studio, click **Copy Overlay URL**
2. Open OBS Studio
3. Add a **Browser Source**:
   - URL: Paste the overlay URL
   - Width: 1920
   - Height: 1080
   - FPS: 60 (recommended)
   - ✅ Shutdown source when not visible
   - ✅ Refresh browser when scene becomes active
4. Position the browser source in your scene
5. The overlay will display polls and events in real-time

## Element Configuration

### Poll Element Configuration

**Basic Settings**:
- **Position**: X and Y coordinates (pixels from top-left)
- **Size**: Width and height in pixels
- **Anchor**: Alignment point (top-left, center, bottom-right)

**Display Options**:
- **Show Question**: Display poll question text
- **Show Results**: Show vote counts or percentages
- **Result Mode**: Hidden, Percentage, Count, Both
- **Choice Layout**: Vertical list, Horizontal, Grid

**Styling**:
- **Background Color**: Card background (with transparency)
- **Text Color**: Question and choice text
- **Border**: Width, color, radius
- **Shadow**: Elevation effect
- **Font**: Size, weight, family

**Animation**:
- **Entrance**: Fade, Slide, Scale
- **Exit**: Fade, Slide, Scale
- **Duration**: Animation timing in milliseconds

### Dice Element Configuration

**Basic Settings**:
- **Position**: X and Y coordinates
- **Size**: Width and height
- **Display Duration**: How long to show each roll (seconds)

**Display Options**:
- **Show Character Name**: Display who made the roll
- **Show Formula**: Display dice formula (e.g., "1d20+5")
- **Show Individual Dice**: Show each die result
- **Show Total**: Display final result

**Critical Styling**:
- **Critical Success Color**: Highlight color for natural 20s
- **Critical Failure Color**: Highlight color for natural 1s
- **Animation**: Special effect for criticals

**Layout**:
- **Dice Box Position**: Where dice animation appears
- **HUD Position**: Where roll details display
- **Stacking**: How multiple rolls are displayed

## Responsive Design

**Desktop (1920x1080)**: Full layout with all elements visible

**Tablet (768x1024)**: Elements may reflow or resize

**Mobile**: Overlay Studio editor is limited on mobile devices. A message will prompt you to use desktop for full editing capabilities. However, overlays created on desktop will display correctly when accessed via OBS on any device.

## Best Practices

### Performance

- Limit number of elements (< 10 recommended)
- Use optimized images (WebP, PNG with compression)
- Avoid excessive animations
- Test overlay with active polls before streaming

### Layout

- Follow the rule of thirds for element placement
- Ensure text is readable at stream resolution
- Leave space for game content (don't cover important areas)
- Use consistent styling across elements

### Accessibility

- Use high contrast colors for text
- Ensure minimum font size (18px recommended)
- Test overlay at different resolutions
- Consider colorblind-friendly palettes

## Advanced Features

### CSS Customization (Coming Soon)

Advanced users can add custom CSS to override element styles.

### Animation Presets (Coming Soon)

Library of pre-built animations for elements.

### Templates (Coming Soon)

Save and share overlay configurations as templates.

## Troubleshooting

### Overlay Not Updating in OBS

**Solutions**:
1. Right-click browser source → **Refresh**
2. Verify overlay URL is correct (check for typos)
3. Ensure campaign is active
4. Check browser source settings (width, height, FPS)

### Elements Not Appearing

**Solutions**:
1. Check element visibility in Inspector
2. Verify element is within canvas bounds (0-1920, 0-1080)
3. Check z-index (elements may be layered incorrectly)
4. Refresh overlay preview

### Poor Performance

**Solutions**:
1. Reduce number of elements
2. Lower animation frame rate
3. Optimize images (compress, resize)
4. Check OBS hardware acceleration settings

## Next Steps

- [Overlay Customization Guide](customization.md)
- [OBS Integration](../guides/obs-integration.md)
- [Character Assignment](../guides/character-assignment.md)
