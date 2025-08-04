/**
 * UI Manager Module
 * Handles all UI interactions and display logic
 */
export class UIManager {
    constructor() {
        this.initializeElements();
    }

    /**
     * Initialize DOM element references
     */
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
        this.priceProviderSelect = document.getElementById('priceProvider');
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
        
        // Tab buttons - scoped to results section
        this.tabButtons = this.resultsSection.querySelectorAll('.tab-btn');
        this.tabContents = this.resultsSection.querySelectorAll('.tab-content');
        
        // Input tab buttons - scoped to their respective containers
        this.wishlistInputTabs = document.querySelector('.input-group:first-child .input-tabs');
        this.collectionInputTabs = document.querySelector('.input-group:last-child .input-tabs');
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

    /**
     * Bind event listeners to UI elements
     */
    bindEvents() {
        // Tab switching - scoped to results section
        this.tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Input tab switching - scoped to their respective containers
        this.inputTabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchInputTab(e.target.dataset.inputTab);
            });
        });
        
        // Feedback tab switching
        this.feedbackTabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchFeedbackTab(e.target.dataset.feedbackTab);
            });
        });
        
        // Price provider change
        this.priceProviderSelect.addEventListener('change', () => {
            // Trigger price refresh event
            this.triggerEvent('priceProviderChanged');
        });
    }

    /**
     * Switch between result tabs
     * @param {string} tabName - The tab to switch to
     */
    switchTab(tabName) {
        // Update tab buttons - scoped to results section
        this.tabButtons.forEach(button => {
            const isActive = button.dataset.tab === tabName;
            button.classList.toggle('active', isActive);
        });
        
        // Update tab contents - scoped to results section
        this.tabContents.forEach(content => {
            const isActive = content.id === `${tabName}Tab`;
            content.classList.toggle('active', isActive);
        });
    }

    /**
     * Switch between input tabs
     * @param {string} tabName - The tab to switch to
     */
    switchInputTab(tabName) {
        // Find which input group this tab belongs to
        const isWishlistTab = tabName.startsWith('wishlist');
        const isCollectionTab = tabName.startsWith('collection');
        
        // Update input tab buttons - only for the relevant group
        this.inputTabButtons.forEach(button => {
            const buttonTabName = button.dataset.inputTab;
            const isSameGroup = (isWishlistTab && buttonTabName.startsWith('wishlist')) ||
                               (isCollectionTab && buttonTabName.startsWith('collection'));
            
            if (isSameGroup) {
                button.classList.toggle('active', buttonTabName === tabName);
            }
        });
        
        // Update input contents - only for the relevant group
        this.inputContents.forEach(content => {
            const contentId = content.id;
            const isSameGroup = (isWishlistTab && contentId.startsWith('wishlist')) ||
                               (isCollectionTab && contentId.startsWith('collection'));
            
            if (isSameGroup) {
                content.classList.toggle('active', contentId === tabName);
            }
        });
    }

    /**
     * Switch between feedback tabs
     * @param {string} tabName - The tab to switch to
     */
    switchFeedbackTab(tabName) {
        // Update feedback tab buttons
        this.feedbackTabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.feedbackTab === tabName);
        });
        
        // Update feedback contents
        this.feedbackContents.forEach(content => {
            content.classList.toggle('active', content.id === tabName);
        });
    }

    /**
     * Display search results
     * @param {Array} wishlistCards - Wishlist cards
     * @param {Array} collectionCards - Collection cards
     * @param {Array} matches - Matching cards
     * @param {Array} missing - Missing cards
     */
    displayResults(wishlistCards, collectionCards, matches, missing) {
        // Show results section
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Update stats
        this.totalWishlistEl.textContent = wishlistCards.length;
        this.totalCollectionEl.textContent = collectionCards.length;
        this.matchesFoundEl.textContent = matches.length;
        
        // Update tab counts
        this.matchesCountEl.textContent = matches.length;
        this.missingCountEl.textContent = missing.length;
        
        // Display card lists
        this.displayCardList(this.matchesListEl, matches, 'match');
        this.displayCardList(this.missingListEl, missing, 'missing');
        
        // Switch to matches tab by default
        this.switchTab('matches');
    }

    /**
     * Display a list of cards
     * @param {HTMLElement} container - The container element
     * @param {Array} cards - The cards to display
     * @param {string} type - The type of cards (match/missing)
     */
    displayCardList(container, cards, type) {
        container.innerHTML = '';
        
        if (cards.length === 0) {
            container.innerHTML = '<p class="empty-message">No cards found</p>';
            return;
        }
        
        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card-item';
            
            // Handle different card data structures
            let displayCard = card;
            if (type === 'match' && card.wishlist && card.collection) {
                // For matches, use wishlist card for display but store collection data
                displayCard = card.wishlist;
                cardElement.dataset.collectionData = JSON.stringify(card.collection);
            }
            
            const foilIndicator = displayCard.foil ? ' *F*' : '';
            const etchedIndicator = displayCard.etched ? ' *E*' : '';
            const setInfo = displayCard.set ? ` (${displayCard.set})` : '';
            const numberInfo = displayCard.number ? ` ${displayCard.number}` : '';
            
            let cardHtml = `
                <span class="card-quantity">${displayCard.quantity}x</span>
                <span class="card-name">${displayCard.name}${setInfo}${numberInfo}${foilIndicator}${etchedIndicator}</span>
                <span class="card-price">Loading...</span>
            `;
            
            // Add partial matches if they exist
            if (type === 'missing' && card.partialMatches && card.partialMatches.length > 0) {
                // eslint-disable-next-line no-console
                console.log('Found partial matches for card:', displayCard.name, card.partialMatches);
                cardHtml += '<div class="partial-matches">';
                cardHtml += '<div class="partial-matches-header">Partial matches found:</div>';
                card.partialMatches.forEach(partialMatch => {
                    const partialFoilIndicator = partialMatch.foil ? ' *F*' : '';
                    const partialEtchedIndicator = partialMatch.etched ? ' *E*' : '';
                    const partialSetInfo = partialMatch.set ? ` (${partialMatch.set})` : '';
                    const partialNumberInfo = partialMatch.number ? ` ${partialMatch.number}` : '';
                    
                    cardHtml += `
                        <div class="partial-match">
                            <span class="partial-match-quantity">${partialMatch.quantity}x</span>
                            <span class="partial-match-name">${partialMatch.name}${partialSetInfo}${partialNumberInfo}${partialFoilIndicator}${partialEtchedIndicator}</span>
                            <span class="partial-match-reason">${partialMatch.matchReason}</span>
                        </div>
                    `;
                });
                cardHtml += '</div>';
            } else if (type === 'missing') {
                // eslint-disable-next-line no-console
                console.log('No partial matches for card:', displayCard.name, 'partialMatches:', card.partialMatches);
            }
            
            cardElement.innerHTML = cardHtml;
            container.appendChild(cardElement);
            
            // Trigger price update event
            this.triggerEvent('cardPriceUpdate', { cardElement, card: displayCard, type });
        });
    }

    /**
     * Display feedback information
     * @param {Array} wishlistErrors - Wishlist parsing errors
     * @param {Array} collectionErrors - Collection parsing errors
     * @param {Array} wishlistCards - Parsed wishlist cards
     * @param {Array} collectionCards - Parsed collection cards
     */
    displayFeedback(wishlistErrors, collectionErrors, wishlistCards, collectionCards) {
        // Show feedback section if there are errors
        if (wishlistErrors.length > 0 || collectionErrors.length > 0) {
            this.feedbackSection.style.display = 'block';
        } else {
            this.feedbackSection.style.display = 'none';
        }
        
        // Update error counts
        this.wishlistErrorCountEl.textContent = wishlistErrors.length;
        this.collectionErrorCountEl.textContent = collectionErrors.length;
        
        // Update parsed counts
        this.wishlistParsedEl.textContent = wishlistCards.length;
        this.collectionParsedEl.textContent = collectionCards.length;
        
        // Display error lists
        this.displayErrorList(this.wishlistErrorListEl, wishlistErrors, 'wishlist');
        this.displayErrorList(this.collectionErrorListEl, collectionErrors, 'collection');
        
        // Switch to wishlist feedback tab by default if there are errors
        if (wishlistErrors.length > 0 || collectionErrors.length > 0) {
            this.switchFeedbackTab('wishlist');
        }
    }

    /**
     * Display error list
     * @param {HTMLElement} container - The container element
     * @param {Array} errors - The errors to display
     * @param {string} _type - The type of errors (unused)
     */
    displayErrorList(container, errors, _type) {
        container.innerHTML = '';
        
        if (errors.length === 0) {
            container.innerHTML = '<p class="no-errors">No errors found</p>';
            return;
        }
        
        errors.forEach(error => {
            const errorElement = document.createElement('div');
            errorElement.className = 'error-item';
            errorElement.innerHTML = `
                <span class="error-line">Line ${error.line}:</span>
                <span class="error-content">${error.content}</span>
                <span class="error-message">${error.message}</span>
            `;
            container.appendChild(errorElement);
        });
    }

    /**
     * Get card data from card elements
     * @param {NodeList} cardElements - The card elements
     * @param {string} type - The type of cards
     * @returns {Array} - Array of card data
     */
    getCardsDataFromElements(cardElements, type) {
        return Array.from(cardElements).map(element => 
            this.getCardDataFromElement(element, type)
        );
    }

    /**
     * Get card data from a card element
     * @param {HTMLElement} cardElement - The card element
     * @param {string} _type - The type of card (unused)
     * @returns {Object} - The card data
     */
    getCardDataFromElement(cardElement, _type) {
        const quantityElement = cardElement.querySelector('.card-quantity');
        const nameElement = cardElement.querySelector('.card-name');
        
        if (!quantityElement || !nameElement) {
            return null;
        }
        
        const quantity = parseInt(quantityElement.textContent.replace('x', ''));
        const nameText = nameElement.textContent;
        
        // Parse name text to extract card details
        const nameMatch = nameText.match(/^(.+?)(?:\s+\(([^)]+)\))?(?:\s+([A-Z0-9\-★]+))?(?:\s+\*[A-Z]\*)?$/);
        
        if (!nameMatch) {
            return null;
        }
        
        const name = nameMatch[1].trim();
        const set = nameMatch[2] || '';
        const number = nameMatch[3] || '';
        const isFoil = nameText.includes('*F*');
        const isEtched = nameText.includes('*E*');
        
        const cardData = {
            quantity,
            name,
            set,
            number,
            foil: isFoil,
            etched: isEtched
        };
        
        // Check if there's collection data stored in the element
        const { collectionData } = cardElement.dataset;
        if (collectionData) {
            try {
                const collection = JSON.parse(collectionData);
                cardData.collection = collection;
            } catch (error) {
                // Ignore parsing errors
            }
        }
        
        return cardData;
    }

    /**
     * Trigger a custom event
     * @param {string} eventName - The event name
     * @param {Object} detail - The event detail
     */
    triggerEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Get input values
     * @returns {Object} - Object containing input values
     */
    getInputValues() {
        return {
            wishlist: this.wishlistTextarea.value,
            collection: this.collectionTextarea.value,
            wishlistUrl: this.wishlistUrlInput.value,
            collectionUrl: this.collectionUrlInput.value,
            ignoreEdition: this.ignoreEditionCheckbox.checked,
            ignoreWishlistSideboard: this.ignoreWishlistSideboardCheckbox.checked,
            ignoreCollectionSideboard: this.ignoreCollectionSideboardCheckbox.checked,
            priceProvider: this.priceProviderSelect.value
        };
    }

    /**
     * Set input values
     * @param {Object} values - Object containing input values
     */
    setInputValues(values) {
        if (values.wishlist) this.wishlistTextarea.value = values.wishlist;
        if (values.collection) this.collectionTextarea.value = values.collection;
        if (values.wishlistUrl) this.wishlistUrlInput.value = values.wishlistUrl;
        if (values.collectionUrl) this.collectionUrlInput.value = values.collectionUrl;
        if (values.ignoreEdition !== undefined) this.ignoreEditionCheckbox.checked = values.ignoreEdition;
        if (values.ignoreWishlistSideboard !== undefined) this.ignoreWishlistSideboardCheckbox.checked = values.ignoreWishlistSideboard;
        if (values.ignoreCollectionSideboard !== undefined) this.ignoreCollectionSideboardCheckbox.checked = values.ignoreCollectionSideboard;
        if (values.priceProvider) this.priceProviderSelect.value = values.priceProvider;
    }

    /**
     * Show manual API response input dialog
     * @param {string} url - The original URL that failed
     * @param {string} _type - The type of data (wishlist/collection)
     * @returns {Promise<string>} - The manually input API response
     */
    showManualApiInputDialog(url, _type) {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'manual-api-dialog';
            dialog.innerHTML = `
                <div class="dialog-content">
                    <h3>Manual API Response Input</h3>
                    <p>The automatic API request failed due to CORS restrictions.</p>
                    <p><strong>API URL:</strong> <a href="${url}" target="_blank">${url}</a></p>
                    <div class="instructions">
                        <h4>Instructions:</h4>
                        <ol>
                            <li>Click the API URL above to open it in a new tab</li>
                            <li>Copy the entire JSON response (Ctrl+A, Ctrl+C)</li>
                            <li>Paste it in the textarea below</li>
                            <li>Click Submit</li>
                        </ol>
                        <p><strong>Note:</strong> If you're using GitHub Pages, this is the recommended way to load data.</p>
                    </div>
                    <textarea id="manualApiResponse" placeholder="Paste the JSON response here..." rows="15" style="width: 100%; margin: 10px 0; font-family: monospace; font-size: 12px;"></textarea>
                    <div class="dialog-buttons">
                        <button id="submitManualApi">Submit</button>
                        <button id="cancelManualApi">Cancel</button>
                    </div>
                </div>
            `;

            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                .manual-api-dialog {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .dialog-content {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    max-width: 700px;
                    max-height: 80vh;
                    overflow-y: auto;
                }
                .dialog-content h3 {
                    margin-bottom: 15px;
                    color: #333;
                }
                .dialog-content p {
                    margin-bottom: 10px;
                    line-height: 1.5;
                }
                .instructions {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 6px;
                    margin: 15px 0;
                }
                .instructions h4 {
                    margin-bottom: 10px;
                    color: #495057;
                }
                .instructions ol {
                    margin-left: 20px;
                }
                .instructions li {
                    margin-bottom: 5px;
                    line-height: 1.4;
                }
                .dialog-buttons {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                    margin-top: 15px;
                }
                .dialog-buttons button {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                }
                #submitManualApi {
                    background: #007bff;
                    color: white;
                }
                #submitManualApi:hover {
                    background: #0056b3;
                }
                #cancelManualApi {
                    background: #6c757d;
                    color: white;
                }
                #cancelManualApi:hover {
                    background: #545b62;
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(dialog);

            // Handle submit
            document.getElementById('submitManualApi').addEventListener('click', () => {
                const response = document.getElementById('manualApiResponse').value.trim();
                if (response) {
                    document.body.removeChild(dialog);
                    document.head.removeChild(style);
                    resolve(response);
                } else {
                    alert('Please paste the JSON response before submitting.');
                }
            });

            // Handle cancel
            document.getElementById('cancelManualApi').addEventListener('click', () => {
                document.body.removeChild(dialog);
                document.head.removeChild(style);
                resolve('');
            });
        });
    }

    /**
     * Show loading state and disable buttons
     * @param {string} type - The type of loading (wishlist/collection)
     */
    showLoadingState(type) {
        const loadBtn = type === 'wishlist' ? this.loadWishlistBtn : this.loadCollectionBtn;
        const { searchBtn } = this;
        
        // Disable buttons
        if (loadBtn) {
            loadBtn.disabled = true;
            loadBtn.textContent = 'Loading...';
        }
        if (searchBtn) {
            searchBtn.disabled = true;
        }
        
        // Add loading class for visual feedback
        if (loadBtn) {
            loadBtn.classList.add('loading');
        }
    }

    /**
     * Hide loading state and enable buttons
     * @param {string} type - The type of loading (wishlist/collection)
     */
    hideLoadingState(type) {
        const loadBtn = type === 'wishlist' ? this.loadWishlistBtn : this.loadCollectionBtn;
        const { searchBtn } = this;
        
        // Enable buttons
        if (loadBtn) {
            loadBtn.disabled = false;
            loadBtn.textContent = 'Load from URL';
        }
        if (searchBtn) {
            searchBtn.disabled = false;
        }
        
        // Remove loading class
        if (loadBtn) {
            loadBtn.classList.remove('loading');
        }
    }
} 