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
            const wishlist = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 2, foil: false, etched: false }
            ];
            const collection = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 3, foil: false, etched: false }
            ];
            const result = comparator.findMatches(wishlist, collection, false);

            expect(result.matches).toHaveLength(1);
            expect(result.matches[0].wishlist.name).toBe('Lightning Bolt');
            expect(result.matches[0].quantity).toBe(2);
        });

        test('should not match cards with different names', () => {
            const wishlist = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 2, foil: false, etched: false }
            ];
            const collection = [
                { name: 'Counterspell', set: 'M10', number: '133', quantity: 3, foil: false, etched: false }
            ];
            const result = comparator.findMatches(wishlist, collection, false);

            expect(result.matches).toHaveLength(0);
        });

        test('should not match cards with different sets when ignoreEdition is false', () => {
            const wishlist = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 2, foil: false, etched: false }
            ];
            const collection = [
                { name: 'Lightning Bolt', set: 'M11', number: '133', quantity: 3, foil: false, etched: false }
            ];
            const result = comparator.findMatches(wishlist, collection, false);

            expect(result.matches).toHaveLength(0);
        });

        test('should match cards with different sets when ignoreEdition is true', () => {
            const wishlist = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 2, foil: false, etched: false }
            ];
            const collection = [
                { name: 'Lightning Bolt', set: 'M11', number: '133', quantity: 3, foil: false, etched: false }
            ];
            const result = comparator.findMatches(wishlist, collection, true);

            expect(result.matches).toHaveLength(1);
            expect(result.matches[0].wishlist.name).toBe('Lightning Bolt');
            expect(result.matches[0].quantity).toBe(2);
        });

        test('should not match foil vs non-foil cards', () => {
            const wishlist = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 2, foil: true, etched: false }
            ];
            const collection = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 3, foil: false, etched: false }
            ];
            const result = comparator.findMatches(wishlist, collection, false);

            expect(result.matches).toHaveLength(0);
        });

        test('should match foil cards correctly', () => {
            const wishlist = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 2, foil: true, etched: false }
            ];
            const collection = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 3, foil: true, etched: false }
            ];
            const result = comparator.findMatches(wishlist, collection, false);

            expect(result.matches).toHaveLength(1);
            expect(result.matches[0].wishlist.foil).toBe(true);
            expect(result.matches[0].collection.foil).toBe(true);
        });

        test('should handle etched foil cards', () => {
            const wishlist = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 2, foil: true, etched: true }
            ];
            const collection = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 3, foil: true, etched: true }
            ];
            const result = comparator.findMatches(wishlist, collection, false);

            expect(result.matches).toHaveLength(1);
            expect(result.matches[0].wishlist.etched).toBe(true);
            expect(result.matches[0].collection.etched).toBe(true);
        });

        test('should not match etched vs regular foil', () => {
            const wishlist = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 2, foil: true, etched: true }
            ];
            const collection = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 3, foil: true, etched: false }
            ];
            const result = comparator.findMatches(wishlist, collection, false);

            expect(result.matches).toHaveLength(0);
        });

        test('should handle quantity matching correctly', () => {
            const wishlist = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 5, foil: false, etched: false }
            ];
            const collection = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 3, foil: false, etched: false }
            ];
            const result = comparator.findMatches(wishlist, collection, false);

            expect(result.matches).toHaveLength(1);
            expect(result.matches[0].quantity).toBe(3); // Should match the smaller quantity
        });

        test('should handle multiple cards with same name but different editions', () => {
            const wishlist = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 2, foil: false, etched: false },
                { name: 'Lightning Bolt', set: 'M11', number: '133', quantity: 1, foil: false, etched: false }
            ];
            const collection = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 3, foil: false, etched: false }
            ];
            const result = comparator.findMatches(wishlist, collection, false);

            expect(result.matches).toHaveLength(1); // Only M10 should match
            expect(result.matches[0].wishlist.set).toBe('M10');
            expect(result.matches[0].collection.set).toBe('M10');
        });
    });

    describe('Missing Cards Logic', () => {
        test('should identify cards not in collection', () => {
            const wishlist = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 2, foil: false, etched: false },
                { name: 'Counterspell', set: 'M10', number: '50', quantity: 1, foil: false, etched: false }
            ];
            const collection = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 3, foil: false, etched: false }
            ];
            const result = comparator.findMatches(wishlist, collection, false);

            expect(result.missing).toHaveLength(1);
            expect(result.missing[0].name).toBe('Counterspell');
        });

        test('should handle partial quantity matches', () => {
            const wishlist = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 5, foil: false, etched: false }
            ];
            const collection = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 3, foil: false, etched: false }
            ];
            const result = comparator.findMatches(wishlist, collection, false);

            expect(result.missing).toHaveLength(1);
            expect(result.missing[0].name).toBe('Lightning Bolt');
            expect(result.missing[0].needed).toBe(2);
        });

        test('should show partial matches when ignoreEdition is false', () => {
            const wishlist = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 2, foil: false, etched: false }
            ];
            const collection = [
                { name: 'Lightning Bolt', set: 'M11', number: '133', quantity: 3, foil: false, etched: false }
            ];
            const result = comparator.findMatches(wishlist, collection, false);

            expect(result.missing).toHaveLength(1);
            expect(result.missing[0].name).toBe('Lightning Bolt');
        });

        test('should not show partial matches when ignoreEdition is true', () => {
            const wishlist = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 2, foil: false, etched: false }
            ];
            const collection = [
                { name: 'Lightning Bolt', set: 'M11', number: '133', quantity: 3, foil: false, etched: false }
            ];
            const result = comparator.findMatches(wishlist, collection, true);

            expect(result.missing).toHaveLength(0); // Should match when ignoring edition
        });
    });

    describe('performSearch Integration', () => {
        test('should perform complete search with matches and missing', () => {
            // Set up test data
            comparator.wishlistCards = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 2, foil: false, etched: false }
            ];
            comparator.collectionCards = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 3, foil: false, etched: false }
            ];

            comparator.performSearch();

            // The mock performSearch should call the display methods
            expect(comparator.displayResults).toHaveBeenCalled();
            expect(comparator.displayFeedback).toHaveBeenCalled();
        });

        test('should handle empty inputs', () => {
            // Mock alert
            global.alert = jest.fn();
            
            comparator.wishlistCards = [];
            comparator.collectionCards = [];

            comparator.performSearch();

            expect(global.alert).toHaveBeenCalledWith('Please enter at least one card list to compare.');
        });
    });

    describe('Edge Cases', () => {
        test('should handle cards with empty set and number', () => {
            const wishlist = [
                { name: 'Lightning Bolt', set: '', number: '', quantity: 2, foil: false, etched: false }
            ];
            const collection = [
                { name: 'Lightning Bolt', set: '', number: '', quantity: 3, foil: false, etched: false }
            ];
            const result = comparator.findMatches(wishlist, collection, false);

            expect(result.matches).toHaveLength(1);
            expect(result.matches[0].wishlist.name).toBe('Lightning Bolt');
        });

        test('should handle case insensitive name matching', () => {
            const wishlist = [
                { name: 'lightning bolt', set: 'M10', number: '133', quantity: 2, foil: false, etched: false }
            ];
            const collection = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 3, foil: false, etched: false }
            ];
            const result = comparator.findMatches(wishlist, collection, false);

            expect(result.matches).toHaveLength(1);
            expect(result.matches[0].wishlist.name).toBe('lightning bolt');
        });

        test('should handle zero quantities', () => {
            const wishlist = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 0, foil: false, etched: false }
            ];
            const collection = [
                { name: 'Lightning Bolt', set: 'M10', number: '133', quantity: 3, foil: false, etched: false }
            ];
            const result = comparator.findMatches(wishlist, collection, false);

            expect(result.matches).toHaveLength(0); // Zero quantity cards are skipped
            expect(result.missing).toHaveLength(0); // Zero quantity cards are skipped
        });
    });
}); 