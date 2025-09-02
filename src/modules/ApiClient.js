/**
 * API Client Module
 * Handles all API interactions with Moxfield and Scryfall
 */
export class ApiClient {
    constructor() {
        this.baseUrl = 'https://api2.moxfield.com';
        this.scryfallUrl = 'https://api.scryfall.com';
        this.debug = false;
    }

    /**
     * Extract deck ID from various Moxfield URL formats
     * @param {string} url - The URL to extract from
     * @returns {Object|null} - Object with type and id, or null if invalid
     */
    extractDeckId(url) {
        const patterns = [
            /\/decks\/([a-zA-Z0-9_-]+)(?:\/|$)/,
            /\/deck\/([a-zA-Z0-9_-]+)(?:\/|$)/,
            /\/v2\/decks\/all\/([a-zA-Z0-9_-]+)(?:\/|$)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return { type: 'deck', id: match[1] };
            }
        }

        return null;
    }

    /**
     * Extract collection ID from various Moxfield URL formats
     * @param {string} url - The URL to extract from
     * @returns {Object|null} - Object with type and id, or null if invalid
     */
    extractCollectionId(url) {
        const patterns = [
            /\/collection\/([a-zA-Z0-9_-]+)(?:\/|$)/,
            /\/v1\/collections\/search\/([a-zA-Z0-9_-]+)(?:\/|$)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return { type: 'collection', id: match[1] };
            }
        }

        return null;
    }

    /**
     * Extract binder ID from Moxfield URL
     * @param {string} url - The URL to extract from
     * @returns {Object|null} - Object with type and id, or null if invalid
     */
    extractBinderId(url) {
        const patterns = [
            /\/binders\/([a-zA-Z0-9_-]+)(?:\/|$)/,
            /\/v1\/trade-binders\/([a-zA-Z0-9_-]+)(?:\/|$)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return { type: 'binder', id: match[1] };
            }
        }

        return null;
    }

    /**
     * Load data from a URL by determining the type and calling appropriate method
     * @param {string} url - The URL to load from
     * @param {string} type - The type of data (wishlist/collection)
     * @returns {Promise<string>} - The loaded card data
     */
    async loadFromUrl(url, type) {
        if (!url.trim()) {
            alert('Please enter a Moxfield URL');
            return '';
        }

        // Try to extract different types of IDs
        const deckInfo = this.extractDeckId(url);
        const collectionInfo = this.extractCollectionId(url);
        const binderInfo = this.extractBinderId(url);

        if (deckInfo) {
            return await this.loadFromDeck(deckInfo.id, type);
        } else if (collectionInfo) {
            return await this.loadFromCollection(collectionInfo.id, type);
        } else if (binderInfo) {
            return await this.loadFromBinder(binderInfo.id, type);
        } else {
            alert('Invalid Moxfield URL format');
            return '';
        }
    }

    /**
     * Load deck data from Moxfield API
     * @param {string} deckId - The deck ID
     * @param {string} type - The type of data
     * @returns {Promise<string|Object>} - The loaded card data or object with API URL
     */
    async loadFromDeck(deckId, type) {
        const apiUrl = `${this.baseUrl}/v2/decks/all/${deckId}`;
        return await this.loadFromApiUrl(apiUrl, type);
    }

    /**
     * Load collection data from Moxfield API with pagination
     * @param {string} collectionId - The collection ID
     * @param {string} type - The type of data
     * @returns {Promise<string|Object>} - The loaded card data or object with API URL
     */
    async loadFromCollection(collectionId, type) {
        const allCards = [];
        let pageNumber = 1;
        const pageSize = 50;
        
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const apiUrl = `${this.baseUrl}/v1/collections/search/${collectionId}?pageNumber=${pageNumber}&pageSize=${pageSize}&sortType=cardName&sortDirection=ascending`;
            
            try {
                const data = await this.loadFromApiUrl(apiUrl, type);
                
                // Handle new return format
                if (typeof data === 'object' && data.apiUrl) {
                    // CORS failed, return the object with API URL
                    return data;
                }
                
                if (data && data.trim()) {
                    allCards.push(data);
                    pageNumber++;
                    
                    // Safety check to prevent infinite loops
                    if (pageNumber > 100) {
                        break;
                    }
                } else {
                    break; // No more data
                }
            } catch (error) {
                break;
            }
        }
        
        return allCards.join('\n');
    }

    /**
     * Fetch data from API URL and parse, with CORS-friendly fallback
     * @param {string} apiUrl - The API URL to fetch
     * @param {string} type - The type of data (wishlist/collection)
     * @returns {Promise<string|Object>} - Parsed card list string, or an object with { apiUrl, cards: '' } when manual input is needed
     */
    async loadFromApiUrl(apiUrl, type) {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                // Defer to manual flow when response not OK (e.g., CORS)
                return { apiUrl, cards: '' };
            }
            const data = await response.json();
            return this.parseApiResponse(data, type);
        } catch (_err) {
            // Likely CORS/network error in browser; allow manual paste flow
            return { apiUrl, cards: '' };
        }
    }

    /**
     * Load binder data from Moxfield API with pagination
     * @param {string} binderId - The binder ID
     * @param {string} type - The type of data
     * @returns {Promise<string|Object>} - The loaded card data or object with API URL
     */
    async loadFromBinder(binderId, type) {
        const allCards = [];
        let pageNumber = 1;
        const pageSize = 50;
        
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const apiUrl = `${this.baseUrl}/v1/trade-binders/${binderId}/search?pageNumber=${pageNumber}&pageSize=${pageSize}&playStyle=paperDollars&pricingProvider=cardkingdom&sortColumn=cardName&sortType=cardName&sortDirection=ascending&q=+&setId=&deckId=&game=&condition=&rarity=&isAlter=&isProxy=&finish=&cardLanguageId=&priceMinimum=&priceMaximum=`;
            
            try {
                const data = await this.loadFromApiUrl(apiUrl, type);
                
                // Handle new return format
                if (typeof data === 'object' && data.apiUrl) {
                    // CORS failed, return the object with API URL
                    return data;
                }
                
                if (data && data.trim()) {
                    allCards.push(data);
                    pageNumber++;
                    
                    // Safety check to prevent infinite loops
                    if (pageNumber > 100) {
                        break;
                    }
                } else {
                    break; // No more data
                }
            } catch (error) {
                break;
            }
        }
        
        return allCards.join('\n');
    }

    /**
     * Load data from a specific API URL
     * @param {string} apiUrl - The API URL to fetch from
     * @param {string} type - The type of data
     * @returns {Promise<string>} - The loaded card data
     */
    async loadFromApiUrl(apiUrl, type) {
        try {
            // eslint-disable-next-line no-console
            console.log('Making API request to:', apiUrl);
            
            // Try direct fetch first
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (compatible; MTGCardComparator/1.0)'
                }
            });
            
            if (!response.ok) {
                // eslint-disable-next-line no-console
                console.error('API request failed:', response.status, response.statusText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            // eslint-disable-next-line no-console
            console.log('API response received:', data);
            return this.parseApiResponse(data, type);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error loading from API:', error);
            
            // If it's a CORS error, try the local proxy
            if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
                // eslint-disable-next-line no-console
                console.log('CORS error detected, trying local proxy...');
                
                try {
                    const proxyUrl = `http://localhost:3001/${apiUrl}`;
                    // eslint-disable-next-line no-console
                    console.log('Trying proxy URL:', proxyUrl);
                    
                    const proxyResponse = await fetch(proxyUrl, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json'
                        }
                    });
                    
                    if (!proxyResponse.ok) {
                        throw new Error(`Proxy request failed: HTTP ${proxyResponse.status}`);
                    }
                    
                    const data = await proxyResponse.json();
                    // eslint-disable-next-line no-console
                    console.log('Proxy API response received:', data);
                    return this.parseApiResponse(data, type);
                } catch (proxyError) {
                    // eslint-disable-next-line no-console
                    console.error('Proxy also failed:', proxyError);
                    
                    // Return object with API URL and empty string to trigger manual input dialog
                    // eslint-disable-next-line no-console
                    console.log('CORS and proxy failed, returning API URL for manual input');
                    return { apiUrl, cards: '' };
                }
            }
            
            // For other errors, still throw them
            throw error;
        }
    }

    /**
     * Parse manually input API response data
     * @param {string} jsonData - The JSON string from API response
     * @param {string} type - The type of data
     * @returns {string} - The parsed card data
     */
    parseManualApiResponse(jsonData, type) {
        try {
            const data = JSON.parse(jsonData);
            return this.parseApiResponse(data, type);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error parsing manual API response:', error);
            throw new Error('Invalid JSON data provided');
        }
    }

    /**
     * Parse API response and convert to card list format
     * @param {Object} data - The API response data
     * @param {string} _type - The type of data (unused)
     * @returns {string} - The parsed card list
     */
    parseApiResponse(data, _type) {
        try {
            if (this.debug) {
                // eslint-disable-next-line no-console
                console.log('parseApiResponse called with data:', data);
                // eslint-disable-next-line no-console
                console.log('Data type:', typeof data);
                // eslint-disable-next-line no-console
                console.log('Data keys:', Object.keys(data || {}));
            }
            
            let deckList = '';
            
            // Handle different API response formats
            if (data.mainboard) {
                const mainboardArray = Array.isArray(data.mainboard) ? data.mainboard : Object.values(data.mainboard);
                const lines = mainboardArray.map(c => this.buildCardLine(this.normalizeCard(c)) ).sort();
                deckList += `${lines.join('\n')}\n`;
            } else if (data.cards && Array.isArray(data.cards)) {
                const lines = data.cards.map(c => this.buildCardLine(this.normalizeCard(c)) ).sort();
                deckList += `${lines.join('\n')}\n`;
            } else if (data.data && Array.isArray(data.data)) {
                const lines = data.data.map(c => this.buildCardLine(this.normalizeCard(c)) ).sort();
                deckList += `${lines.join('\n')}\n`;
            } else if (typeof data === 'string') {
                // Direct text format
                deckList = data;
            } else {
                // Try to find cards in the response structure
                const cards = this.findCardsInResponse(data);
                cards.forEach(card => {
                    deckList += `${card.quantity} ${card.name} (${card.set}) ${card.number}${card.foil ? ' *F*' : ''}\n`;
                });
            }
            
            if (this.debug) {
                // eslint-disable-next-line no-console
                console.log('Final deckList:', deckList);
            }
            return deckList.trim();
            
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error parsing API response:', error);
            // eslint-disable-next-line no-console
            console.error('Data that caused error:', data);
            throw new Error('Failed to parse deck data from API response');
        }
    }

    /**
     * Find cards in API response data
     * @param {Object} data - The API response data
     * @returns {Array} - Array of card objects
     */
    findCardsInResponse(data) {
        if (!data || typeof data !== 'object') {
            return [];
        }

        try {
            // Handle different response formats
            if (data.cards) {
                // Binder format - check if cards is an array
                const cardsArray = Array.isArray(data.cards) ? data.cards : Object.values(data.cards);
                return cardsArray.map(card => ({
                    quantity: card.quantity || 1,
                    name: card.card?.name || card.name,
                    set: card.card?.set || card.set || '',
                    number: card.card?.number || card.number || '',
                    foil: this.isFoil(card),
                    etched: this.isEtched(card)
                }));
            } else if (data.mainboard) {
                // Deck format - check if mainboard is an array
                const mainboardArray = Array.isArray(data.mainboard) ? data.mainboard : Object.values(data.mainboard);
                return mainboardArray.map(card => ({
                    quantity: card.quantity || 1,
                    name: card.card?.name || card.name,
                    set: card.card?.set || card.set || '',
                    number: card.card?.number || card.number || '',
                    foil: this.isFoil(card),
                    etched: this.isEtched(card)
                }));
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error in findCardsInResponse:', error);
        }

        return [];
    }

    /**
     * Check if a card is foil
     * @param {Object} card - The card object
     * @returns {boolean} - True if the card is foil
     */
    isFoil(card) {
        return card.card?.isFoil || 
               card.card?.finish === 'foil' || 
               card.card?.finish === 'foil-etched' ||
               card.isFoil ||
               false;
    }

    /**
     * Check if a card is etched
     * @param {Object} card - The card object
     * @returns {boolean} - True if the card is etched
     */
    isEtched(card) {
        return card.card?.finish === 'etched' || 
               card.card?.finish === 'foil-etched' ||
               card.card?.etched === true ||
               card.isEtched ||
               false;
    }

    /**
     * Normalize card-like objects from different API shapes to a common shape
     * @param {Object} raw - Raw card entry possibly with nested `card`
     * @returns {{quantity:number,name:string,set:string,number:string,isFoil:boolean,isEtched:boolean}}
     */
    normalizeCard(raw) {
        const base = raw.card || raw;
        const quantity = raw.quantity || 1;
        const name = base?.name || raw.name || '';
        const set = (base?.set || raw.set || '').toUpperCase();
        const number = base?.cn || base?.number || base?.collector_number || raw.number || '';
        const isFoil = this.isFoil(raw);
        const isEtched = this.isEtched(raw);
        return { quantity, name, set, number, isFoil, isEtched };
    }

    /**
     * Build a consistent card line string from normalized fields
     * @param {Object} c - Normalized card fields
     * @returns {string}
     */
    buildCardLine(c) {
        let line = `${c.quantity} ${c.name} (${c.set})`;
        if (c.number) line += ` ${c.number}`;
        if (c.isEtched) line += ' *E*';
        else if (c.isFoil) line += ' *F*';
        return line;
    }
}
