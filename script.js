class MTGCardComparator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.wishlistTextarea = document.getElementById('wishlist');
        this.collectionTextarea = document.getElementById('collection');
        this.wishlistUrlInput = document.getElementById('wishlistUrl');
        this.collectionUrlInput = document.getElementById('collectionUrl');
        this.loadWishlistBtn = document.getElementById('loadWishlistBtn');
        this.loadCollectionBtn = document.getElementById('loadCollectionBtn');
        this.ignoreEditionCheckbox = document.getElementById('ignoreEdition');
        this.ignoreWishlistSideboardCheckbox = document.getElementById('ignoreWishlistSideboard');
        this.ignoreCollectionSideboardCheckbox = document.getElementById('ignoreCollectionSideboard');
        this.searchBtn = document.getElementById('searchBtn');
        this.resultsSection = document.getElementById('resultsSection');
        this.feedbackSection = document.getElementById('feedbackSection');
        
        // Stats elements
        this.totalWishlistEl = document.getElementById('totalWishlist');
        this.totalCollectionEl = document.getElementById('totalCollection');
        this.matchesFoundEl = document.getElementById('matchesFound');
        
        // Tab elements
        this.matchesCountEl = document.getElementById('matchesCount');
        this.missingCountEl = document.getElementById('missingCount');
        this.matchesListEl = document.getElementById('matchesList');
        this.missingListEl = document.getElementById('missingList');
        
        // Tab buttons
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // Input tab buttons
        this.inputTabButtons = document.querySelectorAll('.input-tab-btn');
        this.inputContents = document.querySelectorAll('.input-content');
        
        // Feedback elements
        this.wishlistErrorCountEl = document.getElementById('wishlistErrorCount');
        this.collectionErrorCountEl = document.getElementById('collectionErrorCount');
        this.wishlistErrorListEl = document.getElementById('wishlistErrorList');
        this.collectionErrorListEl = document.getElementById('collectionErrorList');
        this.wishlistParsedEl = document.getElementById('wishlistParsed');
        this.collectionParsedEl = document.getElementById('collectionParsed');
        this.feedbackTabButtons = document.querySelectorAll('.feedback-tab-btn');
        this.feedbackContents = document.querySelectorAll('.feedback-content');
    }

    bindEvents() {
        this.searchBtn.addEventListener('click', () => this.performSearch());
        
        // Tab switching
        this.tabButtons.forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Input tab switching
        this.inputTabButtons.forEach(button => {
            button.addEventListener('click', (e) => this.switchInputTab(e.target.dataset.inputTab));
        });
        
        // Feedback tab switching
        this.feedbackTabButtons.forEach(button => {
            button.addEventListener('click', (e) => this.switchFeedbackTab(e.target.dataset.feedbackTab));
        });
        
        // URL loading
        this.loadWishlistBtn.addEventListener('click', () => this.loadFromUrl('wishlist'));
        this.loadCollectionBtn.addEventListener('click', () => this.loadFromUrl('collection'));
    }

    parseCardLine(line) {
        // Remove extra whitespace and skip empty lines
        line = line.trim();
        if (!line) return null;

        // Parse card line with optional quantity and set code
        // Supported formats:
        // "1 Aether Channeler (DMU) 42 *F*" - full format
        // "Aether Channeler (DMU) 42 *F*" - no quantity (assume 1)
        // "1 Aether Channeler 42 *F*" - no set code
        // "Aether Channeler 42 *F*" - no quantity, no set code
        // "1 Aether Channeler (DMU) *F*" - no number
        // "Aether Channeler (DMU) *F*" - no quantity, no number
        // "1 Aether Channeler" - just quantity and name
        // "Aether Channeler" - just name (assume quantity 1)

        // Try full format first: "1 Aether Channeler (DMU) 42 *F*"
        let regex = /^(\d+)\s+([^(]+?)\s*\(([^)]+)\)\s*([A-Z0-9\-]+[a-z]*)\s*(\*[A-Z]\*)?$/;
        let match = line.match(regex);
        
        if (match) {
            return {
                quantity: parseInt(match[1]),
                name: match[2].trim(),
                set: match[3].trim(),
                number: match[4],
                foil: !!match[5]
            };
        }

        // Try format without quantity: "Aether Channeler (DMU) 42 *F*"
        regex = /^([^(]+?)\s*\(([^)]+)\)\s*([A-Z0-9\-]+[a-z]*)\s*(\*[A-Z]\*)?$/;
        match = line.match(regex);
        
        if (match) {
            return {
                quantity: 1, // Default quantity
                name: match[1].trim(),
                set: match[2].trim(),
                number: match[3],
                foil: !!match[4]
            };
        }

        // Try format without set code: "1 Aether Channeler 42 *F*"
        regex = /^(\d+)\s+([A-Z0-9\-]+[a-z]*)\s*(\*[A-Z]\*)?$/;
        match = line.match(regex);
        
        if (match) {
            return {
                quantity: parseInt(match[1]),
                name: match[2].trim(),
                set: '', // No set code
                number: match[3] || '',
                foil: !!match[4]
            };
        }

        // Try format without quantity and set code: "Aether Channeler 42 *F*"
        regex = /^([A-Z0-9\-]+[a-z]*)\s*(\*[A-Z]\*)?$/;
        match = line.match(regex);
        
        if (match) {
            return {
                quantity: 1, // Default quantity
                name: match[1].trim(),
                set: '', // No set code
                number: match[2] || '',
                foil: !!match[3]
            };
        }

        // Try format with set code but no number: "1 Aether Channeler (DMU) *F*"
        regex = /^(\d+)\s+([^(]+?)\s*\(([^)]+)\)\s*(\*[A-Z]\*)?$/;
        match = line.match(regex);
        
        if (match) {
            return {
                quantity: parseInt(match[1]),
                name: match[2].trim(),
                set: match[3].trim(),
                number: '', // No number
                foil: !!match[4]
            };
        }

        // Try format without quantity, set code, and number: "Aether Channeler (DMU) *F*"
        regex = /^([^(]+?)\s*\(([^)]+)\)\s*(\*[A-Z]\*)?$/;
        match = line.match(regex);
        
        if (match) {
            return {
                quantity: 1, // Default quantity
                name: match[1].trim(),
                set: match[2].trim(),
                number: '', // No number
                foil: !!match[3]
            };
        }

        // Try format with just quantity and name: "1 Aether Channeler"
        regex = /^(\d+)\s+(.+)$/;
        match = line.match(regex);
        
        if (match) {
            return {
                quantity: parseInt(match[1]),
                name: match[2].trim(),
                set: '', // No set code
                number: '', // No number
                foil: false
            };
        }

        // Try format with just name: "Aether Channeler"
        regex = /^(.+)$/;
        match = line.match(regex);
        
        if (match) {
            return {
                quantity: 1, // Default quantity
                name: match[1].trim(),
                set: '', // No set code
                number: '', // No number
                foil: false
            };
        }

        return null;
    }

    parseCardList(text, ignoreSideboard = true) {
        const lines = text.split('\n');
        const cards = [];
        const errors = [];
        let sideboardMode = false;

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            
            // Check for sideboard header
            if (trimmedLine.toUpperCase() === 'SIDEBOARD:') {
                sideboardMode = true;
                return; // Skip the sideboard header line
            }
            
            // Skip empty lines
            if (!trimmedLine) {
                return;
            }
            
            // Skip everything after sideboard header if ignoreSideboard is true
            if (sideboardMode && ignoreSideboard) {
                return;
            }
            
            const card = this.parseCardLine(trimmedLine);
            if (card) {
                cards.push(card);
            } else {
                // Only add to errors if it's not a sideboard header
                if (!trimmedLine.toUpperCase().includes('SIDEBOARD:')) {
                    errors.push(`Line ${index + 1}: "${trimmedLine}"`);
                }
            }
        });

        // Debug logging
        console.log(`Parsed ${cards.length} cards, ${errors.length} errors`);
        if (errors.length > 0) {
            console.log('Failed lines:', errors);
        }
        
        // Additional debugging: log first few successful parses
        if (cards.length > 0) {
            console.log('First 5 successful parses:', cards.slice(0, 5));
        }

        return { cards, errors };
    }

    createCardKey(card, ignoreEdition = false) {
        if (ignoreEdition) {
            return card.name.toLowerCase();
        }
        // Normalize the foil indicator to just true/false for matching
        const foilIndicator = card.foil ? 'foil' : 'nonfoil';
        // Handle empty set and number fields
        const set = card.set || 'unknown';
        const number = card.number || 'unknown';
        return `${card.name.toLowerCase()}-${set.toLowerCase()}-${number}-${foilIndicator}`;
    }

    performSearch() {
        const wishlistText = this.wishlistTextarea.value;
        const collectionText = this.collectionTextarea.value;
        const ignoreEdition = this.ignoreEditionCheckbox.checked;
        const ignoreWishlistSideboard = this.ignoreWishlistSideboardCheckbox.checked;
        const ignoreCollectionSideboard = this.ignoreCollectionSideboardCheckbox.checked;

        if (!wishlistText.trim() && !collectionText.trim()) {
            alert('Please enter at least one card list to compare.');
            return;
        }

        // Parse both lists
        const wishlistResult = this.parseCardList(wishlistText, ignoreWishlistSideboard);
        const collectionResult = this.parseCardList(collectionText, ignoreCollectionSideboard);

        // Display feedback for parsing errors
        this.displayFeedback(wishlistResult.errors, collectionResult.errors, wishlistResult.cards, collectionResult.cards);

        // Create lookup maps
        const wishlistMap = new Map();
        const collectionMap = new Map();

        wishlistResult.cards.forEach(card => {
            const key = this.createCardKey(card, ignoreEdition);
            if (wishlistMap.has(key)) {
                wishlistMap.get(key).quantity += card.quantity;
            } else {
                wishlistMap.set(key, { ...card });
            }
        });

        collectionResult.cards.forEach(card => {
            const key = this.createCardKey(card, ignoreEdition);
            if (collectionMap.has(key)) {
                collectionMap.get(key).quantity += card.quantity;
            } else {
                collectionMap.set(key, { ...card });
            }
        });

        // Find matches and missing cards
        const matches = [];
        const missing = [];

        wishlistMap.forEach((wishlistCard, key) => {
            const collectionCard = collectionMap.get(key);
            
            if (collectionCard) {
                // Card found in collection
                const matchQuantity = Math.min(wishlistCard.quantity, collectionCard.quantity);
                matches.push({
                    wishlist: wishlistCard,
                    collection: collectionCard,
                    matchQuantity: matchQuantity,
                    key: key
                });
                
                // If wishlist quantity is more than collection, add to missing
                if (wishlistCard.quantity > collectionCard.quantity) {
                    const missingQuantity = wishlistCard.quantity - collectionCard.quantity;
                    missing.push({
                        ...wishlistCard,
                        quantity: missingQuantity,
                        needed: missingQuantity
                    });
                }
            } else {
                // Card not found in collection - check for partial matches
                let partialMatches = [];
                if (!ignoreEdition) {
                    // Look for cards with the same name but different edition
                    collectionMap.forEach((collectionCard, collectionKey) => {
                        if (collectionCard.name.toLowerCase() === wishlistCard.name.toLowerCase()) {
                            partialMatches.push(collectionCard);
                        }
                    });
                }
                
                missing.push({
                    ...wishlistCard,
                    needed: wishlistCard.quantity,
                    partialMatches: partialMatches
                });
            }
        });

        this.displayResults(wishlistResult.cards, collectionResult.cards, matches, missing);
    }

    displayResults(wishlistCards, collectionCards, matches, missing) {
        // Update stats
        this.totalWishlistEl.textContent = wishlistCards.length;
        this.totalCollectionEl.textContent = collectionCards.length;
        this.matchesFoundEl.textContent = matches.length;

        // Update tab counts
        this.matchesCountEl.textContent = matches.length;
        this.missingCountEl.textContent = missing.length;

        // Display matches
        this.displayCardList(this.matchesListEl, matches, 'match');
        
        // Display missing cards
        this.displayCardList(this.missingListEl, missing, 'missing');

        // Show results section
        this.resultsSection.style.display = 'block';
        
        // Scroll to results
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    displayCardList(container, cards, type) {
        container.innerHTML = '';

        if (cards.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <p>No ${type === 'match' ? 'matches' : 'missing cards'} found</p>
                <p>${type === 'match' ? 'Try adding more cards to your collection' : 'All cards from your wishlist are in your collection!'}</p>
            `;
            container.appendChild(emptyState);
            return;
        }

        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card-item';

            let cardInfo, quantity;

            if (type === 'match') {
                cardInfo = `
                    <div class="card-info">
                        <div class="card-name">${card.wishlist.name}</div>
                        <div class="card-details">
                            ${card.wishlist.set ? `(${card.wishlist.set})` : ''} ${card.wishlist.number || ''} 
                            ${card.wishlist.foil ? '<span class="foil-badge">Foil</span>' : ''}
                            <br>
                            <small>Wishlist: ${card.wishlist.quantity} | Collection: ${card.collection.quantity}</small>
                        </div>
                    </div>
                `;
                quantity = card.matchQuantity;
            } else {
                // Check for partial matches
                let partialMatchInfo = '';
                if (card.partialMatches && card.partialMatches.length > 0) {
                    const partialMatch = card.partialMatches[0]; // Show first partial match
                    partialMatchInfo = `
                        <div class="partial-match">
                            <small>Similar card in collection: ${partialMatch.set ? `(${partialMatch.set})` : ''} ${partialMatch.number || ''} ${partialMatch.foil ? '<span class="foil-badge">Foil</span>' : ''}</small>
                        </div>
                    `;
                }
                
                cardInfo = `
                    <div class="card-info">
                        <div class="card-name">${card.name}</div>
                        <div class="card-details">
                            ${card.set ? `(${card.set})` : ''} ${card.number || ''} 
                            ${card.foil ? '<span class="foil-badge">Foil</span>' : ''}
                        </div>
                        ${partialMatchInfo}
                    </div>
                `;
                quantity = card.needed;
            }

            cardElement.innerHTML = `
                ${cardInfo}
                <div class="card-quantity">${quantity}</div>
            `;

            container.appendChild(cardElement);
        });
    }

    displayFeedback(wishlistErrors, collectionErrors, wishlistCards, collectionCards) {
        // Update parsing stats
        this.wishlistParsedEl.textContent = wishlistCards.length;
        this.collectionParsedEl.textContent = collectionCards.length;
        
        // Update error counts
        this.wishlistErrorCountEl.textContent = wishlistErrors.length;
        this.collectionErrorCountEl.textContent = collectionErrors.length;

        // Display wishlist errors
        this.displayErrorList(this.wishlistErrorListEl, wishlistErrors, 'wishlist');
        
        // Display collection errors
        this.displayErrorList(this.collectionErrorListEl, collectionErrors, 'collection');

        // Show feedback section only if there are any errors
        if (wishlistErrors.length > 0 || collectionErrors.length > 0) {
            this.feedbackSection.style.display = 'block';
            this.feedbackSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            this.feedbackSection.style.display = 'none';
        }
    }

    displayErrorList(container, errors, type) {
        container.innerHTML = '';

        if (errors.length === 0) {
            const noErrors = document.createElement('div');
            noErrors.className = 'no-errors';
            noErrors.textContent = `No parsing errors found in ${type}`;
            container.appendChild(noErrors);
            return;
        }

        errors.forEach(error => {
            const errorElement = document.createElement('div');
            errorElement.className = 'error-item';
            
            // Extract the actual line from the error message
            const lineMatch = error.match(/Line \d+: "(.+)"/);
            const lineText = lineMatch ? lineMatch[1] : error;
            
            errorElement.innerHTML = `
                <div class="error-line">${lineText}</div>
                <div class="error-message">Invalid format</div>
            `;
            
            container.appendChild(errorElement);
        });
    }

    switchTab(tabName) {
        // Update active tab button
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update active tab content
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
        });
    }

    switchInputTab(tabName) {
        // Determine which group this tab belongs to (wishlist or collection)
        const isWishlist = tabName.startsWith('wishlist-');
        const isCollection = tabName.startsWith('collection-');
        
        // Update only the relevant input tab buttons
        this.inputTabButtons.forEach(btn => {
            const btnTabName = btn.dataset.inputTab;
            const btnIsWishlist = btnTabName.startsWith('wishlist-');
            const btnIsCollection = btnTabName.startsWith('collection-');
            
            // Only update buttons in the same group
            if ((isWishlist && btnIsWishlist) || (isCollection && btnIsCollection)) {
                btn.classList.toggle('active', btnTabName === tabName);
            }
        });

        // Update only the relevant input content
        this.inputContents.forEach(content => {
            // Map the tab names to the correct content IDs
            let targetId;
            if (tabName === 'wishlist-text') {
                targetId = 'wishlistTextTab';
            } else if (tabName === 'wishlist-url') {
                targetId = 'wishlistUrlTab';
            } else if (tabName === 'collection-text') {
                targetId = 'collectionTextTab';
            } else if (tabName === 'collection-url') {
                targetId = 'collectionUrlTab';
            }
            
            // Only update content in the same group
            const contentIsWishlist = content.id.startsWith('wishlist');
            const contentIsCollection = content.id.startsWith('collection');
            
            if ((isWishlist && contentIsWishlist) || (isCollection && contentIsCollection)) {
                content.classList.toggle('active', content.id === targetId);
            }
        });
    }

    switchFeedbackTab(tabName) {
        // Update active feedback tab button
        this.feedbackTabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.feedbackTab === tabName);
        });

        // Update active feedback content
        this.feedbackContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}FeedbackTab`);
        });
    }

    async loadFromUrl(type) {
        const urlInput = type === 'wishlist' ? this.wishlistUrlInput : this.collectionUrlInput;
        const loadBtn = type === 'wishlist' ? this.loadWishlistBtn : this.loadCollectionBtn;
        const textarea = type === 'wishlist' ? this.wishlistTextarea : this.collectionTextarea;
        
        const url = urlInput.value.trim();
        
        if (!url) {
            alert('Please enter a Moxfield URL');
            return;
        }
        
        // Show loading state
        loadBtn.disabled = true;
        loadBtn.classList.add('loading');
        loadBtn.textContent = 'Loading...';
        
        try {
            let deckData = null;
            
            // Check if it's a direct API URL
            if (url.includes('api2.moxfield.com')) {
                deckData = await this.loadFromApiUrl(url, type);
            } else {
                // Extract deck ID from regular Moxfield URL and use main deck API
                const deckId = this.extractDeckId(url);
                if (deckId) {
                    const apiUrl = `https://api2.moxfield.com/v2/decks/all/${deckId}`;
                    deckData = await this.loadFromApiUrl(apiUrl, type);
                } else {
                    throw new Error('Invalid Moxfield URL format');
                }
            }
            
            if (deckData && deckData.trim()) {
                textarea.value = deckData;
                // Switch to text tab to show the loaded data
                this.switchInputTab(`${type}-text`);
                
                // Show success message with card count (excluding SIDEBOARD: line)
                const cardCount = deckData.split('\n').filter(line => {
                    const trimmed = line.trim();
                    return trimmed && !trimmed.toUpperCase().includes('SIDEBOARD:');
                }).length;
                alert(`Deck data loaded successfully! Found ${cardCount} cards.`);
            } else {
                throw new Error('Could not extract deck data. The deck might be private or the API structure has changed.');
            }
            
        } catch (error) {
            console.error('Error loading deck:', error);
            const useManual = confirm(`Failed to load deck data: ${error.message}\n\nWould you like to switch to manual input mode instead?`);
            if (useManual) {
                this.switchInputTab(`${type}-text`);
            }
        } finally {
            // Reset loading state
            loadBtn.disabled = false;
            loadBtn.classList.remove('loading');
            loadBtn.textContent = 'Load from URL';
        }
    }
    
    extractDeckId(url) {
        // Extract deck ID from various Moxfield URL formats
        const patterns = [
            /moxfield\.com\/decks\/([a-zA-Z0-9_-]+)/,
            /moxfield\.com\/deck\/([a-zA-Z0-9_-]+)/,
            /api2\.moxfield\.com\/v2\/decks\/all\/([a-zA-Z0-9_-]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }
        
        return null;
    }
    

    
    async loadFromApiUrl(apiUrl, type) {
        // Try multiple CORS proxies that don't require activation
        const proxies = [
            `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`,
            `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`,
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(apiUrl)}`,
            `https://thingproxy.freeboard.io/fetch/${apiUrl}`
        ];
        
        let lastError = null;
        
        for (const proxyUrl of proxies) {
            try {
                const response = await fetch(proxyUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Proxy request failed with status ${response.status}`);
                }
                
                let data;
                if (proxyUrl.includes('allorigins.win')) {
                    const proxyData = await response.json();
                    data = JSON.parse(proxyData.contents);
                } else if (proxyUrl.includes('codetabs.com')) {
                    const proxyData = await response.json();
                    data = JSON.parse(proxyData.body);
                } else {
                    data = await response.json();
                }
                
                return this.parseApiResponse(data, type);
                
            } catch (error) {
                lastError = error;
                console.warn(`Proxy ${proxyUrl} failed:`, error);
                continue;
            }
        }
        
        // If all proxies failed, try a different approach - use a public API endpoint
        try {
            // Try using a public Moxfield API endpoint that might not have CORS restrictions
            const publicApiUrl = apiUrl.replace('api2.moxfield.com', 'api.moxfield.com');
            const response = await fetch(publicApiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                return this.parseApiResponse(data, type);
            }
        } catch (error) {
            console.warn('Public API attempt failed:', error);
        }
        
        // If all attempts failed
        throw new Error(`All proxy attempts failed: ${lastError?.message || 'Unknown error'}. Please try again later or use manual input.`);
    }
    
    parseApiResponse(data, type) {
        try {
            let deckList = '';
            
            // Debug: Log the first card structure to understand the API format
            if (data.mainboard && Object.keys(data.mainboard).length > 0) {
                const firstCardId = Object.keys(data.mainboard)[0];
                const firstCard = data.mainboard[firstCardId];
                console.log('First card structure:', firstCard);
                console.log('Card data:', firstCard.card);
                console.log('isFoil:', firstCard.card.isFoil);
                console.log('finish:', firstCard.card.finish);
            }
            
            // Check if we should ignore sideboard based on the checkbox
            const ignoreSideboard = type === 'wishlist' ? 
                this.ignoreWishlistSideboardCheckbox.checked : 
                this.ignoreCollectionSideboardCheckbox.checked;
            
            // Handle different API response formats
            if (data.mainboard) {
                // Mainboard cards from main deck API
                const mainboardCards = [];
                
                Object.entries(data.mainboard).forEach(([cardId, cardData]) => {
                    const quantity = cardData.quantity || 1;
                    const name = cardData.card.name;
                    const set = (cardData.card.set || '').toUpperCase();
                    const number = cardData.card.cn || cardData.card.number || cardData.card.collector_number || '';
                    
                    // Enhanced foil detection - check multiple possible fields
                    const isFoil = cardData.card.isFoil || 
                                 cardData.card.finish === 'foil' || 
                                 cardData.card.finish === 'foil-etched' ||
                                 cardData.isFoil ||
                                 false;
                    
                    // Enhanced etched detection - check both finish field and etched boolean
                    const isEtched = cardData.card.finish === 'etched' || 
                                   cardData.card.finish === 'foil-etched' ||
                                   cardData.card.etched === true ||
                                   cardData.isEtched ||
                                   false;
                    
                    let cardLine = `${quantity} ${name} (${set})`;
                    if (number) {
                        cardLine += ` ${number}`;
                    }
                    if (isEtched) {
                        cardLine += ' *E*';
                    } else if (isFoil) {
                        cardLine += ' *F*';
                    }
                    mainboardCards.push(cardLine);
                });
                
                // Sort mainboard cards alphabetically
                mainboardCards.sort();
                deckList += mainboardCards.join('\n') + '\n';
            }
            
            // Add sideboard cards if not ignoring sideboard
            if (!ignoreSideboard && data.sideboard) {
                // Add a separator line
                deckList += '\nSIDEBOARD:\n';
                
                // Sideboard cards
                const sideboardCards = [];
                
                Object.entries(data.sideboard).forEach(([cardId, cardData]) => {
                    const quantity = cardData.quantity || 1;
                    const name = cardData.card.name;
                    const set = (cardData.card.set || '').toUpperCase();
                    const number = cardData.card.cn || cardData.card.number || cardData.card.collector_number || '';
                    
                    // Enhanced foil detection - check multiple possible fields
                    const isFoil = cardData.card.isFoil || 
                                 cardData.card.finish === 'foil' || 
                                 cardData.card.finish === 'foil-etched' ||
                                 cardData.isFoil ||
                                 false;
                    
                    // Enhanced etched detection - check both finish field and etched boolean
                    const isEtched = cardData.card.finish === 'etched' || 
                                   cardData.card.finish === 'foil-etched' ||
                                   cardData.card.etched === true ||
                                   cardData.isEtched ||
                                   false;
                    
                    let cardLine = `${quantity} ${name} (${set})`;
                    if (number) {
                        cardLine += ` ${number}`;
                    }
                    if (isEtched) {
                        cardLine += ' *E*';
                    } else if (isFoil) {
                        cardLine += ' *F*';
                    }
                    sideboardCards.push(cardLine);
                });
                
                // Sort sideboard cards alphabetically
                sideboardCards.sort();
                deckList += sideboardCards.join('\n') + '\n';
            } else if (data.cards) {
                // Alternative format with cards array
                const cards = [];
                
                data.cards.forEach(card => {
                    const quantity = card.quantity || 1;
                    const name = card.name;
                    const set = (card.set || '').toUpperCase();
                    const number = card.cn || card.number || card.collector_number || '';
                    
                    // Enhanced foil detection - check multiple possible fields
                    const isFoil = card.isFoil || 
                                 card.finish === 'foil' || 
                                 card.finish === 'foil-etched' ||
                                 false;
                    
                    // Enhanced etched detection - check both finish field and etched boolean
                    const isEtched = card.finish === 'etched' || 
                                   card.finish === 'foil-etched' ||
                                   card.etched === true ||
                                   false;
                    
                    let cardLine = `${quantity} ${name} (${set})`;
                    if (number) {
                        cardLine += ` ${number}`;
                    }
                    if (isEtched) {
                        cardLine += ' *E*';
                    } else if (isFoil) {
                        cardLine += ' *F*';
                    }
                    cards.push(cardLine);
                });
                
                // Sort cards alphabetically
                cards.sort();
                deckList += cards.join('\n') + '\n';
            } else if (typeof data === 'string') {
                // Direct text format
                deckList = data;
            } else {
                // Try to find cards in the response structure
                const cards = this.findCardsInResponse(data);
                cards.forEach(card => {
                    deckList += `${card.quantity} ${card.name} (${card.set}) ${card.number}${card.isFoil ? ' *F*' : ''}\n`;
                });
            }
            
            return deckList.trim();
            
        } catch (error) {
            console.error('Error parsing API response:', error);
            throw new Error('Failed to parse deck data from API response');
        }
    }
    
    findCardsInResponse(data, path = '') {
        const cards = [];
        
        if (typeof data === 'object' && data !== null) {
            for (const [key, value] of Object.entries(data)) {
                const currentPath = path ? `${path}.${key}` : key;
                
                if (key === 'name' && typeof value === 'string' && 
                    (data.quantity || data.quantity === 0) && 
                    (data.set || data.card?.set)) {
                    // Found a card object
                    cards.push({
                        quantity: data.quantity || 1,
                        name: value,
                        set: data.set || data.card?.set || 'Unknown',
                        number: data.number || data.card?.number || '',
                        isFoil: data.isFoil || data.card?.isFoil || false
                    });
                } else if (typeof value === 'object') {
                    // Recursively search nested objects
                    cards.push(...this.findCardsInResponse(value, currentPath));
                }
            }
        }
        
        return cards;
    }


}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MTGCardComparator();
}); 