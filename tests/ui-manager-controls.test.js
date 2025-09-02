/**
 * Tests for UIManager controls: sorting, filtering, loading indicators, and totals
 */

import { UIManager } from '../src/modules/UIManager.js';

describe('UIManager Controls & Utilities', () => {
    let ui;

    beforeEach(() => {
        document.body.innerHTML = `
      <div class="results-section" id="resultsSection">
        <button class="tab-btn" data-tab="matches">Matches</button>
        <button class="tab-btn" data-tab="missing">Missing</button>
        <div class="tab-content" id="matchesTab"></div>
        <div class="tab-content" id="missingTab"></div>
        <div id="matchesList"></div>
        <div id="missingList"></div>
      </div>

      <div class="input-group">
        <div class="input-tabs">
          <button class="input-tab-btn" data-input-tab="wishlistTextTab">Text</button>
          <button class="input-tab-btn" data-input-tab="wishlistUrlTab">URL</button>
        </div>
        <div class="input-content" id="wishlistTextTab"></div>
        <div class="input-content" id="wishlistUrlTab"></div>
      </div>
      <div class="input-group">
        <div class="input-tabs">
          <button class="input-tab-btn" data-input-tab="collectionTextTab">Text</button>
          <button class="input-tab-btn" data-input-tab="collectionUrlTab">URL</button>
        </div>
        <div class="input-content" id="collectionTextTab"></div>
        <div class="input-content" id="collectionUrlTab"></div>
      </div>

      <div id="feedbackSection">
        <button class="feedback-tab-btn" data-feedback-tab="wishlist">Wishlist</button>
        <button class="feedback-tab-btn" data-feedback-tab="collection">Collection</button>
        <div class="feedback-content" id="wishlist"></div>
        <div class="feedback-content" id="collection"></div>
        <span id="wishlistErrorCount"></span>
        <span id="collectionErrorCount"></span>
        <span id="wishlistParsed"></span>
        <span id="collectionParsed"></span>
        <div id="wishlistErrorList"></div>
        <div id="collectionErrorList"></div>
      </div>

      <textarea id="wishlist"></textarea>
      <textarea id="collection"></textarea>
      <input id="wishlistUrl" />
      <input id="collectionUrl" />
      <input type="checkbox" id="ignoreEdition" />
      <input type="checkbox" id="ignoreWishlistSideboard" />
      <input type="checkbox" id="ignoreCollectionSideboard" />
      <select id="priceProvider"><option value="tcgplayer">TCG</option></select>
      <button id="loadWishlistBtn">Load</button>
      <button id="loadCollectionBtn">Load</button>
      <button id="searchBtn">Search</button>

      <select id="matchesSort"><option value="name">Name</option><option value="set">Set</option><option value="quantity">Quantity</option><option value="price">Price</option></select>
      <input type="checkbox" id="matchesFilterFoil" />
      <input type="checkbox" id="matchesFilterEtched" />
      <button id="matchesReset">Reset</button>

      <select id="missingSort"><option value="name">Name</option><option value="set">Set</option><option value="quantity">Quantity</option><option value="price">Price</option></select>
      <input type="checkbox" id="missingFilterFoil" />
      <input type="checkbox" id="missingFilterEtched" />
      <button id="missingReset">Reset</button>
      <button id="exportMissing">Export</button>

      <span id="matchesFound">0</span>
    `;

        ui = new UIManager();
        ui.bindEvents();
    });

    test('switchTab toggles active state', () => {
        ui.switchTab('missing');
        expect(document.getElementById('missingTab').classList.contains('active')).toBe(true);
        expect(document.getElementById('matchesTab').classList.contains('active')).toBe(false);
    });

    test('switchInputTab toggles groups independently', () => {
        ui.switchInputTab('wishlistUrlTab');
        expect(document.getElementById('wishlistUrlTab').classList.contains('active')).toBe(true);
        ui.switchInputTab('collectionUrlTab');
        expect(document.getElementById('collectionUrlTab').classList.contains('active')).toBe(true);
    });

    test('switchFeedbackTab toggles feedback panels', () => {
        ui.switchFeedbackTab('collection');
        expect(document.getElementById('collection').classList.contains('active')).toBe(true);
    });

    test('show/hide loading state disables/enables buttons', () => {
        ui.showLoadingState('wishlist');
        expect(ui.loadWishlistBtn.disabled).toBe(true);
        ui.hideLoadingState('wishlist');
        expect(ui.loadWishlistBtn.disabled).toBe(false);
    });

    test('show/hide price loading indicator', () => {
        ui.showPriceLoadingState();
        const ind = document.getElementById('priceLoadingIndicator');
        expect(ind).toBeTruthy();
        expect(ind.style.display).toBe('flex');
        ui.hidePriceLoadingState();
        expect(ind.style.display).toBe('none');
    });

    test('applyControls sorts by quantity and filters by foil', () => {
        const container = document.getElementById('matchesList');
        container.innerHTML = '';
        const mk = (name, set, qty, foil, total) => {
            const el = document.createElement('div');
            el.className = 'card-item';
            el.dataset.foil = foil ? 'true' : 'false';
            el.dataset.etched = 'false';
            el.dataset.priceTotal = total != null ? String(total) : '';
            el.innerHTML = `
        <span class="card-quantity">${qty}x</span>
        <span class="card-name">${name} (${set})</span>
        <span class="card-badges"></span>
        <span class="card-price"></span>
      `;
            return el;
        };
        const a = mk('A Card', 'ABC', 1, false, 2.0);
        const b = mk('B Card', 'AAA', 3, true, 9.0);
        const c = mk('C Card', 'ZZZ', 2, false, 6.0);
        container.appendChild(a); container.appendChild(b); container.appendChild(c);

        // Sort by price desc
        ui.applyControls(container, 'price', false, false);
        const order1 = Array.from(container.children).map(el => el.querySelector('.card-name').textContent[0]);
        expect(order1).toEqual(['B','C','A']);

        // Filter foil only
        ui.applyControls(container, 'name', true, false);
        const visible = Array.from(container.children).filter(el => el.style.display !== 'none');
        expect(visible).toHaveLength(1);
    });

    test('resetControls resets sort and filters', () => {
        if (ui.matchesSort) ui.matchesSort.value = 'price';
        if (ui.matchesFilterFoil) ui.matchesFilterFoil.checked = true;
        if (ui.matchesFilterEtched) ui.matchesFilterEtched.checked = true;
        ui.resetControls('matches');
        expect(ui.matchesSort.value).toBe('name');
        expect(ui.matchesFilterFoil.checked).toBe(false);
        expect(ui.matchesFilterEtched.checked).toBe(false);
    });

    test('exportMissingCsv creates a download', () => {
        const container = document.getElementById('missingList');
        container.innerHTML = '';
        const el = document.createElement('div');
        el.className = 'card-item';
        el.dataset.foil = 'true';
        el.dataset.etched = 'false';
        el.innerHTML = `
      <span class="card-quantity">2x</span>
      <span class="card-name">Lightning Bolt (M10) 133</span>
      <span class="card-badges"></span>
      <span class="card-price"></span>
    `;
        container.appendChild(el);

        const createObjectURL = jest.fn(() => 'blob://csv');
        const revokeObjectURL = jest.fn();
        global.URL.createObjectURL = createObjectURL;
        global.URL.revokeObjectURL = revokeObjectURL;

        const origAppend = document.body.appendChild.bind(document.body);
        const origRemove = document.body.removeChild.bind(document.body);
        const clickSpy = jest.fn();
        document.body.appendChild = (node) => { if (node && node.tagName === 'A') { node.click = clickSpy; } return origAppend(node); };
        document.body.removeChild = (node) => origRemove(node);

        ui.exportMissingCsv();
        expect(createObjectURL).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalled();

        // cleanup
        document.body.appendChild = origAppend;
        document.body.removeChild = origRemove;
    });

    test('triggerEvent emits and get/set input values work', () => {
        let received = false;
        document.addEventListener('customPing', () => { received = true; });
        ui.triggerEvent('customPing');
        expect(received).toBe(true);

        ui.setInputValues({
            wishlist: 'W',
            collection: 'C',
            wishlistUrl: 'wu',
            collectionUrl: 'cu',
            ignoreEdition: true,
            ignoreWishlistSideboard: true,
            ignoreCollectionSideboard: false,
            priceProvider: 'tcgplayer'
        });
        const vals = ui.getInputValues();
        expect(vals.wishlist).toBe('W');
        expect(vals.collection).toBe('C');
        expect(vals.ignoreEdition).toBe(true);
        expect(vals.ignoreWishlistSideboard).toBe(true);
        expect(vals.ignoreCollectionSideboard).toBe(false);
    });

    test('displayFeedback and displayErrorList render errors', () => {
        const wishlistErrors = [{ line: 1, content: 'bad', message: 'Invalid' }];
        const collectionErrors = [{ line: 2, content: 'worse', message: 'Invalid' }];
        ui.displayFeedback(wishlistErrors, collectionErrors, [{},{}], [{}]);
        expect(document.getElementById('wishlistErrorCount').textContent).toBe('1');
        expect(document.getElementById('collectionErrorCount').textContent).toBe('1');
        expect(document.getElementById('wishlistErrorList').innerHTML).toContain('Line 1');
        expect(document.getElementById('collectionErrorList').innerHTML).toContain('Line 2');
    });

    test('showManualApiInputDialog resolves on cancel', async () => {
        const p = ui.showManualApiInputDialog('http://example/api', 'wishlist');
        const cancel = document.getElementById('cancelManualApi');
        expect(cancel).toBeTruthy();
        cancel.click();
        const result = await p;
        expect(result).toBe('');
    });
});
