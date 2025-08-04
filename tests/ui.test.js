/**
 * Tests for UI functionality including tabs, checkboxes, and user interactions
 */

/* global MTGCardComparator */

describe('UI Functionality Tests', () => {
    let comparator;

    beforeEach(() => {
        comparator = window.mtgCardComparator || new MTGCardComparator();
    });

    describe('Tab Switching', () => {
        test('should switch between results tabs', () => {
            const matchesTabBtn = document.querySelector('[data-tab="matches"]');
            const missingTabBtn = document.querySelector('[data-tab="missing"]');
            const matchesTab = document.getElementById('matchesTab');
            const missingTab = document.getElementById('missingTab');
      
            // Initially matches tab should be active
            expect(matchesTabBtn.classList.contains('active')).toBe(true);
            expect(matchesTab.classList.contains('active')).toBe(true);
            expect(missingTab.classList.contains('active')).toBe(false);
      
            // Click missing tab
            missingTabBtn.click();
      
            // Missing tab should now be active
            expect(missingTabBtn.classList.contains('active')).toBe(true);
            expect(missingTab.classList.contains('active')).toBe(true);
            expect(matchesTabBtn.classList.contains('active')).toBe(false);
            expect(matchesTab.classList.contains('active')).toBe(false);
        });

        test('should switch between input tabs for wishlist', () => {
            const wishlistTextTabBtn = document.querySelector('[data-input-tab="wishlist-text"]');
            const wishlistUrlTabBtn = document.querySelector('[data-input-tab="wishlist-url"]');
            const wishlistTextTab = document.getElementById('wishlistTextTab');
            const wishlistUrlTab = document.getElementById('wishlistUrlTab');
      
            // Initially text tab should be active
            expect(wishlistTextTabBtn.classList.contains('active')).toBe(true);
            expect(wishlistTextTab.classList.contains('active')).toBe(true);
            expect(wishlistUrlTab.classList.contains('active')).toBe(false);
      
            // Click URL tab
            wishlistUrlTabBtn.click();
      
            // URL tab should now be active
            expect(wishlistUrlTabBtn.classList.contains('active')).toBe(true);
            expect(wishlistUrlTab.classList.contains('active')).toBe(true);
            expect(wishlistTextTabBtn.classList.contains('active')).toBe(false);
            expect(wishlistTextTab.classList.contains('active')).toBe(false);
        });

        test('should switch between input tabs for collection', () => {
            const collectionTextTabBtn = document.querySelector('[data-input-tab="collection-text"]');
            const collectionUrlTabBtn = document.querySelector('[data-input-tab="collection-url"]');
            const collectionTextTab = document.getElementById('collectionTextTab');
            const collectionUrlTab = document.getElementById('collectionUrlTab');
      
            // Initially text tab should be active
            expect(collectionTextTabBtn.classList.contains('active')).toBe(true);
            expect(collectionTextTab.classList.contains('active')).toBe(true);
            expect(collectionUrlTab.classList.contains('active')).toBe(false);
      
            // Click URL tab
            collectionUrlTabBtn.click();
      
            // URL tab should now be active
            expect(collectionUrlTabBtn.classList.contains('active')).toBe(true);
            expect(collectionUrlTab.classList.contains('active')).toBe(true);
            expect(collectionTextTabBtn.classList.contains('active')).toBe(false);
            expect(collectionTextTab.classList.contains('active')).toBe(false);
        });

        test('should switch between feedback tabs', () => {
            const wishlistFeedbackTabBtn = document.querySelector('[data-feedback-tab="wishlist"]');
            const collectionFeedbackTabBtn = document.querySelector('[data-feedback-tab="collection"]');
            const wishlistFeedbackTab = document.getElementById('wishlistFeedbackTab');
            const collectionFeedbackTab = document.getElementById('collectionFeedbackTab');
      
            // Initially wishlist tab should be active
            expect(wishlistFeedbackTabBtn.classList.contains('active')).toBe(true);
            expect(wishlistFeedbackTab.classList.contains('active')).toBe(true);
            expect(collectionFeedbackTab.classList.contains('active')).toBe(false);
      
            // Click collection tab
            collectionFeedbackTabBtn.click();
      
            // Collection tab should now be active
            expect(collectionFeedbackTabBtn.classList.contains('active')).toBe(true);
            expect(collectionFeedbackTab.classList.contains('active')).toBe(true);
            expect(wishlistFeedbackTabBtn.classList.contains('active')).toBe(false);
            expect(wishlistFeedbackTab.classList.contains('active')).toBe(false);
        });
    });

    describe('Checkbox Functionality', () => {
        test('should handle ignore edition checkbox', () => {
            const ignoreEditionCheckbox = document.getElementById('ignoreEdition');
      
            // Initially should be unchecked
            expect(ignoreEditionCheckbox.checked).toBe(false);
      
            // Check the checkbox
            ignoreEditionCheckbox.checked = true;
            ignoreEditionCheckbox.dispatchEvent(new Event('change'));
      
            expect(ignoreEditionCheckbox.checked).toBe(true);
        });

        test('should handle ignore wishlist sideboard checkbox', () => {
            const ignoreWishlistSideboardCheckbox = document.getElementById('ignoreWishlistSideboard');
      
            // Initially should be checked
            expect(ignoreWishlistSideboardCheckbox.checked).toBe(true);
      
            // Uncheck the checkbox
            ignoreWishlistSideboardCheckbox.checked = false;
            ignoreWishlistSideboardCheckbox.dispatchEvent(new Event('change'));
      
            expect(ignoreWishlistSideboardCheckbox.checked).toBe(false);
        });

        test('should handle ignore collection sideboard checkbox', () => {
            const ignoreCollectionSideboardCheckbox = document.getElementById('ignoreCollectionSideboard');
      
            // Initially should be checked
            expect(ignoreCollectionSideboardCheckbox.checked).toBe(true);
      
            // Uncheck the checkbox
            ignoreCollectionSideboardCheckbox.checked = false;
            ignoreCollectionSideboardCheckbox.dispatchEvent(new Event('change'));
      
            expect(ignoreCollectionSideboardCheckbox.checked).toBe(false);
        });
    });

    describe('Price Provider Selection', () => {
        test('should handle price provider changes', () => {
            const priceProviderSelect = document.getElementById('priceProvider');
      
            // Initially should be cardkingdom
            expect(priceProviderSelect.value).toBe('cardkingdom');
      
            // Change to TCGPlayer
            priceProviderSelect.value = 'tcgplayer';
            priceProviderSelect.dispatchEvent(new Event('change'));
      
            expect(priceProviderSelect.value).toBe('tcgplayer');
        });

        test('should refresh prices when provider changes', () => {
            const priceProviderSelect = document.getElementById('priceProvider');
      
            // Mock the refresh method
            comparator.refreshAllPrices = jest.fn();
      
            // Change provider
            priceProviderSelect.value = 'starcitygames';
            priceProviderSelect.dispatchEvent(new Event('change'));
      
            expect(comparator.refreshAllPrices).toHaveBeenCalled();
        });
    });

    describe('Search Button Functionality', () => {
        test('should trigger search when button is clicked', () => {
            const searchBtn = document.getElementById('searchBtn');
      
            // Mock the performSearch method
            comparator.performSearch = jest.fn();
      
            // Click the search button
            searchBtn.click();
      
            expect(comparator.performSearch).toHaveBeenCalled();
        });
    });

    describe('URL Loading Buttons', () => {
        test('should trigger wishlist loading when button is clicked', () => {
            const loadWishlistBtn = document.getElementById('loadWishlistBtn');
      
            // Mock the loadFromUrl method
            comparator.loadFromUrl = jest.fn();
      
            // Click the load button
            loadWishlistBtn.click();
      
            expect(comparator.loadFromUrl).toHaveBeenCalledWith('wishlist');
        });

        test('should trigger collection loading when button is clicked', () => {
            const loadCollectionBtn = document.getElementById('loadCollectionBtn');
      
            // Mock the loadFromUrl method
            comparator.loadFromUrl = jest.fn();
      
            // Click the load button
            loadCollectionBtn.click();
      
            expect(comparator.loadFromUrl).toHaveBeenCalledWith('collection');
        });
    });

    describe('Results Display', () => {
        test('should display results section when search is performed', () => {
            const resultsSection = document.getElementById('resultsSection');
      
            // Initially should be hidden
            expect(resultsSection.style.display).toBe('none');
      
            // Mock some results
            const wishlistCards = [{ name: 'Lightning Bolt', quantity: 2 }];
            const collectionCards = [{ name: 'Lightning Bolt', quantity: 3 }];
            const matches = [{
                wishlist: { name: 'Lightning Bolt', quantity: 2 },
                collection: { name: 'Lightning Bolt', quantity: 3 },
                matchQuantity: 2
            }];
            const missing = [];
      
            comparator.displayResults(wishlistCards, collectionCards, matches, missing);
      
            // Results section should now be visible
            expect(resultsSection.style.display).toBe('block');
        });

        test('should update stats correctly', () => {
            const totalWishlistEl = document.getElementById('totalWishlist');
            const totalCollectionEl = document.getElementById('totalCollection');
            const matchesFoundEl = document.getElementById('matchesFound');
      
            const wishlistCards = [{ name: 'Lightning Bolt', quantity: 2 }];
            const collectionCards = [{ name: 'Lightning Bolt', quantity: 3 }];
            const matches = [{
                wishlist: { name: 'Lightning Bolt', quantity: 2 },
                collection: { name: 'Lightning Bolt', quantity: 3 },
                matchQuantity: 2
            }];
            const missing = [];
      
            comparator.displayResults(wishlistCards, collectionCards, matches, missing);
      
            expect(totalWishlistEl.textContent).toBe('1');
            expect(totalCollectionEl.textContent).toBe('1');
            expect(matchesFoundEl.textContent).toBe('1');
        });

        test('should update tab counts correctly', () => {
            const matchesCountEl = document.getElementById('matchesCount');
            const missingCountEl = document.getElementById('missingCount');
      
            const wishlistCards = [{ name: 'Lightning Bolt', quantity: 2 }];
            const collectionCards = [{ name: 'Lightning Bolt', quantity: 3 }];
            const matches = [{
                wishlist: { name: 'Lightning Bolt', quantity: 2 },
                collection: { name: 'Lightning Bolt', quantity: 3 },
                matchQuantity: 2
            }];
            const missing = [{ name: 'Counterspell', quantity: 1, needed: 1 }];
      
            comparator.displayResults(wishlistCards, collectionCards, matches, missing);
      
            expect(matchesCountEl.textContent).toBe('1');
            expect(missingCountEl.textContent).toBe('1');
        });
    });

    describe('Feedback Display', () => {
        test('should display feedback section when there are errors', () => {
            const feedbackSection = document.getElementById('feedbackSection');
            const wishlistParsedEl = document.getElementById('wishlistParsed');
            const collectionParsedEl = document.getElementById('collectionParsed');
            const wishlistErrorCountEl = document.getElementById('wishlistErrorCount');
            const collectionErrorCountEl = document.getElementById('collectionErrorCount');
      
            // Initially should be hidden
            expect(feedbackSection.style.display).toBe('none');
      
            const wishlistErrors = ['Line 2: "Invalid line"'];
            const collectionErrors = ['Line 3: "Another invalid line"'];
            const wishlistCards = [{ name: 'Lightning Bolt', quantity: 2 }];
            const collectionCards = [{ name: 'Counterspell', quantity: 1 }];
      
            comparator.displayFeedback(wishlistErrors, collectionErrors, wishlistCards, collectionCards);
      
            // Feedback section should now be visible
            expect(feedbackSection.style.display).toBe('block');
            expect(wishlistParsedEl.textContent).toBe('1');
            expect(collectionParsedEl.textContent).toBe('1');
            expect(wishlistErrorCountEl.textContent).toBe('1');
            expect(collectionErrorCountEl.textContent).toBe('1');
        });

        test('should hide feedback section when there are no errors', () => {
            const feedbackSection = document.getElementById('feedbackSection');
        
            // Reset the display state
            feedbackSection.style.display = 'none';
        
            // Initially should be hidden
            expect(feedbackSection.style.display).toBe('none');
        
            const wishlistErrors = [];
            const collectionErrors = [];
            const wishlistCards = [{ name: 'Lightning Bolt', quantity: 2 }];
            const collectionCards = [{ name: 'Counterspell', quantity: 1 }];
        
            comparator.displayFeedback(wishlistErrors, collectionErrors, wishlistCards, collectionCards);
        
            // Feedback section should remain hidden
            expect(feedbackSection.style.display).toBe('none');
        });
    });

    describe('Card List Display', () => {
        test('should display card list correctly', () => {
            const matchesListEl = document.getElementById('matchesList');
      
            const matches = [{
                wishlist: { name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, quantity: 2 },
                collection: { name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, quantity: 3 },
                matchQuantity: 2
            }];
      
            comparator.displayCardList(matchesListEl, matches, 'match');
      
            expect(matchesListEl.children.length).toBe(1);
            const cardElement = matchesListEl.children[0];
            expect(cardElement.classList.contains('card-item')).toBe(true);
            expect(cardElement.querySelector('.card-name').textContent).toBe('Lightning Bolt');
            expect(cardElement.querySelector('.card-quantity').textContent).toBe('2');
        });

        test('should display empty state when no cards', () => {
            const matchesListEl = document.getElementById('matchesList');
      
            comparator.displayCardList(matchesListEl, [], 'match');
      
            expect(matchesListEl.children.length).toBe(1);
            const emptyElement = matchesListEl.children[0];
            expect(emptyElement.classList.contains('empty-state')).toBe(true);
        });
    });

    describe('Error List Display', () => {
        test('should display error list correctly', () => {
            const wishlistErrorListEl = document.getElementById('wishlistErrorList');
      
            const errors = ['Line 2: "Invalid line"', 'Line 4: "Another invalid line"'];
      
            comparator.displayErrorList(wishlistErrorListEl, errors, 'wishlist');
      
            expect(wishlistErrorListEl.children.length).toBe(2);
            const errorElements = wishlistErrorListEl.children;
            expect(errorElements[0].classList.contains('error-item')).toBe(true);
            expect(errorElements[1].classList.contains('error-item')).toBe(true);
        });

        test('should display no errors message when no errors', () => {
            const wishlistErrorListEl = document.getElementById('wishlistErrorList');
      
            comparator.displayErrorList(wishlistErrorListEl, [], 'wishlist');
      
            expect(wishlistErrorListEl.children.length).toBe(1);
            const noErrorsElement = wishlistErrorListEl.children[0];
            expect(noErrorsElement.classList.contains('no-errors')).toBe(true);
        });
    });
}); 