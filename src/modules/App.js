/**
 * Main App Module
 * Orchestrates all modules and handles core business logic
 */
import { CardParser } from './CardParser.js';
import { ApiClient } from './ApiClient.js';
import { PriceService } from './PriceService.js';
import { UIManager } from './UIManager.js';

export class App {
    constructor() {
        this.cardParser = new CardParser();
        this.apiClient = new ApiClient();
        this.priceService = new PriceService();
        this.ui = new UIManager();
        
        // Bind UI events first
        this.ui.bindEvents();
        
        // Then bind application events
        this.bindEvents();
    }

    /**
     * Bind application events
     */
    bindEvents() {
        // Search button
        this.ui.searchBtn.addEventListener('click', () => {
            this.performSearch();
        });
        
        // URL loading buttons
        this.ui.loadWishlistBtn.addEventListener('click', () => {
            this.loadFromUrl('wishlist');
        });
        this.ui.loadCollectionBtn.addEventListener('click', () => {
            this.loadFromUrl('collection');
        });
        
        // Price provider change
        document.addEventListener('priceProviderChanged', () => {
            this.refreshAllPrices();
        });
        
        // Card price updates
        document.addEventListener('cardPriceUpdate', (event) => {
            const { cardElement, card, type } = event.detail;
            this.priceService.updateCardPrice(cardElement, card, type);
        });
    }

    /**
     * Perform the main search functionality
     */
    performSearch() {
        const inputs = this.ui.getInputValues();
        
        // Parse wishlist
        const wishlistResult = this.cardParser.parseCardList(
            inputs.wishlist, 
            inputs.ignoreWishlistSideboard
        );
        
        // Parse collection
        const collectionResult = this.cardParser.parseCardList(
            inputs.collection, 
            inputs.ignoreCollectionSideboard
        );
        
        // Find matches and missing cards
        const { matches, missing } = this.findMatches(
            wishlistResult.cards, 
            collectionResult.cards, 
            inputs.ignoreEdition
        );
        
        // Display results
        this.ui.displayResults(
            wishlistResult.cards, 
            collectionResult.cards, 
            matches, 
            missing
        );
        
        // Display feedback
        this.ui.displayFeedback(
            wishlistResult.errors,
            collectionResult.errors,
            wishlistResult.cards,
            collectionResult.cards
        );
    }

    /**
     * Find matches between wishlist and collection
     * @param {Array} wishlistCards - Wishlist cards
     * @param {Array} collectionCards - Collection cards
     * @param {boolean} ignoreEdition - Whether to ignore edition differences
     * @returns {Object} - Object containing matches and missing cards
     */
    findMatches(wishlistCards, collectionCards, ignoreEdition) {
        const matches = [];
        const missing = [];
        
        // Create collection lookup map
        const collectionMap = new Map();
        collectionCards.forEach(card => {
            const key = this.cardParser.createCardKey(card, ignoreEdition);
            if (collectionMap.has(key)) {
                collectionMap.get(key).quantity += card.quantity;
            } else {
                collectionMap.set(key, { ...card });
            }
        });
        
        // Check each wishlist card
        wishlistCards.forEach(wishlistCard => {
            const key = this.cardParser.createCardKey(wishlistCard, ignoreEdition);
            const collectionCard = collectionMap.get(key);
            
            if (collectionCard) {
                // Found a match
                const matchQuantity = Math.min(wishlistCard.quantity, collectionCard.quantity);
                const missingQuantity = wishlistCard.quantity - matchQuantity;
                
                if (matchQuantity > 0) {
                    matches.push({
                        wishlist: { ...wishlistCard },
                        collection: { ...collectionCard },
                        quantity: matchQuantity,
                        collectionQuantity: collectionCard.quantity
                    });
                }
                
                if (missingQuantity > 0) {
                    missing.push({
                        ...wishlistCard,
                        quantity: missingQuantity,
                        needed: missingQuantity
                    });
                }
            } else {
                // No exact match found - always check for partial matches
                const partialMatches = this.findPartialMatches(wishlistCard, collectionCards);
                if (partialMatches.length > 0) {
                    missing.push({
                        ...wishlistCard,
                        partialMatches
                    });
                } else {
                    missing.push({
                        ...wishlistCard,
                        needed: wishlistCard.quantity
                    });
                }
            }
        });
        
        return { matches, missing };
    }

