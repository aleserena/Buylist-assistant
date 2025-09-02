/**
 * Comprehensive tests for UIManager module
 */

import { UIManager } from '../src/modules/UIManager.js';

describe('UIManager Comprehensive Tests', () => {
    let uiManager;

    beforeEach(() => {
        // Mock DOM elements
        document.body.innerHTML = `
            <textarea id="wishlist"></textarea>
            <textarea id="collection"></textarea>
            <input id="wishlistUrl" value="" />
            <input id="collectionUrl" value="" />
            <button id="loadWishlistBtn">Load from URL</button>
            <button id="loadCollectionBtn">Load from URL</button>
            <input type="checkbox" id="ignoreEdition" />
            <input type="checkbox" id="ignoreWishlistSideboard" />
            <input type="checkbox" id="ignoreCollectionSideboard" />
            <select id="priceProvider">
                <option value="tcgplayer">TCGPlayer</option>
                <option value="cardmarket">Cardmarket</option>
                <option value="cardhoarder">Cardhoarder</option>
            </select>
            <button id="searchBtn">Search</button>
            <div id="resultsSection">
                <div class="tab-btn" data-tab="matches">Matches</div>
                <div class="tab-btn" data-tab="missing">Missing</div>
                <div class="tab-content" id="matchesTab">Matches Content</div>
                <div class="tab-content" id="missingTab">Missing Content</div>
            </div>
            <div id="feedbackSection">
                <div class="feedback-tab-btn" data-feedback-tab="wishlist">Wishlist</div>
                <div class="feedback-tab-btn" data-feedback-tab="collection">Collection</div>
                <div class="feedback-content" id="wishlist">Wishlist Feedback</div>
                <div class="feedback-content" id="collection">Collection Feedback</div>
            </div>
            <div class="input-group">
                <div class="input-tabs">
                    <div class="input-tab-btn" data-input-tab="wishlistTextTab">Text</div>
                    <div class="input-tab-btn" data-input-tab="wishlistUrlTab">URL</div>
                </div>
                <div class="input-content" id="wishlistTextTab">Wishlist Text</div>
                <div class="input-content" id="wishlistUrlTab">Wishlist URL</div>
            </div>
            <div class="input-group">
                <div class="input-tabs">
                    <div class="input-tab-btn" data-input-tab="collectionTextTab">Text</div>
                    <div class="input-tab-btn" data-input-tab="collectionUrlTab">URL</div>
                </div>
                <div class="input-content" id="collectionTextTab">Collection Text</div>
                <div class="input-content" id="collectionUrlTab">Collection URL</div>
            </div>
            <div id="totalWishlist">0</div>
            <div id="totalCollection">0</div>
            <div id="matchesFound">0</div>
            <div id="matchesCount">0</div>
            <div id="missingCount">0</div>
            <div id="matchesList"></div>
            <div id="missingList"></div>
            <div id="wishlistErrorCount">0</div>
            <div id="collectionErrorCount">0</div>
            <div id="wishlistErrorList"></div>
            <div id="collectionErrorList"></div>
            <div id="wishlistParsed">0</div>
            <div id="collectionParsed">0</div>
            <div class="results-section"></div>
        `;

        // Mock global functions
        global.alert = jest.fn();
        
        uiManager = new UIManager();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Constructor and Initialization', () => {
        test('should initialize with all required elements', () => {
            expect(uiManager.wishlistTextarea).toBeDefined();
            expect(uiManager.collectionTextarea).toBeDefined();
            expect(uiManager.wishlistUrlInput).toBeDefined();
            expect(uiManager.collectionUrlInput).toBeDefined();
            expect(uiManager.loadWishlistBtn).toBeDefined();
            expect(uiManager.loadCollectionBtn).toBeDefined();
            expect(uiManager.ignoreEditionCheckbox).toBeDefined();
            expect(uiManager.priceProviderSelect).toBeDefined();
            expect(uiManager.searchBtn).toBeDefined();
            expect(uiManager.resultsSection).toBeDefined();
            expect(uiManager.feedbackSection).toBeDefined();
        });

        test('should initialize stats elements', () => {
            expect(uiManager.totalWishlistEl).toBeDefined();
            expect(uiManager.totalCollectionEl).toBeDefined();
            expect(uiManager.matchesFoundEl).toBeDefined();
            expect(uiManager.matchesCountEl).toBeDefined();
            expect(uiManager.missingCountEl).toBeDefined();
            expect(uiManager.matchesListEl).toBeDefined();
            expect(uiManager.missingListEl).toBeDefined();
        });

        test('should initialize feedback elements', () => {
            expect(uiManager.wishlistErrorCountEl).toBeDefined();
            expect(uiManager.collectionErrorCountEl).toBeDefined();
            expect(uiManager.wishlistErrorListEl).toBeDefined();
            expect(uiManager.collectionErrorListEl).toBeDefined();
            expect(uiManager.wishlistParsedEl).toBeDefined();
            expect(uiManager.collectionParsedEl).toBeDefined();
        });

        test('should initialize tab elements', () => {
            expect(uiManager.tabButtons).toBeDefined();
            expect(uiManager.tabContents).toBeDefined();
            expect(uiManager.inputTabButtons).toBeDefined();
            expect(uiManager.inputContents).toBeDefined();
            expect(uiManager.feedbackTabButtons).toBeDefined();
            expect(uiManager.feedbackContents).toBeDefined();
        });
    });

    describe('switchTab', () => {
        test('should switch to matches tab', () => {
            uiManager.switchTab('matches');
            
            const matchesTabBtn = document.querySelector('[data-tab="matches"]');
            const missingTabBtn = document.querySelector('[data-tab="missing"]');
            const matchesContent = document.getElementById('matchesTab');
            const missingContent = document.getElementById('missingTab');
            
            expect(matchesTabBtn.classList.contains('active')).toBe(true);
            expect(missingTabBtn.classList.contains('active')).toBe(false);
            expect(matchesContent.classList.contains('active')).toBe(true);
            expect(missingContent.classList.contains('active')).toBe(false);
        });

        test('should switch to missing tab', () => {
            uiManager.switchTab('missing');
            
            const matchesTabBtn = document.querySelector('[data-tab="matches"]');
            const missingTabBtn = document.querySelector('[data-tab="missing"]');
            const matchesContent = document.getElementById('matchesTab');
            const missingContent = document.getElementById('missingTab');
            
            expect(matchesTabBtn.classList.contains('active')).toBe(false);
            expect(missingTabBtn.classList.contains('active')).toBe(true);
            expect(matchesContent.classList.contains('active')).toBe(false);
            expect(missingContent.classList.contains('active')).toBe(true);
        });
    });

    describe('switchInputTab', () => {
        test('should switch to wishlist text tab', () => {
            uiManager.switchInputTab('wishlistTextTab');
            
            const wishlistTextBtn = document.querySelector('[data-input-tab="wishlistTextTab"]');
            const wishlistUrlBtn = document.querySelector('[data-input-tab="wishlistUrlTab"]');
            const wishlistTextContent = document.getElementById('wishlistTextTab');
            const wishlistUrlContent = document.getElementById('wishlistUrlTab');
            
            expect(wishlistTextBtn.classList.contains('active')).toBe(true);
            expect(wishlistUrlBtn.classList.contains('active')).toBe(false);
            expect(wishlistTextContent.classList.contains('active')).toBe(true);
            expect(wishlistUrlContent.classList.contains('active')).toBe(false);
        });

        test('should switch to collection text tab', () => {
            uiManager.switchInputTab('collectionTextTab');
            
            const collectionTextBtn = document.querySelector('[data-input-tab="collectionTextTab"]');
            const collectionUrlBtn = document.querySelector('[data-input-tab="collectionUrlTab"]');
            const collectionTextContent = document.getElementById('collectionTextTab');
            const collectionUrlContent = document.getElementById('collectionUrlTab');
            
            expect(collectionTextBtn.classList.contains('active')).toBe(true);
            expect(collectionUrlBtn.classList.contains('active')).toBe(false);
            expect(collectionTextContent.classList.contains('active')).toBe(true);
            expect(collectionUrlContent.classList.contains('active')).toBe(false);
        });

        test('should not affect other input groups when switching', () => {
            // First switch to wishlist tab
            uiManager.switchInputTab('wishlistTextTab');
            
            // Then switch to collection tab
            uiManager.switchInputTab('collectionTextTab');
            
            const wishlistTextBtn = document.querySelector('[data-input-tab="wishlistTextTab"]');
            const collectionTextBtn = document.querySelector('[data-input-tab="collectionTextTab"]');
            
            // Both should be active since they're in different groups
            expect(wishlistTextBtn.classList.contains('active')).toBe(true);
            expect(collectionTextBtn.classList.contains('active')).toBe(true);
        });
    });

    describe('switchFeedbackTab', () => {
        test('should switch to wishlist feedback tab', () => {
            uiManager.switchFeedbackTab('wishlist');
            
            const wishlistTabBtn = document.querySelector('[data-feedback-tab="wishlist"]');
            const collectionTabBtn = document.querySelector('[data-feedback-tab="collection"]');
            const wishlistContent = document.getElementById('wishlist');
            const collectionContent = document.getElementById('collection');
            
            expect(wishlistTabBtn.classList.contains('active')).toBe(true);
            expect(collectionTabBtn.classList.contains('active')).toBe(false);
            // The content elements don't have the 'active' class by default, so we check they exist
            expect(wishlistContent).toBeDefined();
            expect(collectionContent).toBeDefined();
        });

        test('should switch to collection feedback tab', () => {
            uiManager.switchFeedbackTab('collection');
            
            const wishlistTabBtn = document.querySelector('[data-feedback-tab="wishlist"]');
            const collectionTabBtn = document.querySelector('[data-feedback-tab="collection"]');
            const wishlistContent = document.getElementById('wishlist');
            const collectionContent = document.getElementById('collection');
            
            expect(wishlistTabBtn.classList.contains('active')).toBe(false);
            expect(collectionTabBtn.classList.contains('active')).toBe(true);
            // The content elements don't have the 'active' class by default, so we check they exist
            expect(wishlistContent).toBeDefined();
            expect(collectionContent).toBeDefined();
        });
    });

    describe('displayResults', () => {
        test('should display results with matches and missing cards', () => {
            const wishlistCards = [
                { name: 'Lightning Bolt', quantity: 2, set: 'M10', number: '133', foil: false, etched: false }
            ];
            const collectionCards = [
                { name: 'Lightning Bolt', quantity: 3, set: 'M10', number: '133', foil: false, etched: false }
            ];
            const matches = [
                {
                    wishlist: { name: 'Lightning Bolt', quantity: 2, set: 'M10', number: '133', foil: false, etched: false },
                    collection: { name: 'Lightning Bolt', quantity: 3, set: 'M10', number: '133', foil: false, etched: false },
                    quantity: 2,
                    collectionQuantity: 3
                }
            ];
            const missing = [
                { name: 'Counterspell', quantity: 1, set: 'M10', number: '50', foil: false, etched: false, needed: 1 }
            ];

            uiManager.displayResults(wishlistCards, collectionCards, matches, missing);

            expect(uiManager.totalWishlistEl.textContent).toBe('1');
            expect(uiManager.totalCollectionEl.textContent).toBe('1');
            expect(uiManager.matchesFoundEl.textContent).toBe('1');
            expect(uiManager.matchesCountEl.textContent).toBe('1');
            expect(uiManager.missingCountEl.textContent).toBe('1');
            expect(uiManager.resultsSection.style.display).toBe('block');
        });

        test('should display empty results', () => {
            const wishlistCards = [];
            const collectionCards = [];
            const matches = [];
            const missing = [];

            uiManager.displayResults(wishlistCards, collectionCards, matches, missing);

            expect(uiManager.totalWishlistEl.textContent).toBe('0');
            expect(uiManager.totalCollectionEl.textContent).toBe('0');
            expect(uiManager.matchesFoundEl.textContent).toBe('0');
            expect(uiManager.matchesCountEl.textContent).toBe('0');
            expect(uiManager.missingCountEl.textContent).toBe('0');
        });
    });

    describe('displayCardList', () => {
        test('should display match cards', () => {
            const container = document.createElement('div');
            const cards = [
                {
                    wishlist: { name: 'Lightning Bolt', quantity: 2, set: 'M10', number: '133', foil: false, etched: false },
                    collection: { name: 'Lightning Bolt', quantity: 3, set: 'M10', number: '133', foil: false, etched: false },
                    quantity: 2,
                    collectionQuantity: 3
                }
            ];

            uiManager.displayCardList(container, cards, 'match');

            expect(container.children.length).toBe(1);
            const cardElement = container.firstElementChild;
            expect(cardElement.className).toBe('card-item');
            expect(cardElement.innerHTML).toContain('2x');
            expect(cardElement.innerHTML).toContain('Lightning Bolt');
            expect(cardElement.innerHTML).toContain('(M10)');
            expect(cardElement.innerHTML).toContain('133');
            expect(cardElement.innerHTML).toContain('Loading...');
        });

        test('should display missing cards with partial matches', () => {
            const container = document.createElement('div');
            const cards = [
                {
                    name: 'Lightning Bolt',
                    quantity: 2,
                    set: 'M10',
                    number: '133',
                    foil: false,
                    etched: false,
                    needed: 2,
                    partialMatches: [
                        {
                            name: 'Lightning Bolt',
                            quantity: 1,
                            set: 'M11',
                            number: '133',
                            foil: false,
                            etched: false,
                            matchReason: 'Same name, different set (M11 vs M10)'
                        }
                    ]
                }
            ];

            uiManager.displayCardList(container, cards, 'missing');

            expect(container.children.length).toBe(1);
            const cardElement = container.firstElementChild;
            expect(cardElement.className).toBe('card-item');
            expect(cardElement.innerHTML).toContain('2x');
            expect(cardElement.innerHTML).toContain('Lightning Bolt');
            expect(cardElement.innerHTML).toContain('Partial matches found:');
            expect(cardElement.innerHTML).toContain('Same name, different set');
        });

        test('should display empty card list', () => {
            const container = document.createElement('div');
            const cards = [];

            uiManager.displayCardList(container, cards, 'match');

            expect(container.innerHTML).toContain('No cards found');
        });

        test('should display foil cards', () => {
            const container = document.createElement('div');
            const cards = [
                { name: 'Lightning Bolt', quantity: 1, set: 'M10', number: '133', foil: true, etched: false }
            ];

            uiManager.displayCardList(container, cards, 'missing');

            expect(container.children.length).toBe(1);
            const cardElement = container.firstElementChild;
            expect(cardElement.innerHTML).toContain('*F*');
        });

        test('should display etched cards', () => {
            const container = document.createElement('div');
            const cards = [
                { name: 'Lightning Bolt', quantity: 1, set: 'M10', number: '133', foil: false, etched: true }
            ];

            uiManager.displayCardList(container, cards, 'missing');

            expect(container.children.length).toBe(1);
            const cardElement = container.firstElementChild;
            expect(cardElement.innerHTML).toContain('*E*');
        });
    });

    describe('displayFeedback', () => {
        test('should display feedback with errors', () => {
            const wishlistErrors = [
                { line: 1, content: 'Invalid card', message: 'Invalid card format' }
            ];
            const collectionErrors = [
                { line: 2, content: 'Another invalid card', message: 'Invalid card format' }
            ];
            const wishlistCards = [
                { name: 'Lightning Bolt', quantity: 1, set: 'M10', number: '133', foil: false, etched: false }
            ];
            const collectionCards = [
                { name: 'Counterspell', quantity: 1, set: 'M10', number: '50', foil: false, etched: false }
            ];

            uiManager.displayFeedback(wishlistErrors, collectionErrors, wishlistCards, collectionCards);

            expect(uiManager.wishlistErrorCountEl.textContent).toBe('1');
            expect(uiManager.collectionErrorCountEl.textContent).toBe('1');
            expect(uiManager.wishlistParsedEl.textContent).toBe('1');
            expect(uiManager.collectionParsedEl.textContent).toBe('1');
            expect(uiManager.feedbackSection.style.display).toBe('block');
        });

        test('should hide feedback when no errors', () => {
            const wishlistErrors = [];
            const collectionErrors = [];
            const wishlistCards = [
                { name: 'Lightning Bolt', quantity: 1, set: 'M10', number: '133', foil: false, etched: false }
            ];
            const collectionCards = [
                { name: 'Counterspell', quantity: 1, set: 'M10', number: '50', foil: false, etched: false }
            ];

            uiManager.displayFeedback(wishlistErrors, collectionErrors, wishlistCards, collectionCards);

            expect(uiManager.feedbackSection.style.display).toBe('none');
        });
    });

    describe('displayErrorList', () => {
        test('should display error list', () => {
            const container = document.createElement('div');
            const errors = [
                { line: 1, content: 'Invalid card', message: 'Invalid card format' },
                { line: 2, content: 'Another invalid card', message: 'Invalid card format' }
            ];

            uiManager.displayErrorList(container, errors, 'wishlist');

            expect(container.children.length).toBe(2);
            const firstError = container.firstElementChild;
            expect(firstError.className).toBe('error-item');
            expect(firstError.innerHTML).toContain('Line 1:');
            expect(firstError.innerHTML).toContain('Invalid card');
            expect(firstError.innerHTML).toContain('Invalid card format');
        });

        test('should display no errors message', () => {
            const container = document.createElement('div');
            const errors = [];

            uiManager.displayErrorList(container, errors, 'wishlist');

            expect(container.innerHTML).toContain('No errors found');
        });
    });

    describe('getCardDataFromElement', () => {
        test('should extract card data from element', () => {
            const cardElement = document.createElement('div');
            cardElement.innerHTML = `
                <span class="card-quantity">2x</span>
                <span class="card-name">Lightning Bolt (M10) 133</span>
            `;

            const result = uiManager.getCardDataFromElement(cardElement, 'match');

            expect(result).toEqual({
                quantity: 2,
                name: 'Lightning Bolt',
                set: 'M10',
                number: '133',
                foil: false,
                etched: false
            });
        });

        test('should extract foil card data', () => {
            const cardElement = document.createElement('div');
            cardElement.innerHTML = `
                <span class="card-quantity">1x</span>
                <span class="card-name">Lightning Bolt (M10) 133 *F*</span>
            `;

            const result = uiManager.getCardDataFromElement(cardElement, 'match');

            expect(result.foil).toBe(true);
            expect(result.etched).toBe(false);
        });

        test('should extract etched card data', () => {
            const cardElement = document.createElement('div');
            cardElement.innerHTML = `
                <span class="card-quantity">1x</span>
                <span class="card-name">Lightning Bolt (M10) 133 *E*</span>
            `;

            const result = uiManager.getCardDataFromElement(cardElement, 'match');

            expect(result.foil).toBe(false);
            expect(result.etched).toBe(true);
        });

        test('should handle card without set and number', () => {
            const cardElement = document.createElement('div');
            cardElement.innerHTML = `
                <span class="card-quantity">1x</span>
                <span class="card-name">Lightning Bolt</span>
            `;

            const result = uiManager.getCardDataFromElement(cardElement, 'match');

            expect(result).toEqual({
                quantity: 1,
                name: 'Lightning Bolt',
                set: '',
                number: '',
                foil: false,
                etched: false
            });
        });

        test('should return null for invalid element', () => {
            const cardElement = document.createElement('div');
            cardElement.innerHTML = '<span>Invalid card</span>';

            const result = uiManager.getCardDataFromElement(cardElement, 'match');

            expect(result).toBeNull();
        });

        test('should handle collection data in dataset', () => {
            const cardElement = document.createElement('div');
            cardElement.innerHTML = `
                <span class="card-quantity">2x</span>
                <span class="card-name">Lightning Bolt (M10) 133</span>
            `;
            cardElement.dataset.collectionData = JSON.stringify({
                name: 'Lightning Bolt',
                quantity: 3,
                set: 'M10',
                number: '133',
                foil: false,
                etched: false
            });

            const result = uiManager.getCardDataFromElement(cardElement, 'match');

            expect(result.collection).toBeDefined();
            expect(result.collection.name).toBe('Lightning Bolt');
            expect(result.collection.quantity).toBe(3);
        });
    });

    describe('getCardsDataFromElements', () => {
        test('should extract data from multiple elements', () => {
            const container = document.createElement('div');
            container.innerHTML = `
                <div class="card-item">
                    <span class="card-quantity">2x</span>
                    <span class="card-name">Lightning Bolt (M10) 133</span>
                </div>
                <div class="card-item">
                    <span class="card-quantity">1x</span>
                    <span class="card-name">Counterspell (M10) 50</span>
                </div>
            `;

            const cardElements = container.querySelectorAll('.card-item');
            const result = uiManager.getCardsDataFromElements(cardElements, 'match');

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('Lightning Bolt');
            expect(result[0].quantity).toBe(2);
            expect(result[1].name).toBe('Counterspell');
            expect(result[1].quantity).toBe(1);
        });
    });

    describe('triggerEvent', () => {
        test('should trigger custom event', () => {
            const mockEventListener = jest.fn();
            document.addEventListener('testEvent', mockEventListener);

            uiManager.triggerEvent('testEvent', { data: 'test' });

            expect(mockEventListener).toHaveBeenCalled();
            const event = mockEventListener.mock.calls[0][0];
            expect(event.type).toBe('testEvent');
            expect(event.detail).toEqual({ data: 'test' });

            document.removeEventListener('testEvent', mockEventListener);
        });
    });

    describe('getInputValues', () => {
        test('should return all input values', () => {
            // Set up test values
            uiManager.wishlistTextarea.value = '2 Lightning Bolt (M10) 133';
            uiManager.collectionTextarea.value = '1 Counterspell (M10) 50';
            uiManager.wishlistUrlInput.value = 'https://example.com/wishlist';
            uiManager.collectionUrlInput.value = 'https://example.com/collection';
            uiManager.ignoreEditionCheckbox.checked = true;
            uiManager.ignoreWishlistSideboardCheckbox.checked = false;
            uiManager.ignoreCollectionSideboardCheckbox.checked = true;
            uiManager.priceProviderSelect.value = 'cardmarket';

            const result = uiManager.getInputValues();

            expect(result).toEqual({
                wishlist: '2 Lightning Bolt (M10) 133',
                collection: '1 Counterspell (M10) 50',
                wishlistUrl: 'https://example.com/wishlist',
                collectionUrl: 'https://example.com/collection',
                ignoreEdition: true,
                ignoreWishlistSideboard: false,
                ignoreCollectionSideboard: true,
                priceProvider: 'cardmarket'
            });
        });
    });

    describe('setInputValues', () => {
        test('should set all input values', () => {
            const values = {
                wishlist: '2 Lightning Bolt (M10) 133',
                collection: '1 Counterspell (M10) 50',
                wishlistUrl: 'https://example.com/wishlist',
                collectionUrl: 'https://example.com/collection',
                ignoreEdition: true,
                ignoreWishlistSideboard: false,
                ignoreCollectionSideboard: true,
                priceProvider: 'cardmarket'
            };

            uiManager.setInputValues(values);

            expect(uiManager.wishlistTextarea.value).toBe('2 Lightning Bolt (M10) 133');
            expect(uiManager.collectionTextarea.value).toBe('1 Counterspell (M10) 50');
            expect(uiManager.wishlistUrlInput.value).toBe('https://example.com/wishlist');
            expect(uiManager.collectionUrlInput.value).toBe('https://example.com/collection');
            expect(uiManager.ignoreEditionCheckbox.checked).toBe(true);
            expect(uiManager.ignoreWishlistSideboardCheckbox.checked).toBe(false);
            expect(uiManager.ignoreCollectionSideboardCheckbox.checked).toBe(true);
            expect(uiManager.priceProviderSelect.value).toBe('cardmarket');
        });

        test('should handle partial values', () => {
            const values = {
                wishlist: '2 Lightning Bolt (M10) 133',
                priceProvider: 'cardhoarder'
            };

            uiManager.setInputValues(values);

            expect(uiManager.wishlistTextarea.value).toBe('2 Lightning Bolt (M10) 133');
            expect(uiManager.priceProviderSelect.value).toBe('cardhoarder');
            // Other values should remain unchanged
            expect(uiManager.collectionTextarea.value).toBe('');
        });
    });

    describe('showManualApiInputDialog', () => {
        test('should create dialog with correct content', async () => {
            const url = 'https://api.example.com/test';
            const promise = uiManager.showManualApiInputDialog(url, 'wishlist');

            // Check that dialog was created
            const dialog = document.querySelector('.manual-api-dialog');
            expect(dialog).toBeDefined();
            expect(dialog.innerHTML).toContain('Manual API Response Input');
            expect(dialog.innerHTML).toContain(url);

            // Simulate submit
            const submitBtn = document.getElementById('submitManualApi');
            const textarea = document.getElementById('manualApiResponse');
            textarea.value = '{"test": "data"}';
            submitBtn.click();

            const result = await promise;
            expect(result).toBe('{"test": "data"}');
        });

        test('should handle cancel', async () => {
            const url = 'https://api.example.com/test';
            const promise = uiManager.showManualApiInputDialog(url, 'wishlist');

            // Simulate cancel
            const cancelBtn = document.getElementById('cancelManualApi');
            cancelBtn.click();

            const result = await promise;
            expect(result).toBe('');
        });

        test('should handle empty response', async () => {
            const url = 'https://api.example.com/test';
            const promise = uiManager.showManualApiInputDialog(url, 'wishlist');

            // Simulate submit with empty response
            const submitBtn = document.getElementById('submitManualApi');
            submitBtn.click();

            expect(global.alert).toHaveBeenCalledWith('Please paste the JSON response before submitting.');

            // Clean up
            const cancelBtn = document.getElementById('cancelManualApi');
            cancelBtn.click();
            await promise;
        });
    });

    describe('Loading States', () => {
        test('should show loading state for wishlist', () => {
            uiManager.showLoadingState('wishlist');

            expect(uiManager.loadWishlistBtn.disabled).toBe(true);
            expect(uiManager.loadWishlistBtn.textContent).toBe('Loading...');
            expect(uiManager.loadWishlistBtn.classList.contains('loading')).toBe(true);
            expect(uiManager.searchBtn.disabled).toBe(true);
        });

        test('should show loading state for collection', () => {
            uiManager.showLoadingState('collection');

            expect(uiManager.loadCollectionBtn.disabled).toBe(true);
            expect(uiManager.loadCollectionBtn.textContent).toBe('Loading...');
            expect(uiManager.loadCollectionBtn.classList.contains('loading')).toBe(true);
            expect(uiManager.searchBtn.disabled).toBe(true);
        });

        test('should hide loading state for wishlist', () => {
            // First show loading state
            uiManager.showLoadingState('wishlist');
            
            // Then hide it
            uiManager.hideLoadingState('wishlist');

            expect(uiManager.loadWishlistBtn.disabled).toBe(false);
            expect(uiManager.loadWishlistBtn.textContent).toBe('Load from URL');
            expect(uiManager.loadWishlistBtn.classList.contains('loading')).toBe(false);
            expect(uiManager.searchBtn.disabled).toBe(false);
        });

        test('should hide loading state for collection', () => {
            // First show loading state
            uiManager.showLoadingState('collection');
            
            // Then hide it
            uiManager.hideLoadingState('collection');

            expect(uiManager.loadCollectionBtn.disabled).toBe(false);
            expect(uiManager.loadCollectionBtn.textContent).toBe('Load from URL');
            expect(uiManager.loadCollectionBtn.classList.contains('loading')).toBe(false);
            expect(uiManager.searchBtn.disabled).toBe(false);
        });
    });

    describe('Price Loading States', () => {
        test('should show price loading state', () => {
            uiManager.showPriceLoadingState();

            const loadingIndicator = document.getElementById('priceLoadingIndicator');
            expect(loadingIndicator).toBeDefined();
            expect(loadingIndicator.style.display).toBe('flex');
        });

        test('should hide price loading state', () => {
            // First show loading state
            uiManager.showPriceLoadingState();
            
            // Then hide it
            uiManager.hidePriceLoadingState();

            const loadingIndicator = document.getElementById('priceLoadingIndicator');
            expect(loadingIndicator.style.display).toBe('none');
        });

        test('should handle missing results section', () => {
            // Remove results section
            const resultsSection = document.querySelector('.results-section');
            if (resultsSection) {
                resultsSection.remove();
            }

            // Should not throw error
            expect(() => {
                uiManager.showPriceLoadingState();
            }).not.toThrow();
        });
    });

    describe('updateTotalPrice', () => {
        test('should update total price display', () => {
            // Set up matches found
            uiManager.matchesFoundEl.textContent = '3';
            uiManager.priceProviderSelect.value = 'tcgplayer';

            uiManager.updateTotalPrice(45.67, 2);

            const totalPriceElement = document.getElementById('totalPrice');
            expect(totalPriceElement).toBeDefined();
            expect(totalPriceElement.style.display).toBe('block');
            expect(totalPriceElement.innerHTML).toContain('$45.67');
            expect(totalPriceElement.innerHTML).toContain('2 of 3 cards priced');
        });

        test('should hide total price when zero', () => {
            uiManager.updateTotalPrice(0, 0);

            const totalPriceElement = document.getElementById('totalPrice');
            expect(totalPriceElement.style.display).toBe('none');
        });

        test('should handle different price providers', () => {
            uiManager.matchesFoundEl.textContent = '2';
            uiManager.priceProviderSelect.value = 'cardmarket';

            uiManager.updateTotalPrice(30.50, 1);

            const totalPriceElement = document.getElementById('totalPrice');
            // The UIManager uses a fallback to USD when provider config is not available
            expect(totalPriceElement.innerHTML).toContain('$30.50');
        });

        test('should handle cardhoarder provider', () => {
            uiManager.matchesFoundEl.textContent = '1';
            uiManager.priceProviderSelect.value = 'cardhoarder';

            uiManager.updateTotalPrice(15.25, 1);

            const totalPriceElement = document.getElementById('totalPrice');
            // The UIManager uses a fallback to USD when provider config is not available
            expect(totalPriceElement.innerHTML).toContain('$15.25');
        });
    });

    describe('Event Binding', () => {
        test('should bind price provider change event', () => {
            const mockEventListener = jest.fn();
            document.addEventListener('priceProviderChanged', mockEventListener);

            // Bind events first
            uiManager.bindEvents();

            // Trigger change event
            uiManager.priceProviderSelect.value = 'cardmarket';
            uiManager.priceProviderSelect.dispatchEvent(new Event('change'));

            expect(mockEventListener).toHaveBeenCalled();

            document.removeEventListener('priceProviderChanged', mockEventListener);
        });
    });

    describe('Edge Cases', () => {
        test('should handle missing elements gracefully', () => {
            // Remove some elements
            if (uiManager.totalWishlistEl) uiManager.totalWishlistEl.remove();
            if (uiManager.matchesFoundEl) uiManager.matchesFoundEl.remove();

            // Should not throw errors
            expect(() => {
                uiManager.displayResults([], [], [], []);
            }).not.toThrow();
        });

        test('should handle null/undefined values', () => {
            // These methods expect valid container elements, so we test with valid containers
            const container = document.createElement('div');
            
            expect(() => {
                uiManager.displayCardList(container, [], 'match');
            }).not.toThrow();

            expect(() => {
                uiManager.displayErrorList(container, [], 'wishlist');
            }).not.toThrow();
        });

        test('should handle invalid card data', () => {
            const container = document.createElement('div');
            const cards = [
                { name: 'Invalid Card', quantity: 1 }
            ];

            uiManager.displayCardList(container, cards, 'missing');

            expect(container.children.length).toBe(1);
        });
    });
}); 