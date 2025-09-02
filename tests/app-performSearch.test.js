/**
 * Tests focused on App.performSearch and event binding
 */

import { App } from '../src/modules/App.js';

describe('App performSearch and bindings', () => {
    let app;

    beforeEach(() => {
        document.body.innerHTML = `
      <button id="searchBtn">Search</button>
      <button id="loadWishlistBtn">Load Wishlist</button>
      <button id="loadCollectionBtn">Load Collection</button>
      <input id="wishlistUrl" />
      <input id="collectionUrl" />
      <textarea id="wishlist"></textarea>
      <textarea id="collection"></textarea>
      <select id="priceProvider"><option value="tcgplayer">TCGPlayer</option></select>
      <input type="checkbox" id="ignoreEdition" />
      <input type="checkbox" id="ignoreWishlistSideboard" />
      <input type="checkbox" id="ignoreCollectionSideboard" />
      <div id="resultsSection">
        <div class="tab-btn" data-tab="matches">Matches</div>
        <div class="tab-btn" data-tab="missing">Missing</div>
        <div class="tab-content" id="matchesTab"></div>
        <div class="tab-content" id="missingTab"></div>
        <div id="matchesList"></div>
        <div id="missingList"></div>
      </div>
      <div id="feedbackSection"></div>
    `;

        // Silence alerts in tests
        global.alert = jest.fn();
        app = new App();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('clicking search button calls performSearch', () => {
        const spy = jest.spyOn(app, 'performSearch').mockResolvedValue();
        document.getElementById('searchBtn').click();
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });

    test('performSearch parses inputs, displays results, and triggers price refresh', async () => {
    // Provide simple matching lists
        document.getElementById('wishlist').value = '1 Lightning Bolt (M10) 133';
        document.getElementById('collection').value = '2 Lightning Bolt (M10) 133';

        const displayResults = jest.spyOn(app.ui, 'displayResults').mockImplementation(() => {});
        const displayFeedback = jest.spyOn(app.ui, 'displayFeedback').mockImplementation(() => {});
        const refreshSpy = jest.spyOn(app, 'refreshAllPrices').mockResolvedValue();

        await app.performSearch();

        expect(displayResults).toHaveBeenCalled();
        expect(displayFeedback).toHaveBeenCalled();
        // Because there is at least one match, refreshAllPrices should run
        expect(refreshSpy).toHaveBeenCalled();

        displayResults.mockRestore();
        displayFeedback.mockRestore();
        refreshSpy.mockRestore();
    });
});

