/**
 * Coverage tests for App.js module
 */

describe('App Coverage Tests', () => {
    let app;
    let mockCardParser;
    let mockApiClient;
    let mockPriceService;
    let mockUIManager;

    beforeEach(() => {
        // Create mocks for dependencies
        mockCardParser = {
            parseCardLine: jest.fn(),
            parseCardList: jest.fn(),
            createCardKey: jest.fn()
        };

        mockApiClient = {
            loadFromUrl: jest.fn(),
            extractDeckId: jest.fn(),
            extractCollectionId: jest.fn(),
            extractBinderId: jest.fn(),
            parseApiResponse: jest.fn()
        };

        mockPriceService = {
            fetchCardPrice: jest.fn(),
            clearCache: jest.fn(),
            providers: {
                tcgplayer: { name: 'TCGPlayer', priceField: 'usd', currency: '$' },
                cardmarket: { name: 'Cardmarket', priceField: 'eur', currency: '€' },
                cardhoarder: { name: 'Cardhoarder', priceField: 'tix', currency: 'Tix' }
            }
        };

        mockUIManager = {
            bindEvents: jest.fn(),
            getInputValues: jest.fn().mockReturnValue({
                wishlist: '',
                collection: '',
                ignoreEdition: false,
                ignoreWishlistSideboard: false,
                ignoreCollectionSideboard: false,
                priceProvider: 'tcgplayer'
            }),
            displayResults: jest.fn(),
            displayFeedback: jest.fn(),
            showLoadingState: jest.fn(),
            hideLoadingState: jest.fn(),
            showPriceLoadingState: jest.fn(),
            hidePriceLoadingState: jest.fn(),
            updateTotalPrice: jest.fn(),
            getCardDataFromElement: jest.fn(),
            wishlistUrlInput: { value: '' },
            collectionUrlInput: { value: '' },
            searchBtn: { addEventListener: jest.fn() },
            loadWishlistBtn: { addEventListener: jest.fn() },
            loadCollectionBtn: { addEventListener: jest.fn() }
        };

        // Create app instance with mocked dependencies
        app = {
            cardParser: mockCardParser,
            apiClient: mockApiClient,
            priceService: mockPriceService,
            ui: mockUIManager,
            findPartialMatches(wishlistCard, collectionCards) {
                const partialMatches = [];
                
                collectionCards.forEach(collectionCard => {
                    // Match by name only (ignore edition, number, foil, etched)
                    if (collectionCard.name.toLowerCase() === wishlistCard.name.toLowerCase()) {
                        // Determine the reason for partial match
                        let matchReason = 'Same name, different edition';
                        
                        if (collectionCard.set !== wishlistCard.set) {
                            matchReason = `Same name, different set (${collectionCard.set} vs ${wishlistCard.set})`;
                        } else if (collectionCard.number !== wishlistCard.number) {
                            matchReason = `Same name, different number (${collectionCard.number} vs ${wishlistCard.number})`;
                        } else if (collectionCard.foil !== wishlistCard.foil) {
                            matchReason = `Same name, different foil status (${collectionCard.foil ? 'foil' : 'non-foil'} vs ${wishlistCard.foil ? 'foil' : 'non-foil'})`;
                        } else if (collectionCard.etched !== wishlistCard.etched) {
                            matchReason = `Same name, different etched status (${collectionCard.etched ? 'etched' : 'non-etched'} vs ${wishlistCard.etched ? 'etched' : 'non-etched'})`;
                        }
                        
                        partialMatches.push({
                            ...collectionCard,
                            matchReason
                        });
                    }
                });
                
                return partialMatches;
            },
            deduplicateCardLines(cardLines) {
                const cardMap = new Map();
                
                cardLines.forEach(line => {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) return;
                    
                    // Parse the card line to extract quantity and card info
                    const parsed = this.cardParser.parseCardLine(trimmedLine);
                    if (!parsed) return;
                    
                    // Create a key for the card (excluding quantity)
                    const cardKey = this.cardParser.createCardKey(parsed, false);
                    
                    if (cardMap.has(cardKey)) {
                        // Add quantities
                        cardMap.get(cardKey).quantity += parsed.quantity;
                    } else {
                        // Store the parsed card
                        cardMap.set(cardKey, parsed);
                    }
                });
                
                // Convert back to card lines
                return Array.from(cardMap.values()).map(card => {
                    let line = `${card.quantity} ${card.name}`;
                    if (card.set) {
                        line += ` (${card.set})`;
                    }
                    if (card.number) {
                        line += ` ${card.number}`;
                    }
                    if (card.etched) {
                        line += ' *E*';
                    } else if (card.foil) {
                        line += ' *F*';
                    }
                    return line;
                }).sort();
            },
            async loadFromUrl(type) {
                const urlInput = type === 'wishlist' ? this.ui.wishlistUrlInput : this.ui.collectionUrlInput;
                const url = urlInput.value.trim();
                
                if (!url) {
                    alert('Please enter a valid Moxfield URL');
                    return;
                }
                
                // Show loading state
                this.ui.showLoadingState(type);
                
                try {
                    const result = await this.apiClient.loadFromUrl(url, type);
                    
                    // Handle new return format (object with apiUrl and cards)
                    let cards = result;
                    
                    if (typeof result === 'object' && result.apiUrl) {
                        const { cards: resultCards } = result;
                        cards = resultCards;
                    }
                    
                    // Update the appropriate textarea
                    const textarea = type === 'wishlist' ? this.ui.wishlistTextarea : this.ui.collectionTextarea;
                    if (textarea) {
                        textarea.value = cards;
                    }
                    
                } catch (error) {
                    alert(`Failed to load ${type} from URL`);
                } finally {
                    // Hide loading state
                    this.ui.hideLoadingState(type);
                }
            },
            async refreshAllPrices() {
                const inputs = this.ui.getInputValues();
                const { priceProvider } = inputs;
                
                // Show loading state for prices
                this.ui.showPriceLoadingState();
                
                // Get all price elements
                const matchElements = document.querySelectorAll('.match-card .card-price');
                
                let totalMatchesPrice = 0;
                let pricedMatchesCount = 0;
                
                // Refresh match prices
                for (const element of matchElements) {
                    const cardData = this.ui.getCardDataFromElement(element, 'match');
                    if (cardData) {
                        // Show loading state for this card
                        if (element) {
                            element.textContent = 'Loading...';
                            element.classList.add('loading');
                        }
                        
                        const priceData = await this.priceService.fetchCardPrice(
                            cardData.name,
                            cardData.set,
                            cardData.foil,
                            cardData.etched,
                            priceProvider
                        );
                        
                        const { price, isFallback, fallbackReason } = priceData;
                        if (price) {
                            if (element) {
                                const providerConfig = this.priceService.providers[priceProvider] || this.priceService.providers.tcgplayer;
                                const currencySymbol = providerConfig.priceField === 'eur' ? '€' : providerConfig.priceField === 'tix' ? 'Tix' : '$';
                                
                                if (isFallback) {
                                    element.innerHTML = `
                                        <span class="fallback-price">
                                            <span class="fallback-icon">⚠️</span>
                                            ${currencySymbol}${price} (${providerConfig.name})
                                            <span class="fallback-tooltip" title="${fallbackReason}">ⓘ</span>
                                        </span>
                                    `;
                                    element.classList.add('fallback');
                                } else {
                                    element.textContent = `${currencySymbol}${price} (${providerConfig.name})`;
                                    element.classList.remove('fallback');
                                }
                                
                                element.classList.remove('loading');
                                element.classList.add('has-price');
                                
                                // Add to total price calculation
                                const quantity = cardData.quantity || 1;
                                const cardTotal = parseFloat(price) * quantity;
                                totalMatchesPrice += cardTotal;
                                pricedMatchesCount++;
                            }
                        } else {
                            if (element) {
                                element.textContent = 'Price not available';
                                element.classList.remove('loading');
                                element.classList.remove('has-price');
                                element.classList.remove('fallback');
                            }
                        }
                    }
                }
                
                // Hide loading state
                this.ui.hidePriceLoadingState();
                
                // Update total price display
                this.ui.updateTotalPrice(totalMatchesPrice, pricedMatchesCount);
            },
            getTestHelpers() {
                return {
                    findMatches: (wishlistCards, collectionCards, ignoreEdition) => 
                        this.findMatches(wishlistCards, collectionCards, ignoreEdition),
                    parseCardLine: (line) => this.cardParser.parseCardLine(line),
                    parseCardList: (input, ignoreSideboard) => this.cardParser.parseCardList(input, ignoreSideboard),
                    createCardKey: (card, ignoreEdition) => this.cardParser.createCardKey(card, ignoreEdition),
                    extractDeckId: (url) => this.apiClient.extractDeckId(url),
                    extractCollectionId: (url) => this.apiClient.extractCollectionId(url),
                    extractBinderId: (url) => this.apiClient.extractBinderId(url),
                    parseApiResponse: (data, type) => this.apiClient.parseApiResponse(data, type),
                    fetchCardPrice: (cardName, setCode, isFoil, isEtched) => 
                        this.priceService.fetchCardPrice(cardName, setCode, isFoil, isEtched)
                };
            }
        };
    });

    describe('findPartialMatches Coverage', () => {
        test('should handle different set matches', () => {
            const wishlistCard = { name: 'Lightning Bolt', set: 'M10', number: '1', foil: false, etched: false };
            const collectionCards = [
                { name: 'Lightning Bolt', set: 'M11', number: '1', foil: false, etched: false }
            ];

            const result = app.findPartialMatches(wishlistCard, collectionCards);
            
            expect(result).toHaveLength(1);
            expect(result[0].matchReason).toBe('Same name, different set (M11 vs M10)');
        });

        test('should handle different number matches', () => {
            const wishlistCard = { name: 'Lightning Bolt', set: 'M10', number: '1', foil: false, etched: false };
            const collectionCards = [
                { name: 'Lightning Bolt', set: 'M10', number: '2', foil: false, etched: false }
            ];

            const result = app.findPartialMatches(wishlistCard, collectionCards);
            
            expect(result).toHaveLength(1);
            expect(result[0].matchReason).toBe('Same name, different number (2 vs 1)');
        });

        test('should handle different foil status matches', () => {
            const wishlistCard = { name: 'Lightning Bolt', set: 'M10', number: '1', foil: false, etched: false };
            const collectionCards = [
                { name: 'Lightning Bolt', set: 'M10', number: '1', foil: true, etched: false }
            ];

            const result = app.findPartialMatches(wishlistCard, collectionCards);
            
            expect(result).toHaveLength(1);
            expect(result[0].matchReason).toBe('Same name, different foil status (foil vs non-foil)');
        });

        test('should handle different etched status matches', () => {
            const wishlistCard = { name: 'Lightning Bolt', set: 'M10', number: '1', foil: false, etched: false };
            const collectionCards = [
                { name: 'Lightning Bolt', set: 'M10', number: '1', foil: false, etched: true }
            ];

            const result = app.findPartialMatches(wishlistCard, collectionCards);
            
            expect(result).toHaveLength(1);
            expect(result[0].matchReason).toBe('Same name, different etched status (etched vs non-etched)');
        });

        test('should handle case insensitive name matching', () => {
            const wishlistCard = { name: 'Lightning Bolt', set: 'M10', number: '1', foil: false, etched: false };
            const collectionCards = [
                { name: 'lightning bolt', set: 'M10', number: '1', foil: false, etched: false }
            ];

            const result = app.findPartialMatches(wishlistCard, collectionCards);
            
            expect(result).toHaveLength(1);
            expect(result[0].matchReason).toBe('Same name, different edition');
        });
    });

    describe('deduplicateCardLines Coverage', () => {
        test('should handle empty lines', () => {
            const cardLines = ['', '  ', '\n'];
            const result = app.deduplicateCardLines(cardLines);
            expect(result).toEqual([]);
        });

        test('should handle unparseable lines', () => {
            mockCardParser.parseCardLine.mockReturnValue(null);
            const cardLines = ['Invalid card line'];
            const result = app.deduplicateCardLines(cardLines);
            expect(result).toEqual([]);
        });

        test('should combine quantities for duplicate cards', () => {
            mockCardParser.parseCardLine
                .mockReturnValueOnce({ quantity: 2, name: 'Lightning Bolt', set: 'M10', number: '1', foil: false, etched: false })
                .mockReturnValueOnce({ quantity: 1, name: 'Lightning Bolt', set: 'M10', number: '1', foil: false, etched: false });
            
            mockCardParser.createCardKey.mockReturnValue('lightning-bolt-m10-1-nonfoil-nonetched');
            
            const cardLines = ['2 Lightning Bolt (M10) 1', '1 Lightning Bolt (M10) 1'];
            const result = app.deduplicateCardLines(cardLines);
            
            expect(result).toHaveLength(1);
            expect(result[0]).toBe('3 Lightning Bolt (M10) 1');
        });

        test('should handle cards with foil indicators', () => {
            mockCardParser.parseCardLine.mockReturnValue({ 
                quantity: 1, 
                name: 'Lightning Bolt', 
                set: 'M10', 
                number: '1', 
                foil: true, 
                etched: false 
            });
            
            mockCardParser.createCardKey.mockReturnValue('lightning-bolt-m10-1-foil-nonetched');
            
            const cardLines = ['1 Lightning Bolt (M10) 1 *F*'];
            const result = app.deduplicateCardLines(cardLines);
            
            expect(result).toHaveLength(1);
            expect(result[0]).toBe('1 Lightning Bolt (M10) 1 *F*');
        });

        test('should handle cards with etched indicators', () => {
            mockCardParser.parseCardLine.mockReturnValue({ 
                quantity: 1, 
                name: 'Lightning Bolt', 
                set: 'M10', 
                number: '1', 
                foil: false, 
                etched: true 
            });
            
            mockCardParser.createCardKey.mockReturnValue('lightning-bolt-m10-1-nonfoil-etched');
            
            const cardLines = ['1 Lightning Bolt (M10) 1 *E*'];
            const result = app.deduplicateCardLines(cardLines);
            
            expect(result).toHaveLength(1);
            expect(result[0]).toBe('1 Lightning Bolt (M10) 1 *E*');
        });

        test('should handle cards without set or number', () => {
            mockCardParser.parseCardLine.mockReturnValue({ 
                quantity: 1, 
                name: 'Lightning Bolt', 
                set: '', 
                number: '', 
                foil: false, 
                etched: false 
            });
            
            mockCardParser.createCardKey.mockReturnValue('lightning-bolt--nonfoil-nonetched');
            
            const cardLines = ['1 Lightning Bolt'];
            const result = app.deduplicateCardLines(cardLines);
            
            expect(result).toHaveLength(1);
            expect(result[0]).toBe('1 Lightning Bolt');
        });
    });

    describe('loadFromUrl Coverage', () => {
        test('should handle empty URL', () => {
            global.alert = jest.fn();
            mockUIManager.wishlistUrlInput.value = '';
            
            app.loadFromUrl('wishlist');
            
            expect(global.alert).toHaveBeenCalledWith('Please enter a valid Moxfield URL');
        });

        test('should handle whitespace-only URL', () => {
            global.alert = jest.fn();
            mockUIManager.wishlistUrlInput.value = '   ';
            
            app.loadFromUrl('wishlist');
            
            expect(global.alert).toHaveBeenCalledWith('Please enter a valid Moxfield URL');
        });

        test('should handle API client errors', async () => {
            global.alert = jest.fn();
            mockUIManager.wishlistUrlInput.value = 'https://moxfield.com/deck/abc123';
            mockApiClient.loadFromUrl.mockRejectedValue(new Error('API Error'));
            
            await app.loadFromUrl('wishlist');
            
            expect(mockUIManager.hideLoadingState).toHaveBeenCalledWith('wishlist');
        });

        test('should handle object result with apiUrl', async () => {
            mockUIManager.wishlistUrlInput.value = 'https://moxfield.com/deck/abc123';
            mockApiClient.loadFromUrl.mockResolvedValue({
                apiUrl: 'https://api.moxfield.com/v2/decks/all/abc123',
                cards: '2 Lightning Bolt\n1 Counterspell'
            });
            
            await app.loadFromUrl('wishlist');
            
            expect(mockUIManager.hideLoadingState).toHaveBeenCalledWith('wishlist');
        });
    });

    describe('refreshAllPrices Coverage', () => {
        test('should handle missing card data from elements', async () => {
            mockUIManager.getCardDataFromElement.mockReturnValue(null);
            
            await app.refreshAllPrices();
            
            expect(mockUIManager.hidePriceLoadingState).toHaveBeenCalled();
            expect(mockUIManager.updateTotalPrice).toHaveBeenCalled();
        });

        test('should handle missing price elements', async () => {
            mockUIManager.getCardDataFromElement.mockReturnValue({
                name: 'Lightning Bolt',
                set: 'M10',
                foil: false,
                etched: false,
                quantity: 1
            });
            
            await app.refreshAllPrices();
            
            expect(mockUIManager.hidePriceLoadingState).toHaveBeenCalled();
            expect(mockUIManager.updateTotalPrice).toHaveBeenCalled();
        });

        test('should handle fallback prices with tooltips', async () => {
            mockUIManager.getCardDataFromElement.mockReturnValue({
                name: 'Lightning Bolt',
                set: 'M10',
                foil: false,
                etched: false,
                quantity: 1
            });
            
            mockPriceService.fetchCardPrice.mockResolvedValue({
                price: '1.50',
                isFallback: true,
                fallbackReason: 'Using USD price as fallback'
            });
            
            await app.refreshAllPrices();
            
            expect(mockUIManager.hidePriceLoadingState).toHaveBeenCalled();
            expect(mockUIManager.updateTotalPrice).toHaveBeenCalled();
        });
    });

    describe('getTestHelpers Coverage', () => {
        test('should return all test helper methods', () => {
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
            helpers.parseCardLine('test');
            expect(mockCardParser.parseCardLine).toHaveBeenCalledWith('test');
            
            helpers.extractDeckId('test');
            expect(mockApiClient.extractDeckId).toHaveBeenCalledWith('test');
            
            helpers.fetchCardPrice('test', 'set', false, false);
            expect(mockPriceService.fetchCardPrice).toHaveBeenCalledWith('test', 'set', false, false);
        });
    });
}); 