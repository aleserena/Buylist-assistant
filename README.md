# MTG Card List Comparator

A web application that helps Magic: The Gathering players compare their wishlists with their collections to see what cards they already own and what they still need to acquire.

## Features

- **Card List Comparison**: Compare wishlists with collections to find matches and missing cards
- **Moxfield Integration**: Load card lists directly from Moxfield URLs (decks, collections, and binders)
- **Flexible Parsing**: Supports various card list formats including foil, etched, and star collector numbers
- **Sideboard Handling**: Option to include or exclude sideboard cards
- **Edition Matching**: Option to ignore specific editions when comparing cards
- **Price Integration**: Display card prices from various providers
- **Error Reporting**: Detailed feedback on parsing errors
- **Binder Support**: Load cards from Moxfield binder URLs
- **Special Characters**: Support for star (★) characters in collector numbers

## Testing & CI/CD

This project includes comprehensive testing and CI/CD setup to ensure code quality and reliability.

### Test Coverage

The test suite covers all major functionality:

#### 1. **Moxfield Parsing Tests** (`tests/parsing.test.js`)
- ✅ Correct parsing from Moxfield format
- ✅ Support for various card line formats
- ✅ Foil and etched foil detection
- ✅ Sideboard parsing and filtering
- ✅ Error handling for invalid formats

#### 2. **Card Comparison Tests** (`tests/comparison.test.js`)
- ✅ Correct comparison of cards (including foil, etched and edition)
- ✅ Edition matching with ignore option
- ✅ Quantity matching logic
- ✅ Partial matches and missing card detection

#### 3. **UI Functionality Tests** (`tests/ui.test.js`)
- ✅ Correct functionality of the tabs
- ✅ Checkbox behavior (ignore sideboard and edition)
- ✅ Price provider selection
- ✅ Results display and feedback

#### 4. **API Integration Tests** (`tests/api.test.js`)
- ✅ Moxfield URL parsing and extraction
- ✅ API response parsing
- ✅ Price fetching and caching
- ✅ Error handling for network issues

#### 5. **Integration Tests** (`tests/integration.test.js`)
- ✅ Complete workflow testing
- ✅ End-to-end functionality
- ✅ Error handling integration

### Running Tests

#### Prerequisites
```bash
npm install
```

#### Run all tests
```bash
npm test
```

#### Run tests in watch mode
```bash
npm run test:watch
```

#### Run tests with coverage
```bash
npm run test:coverage
```

#### Run linting
```bash
npm run lint
```

#### Fix linting issues
```bash
npm run lint:fix
```

### Current Test Status

**Test Results**: 104 passed, 0 failed (104 total)

**All functionality is working correctly**:
- ✅ Basic card parsing and comparison
- ✅ UI tab switching and checkbox functionality
- ✅ API URL extraction and response parsing
- ✅ Price fetching and caching
- ✅ Complete workflow integration
- ✅ Binder URL support
- ✅ Star character support in collector numbers

### CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

#### **CI Pipeline** (`.github/workflows/ci.yml`)
- ✅ **Testing**: Runs Jest tests on Node.js 20.x
- ✅ **Linting**: ESLint code quality checks
- ✅ **Coverage**: Test coverage reporting
- ✅ **Security**: npm audit for vulnerability scanning

#### **Deployment Pipeline** (`.github/workflows/deploy.yml`)
- ✅ **GitHub Pages**: Automatic deployment to GitHub Pages
- ✅ **Testing**: Ensures all tests pass before deployment
- ✅ **Linting**: Code quality validation
- ✅ **Build**: Creates deployment package with all necessary files

### GitHub Pages Deployment

The application is automatically deployed to GitHub Pages when changes are pushed to the `master` branch.

#### **Live Demo**
- **URL**: `https://[username].github.io/[repository-name]/`
- **Status**: Automatically deployed from master branch
- **Features**: Full functionality including Moxfield integration

#### **Deployment Files**
- `index.html` - Main application
- `styles.css` - Styling
- `src/` - Modular JavaScript files
- `404.html` - SPA support for GitHub Pages

#### **Local Development**
```bash
# Install dependencies
npm install

# Start local server
npm start

# Run tests
npm test

# Run linting
npm run lint
```

