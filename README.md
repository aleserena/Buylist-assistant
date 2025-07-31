# MTG Card List Comparator

A web-based tool for comparing Magic: The Gathering card wishlists with collections to see which cards you already own.

## Features

- **Moxfield Format Support**: Parses card lists in the Moxfield format
- **Flexible Matching**: Option to ignore edition and search by card name only
- **Detailed Results**: Shows matches and missing cards with quantities
- **Modern UI**: Beautiful, responsive design that works on desktop and mobile
- **Real-time Statistics**: Displays counts of cards in wishlist, collection, and matches found

## How to Use

1. **Open the Application**: Open `index.html` in your web browser
2. **Enter Your Wishlist**: Paste your wishlist cards in the left text area
3. **Enter Your Collection**: Paste your collection cards in the right text area
4. **Configure Options**: Check "Ignore edition" if you want to match cards by name only
5. **Search**: Click the "Search for Matches" button
6. **View Results**: See matches and missing cards in the tabs below

## Card Format

The tool supports the Moxfield format for card lists:

```
1 Aether Channeler (DMU) 42 *F*
2 Lightning Bolt (M10) 133
3 Counterspell (M10) 52 *F*
```

**Format Breakdown:**
- `1` - Quantity
- `Aether Channeler` - Card name
- `(DMU)` - Set code
- `42` - Card number (optional)
- `*F*` - Foil indicator (optional)

## Examples

### Input Examples

**Wishlist:**
```
1 Aether Channeler (DMU) 42 *F*
2 Lightning Bolt (M10) 133
3 Counterspell (M10) 52
```

**Collection:**
```
1 Aether Channeler (DMU) 42 *F*
1 Lightning Bolt (M10) 133
1 Counterspell (M10) 52 *F*
```

### Results

- **Matches**: Shows cards that exist in both lists with matching quantities
- **Missing**: Shows cards from your wishlist that are not in your collection (or have insufficient quantities)

## Features

### Ignore Edition Option
When checked, the tool will match cards by name only, ignoring set, number, and foil status. This is useful if you want to know if you own any version of a card.

### Quantity Handling
- If you have more copies in your collection than your wishlist, it shows the wishlist quantity as matched
- If you have fewer copies in your collection than your wishlist, it shows the difference as missing
- Duplicate entries are automatically combined

### Error Handling
- Invalid lines are ignored and logged to the console
- Empty lines are automatically skipped
- The tool continues processing even if some lines can't be parsed

## Browser Compatibility

This application works in all modern browsers:
- Chrome/Edge
- Firefox
- Safari
- Mobile browsers

## File Structure

```
├── index.html      # Main HTML file
├── styles.css      # CSS styles
├── script.js       # JavaScript logic
└── README.md       # This file
```

## Getting Started

1. Download all files to a folder
2. Open `index.html` in your web browser
3. Start comparing your MTG card lists!

No installation or server setup required - it's a pure client-side application. 