    /**
     * Find partial matches for a card (same name but different edition/number/foil/etched)
     * @param {Object} wishlistCard - The wishlist card
     * @param {Array} collectionCards - Collection cards
     * @returns {Array} - Array of partial matches
     */
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
    }

    /**
     * Deduplicate card lines by combining quantities
     * @param {Array} cardLines - Array of card line strings
     * @returns {Array} - Deduplicated card lines
     */
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
    }

    /**
     * Load data from URL
     * @param {string} type - The type of data to load (wishlist/collection)
     */
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
            let apiUrl = url; // Default to original URL
            
            if (typeof result === 'object' && result.apiUrl) {
                const { cards: resultCards, apiUrl: resultApiUrl } = result;
                cards = resultCards;
                apiUrl = resultApiUrl;
            }
            
            // If cards is empty string, it means manual input is needed
            if (cards === '') {
                // eslint-disable-next-line no-console
                console.log('Manual API input needed for:', apiUrl);
                const manualResponse = await this.ui.showManualApiInputDialog(apiUrl, type);
                
                if (manualResponse) {
                    try {
                        const parsedCards = this.apiClient.parseManualApiResponse(manualResponse, type);
                        const cardLines = parsedCards.split('\n').filter(line => line.trim());
                        
                        // Deduplicate card lines
                        const deduplicatedCards = this.deduplicateCardLines(cardLines);
                        const cardList = deduplicatedCards.join('\n');
                        
                        const textarea = type === 'wishlist' ? this.ui.wishlistTextarea : this.ui.collectionTextarea;
                        textarea.value = cardList;
                        
                        // Switch to text tab
                        const tabName = type === 'wishlist' ? 'wishlistTextTab' : 'collectionTextTab';
                        this.ui.switchInputTab(tabName);
                        
                        // eslint-disable-next-line no-console
                        console.log('Manual API response processed successfully');
                    } catch (parseError) {
                        alert(`Failed to parse manual API response: ${parseError.message}`);
                    }
                } else {
                    // eslint-disable-next-line no-console
                    console.log('Manual API input cancelled');
                }
                return;
            }
            
            // Process automatic API response
            const cardList = cards.split('\n').filter(line => line.trim()).map(card => 
                card.trim()
            ).join('\n');
            
            const textarea = type === 'wishlist' ? this.ui.wishlistTextarea : this.ui.collectionTextarea;
            textarea.value = cardList;
            
            // Switch to text tab
            const tabName = type === 'wishlist' ? 'wishlistTextTab' : 'collectionTextTab';
            this.ui.switchInputTab(tabName);
            
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error loading from URL:', error);
            alert(`Failed to load data from URL: ${error.message}`);
        } finally {
            // Hide loading state
            this.ui.hideLoadingState(type);
        }
    }

    /**
     * Refresh all card prices
     */
    async refreshAllPrices() {
        const inputs = this.ui.getInputValues();
        const { priceProvider } = inputs;
        
        // Get all card elements
        const matchElements = document.querySelectorAll('#matchesList .card-item');
        const missingElements = document.querySelectorAll('#missingList .card-item');
        
        // Refresh match prices
        for (const element of matchElements) {
            const cardData = this.ui.getCardDataFromElement(element, 'match');
            if (cardData) {
                // Use collection card data for pricing when available
                const { collection } = cardData;
                const collectionCard = collection || cardData;
                const priceData = await this.priceService.fetchCardPrice(
                    collectionCard.name,
                    collectionCard.set,
                    collectionCard.foil,
                    collectionCard.etched,
                    priceProvider
                );
                
                const { price } = priceData;
                if (price) {
                    const priceElement = element.querySelector('.card-price');
                    if (priceElement) {
                        priceElement.textContent = `$${price}`;
                        priceElement.classList.add('has-price');
                    }
                }
            }
        }
        
        // Refresh missing prices
        for (const element of missingElements) {
            const cardData = this.ui.getCardDataFromElement(element, 'missing');
            if (cardData) {
                const priceData = await this.priceService.fetchCardPrice(
                    cardData.name,
                    cardData.set,
                    cardData.foil,
                    cardData.etched,
                    priceProvider
                );
                
                const { price } = priceData;
                if (price) {
                    const priceElement = element.querySelector('.card-price');
                    if (priceElement) {
                        priceElement.textContent = `$${price}`;
                        priceElement.classList.add('has-price');
                    }
                }
            }
        }
    }

    /**
     * Get helper methods for testing
     */
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
} 