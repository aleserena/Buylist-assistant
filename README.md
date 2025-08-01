t ada# MTG Card List Comparator

A web-based tool for comparing Magic: The Gathering card wishlists with collections to see which cards you already own.

## Features

- **Moxfield Format Support**: Parses card lists in the Moxfield format
- **Moxfield URL Loading**: Load deck and collection data directly from Moxfield URLs
- **Flexible Matching**: Option to ignore edition and search by card name only
- **Sideboard Handling**: Automatically ignores sideboard cards (everything after "SIDEBOARD:")
- **Card Pricing**: Real-time card prices from multiple providers with price caching
- **Detailed Results**: Shows matches and missing cards with quantities and prices
- **Parsing Feedback**: Shows detailed feedback about parsing errors and statistics
- **Modern UI**: Beautiful, responsive design that works on desktop and mobile
- **Real-time Statistics**: Displays counts of cards in wishlist, collection, and matches found

## Pricing Features

The application includes real-time card pricing functionality:

### Price Providers
- **Card Kingdom** (default) - USD prices
- **TCGPlayer** - USD prices  
- **Star City Games** - USD prices
- **CoolStuffInc** - USD prices
- **CardHoarder** - USD prices
- **CardMarket** - EUR prices

### Price Display
- Prices are automatically fetched and displayed for all cards in results
- Foil and etched cards show appropriate pricing
- Price cache prevents repeated API calls for the same card
- Loading indicators show while prices are being fetched
- Error handling for cards without available pricing

### Price Provider Selection
- Use the dropdown in the options section to change price providers
- Prices automatically refresh when provider is changed
- All displayed cards update with new provider prices

## How to Use

### Method 1: Manual Input
1. **Open the Application**: Open `index.html` in your web browser
2. **Enter Your Wishlist**: Paste your wishlist cards in the left text area
3. **Enter Your Collection**: Paste your collection cards in the right text area
4. **Configure Options**: Check "Ignore edition" if you want to match cards by name only
5. **Search**: Click the "Search for Matches" button
6. **View Results**: See matches and missing cards in the tabs below

### Method 2: Moxfield URL Loading
1. **Switch to URL Tab**: Click the "Moxfield URL" tab for wishlist or collection
2. **Enter Moxfield URL**: Paste a Moxfield deck or collection URL (e.g., `https://www.moxfield.com/decks/deck-id` or `https://www.moxfield.com/collection/collection-id`) or direct API URL
3. **Load Data**: Click "Load from URL" to fetch and parse the deck/collection data using Moxfield's API
4. **Review Data**: The parsed card list will appear in the text area
5. **Search**: Click "Search for Matches" to compare the lists

**Supported URL Formats:**
- Regular Moxfield URLs: `https://www.moxfield.com/decks/deck-id`
- Collection URLs: `https://www.moxfield.com/collection/collection-id`
- Direct API URLs: `https://api2.moxfield.com/v2/decks/all/deck-id`
- Collection API URLs: `https://api2.moxfield.com/v1/collections/search/collection-id`

## Card Format

The tool supports flexible Moxfield-style formats for card lists:

### Full Format
```
1 Aether Channeler (DMU) 42 *F*
2 Lightning Bolt (M10) 133
3 Counterspell (M10) 52 *F*
```

### Flexible Formats Supported
- `1 Aether Channeler (DMU) 42 *F*` - Full format
- `Aether Channeler (DMU) 42 *F*` - No quantity (assumes 1)
- `1 Aether Channeler 42 *F*` - No set code
- `Aether Channeler 42 *F*` - No quantity, no set code
- `1 Aether Channeler (DMU) *F*` - No card number
- `Aether Channeler (DMU) *F*` - No quantity, no number
- `1 Aether Channeler` - Just quantity and name
- `Aether Channeler` - Just name (assumes quantity 1)

**Format Breakdown:**
- `1` - Quantity (optional, defaults to 1)
- `Aether Channeler` - Card name (required)
- `(DMU)` - Set code (optional)
- `42` - Card number (optional)
- `*F*` - Foil indicator (optional, `*E*` for etched)

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