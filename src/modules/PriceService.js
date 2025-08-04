/**
 * Price Service Module
 * Handles fetching and caching of card prices from Scryfall
 */
export class PriceService {
    constructor() {
        this.priceCache = new Map();
        this.scryfallUrl = 'https://api.scryfall.com';
    }

    /**
     * Get a cache key for price data
     * @param {string} cardName - The card name
     * @param {string} setCode - The set code
     * @param {boolean} isFoil - Whether the card is foil
     * @param {boolean} isEtched - Whether the card is etched
     * @param {string} provider - The price provider
     * @returns {string} - The cache key
     */
    getPriceCacheKey(cardName, setCode, isFoil, isEtched, provider) {
        return `${cardName.toLowerCase()}|${setCode.toLowerCase()}|${isFoil}|${isEtched}|${provider}`;
    }

    /**
     * Fetch card price from Scryfall API
     * @param {string} cardName - The card name
     * @param {string} setCode - The set code
     * @param {boolean} isFoil - Whether the card is foil
     * @param {boolean} isEtched - Whether the card is etched
     * @returns {Promise<Object>} - Price data object
     */
    async fetchCardPrice(cardName, setCode = '', isFoil = false, isEtched = false) {
        const provider = 'cardkingdom'; // Default provider
        const cacheKey = this.getPriceCacheKey(cardName, setCode, isFoil, isEtched, provider);
        
        // Check cache first
        if (this.priceCache.has(cacheKey)) {
            return this.priceCache.get(cacheKey);
        }

        try {
            // Build search query
            let searchQuery = cardName;
            if (setCode) {
                searchQuery += ` set:${setCode}`;
            }

            const response = await fetch(`${this.scryfallUrl}/cards/search?q=${encodeURIComponent(searchQuery)}`);
            
            if (!response.ok) {
                if (response.status === 429) {
                    return {
                        price: null,
                        error: 'Rate limit exceeded. Please try again later.',
                        cardName,
                        provider
                    };
                }
                return {
                    price: null,
                    error: `HTTP ${response.status}`,
                    cardName,
                    provider
                };
            }

            const data = await response.json();
            
            if (!data.data || data.data.length === 0) {
                return {
                    price: null,
                    error: 'Card not found',
                    cardName,
                    provider
                };
            }

            // Find the best matching card
            let bestMatch = data.data[0];
            
            // If we have a set code, try to find an exact match
            if (setCode) {
                const exactMatch = data.data.find(card => 
                    card.set?.toLowerCase() === setCode.toLowerCase()
                );
                if (exactMatch) {
                    bestMatch = exactMatch;
                }
            }

            // Get price based on foil status
            let price = null;
            if (isFoil && bestMatch.prices?.usd_foil) {
                price = bestMatch.prices.usd_foil;
            } else if (isEtched && bestMatch.prices?.usd_etched) {
                price = bestMatch.prices.usd_etched;
            } else if (bestMatch.prices?.usd) {
                price = bestMatch.prices.usd;
            }

            const result = {
                price,
                error: null,
                cardName,
                provider
            };

            // Cache the result
            this.priceCache.set(cacheKey, result);
            
            return result;

        } catch (error) {
            return {
                price: null,
                error: error.message,
                cardName,
                provider
            };
        }
    }

    /**
     * Update card price in the UI
     * @param {HTMLElement} cardElement - The card element
     * @param {Object} card - The card data
     * @param {string} _type - The type of card (unused)
     */
    updateCardPrice(cardElement, { price }, _type) {
        const priceElement = cardElement.querySelector('.card-price');
        if (!priceElement) return;
        
        if (price) {
            priceElement.textContent = `$${price}`;
            priceElement.classList.add('has-price');
        } else {
            priceElement.textContent = 'Price not available';
            priceElement.classList.remove('has-price');
        }
    }

    /**
     * Clear the price cache
     */
    clearCache() {
        this.priceCache.clear();
    }
} 