/**
 * Price Service Module
 * Handles fetching and caching of card prices from Scryfall
 */
export class PriceService {
    constructor() {
        this.priceCache = new Map();
        this.scryfallUrl = 'https://api.scryfall.com';
        this.fallbackEnabled = false;
        
        // Define different price sources and their Scryfall price fields
        this.providers = {
            tcgplayer: {
                name: 'TCGPlayer',
                priceField: 'usd',
                currency: 'USD'
            },
            cardmarket: {
                name: 'Cardmarket',
                priceField: 'eur',
                currency: 'EUR'
            },
            cardhoarder: {
                name: 'Cardhoarder',
                priceField: 'tix',
                currency: 'MTGO Tix'
            }
        };
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
     * 
     * Note: Moxfield API does not provide pricing data. All pricing comes from Scryfall's API,
     * which aggregates prices from three main sources:
     * - TCGPlayer: usd (USD prices from TCGPlayer marketplace)
     * - Cardmarket: eur (Euro prices from Cardmarket)
     * - Cardhoarder: tix (MTGO ticket prices from Cardhoarder)
     * 
     * Each provider uses only its specific price field. If the price is not available, null is returned.
     * 
     * @param {string} cardName - The card name
     * @param {string} setCode - The set code
     * @param {boolean} isFoil - Whether the card is foil
     * @param {boolean} isEtched - Whether the card is etched
     * @param {string} provider - The price source (tcgplayer, cardmarket, cardhoarder)
     * @returns {Promise<Object>} - Price data object
     */
    async fetchCardPrice(cardName, setCode = '', isFoil = false, isEtched = false, provider = 'tcgplayer', options = undefined) {
        const fallbackEnabled = options && Object.prototype.hasOwnProperty.call(options, 'fallback')
            ? !!options.fallback
            : !!this.fallbackEnabled;
        const providerKey = provider + (fallbackEnabled ? ':fb' : '');
        const cacheKey = this.getPriceCacheKey(cardName, setCode, isFoil, isEtched, providerKey);
        
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
                const providerConfig = this.providers[provider] || this.providers.tcgplayer;
                if (response.status === 429) {
                    return {
                        price: null,
                        error: 'Rate limit exceeded. Please try again later.',
                        cardName,
                        provider: providerConfig.name
                    };
                }
                return {
                    price: null,
                    error: `HTTP ${response.status}`,
                    cardName,
                    provider: providerConfig.name
                };
            }

            const data = await response.json();
            
            if (!data.data || data.data.length === 0) {
                const providerConfig = this.providers[provider] || this.providers.tcgplayer;
                return {
                    price: null,
                    error: 'Card not found',
                    cardName,
                    provider: providerConfig.name
                };
            }

            // Find the best match (exact name match first, then partial)
            let bestMatch = null;
            
            // First try exact name match
            for (const card of data.data) {
                if (card.name.toLowerCase() === cardName.toLowerCase()) {
                    bestMatch = card;
                    break;
                }
            }
            
            // If no exact match, try partial match
            if (!bestMatch) {
                for (const card of data.data) {
                    if (card.name.toLowerCase().includes(cardName.toLowerCase()) ||
                        cardName.toLowerCase().includes(card.name.toLowerCase())) {
                        bestMatch = card;
                        break;
                    }
                }
            }
            
            if (!bestMatch) {
                const providerConfig = this.providers[provider] || this.providers.tcgplayer;
                return {
                    price: null,
                    error: 'No matching card found',
                    cardName,
                    provider: providerConfig.name
                };
            }

            const primary = (this.providers[provider] ? provider : 'tcgplayer');
            if (fallbackEnabled) {
                // Try primary, then fallbacks
                const tryOrder = ['tcgplayer', 'cardmarket', 'cardhoarder'];
                const order = [primary, ...tryOrder.filter(p => p !== primary)];
                let final = null;
                for (const key of order) {
                    const conf = this.providers[key];
                    const field = conf.priceField;
                    const p = bestMatch.prices && bestMatch.prices[field] ? bestMatch.prices[field] : null;
                    if (p) {
                        final = {
                            price: p,
                            cardName: bestMatch.name,
                            setCode: bestMatch.set,
                            provider: conf.name,
                            currency: conf.currency,
                            isFallback: key !== primary,
                            fallbackReason: key !== primary ? `Missing price for selected provider; used ${conf.name}` : ''
                        };
                        break;
                    }
                }
                if (!final) {
                    const providerConfig = this.providers[primary];
                    final = {
                        price: null,
                        error: 'Price not available from any provider',
                        cardName: bestMatch.name,
                        provider: providerConfig.name,
                        currency: providerConfig.currency,
                        isFallback: false,
                        fallbackReason: ''
                    };
                }
                this.priceCache.set(cacheKey, final);
                return final;
            } else {
                // No fallback: only use selected provider
                const providerConfig = this.providers[primary];
                const field = providerConfig.priceField;
                const p = bestMatch.prices && bestMatch.prices[field] ? bestMatch.prices[field] : null;
                const result = {
                    price: p,
                    cardName: bestMatch.name,
                    setCode: bestMatch.set,
                    provider: providerConfig.name,
                    currency: providerConfig.currency,
                    isFallback: false,
                    fallbackReason: ''
                };
                this.priceCache.set(cacheKey, result);
                return result;
            }
            
        } catch (error) {
            const providerConfig = this.providers[provider] || this.providers.tcgplayer;
            return {
                price: null,
                error: error.message,
                cardName,
                provider: providerConfig.name
            };
        }
    }

    /**
     * Update card price in the UI
     * @param {Element} cardElement - The card element
     * @param {Object} priceData - The price data
     * @param {string} _type - The type (unused parameter)
     */
    updateCardPrice(cardElement, { price } = {}, _type) {
        if (!cardElement) return;
        
        const priceElement = cardElement.querySelector('.card-price');
        if (!priceElement) return;
        
        // If price is undefined (e.g., placeholder event), keep current text/state
        if (price === undefined) {
            return;
        }

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