### Test Structure

```
tests/
├── setup.js              # Jest setup and DOM configuration
├── parsing.test.js       # Moxfield parsing tests
├── comparison.test.js    # Card comparison logic tests
├── ui.test.js           # UI functionality tests
├── api.test.js          # API integration tests
└── integration.test.js   # End-to-end workflow tests
```

### Coverage Requirements

The project maintains moderate test coverage standards:
- **Branches**: 65%
- **Functions**: 65%
- **Lines**: 65%
- **Statements**: 65%

### Code Quality

#### ESLint Configuration
- Enforces consistent code style
- Catches potential errors
- Ensures modern JavaScript practices
- Configurable rules for browser and Node.js environments

#### Pre-commit Hooks
- Automatic linting on commit
- Test execution before deployment
- Coverage threshold enforcement

## CORS Proxy (Optional)

If you encounter CORS errors when loading from Moxfield URLs, you can use the included CORS proxy:

1. Start the proxy server:
   ```bash
   npm run proxy
   ```

2. The proxy will run on `http://localhost:3001` and automatically handle CORS requests.

3. The application will automatically try the proxy if direct requests fail.

**Note for GitHub Pages:** The local CORS proxy won't work on GitHub Pages due to browser security restrictions. On GitHub Pages, you'll need to use the manual input method:

1. When CORS fails, the app will show a manual input dialog
2. Click the API URL to open it in a new tab
3. Copy the JSON response and paste it in the dialog
4. Submit to load your cards

This is the recommended approach for GitHub Pages deployments.

Alternatively, you can manually copy the API response:
1. Open the Moxfield URL in a new tab
2. Copy the JSON response
3. Use the "Manual Input" option in the application

## Development

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Buylist-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Run tests**
   ```bash
   npm test
   ```

### Project Structure

```
Buylist-assistant/
├── index.html              # Main HTML file
├── script.js               # Main JavaScript application
├── styles.css              # CSS styles
├── package.json            # Project configuration and dependencies
├── .eslintrc.js           # ESLint configuration
├── babel.config.js         # Babel configuration for testing
├── .github/
│   └── workflows/
│       └── ci.yml         # GitHub Actions CI/CD pipeline
├── tests/
│   ├── setup.js           # Test setup and DOM configuration
│   ├── parsing.test.js    # Parsing functionality tests
│   ├── comparison.test.js # Card comparison tests
│   ├── ui.test.js         # UI functionality tests
│   ├── api.test.js        # API integration tests
│   └── integration.test.js # End-to-end tests
└── README.md              # This file
```

## Usage

### Basic Usage

1. **Enter your wishlist**: Paste your card list in Moxfield format or load from a Moxfield URL
2. **Enter your collection**: Paste your collection list or load from a Moxfield URL
3. **Configure options**: Choose whether to ignore sideboards or editions
4. **Search for matches**: Click "Search for Matches" to compare the lists
5. **Review results**: View matches and missing cards in separate tabs

### Supported Formats

The application supports various card list formats:

```
# Full format
1 Aether Channeler (DMU) 42 *F*

# Without quantity (assumes 1)
Aether Channeler (DMU) 42 *F*

# Without set code
1 Aether Channeler 42 *F*

# Just name and quantity
1 Aether Channeler

# With etched foil
1 Lightning Bolt (M10) 133 *E*

# Sideboard format
SIDEBOARD:
1 Counterspell (M10) 50
```

### Features

- **Foil Detection**: Automatically detects `*F*` and `*E*` indicators
- **Sideboard Support**: Handles sideboard sections with `SIDEBOARD:` header
- **Multiple Editions**: Compares cards across different sets and printings
- **Price Integration**: Shows card prices from various providers
- **Error Reporting**: Detailed feedback on parsing issues

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Testing Guidelines

- Write tests for all new functionality
- Maintain test coverage above 80%
- Follow existing test patterns and structure
- Test both success and error scenarios
- Include integration tests for complex workflows

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or contributions, please:
1. Check existing issues in the repository
2. Create a new issue with detailed information
3. Include steps to reproduce if reporting a bug
4. Provide test cases for new features 