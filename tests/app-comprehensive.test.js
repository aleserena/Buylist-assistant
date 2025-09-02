/**
 * Comprehensive tests for App module
 */

import { App } from '../src/modules/App.js';

describe('App Comprehensive Tests', () => {
    let app;

    beforeEach(() => {
        // Mock DOM elements
        document.body.innerHTML = `
            <button id="searchBtn">Search</button>
            <button id="loadWishlistBtn">Load Wishlist</button>
            <button id="loadCollectionBtn">Load Collection</button>
            <input id="wishlistUrl" value="" />
            <input id="collectionUrl" value="" />
            <textarea id="wishlist"></textarea>
            <textarea id="collection"></textarea>
            <select id="priceProvider">
                <option value="tcgplayer">TCGPlayer</option>
            </select>
            <input type="checkbox" id="ignoreEdition" />
            <input type="checkbox" id="ignoreWishlistSideboard" />
            <input type="checkbox" id="ignoreCollectionSideboard" />
            <div id="matchesList"></div>
            <div id="missingList"></div>
            <div id="resultsSection">
                <div class="tab-btn" data-tab="matches">Matches</div>
                <div class="tab-btn" data-tab="missing">Missing</div>
                <div class="tab-content" data-tab="matches">Matches Content</div>
                <div class="tab-content" data-tab="missing">Missing Content</div>
            </div>
            <div id="feedbackSection"></div>
        `;

        // Mock global functions
        global.alert = jest.fn();
        global.fetch = jest.fn();
        
        app = new App();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Constructor and Initialization', () => {
        test('should initialize with all required modules', () => {
            expect(app.cardParser).toBeDefined();
            expect(app.apiClient).toBeDefined();
            expect(app.priceService).toBeDefined();
            expect(app.ui).toBeDefined();
        });

        test('should bind events during initialization', () => {
            // Check that UI events are bound
            expect(app.ui.searchBtn).toBeDefined();
            expect(app.ui.loadWishlistBtn).toBeDefined();
            expect(app.ui.loadCollectionBtn).toBeDefined();
        });
    });

    describe('findMatches', () => {
        test('should find exact matches', () => {
            const wishlistCards = [
                { name: 'Lightning Bolt', quantity: 2, set: 'M10', number: '133', foil: false, etched: false }
            ];
            const collectionCards = [
                { name: 'Lightning Bolt', quantity: 3, set: 'M10', number: '133', foil: false, etched: false }
            ];

            const result = app.findMatches(wishlistCards, collectionCards, false);

            expect(result.matches).toHaveLength(1);
            expect(result.matches[0].quantity).toBe(2);
            expect(result.matches[0].collectionQuantity).toBe(3);
            expect(result.missing).toHaveLength(0);
        });

        test('should find partial matches when exact match not found', () => {
            const wishlistCards = [
                { name: 'Lightning Bolt', quantity: 2, set: 'M10', number: '133', foil: false, etched: false }
            ];
            const collectionCards = [
                { name: 'Lightning Bolt', quantity: 3, set: 'M11', number: '133', foil: false, etched: false }
            ];

            const result = app.findMatches(wishlistCards, collectionCards, false);

            expect(result.matches).toHaveLength(0);
            expect(result.missing).toHaveLength(1);
            expect(result.missing[0].partialMatches).toHaveLength(1);
            expect(result.missing[0].partialMatches[0].matchReason).toContain('different set');
        });

        test('should handle missing cards', () => {
            const wishlistCards = [
                { name: 'Lightning Bolt', quantity: 2, set: 'M10', number: '133', foil: false, etched: false },
                { name: 'Counterspell', quantity: 1, set: 'M10', number: '50', foil: false, etched: false }
            ];
            const collectionCards = [
                { name: 'Lightning Bolt', quantity: 3, set: 'M10', number: '133', foil: false, etched: false }
            ];

            const result = app.findMatches(wishlistCards, collectionCards, false);

            expect(result.matches).toHaveLength(1);
            expect(result.missing).toHaveLength(1);
            expect(result.missing[0].name).toBe('Counterspell');
            expect(result.missing[0].needed).toBe(1);
        });

        test('should handle ignore edition option', () => {
            const wishlistCards = [
                { name: 'Lightning Bolt', quantity: 2, set: 'M10', number: '133', foil: false, etched: false }
            ];
            const collectionCards = [
                { name: 'Lightning Bolt', quantity: 3, set: 'M11', number: '133', foil: false, etched: false }
            ];

            const result = app.findMatches(wishlistCards, collectionCards, true);

            expect(result.matches).toHaveLength(1);
            expect(result.matches[0].quantity).toBe(2);
            expect(result.missing).toHaveLength(0);
        });

        test('should handle duplicate cards in collection', () => {
            const wishlistCards = [
                { name: 'Lightning Bolt', quantity: 4, set: 'M10', number: '133', foil: false, etched: false }
            ];
            const collectionCards = [
                { name: 'Lightning Bolt', quantity: 2, set: 'M10', number: '133', foil: false, etched: false },
                { name: 'Lightning Bolt', quantity: 3, set: 'M10', number: '133', foil: false, etched: false }
            ];

            const result = app.findMatches(wishlistCards, collectionCards, false);

            expect(result.matches).toHaveLength(1);
            expect(result.matches[0].quantity).toBe(4);
            expect(result.matches[0].collectionQuantity).toBe(5);
            expect(result.missing).toHaveLength(0);
        });

        test('should handle partial quantity matches', () => {
            const wishlistCards = [
                { name: 'Lightning Bolt', quantity: 4, set: 'M10', number: '133', foil: false, etched: false }
            ];
            const collectionCards = [
                { name: 'Lightning Bolt', quantity: 2, set: 'M10', number: '133', foil: false, etched: false }
            ];

            const result = app.findMatches(wishlistCards, collectionCards, false);

            expect(result.matches).toHaveLength(1);
            expect(result.matches[0].quantity).toBe(2);
            expect(result.missing).toHaveLength(1);
            expect(result.missing[0].quantity).toBe(2);
            expect(result.missing[0].needed).toBe(2);
        });
    });

    describe('findPartialMatches', () => {
        test('should find partial matches by name only', () => {
            const wishlistCard = { name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, etched: false };
            const collectionCards = [
                { name: 'Lightning Bolt', set: 'M11', number: '133', foil: false, etched: false },
                { name: 'Lightning Bolt', set: 'M10', number: '134', foil: false, etched: false },
                { name: 'Counterspell', set: 'M10', number: '50', foil: false, etched: false }
            ];

            const result = app.findPartialMatches(wishlistCard, collectionCards);

            expect(result).toHaveLength(2);
            expect(result[0].matchReason).toContain('different set');
            expect(result[1].matchReason).toContain('different number');
        });

        test('should handle foil status differences', () => {
            const wishlistCard = { name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, etched: false };
            const collectionCards = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', foil: true, etched: false }
            ];

            const result = app.findPartialMatches(wishlistCard, collectionCards);

            expect(result).toHaveLength(1);
            expect(result[0].matchReason).toContain('different foil status');
        });

        test('should handle etched status differences', () => {
            const wishlistCard = { name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, etched: false };
            const collectionCards = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, etched: true }
            ];

            const result = app.findPartialMatches(wishlistCard, collectionCards);

            expect(result).toHaveLength(1);
            expect(result[0].matchReason).toContain('different etched status');
        });

        test('should be case insensitive', () => {
            const wishlistCard = { name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, etched: false };
            const collectionCards = [
                { name: 'LIGHTNING BOLT', set: 'M11', number: '133', foil: false, etched: false }
            ];

            const result = app.findPartialMatches(wishlistCard, collectionCards);

            expect(result).toHaveLength(1);
        });

        test('should return empty array when no matches', () => {
            const wishlistCard = { name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, etched: false };
            const collectionCards = [
                { name: 'Counterspell', set: 'M10', number: '50', foil: false, etched: false }
            ];

            const result = app.findPartialMatches(wishlistCard, collectionCards);

            expect(result).toHaveLength(0);
        });
    });

    describe('deduplicateCardLines', () => {
        test('should combine quantities for duplicate cards', () => {
            const cardLines = [
                '2 Lightning Bolt (M10) 133',
                '1 Lightning Bolt (M10) 133',
                '1 Counterspell (M10) 50'
            ];

            const result = app.deduplicateCardLines(cardLines);

            expect(result).toHaveLength(2);
            // The result is sorted alphabetically, so Counterspell comes first
            expect(result[0]).toBe('1 Counterspell (M10) 50');
            expect(result[1]).toBe('3 Lightning Bolt (M10) 133');
        });

        test('should handle foil cards', () => {
            const cardLines = [
                '2 Lightning Bolt (M10) 133 *F*',
                '1 Lightning Bolt (M10) 133 *F*'
            ];

            const result = app.deduplicateCardLines(cardLines);

            expect(result).toHaveLength(1);
            expect(result[0]).toBe('3 Lightning Bolt (M10) 133 *F*');
        });

        test('should handle etched cards', () => {
            const cardLines = [
                '2 Lightning Bolt (M10) 133 *E*',
                '1 Lightning Bolt (M10) 133 *E*'
            ];

            const result = app.deduplicateCardLines(cardLines);

            expect(result).toHaveLength(1);
            expect(result[0]).toBe('3 Lightning Bolt (M10) 133 *E*');
        });

        test('should ignore empty lines', () => {
            const cardLines = [
                '2 Lightning Bolt (M10) 133',
                '',
                '   ',
                '1 Counterspell (M10) 50'
            ];

            const result = app.deduplicateCardLines(cardLines);

            expect(result).toHaveLength(2);
        });

        test('should handle invalid card lines', () => {
            const cardLines = [
                '2 Lightning Bolt (M10) 133',
                'Invalid card line',
                '1 Counterspell (M10) 50'
            ];

            const result = app.deduplicateCardLines(cardLines);

            expect(result).toHaveLength(2);
        });

        test('should sort results alphabetically', () => {
            const cardLines = [
                '1 Counterspell (M10) 50',
                '2 Lightning Bolt (M10) 133',
                '1 Dispel (M10) 51'
            ];

            const result = app.deduplicateCardLines(cardLines);

            expect(result[0]).toBe('1 Counterspell (M10) 50');
            expect(result[1]).toBe('1 Dispel (M10) 51');
            expect(result[2]).toBe('2 Lightning Bolt (M10) 133');
        });
    });

    describe('loadFromUrl', () => {
        test('should handle empty URL', async () => {
            app.ui.wishlistUrlInput.value = '';
            
            await app.loadFromUrl('wishlist');
            
            expect(global.alert).toHaveBeenCalledWith('Please enter a valid Moxfield URL');
        });

        test('should handle successful URL loading', async () => {
            app.ui.wishlistUrlInput.value = 'https://www.moxfield.com/decks/abc123';
            
            // Mock successful API response
            const mockLoadFromUrl = jest.spyOn(app.apiClient, 'loadFromUrl').mockResolvedValue('2 Lightning Bolt (M10) 133\n1 Counterspell (M10) 50');
            
            await app.loadFromUrl('wishlist');
            
            expect(mockLoadFromUrl).toHaveBeenCalledWith('https://www.moxfield.com/decks/abc123', 'wishlist');
            expect(app.ui.wishlistTextarea.value).toContain('Lightning Bolt');
            mockLoadFromUrl.mockRestore();
        });

        test('should handle CORS error with manual input', async () => {
            app.ui.wishlistUrlInput.value = 'https://www.moxfield.com/decks/abc123';
            
            // Mock CORS error response
            const mockLoadFromUrl = jest.spyOn(app.apiClient, 'loadFromUrl').mockResolvedValue({ 
                apiUrl: 'https://api2.moxfield.com/v2/decks/all/abc123', 
                cards: '' 
            });
            
            // Mock manual input dialog
            const mockShowManualApiInputDialog = jest.spyOn(app.ui, 'showManualApiInputDialog').mockResolvedValue('{"mainboard": {"cards": [{"quantity": 2, "card": {"name": "Lightning Bolt", "set": "m10", "cn": "133"}}]}}');
            
            await app.loadFromUrl('wishlist');
            
            expect(mockShowManualApiInputDialog).toHaveBeenCalled();
            mockLoadFromUrl.mockRestore();
            mockShowManualApiInputDialog.mockRestore();
        });

        test('should handle API errors', async () => {
            app.ui.wishlistUrlInput.value = 'https://www.moxfield.com/decks/abc123';
            
            // Mock API error
            const mockLoadFromUrl = jest.spyOn(app.apiClient, 'loadFromUrl').mockRejectedValue(new Error('API Error'));
            
            await app.loadFromUrl('wishlist');
            
            expect(global.alert).toHaveBeenCalledWith('Failed to load data from URL: API Error');
            mockLoadFromUrl.mockRestore();
        });

        test('should handle collection URL loading', async () => {
            app.ui.collectionUrlInput.value = 'https://www.moxfield.com/collection/abc123';
            
            const mockLoadFromUrl = jest.spyOn(app.apiClient, 'loadFromUrl').mockResolvedValue('1 Lightning Bolt (M10) 133');
            
            await app.loadFromUrl('collection');
            
            expect(mockLoadFromUrl).toHaveBeenCalledWith('https://www.moxfield.com/collection/abc123', 'collection');
            expect(app.ui.collectionTextarea.value).toContain('Lightning Bolt');
            mockLoadFromUrl.mockRestore();
        });
    });

    describe('performSearch', () => {
        test('should perform search with valid inputs', async () => {
            // Set up test data
            app.ui.wishlistTextarea.value = '2 Lightning Bolt (M10) 133\n1 Counterspell (M10) 50';
            app.ui.collectionTextarea.value = '1 Lightning Bolt (M10) 133';
            
            // Mock UI methods
            const mockDisplayResults = jest.spyOn(app.ui, 'displayResults').mockImplementation(() => {});
            const mockDisplayFeedback = jest.spyOn(app.ui, 'displayFeedback').mockImplementation(() => {});
            const mockRefreshAllPrices = jest.spyOn(app, 'refreshAllPrices').mockResolvedValue();
            
            await app.performSearch();
            
            expect(mockDisplayResults).toHaveBeenCalled();
            expect(mockDisplayFeedback).toHaveBeenCalled();
            expect(mockRefreshAllPrices).toHaveBeenCalled();
            
            mockDisplayResults.mockRestore();
            mockDisplayFeedback.mockRestore();
            mockRefreshAllPrices.mockRestore();
        });

        test('should not refresh prices when no matches or missing cards', async () => {
            // Set up test data with empty inputs - no cards to match
            app.ui.wishlistTextarea.value = '';
            app.ui.collectionTextarea.value = '';
            
            // Mock UI methods to avoid DOM errors
            const mockDisplayResults = jest.spyOn(app.ui, 'displayResults').mockImplementation(() => {});
            const mockDisplayFeedback = jest.spyOn(app.ui, 'displayFeedback').mockImplementation(() => {});
            const mockRefreshAllPrices = jest.spyOn(app, 'refreshAllPrices').mockResolvedValue();
            
            await app.performSearch();
            
            expect(mockRefreshAllPrices).not.toHaveBeenCalled();
            
            mockDisplayResults.mockRestore();
            mockDisplayFeedback.mockRestore();
            mockRefreshAllPrices.mockRestore();
        });
    });

    describe('refreshAllPrices', () => {
        test('should refresh prices for match cards', async () => {
            // Mock DOM elements
            document.body.innerHTML += `
                <div id="matchesList">
                    <div class="card-item" data-card='{"name": "Lightning Bolt", "set": "M10", "foil": false, "etched": false, "quantity": 2}'>
                        <div class="card-price">Loading...</div>
                    </div>
                </div>
            `;
            
            // Mock UI method to return card data
            const mockGetCardDataFromElement = jest.spyOn(app.ui, 'getCardDataFromElement').mockReturnValue({
                name: 'Lightning Bolt',
                set: 'M10',
                foil: false,
                etched: false,
                quantity: 2
            });
            
            // Mock price service
            const mockFetchCardPrice = jest.spyOn(app.priceService, 'fetchCardPrice').mockResolvedValue({
                price: '1.50',
                error: null,
                cardName: 'Lightning Bolt',
                provider: 'tcgplayer',
                isFallback: false,
                fallbackReason: ''
            });
            
            await app.refreshAllPrices();
            
            expect(mockFetchCardPrice).toHaveBeenCalledWith(
                'Lightning Bolt',
                'M10',
                false,
                false,
                'tcgplayer'
            );
            
            mockGetCardDataFromElement.mockRestore();
            mockFetchCardPrice.mockRestore();
        });

        test('should handle price not available', async () => {
            // Mock DOM elements
            document.body.innerHTML += `
                <div id="matchesList">
                    <div class="card-item" data-card='{"name": "Lightning Bolt", "set": "M10", "foil": false, "etched": false, "quantity": 2}'>
                        <div class="card-price">Loading...</div>
                    </div>
                </div>
            `;
            
            // Mock UI method to return card data
            const mockGetCardDataFromElement = jest.spyOn(app.ui, 'getCardDataFromElement').mockReturnValue({
                name: 'Lightning Bolt',
                set: 'M10',
                foil: false,
                etched: false,
                quantity: 2
            });
            
            // Mock price service returning null
            const mockFetchCardPrice = jest.spyOn(app.priceService, 'fetchCardPrice').mockResolvedValue({
                price: null,
                error: null,
                cardName: 'Lightning Bolt',
                provider: 'tcgplayer',
                isFallback: false,
                fallbackReason: ''
            });
            
            await app.refreshAllPrices();
            
            const priceElement = document.querySelector('.card-price');
            expect(priceElement.textContent).toBe('Price not available');
            
            mockGetCardDataFromElement.mockRestore();
            mockFetchCardPrice.mockRestore();
        });

        test('should handle fallback prices', async () => {
            // Mock DOM elements
            document.body.innerHTML += `
                <div id="matchesList">
                    <div class="card-item" data-card='{"name": "Lightning Bolt", "set": "M10", "foil": false, "etched": false, "quantity": 2}'>
                        <div class="card-price">Loading...</div>
                    </div>
                </div>
            `;
            
            // Mock UI method to return card data
            const mockGetCardDataFromElement = jest.spyOn(app.ui, 'getCardDataFromElement').mockReturnValue({
                name: 'Lightning Bolt',
                set: 'M10',
                foil: false,
                etched: false,
                quantity: 2
            });
            
            // Mock price service returning fallback price
            const mockFetchCardPrice = jest.spyOn(app.priceService, 'fetchCardPrice').mockResolvedValue({
                price: '1.50',
                error: null,
                cardName: 'Lightning Bolt',
                provider: 'tcgplayer',
                isFallback: true,
                fallbackReason: 'Using USD price as fallback'
            });
            
            await app.refreshAllPrices();
            
            const priceElement = document.querySelector('.card-price');
            expect(priceElement.innerHTML).toContain('⚠️');
            expect(priceElement.innerHTML).toContain('ⓘ');
            
            mockGetCardDataFromElement.mockRestore();
            mockFetchCardPrice.mockRestore();
        });
    });

    describe('getTestHelpers', () => {
        test('should return all helper methods', () => {
            const helpers = app.getTestHelpers();
            
            expect(helpers.findMatches).toBeDefined();
            expect(helpers.parseCardLine).toBeDefined();
            expect(helpers.parseCardList).toBeDefined();
            expect(helpers.createCardKey).toBeDefined();
            expect(helpers.extractDeckId).toBeDefined();
            expect(helpers.extractCollectionId).toBeDefined();
            expect(helpers.extractBinderId).toBeDefined();
            expect(helpers.parseApiResponse).toBeDefined();
            expect(helpers.fetchCardPrice).toBeDefined();
        });

        test('should delegate to correct modules', () => {
            const helpers = app.getTestHelpers();
            
            // Test that helpers delegate to the correct modules
            const mockParseCardLine = jest.spyOn(app.cardParser, 'parseCardLine').mockReturnValue({ name: 'test' });
            const mockExtractDeckId = jest.spyOn(app.apiClient, 'extractDeckId').mockReturnValue({ type: 'deck', id: 'test' });
            const mockFetchCardPrice = jest.spyOn(app.priceService, 'fetchCardPrice').mockResolvedValue({ price: '1.00' });
            
            helpers.parseCardLine('test line');
            helpers.extractDeckId('test url');
            helpers.fetchCardPrice('test card');
            
            expect(mockParseCardLine).toHaveBeenCalledWith('test line');
            expect(mockExtractDeckId).toHaveBeenCalledWith('test url');
            expect(mockFetchCardPrice).toHaveBeenCalledWith('test card', undefined, undefined, undefined);
            
            mockParseCardLine.mockRestore();
            mockExtractDeckId.mockRestore();
            mockFetchCardPrice.mockRestore();
        });
    });

    describe('Event Handling', () => {
        test('should handle price provider change event', () => {
            const mockClearCache = jest.spyOn(app.priceService, 'clearCache').mockImplementation(() => {});
            const mockRefreshAllPrices = jest.spyOn(app, 'refreshAllPrices').mockResolvedValue();
            
            // Trigger the event
            const event = new CustomEvent('priceProviderChanged');
            document.dispatchEvent(event);
            
            expect(mockClearCache).toHaveBeenCalled();
            expect(mockRefreshAllPrices).toHaveBeenCalled();
            
            mockClearCache.mockRestore();
            mockRefreshAllPrices.mockRestore();
        });

        test('should handle card price update event', () => {
            const mockUpdateCardPrice = jest.spyOn(app.priceService, 'updateCardPrice').mockImplementation(() => {});
            
            // Create mock elements
            const cardElement = document.createElement('div');
            const card = { price: '1.50' };
            
            // Trigger the event
            const event = new CustomEvent('cardPriceUpdate', {
                detail: { cardElement, card, type: 'match' }
            });
            document.dispatchEvent(event);
            
            expect(mockUpdateCardPrice).toHaveBeenCalledWith(cardElement, card, 'match');
            
            mockUpdateCardPrice.mockRestore();
        });
    });

    describe('Edge Cases', () => {
        test('should handle empty card lists', () => {
            const result = app.findMatches([], [], false);
            
            expect(result.matches).toHaveLength(0);
            expect(result.missing).toHaveLength(0);
        });

        test('should handle null/undefined inputs', () => {
            const result = app.findMatches([], [], false);
            
            expect(result.matches).toHaveLength(0);
            expect(result.missing).toHaveLength(0);
        });

        test('should handle cards with missing properties', () => {
            const wishlistCards = [
                { name: 'Lightning Bolt', quantity: 1, set: 'M10', number: '133', foil: false, etched: false }
            ];
            const collectionCards = [
                { name: 'Lightning Bolt', quantity: 1, set: 'M10', number: '133', foil: false, etched: false }
            ];

            const result = app.findMatches(wishlistCards, collectionCards, false);

            expect(result.matches).toHaveLength(1);
        });
    });
}); 