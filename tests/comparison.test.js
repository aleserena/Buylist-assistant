/**
 * Tests for card comparison functionality
 */

/* global MTGCardComparator */

describe('Card Comparison Tests', () => {
    let comparator;

    beforeEach(() => {
        comparator = window.mtgCardComparator || new MTGCardComparator();
    });

    describe('Card Matching Logic', () => {
        test('should match identical cards', () => {
            const wishlist = [{ name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, quantity: 2 }];
            const collection = [{ name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, quantity: 3 }];

            const matches = comparator.findMatches(wishlist, collection, false);

            expect(matches).toHaveLength(1);
            expect(matches[0].wishlist.name).toBe('Lightning Bolt');
            expect(matches[0].matchQuantity).toBe(2);
        });

        test('should not match cards with different names', () => {
            const wishlist = [{ name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, quantity: 2 }];
            const collection = [{ name: 'Counterspell', set: 'M10', number: '50', foil: false, quantity: 3 }];

            const matches = comparator.findMatches(wishlist, collection, false);

            expect(matches).toHaveLength(0);
        });

        test('should not match cards with different sets when ignoreEdition is false', () => {
            const wishlist = [{ name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, quantity: 2 }];
            const collection = [{ name: 'Lightning Bolt', set: 'M11', number: '133', foil: false, quantity: 3 }];

            const matches = comparator.findMatches(wishlist, collection, false);

            expect(matches).toHaveLength(0);
        });

        test('should match cards with different sets when ignoreEdition is true', () => {
            const wishlist = [{ name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, quantity: 2 }];
            const collection = [{ name: 'Lightning Bolt', set: 'M11', number: '133', foil: false, quantity: 3 }];

            const matches = comparator.findMatches(wishlist, collection, true);

            expect(matches).toHaveLength(1);
            expect(matches[0].wishlist.name).toBe('Lightning Bolt');
            expect(matches[0].matchQuantity).toBe(2);
        });

        test('should not match foil vs non-foil cards', () => {
            const wishlist = [{ name: 'Lightning Bolt', set: 'M10', number: '133', foil: true, quantity: 2 }];
            const collection = [{ name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, quantity: 3 }];

            const matches = comparator.findMatches(wishlist, collection, false);

            expect(matches).toHaveLength(0);
        });

        test('should match foil cards correctly', () => {
            const wishlist = [{ name: 'Lightning Bolt', set: 'M10', number: '133', foil: true, quantity: 2 }];
            const collection = [{ name: 'Lightning Bolt', set: 'M10', number: '133', foil: true, quantity: 3 }];

            const matches = comparator.findMatches(wishlist, collection, false);

            expect(matches).toHaveLength(1);
            expect(matches[0].wishlist.foil).toBe(true);
            expect(matches[0].collection.foil).toBe(true);
        });

        test('should handle etched foil cards', () => {
            const wishlist = [{ name: 'Lightning Bolt', set: 'M10', number: '133', foil: true, etched: true, quantity: 2 }];
            const collection = [{ name: 'Lightning Bolt', set: 'M10', number: '133', foil: true, etched: true, quantity: 3 }];

            const matches = comparator.findMatches(wishlist, collection, false);

            expect(matches).toHaveLength(1);
            expect(matches[0].wishlist.etched).toBe(true);
            expect(matches[0].collection.etched).toBe(true);
        });

        test('should not match etched vs regular foil', () => {
            const wishlist = [{ name: 'Lightning Bolt', set: 'M10', number: '133', foil: true, etched: true, quantity: 2 }];
            const collection = [{ name: 'Lightning Bolt', set: 'M10', number: '133', foil: true, etched: false, quantity: 3 }];

            const matches = comparator.findMatches(wishlist, collection, false);

            expect(matches).toHaveLength(0);
        });

        test('should handle quantity matching correctly', () => {
            const wishlist = [{ name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, quantity: 5 }];
            const collection = [{ name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, quantity: 3 }];

            const matches = comparator.findMatches(wishlist, collection, false);

            expect(matches).toHaveLength(1);
            expect(matches[0].matchQuantity).toBe(3); // Should match the smaller quantity
        });

        test('should handle multiple cards with same name but different editions', () => {
            const wishlist = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, quantity: 2 },
                { name: 'Lightning Bolt', set: 'M11', number: '133', foil: false, quantity: 1 }
            ];
            const collection = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, quantity: 3 },
                { name: 'Lightning Bolt', set: 'M12', number: '133', foil: false, quantity: 2 }
            ];

            const matches = comparator.findMatches(wishlist, collection, false);

            expect(matches).toHaveLength(1); // Only M10 should match
            expect(matches[0].wishlist.set).toBe('M10');
            expect(matches[0].collection.set).toBe('M10');
        });
    });

    describe('Missing Cards Logic', () => {
        test('should identify cards not in collection', () => {
            const wishlist = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, quantity: 2 },
                { name: 'Counterspell', set: 'M10', number: '50', foil: false, quantity: 1 }
            ];
            const collection = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, quantity: 3 }
            ];

            const missing = comparator.findMissingCards(wishlist, collection, false);

            expect(missing).toHaveLength(1);
            expect(missing[0].name).toBe('Counterspell');
            expect(missing[0].needed).toBe(1);
        });

        test('should handle partial quantity matches', () => {
            const wishlist = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, quantity: 5 }
            ];
            const collection = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, quantity: 3 }
            ];

            const missing = comparator.findMissingCards(wishlist, collection, false);

            expect(missing).toHaveLength(1);
            expect(missing[0].name).toBe('Lightning Bolt');
            expect(missing[0].needed).toBe(2); // 5 - 3 = 2
        });

        test('should show partial matches when ignoreEdition is false', () => {
            const wishlist = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, quantity: 2 }
            ];
            const collection = [
                { name: 'Lightning Bolt', set: 'M11', number: '133', foil: false, quantity: 3 }
            ];

            const missing = comparator.findMissingCards(wishlist, collection, false);

            expect(missing).toHaveLength(1);
            expect(missing[0].name).toBe('Lightning Bolt');
            expect(missing[0].partialMatches).toHaveLength(1);
            expect(missing[0].partialMatches[0].set).toBe('M11');
        });

        test('should not show partial matches when ignoreEdition is true', () => {
            const wishlist = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, quantity: 2 }
            ];
            const collection = [
                { name: 'Lightning Bolt', set: 'M11', number: '133', foil: false, quantity: 3 }
            ];

            const missing = comparator.findMissingCards(wishlist, collection, true);

            expect(missing).toHaveLength(0); // Should match when ignoring edition
        });
    });

    describe('performSearch Integration', () => {
        test('should perform complete search with matches and missing', () => {
            // Mock the DOM elements
            const wishlistTextarea = document.getElementById('wishlist');
            const collectionTextarea = document.getElementById('collection');
            const ignoreEditionCheckbox = document.getElementById('ignoreEdition');

            wishlistTextarea.value = `2 Lightning Bolt (M10) 133
1 Counterspell (M10) 50`;
            collectionTextarea.value = `3 Lightning Bolt (M10) 133
1 Aether Channeler (DMU) 42`;
            ignoreEditionCheckbox.checked = false;

            // Mock the display methods
            comparator.displayResults = jest.fn();
            comparator.displayFeedback = jest.fn();

            comparator.performSearch();

            expect(comparator.displayResults).toHaveBeenCalled();
            expect(comparator.displayFeedback).toHaveBeenCalled();
        });

        test('should handle empty inputs', () => {
            const wishlistTextarea = document.getElementById('wishlist');
            const collectionTextarea = document.getElementById('collection');

            wishlistTextarea.value = '';
            collectionTextarea.value = '';

            // Mock alert
            global.alert = jest.fn();

            comparator.performSearch();

            expect(global.alert).toHaveBeenCalledWith('Please enter at least one card list to compare.');
        });
    });

    describe('Edge Cases', () => {
        test('should handle cards with empty set and number', () => {
            const wishlist = [{ name: 'Lightning Bolt', set: '', number: '', foil: false, quantity: 2 }];
            const collection = [{ name: 'Lightning Bolt', set: '', number: '', foil: false, quantity: 3 }];

            const matches = comparator.findMatches(wishlist, collection, false);

            expect(matches).toHaveLength(1);
            expect(matches[0].wishlist.name).toBe('Lightning Bolt');
        });

        test('should handle case insensitive name matching', () => {
            const wishlist = [{ name: 'lightning bolt', set: 'M10', number: '133', foil: false, quantity: 2 }];
            const collection = [{ name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, quantity: 3 }];

            const matches = comparator.findMatches(wishlist, collection, false);

            expect(matches).toHaveLength(1);
            expect(matches[0].wishlist.name).toBe('lightning bolt');
        });

        test('should handle zero quantities', () => {
            const wishlist = [{ name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, quantity: 0 }];
            const collection = [{ name: 'Lightning Bolt', set: 'M10', number: '133', foil: false, quantity: 3 }];

            const matches = comparator.findMatches(wishlist, collection, false);

            expect(matches).toHaveLength(1);
            expect(matches[0].matchQuantity).toBe(0);
        });
    });
}); 