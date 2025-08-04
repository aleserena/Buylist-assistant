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

#### Pipeline Stages

1. **Test Stage**
   - Runs on Node.js 18.x and 20.x
   - Executes all unit and integration tests
   - Generates coverage reports
   - Uploads coverage to Codecov

2. **Security Stage**
   - Runs security audits
   - Checks for known vulnerabilities
   - Ensures code quality standards

3. **Build Stage** (Main branch only)
   - Creates deployment package
   - Prepares files for deployment

4. **Deploy Stage** (Main branch only)
   - Deploys to GitHub Pages
   - Makes the application publicly accessible

#### Pipeline Triggers

- **Push to main/develop**: Runs full test suite
- **Pull Request**: Runs tests and security checks
- **Push to main**: Triggers deployment to GitHub Pages

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

The project maintains high test coverage standards:
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

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