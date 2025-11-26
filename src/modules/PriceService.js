/**
 * Price Service Module
 * Handles fetching and caching of card prices from Scryfall and Moxfield
 */
export class PriceService {
    constructor() {
        this.priceCache = new Map();
        this.scryfallUrl = 'https://api.scryfall.com';
        this.moxfieldUrl = 'https://api2.moxfield.com/v2';
        this.fallbackEnabled = false;

        // Define different price sources and their fields
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
            },
            cardkingdom: {
                name: 'CardKingdom',
                priceField: 'ck',
                currency: 'USD'
            },
            starcitygames: {
                name: 'StarCityGames',
                priceField: 'scg',
                currency: 'USD'
            },
            cardtrader: {
                name: 'CardTrader',
                priceField: 'ct',
                currency: 'USD'
            },
            coolstuffinc: {
                name: 'CoolStuffInc',
                priceField: 'csi',
                currency: 'USD'
            },
            manapool: {
                name: 'Manapool',
                priceField: 'mp',
                currency: 'USD'
            }
        };
    }

    /**
     * Get a cache key for price data
     */
    getPriceCacheKey(cardName, setCode, isFoil, isEtched, provider) {
        return `${cardName.toLowerCase()}|${setCode.toLowerCase()}|${isFoil}|${isEtched}|${provider}`;
    }

    /**
     * Determine the appropriate Scryfall price field(s) for a provider
     */
    getProviderPriceFields(providerKey, isFoil, isEtched) {
        switch (providerKey) {
            case 'tcgplayer':
                if (isEtched) return ['usd_etched', 'usd_foil', 'usd'];
                if (isFoil) return ['usd_foil', 'usd'];
                return ['usd'];
            case 'cardmarket':
                if (isFoil) return ['eur_foil', 'eur'];
                return ['eur'];
            case 'cardhoarder':
                if (isFoil) return ['tix_foil', 'tix'];
                return ['tix'];
            default:
                // For Moxfield providers (ck, scg, etc.)
                const base = this.providers[providerKey]?.priceField || providerKey;
                if (isFoil) return [`${base}_foil`, base];
                return [base, `${base}_foil`];
        }
    }

    /**
     * Extract a price from a prices object for a given provider
     */
    getPriceForProvider(prices, providerKey, isFoil, isEtched) {
        const fields = this.getProviderPriceFields(providerKey, isFoil, isEtched);
        for (const f of fields) {
            if (prices && prices[f] !== undefined && prices[f] !== null) return { price: prices[f], field: f };
        }
        return { price: null, field: fields[fields.length - 1] };
    }

    /**
     * Fetch card price from API (Scryfall or Moxfield)
     */
    async fetchCardPrice(cardName, setCode = '', isFoil = false, isEtched = false, provider = 'tcgplayer', options = undefined) {
        // Handle options object if passed as 5th argument (legacy support)
        if (typeof provider === 'object') {
            options = provider;
            provider = options.provider || 'tcgplayer';
        }

        // Default to tcgplayer if provider is unknown
        if (!this.providers[provider]) {
            provider = 'tcgplayer';
        }

        const fallbackEnabled = options && Object.prototype.hasOwnProperty.call(options, 'fallback')
            ? !!options.fallback
            : !!this.fallbackEnabled;
        const providerKey = provider + (fallbackEnabled ? ':fb' : '');
        const cacheKey = this.getPriceCacheKey(cardName, setCode, isFoil, isEtched, providerKey);

        if (this.priceCache.has(cacheKey)) {
            return this.priceCache.get(cacheKey);
        }

        // Determine which API to use
        const scryfallProviders = ['tcgplayer', 'cardmarket', 'cardhoarder'];
        const isScryfall = scryfallProviders.includes(provider);

        try {
            if (isScryfall) {
                return await this.fetchScryfallPrice(cardName, setCode, isFoil, isEtched, provider, fallbackEnabled, cacheKey);
            } else {
                return await this.fetchMoxfieldPrice(cardName, setCode, isFoil, isEtched, provider, fallbackEnabled, cacheKey);
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
     * Fetch price from Scryfall
     */
    async fetchScryfallPrice(cardName, setCode, isFoil, isEtched, provider, fallbackEnabled, cacheKey) {
        let searchQuery = cardName;
        if (setCode) {
            searchQuery += ` set:${setCode}`;
        }

        const response = await fetch(`${this.scryfallUrl}/cards/search?q=${encodeURIComponent(searchQuery)}`);

        if (!response.ok) {
            throw new Error(`Scryfall API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            throw new Error('Card not found');
        }

        // Find best match
        let bestMatch = data.data[0];
        if (setCode) {
            const exactMatch = data.data.find(c => c.set.toLowerCase() === setCode.toLowerCase());
            if (exactMatch) bestMatch = exactMatch;
        }

        return this.processPriceResult(bestMatch, bestMatch.prices, provider, fallbackEnabled, cacheKey, isFoil, isEtched);
    }

    /**
     * Fetch price from Moxfield
     * Note: Moxfield API blocks CORS, so this will only work with a local proxy or browser extension
     */
    async fetchMoxfieldPrice(cardName, setCode, isFoil, isEtched, provider, fallbackEnabled, cacheKey) {
        const moxfieldApiUrl = `${this.moxfieldUrl}/cards/search?q=${encodeURIComponent(cardName)}`;

        try {
            const response = await fetch(moxfieldApiUrl);

            if (!response.ok) {
                throw new Error(`Moxfield API error: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.data || data.data.length === 0) {
                throw new Error('Card not found');
            }

            // Find exact match for name and set
            let bestMatch = data.data.find(c => c.name.toLowerCase() === cardName.toLowerCase());

            if (!bestMatch) {
                bestMatch = data.data[0];
            }

            if (setCode) {
                const setMatch = data.data.find(c =>
                    c.name.toLowerCase() === cardName.toLowerCase() &&
                    c.set.toLowerCase() === setCode.toLowerCase()
                );
                if (setMatch) bestMatch = setMatch;
            }

            return this.processPriceResult(bestMatch, bestMatch.prices, provider, fallbackEnabled, cacheKey, isFoil, isEtched);
        } catch (error) {
            // If CORS blocks it, throw an error that will be caught by the caller
            if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
                throw new Error('Moxfield price unavailable (CORS blocked). Try TCGPlayer, Cardmarket, or Cardhoarder instead.');
            }
            throw error;
        }
    }

    /**
     * Process the price result and handle fallbacks
     */
    processPriceResult(cardData, prices, primaryProvider, fallbackEnabled, cacheKey, isFoil, isEtched) {
        const primaryConfig = this.providers[primaryProvider];

        if (fallbackEnabled) {
            // Try primary, then fallbacks
            const availableProviders = Object.keys(this.providers);
            const order = [primaryProvider, ...availableProviders.filter(p => p !== primaryProvider)];

            let final = null;
            for (const key of order) {
                const conf = this.providers[key];
                const { price: p } = this.getPriceForProvider(prices, key, isFoil, isEtched);
                if (p !== null) {
                    final = {
                        price: p,
                        cardName: cardData.name,
                        setCode: cardData.set,
                        provider: conf.name,
                        currency: conf.currency,
                        isFallback: key !== primaryProvider,
                        fallbackReason: key !== primaryProvider ? `Missing price for selected provider; used ${conf.name}` : ''
                    };
                    break;
                }
            }

            if (!final) {
                final = {
                    price: null,
                    error: 'Price not available',
                    cardName: cardData.name,
                    provider: primaryConfig.name
                };
            }

            this.priceCache.set(cacheKey, final);
            return final;
        } else {
            const { price: p } = this.getPriceForProvider(prices, primaryProvider, isFoil, isEtched);

            const result = {
                price: p,
                cardName: cardData.name,
                setCode: cardData.set,
                provider: primaryConfig.name,
                currency: primaryConfig.currency,
                isFallback: false,
                fallbackReason: ''
            };

            this.priceCache.set(cacheKey, result);
            return result;
        }
    }

    /**
     * Update card price in the UI (Legacy helper)
     */
    updateCardPrice(cardElement, { price } = {}, _type) {
        if (!cardElement) return;
        const priceElement = cardElement.querySelector('.card-price');
        if (!priceElement) return;
        if (price === undefined) return;

        if (price) {
            priceElement.textContent = `$${price}`;
            priceElement.classList.add('has-price');
        } else {
            priceElement.textContent = 'Price not available';
            priceElement.classList.remove('has-price');
        }
    }

    clearCache() {
        this.priceCache.clear();
    }
}
