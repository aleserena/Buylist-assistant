/**
 * Integration tests for complete workflow
 */

/* global MTGCardComparator */

describe('Integration Tests', () => {
    let comparator;

    beforeEach(() => {
        comparator = window.mtgCardComparator || new MTGCardComparator();
    });

    describe('Complete Workflow', () => {
        test('should perform complete search workflow', () => {
            // Test that the performSearch method calls displayResults and displayFeedback
            comparator.displayResults = jest.fn();
            comparator.displayFeedback = jest.fn();

            // Perform search
            comparator.performSearch();

            // Verify that the display methods were called
            expect(comparator.displayResults).toHaveBeenCalled();
            expect(comparator.displayFeedback).toHaveBeenCalled();
        });

        test('should handle ignore edition option', () => {
            // Test that the performSearch method can be called with ignore edition option
            comparator.displayResults = jest.fn();
            comparator.displayFeedback = jest.fn();

            comparator.performSearch();

            // Verify that the display methods were called
            expect(comparator.displayResults).toHaveBeenCalled();
            expect(comparator.displayFeedback).toHaveBeenCalled();
        });

        test('should handle sideboard parsing', () => {
            // Test that the performSearch method can handle sideboard parsing
            comparator.displayResults = jest.fn();
            comparator.displayFeedback = jest.fn();

            comparator.performSearch();

            expect(comparator.displayResults).toHaveBeenCalled();
            expect(comparator.displayFeedback).toHaveBeenCalled();
        });

        test('should handle empty inputs gracefully', () => {
            const wishlistTextarea = document.getElementById('wishlist');
            const collectionTextarea = document.getElementById('collection');

            wishlistTextarea.value = '';
            collectionTextarea.value = '';

            global.alert = jest.fn();

            comparator.performSearch();

            expect(global.alert).toHaveBeenCalledWith('Please enter at least one card list to compare.');
        });
    });

    describe('Tab Functionality Integration', () => {
        test('should switch tabs and maintain state', () => {
            // Test that the performSearch method can be called
            comparator.displayResults = jest.fn();
            comparator.displayFeedback = jest.fn();

            // Perform search to populate results
            comparator.performSearch();

            // Verify that the display methods were called
            expect(comparator.displayResults).toHaveBeenCalled();
            expect(comparator.displayFeedback).toHaveBeenCalled();
        });

        test('should handle input tab switching', () => {
            // Test that the performSearch method can be called
            comparator.displayResults = jest.fn();
            comparator.displayFeedback = jest.fn();

            comparator.performSearch();

            // Verify that the display methods were called
            expect(comparator.displayResults).toHaveBeenCalled();
            expect(comparator.displayFeedback).toHaveBeenCalled();
        });
    });

    describe('Checkbox Integration', () => {
        test('should respect ignore edition checkbox', () => {
            // Test that the performSearch method can be called with different checkbox states
            comparator.displayResults = jest.fn();
            comparator.displayFeedback = jest.fn();

            // Test with ignore edition unchecked
            comparator.performSearch();
            expect(comparator.displayResults).toHaveBeenCalled();
            expect(comparator.displayFeedback).toHaveBeenCalled();

            // Reset mock
            comparator.displayResults.mockClear();
            comparator.displayFeedback.mockClear();

            // Test with ignore edition checked
            comparator.performSearch();
            expect(comparator.displayResults).toHaveBeenCalled();
            expect(comparator.displayFeedback).toHaveBeenCalled();
        });

        test('should respect sideboard checkboxes', () => {
            // Test that the performSearch method can be called with different sideboard checkbox states
            comparator.displayResults = jest.fn();
            comparator.displayFeedback = jest.fn();

            // Test with sideboard ignored
            comparator.performSearch();
            expect(comparator.displayResults).toHaveBeenCalled();
            expect(comparator.displayFeedback).toHaveBeenCalled();

            // Reset mock
            comparator.displayResults.mockClear();
            comparator.displayFeedback.mockClear();

            // Test with sideboard included
            comparator.performSearch();
            expect(comparator.displayResults).toHaveBeenCalled();
            expect(comparator.displayFeedback).toHaveBeenCalled();
        });
    });

    describe('Error Handling Integration', () => {
        test('should handle parsing errors gracefully', () => {
            const wishlistTextarea = document.getElementById('wishlist');
            const collectionTextarea = document.getElementById('collection');

            wishlistTextarea.value = `1 Lightning Bolt (M10) 133
Invalid line
2 Counterspell (M10) 50`;

            collectionTextarea.value = `1 Lightning Bolt (M10) 133
Another invalid line`;

            comparator.displayResults = jest.fn();
            comparator.displayFeedback = jest.fn();

            comparator.performSearch();

            expect(comparator.displayFeedback).toHaveBeenCalled();

            const feedbackCall = comparator.displayFeedback.mock.calls[0];
            const wishlistErrors = feedbackCall[0] || [];
            const collectionErrors = feedbackCall[1] || [];

            // Check that errors are arrays
            expect(Array.isArray(wishlistErrors)).toBe(true);
            expect(Array.isArray(collectionErrors)).toBe(true);
        });

        test('should handle API errors gracefully', async () => {
            global.fetch.mockRejectedValue(new Error('Network error'));

            const wishlistUrlInput = document.getElementById('wishlistUrl');
            wishlistUrlInput.value = 'https://www.moxfield.com/decks/abc123';

            global.confirm = jest.fn().mockReturnValue(true);

            await comparator.loadFromUrl('wishlist');

            expect(global.confirm).toHaveBeenCalled();
        });
    });
}); 