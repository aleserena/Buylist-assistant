class MTGCardComparator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.wishlistTextarea = document.getElementById('wishlist');
        this.collectionTextarea = document.getElementById('collection');
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
        
        // Feedback tab switching
        this.feedbackTabButtons.forEach(button => {
            button.addEventListener('click', (e) => this.switchFeedbackTab(e.target.dataset.feedbackTab));
        });
    }

    parseCardLine(line) {
        // Remove extra whitespace and skip empty lines
        line = line.trim();
        if (!line) return null;

        // Enhanced regex to match various Moxfield formats
        // Groups: 1=quantity, 2=card name, 3=set code, 4=card number (with possible suffix), 5=special indicators
        const regex = /^(\d+)\s+([^(]+?)\s*\(([^)]+)\)\s*([A-Z0-9\-]+[a-z]*)\s*(\*[A-Z]\*)?$/;
        const match = line.match(regex);

        if (!match) {
            // Try to parse without card number: "1 Aether Channeler (DMU) *F*"
            const simpleRegex = /^(\d+)\s+([^(]+?)\s*\(([^)]+)\)\s*(\*[A-Z]\*)?$/;
            const simpleMatch = line.match(simpleRegex);
            
            if (simpleMatch) {
                return {
                    quantity: parseInt(simpleMatch[1]),
                    name: simpleMatch[2].trim(),
                    set: simpleMatch[3].trim(),
                    number: null,
                    foil: !!simpleMatch[4]
                };
            }
            
            // Try to parse with just quantity and name: "1 Aether Channeler"
            const basicRegex = /^(\d+)\s+(.+)$/;
            const basicMatch = line.match(basicRegex);
            
            if (basicMatch) {
                return {
                    quantity: parseInt(basicMatch[1]),
                    name: basicMatch[2].trim(),
                    set: 'Unknown',
                    number: null,
                    foil: false
                };
            }
            
            // If no match, return null
            return null;
        }

        return {
            quantity: parseInt(match[1]),
            name: match[2].trim(),
            set: match[3].trim(),
            number: match[4],
            foil: !!match[5]
        };
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
        return `${card.name.toLowerCase()}-${card.set.toLowerCase()}-${card.number || 'unknown'}-${foilIndicator}`;
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
                // Card not found in collection
                missing.push({
                    ...wishlistCard,
                    needed: wishlistCard.quantity
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
                            ${card.wishlist.set} ${card.wishlist.number || ''} 
                            ${card.wishlist.foil ? '<span class="foil-badge">Foil</span>' : ''}
                            <br>
                            <small>Wishlist: ${card.wishlist.quantity} | Collection: ${card.collection.quantity}</small>
                        </div>
                    </div>
                `;
                quantity = card.matchQuantity;
            } else {
                cardInfo = `
                    <div class="card-info">
                        <div class="card-name">${card.name}</div>
                        <div class="card-details">
                            ${card.set} ${card.number || ''} 
                            ${card.foil ? '<span class="foil-badge">Foil</span>' : ''}
                        </div>
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
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MTGCardComparator();
}); 