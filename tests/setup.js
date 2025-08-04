// Jest setup file for DOM testing

// Mock fetch globally
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
};

// Mock DOM methods that aren't available in jsdom
Element.prototype.scrollIntoView = jest.fn();

// Mock alert and confirm
global.alert = jest.fn();
global.confirm = jest.fn();

// Setup DOM environment
document.body.innerHTML = `
  <div class="container">
    <header>
      <h1>MTG Card List Comparator</h1>
      <p>Compare your wishlist with your collection to see what cards you already own</p>
    </header>

    <div class="input-section">
      <div class="input-group">
        <label for="wishlist">Wishlist Cards:</label>
        <div class="input-tabs">
          <button class="input-tab-btn active" data-input-tab="wishlist-text">Text</button>
          <button class="input-tab-btn" data-input-tab="wishlist-url">Moxfield URL</button>
        </div>
        <div class="input-content active" id="wishlistTextTab">
          <textarea id="wishlist" placeholder="Paste your wishlist here (Moxfield format)&#10;Example:&#10;1 Aether Channeler (DMU) 42 *F*&#10;2 Lightning Bolt (M10) 133"></textarea>
        </div>
        <div class="input-content" id="wishlistUrlTab">
          <input type="url" id="wishlistUrl" placeholder="https://www.moxfield.com/decks/..." class="url-input">
          <button id="loadWishlistBtn" class="load-btn">Load from URL</button>
        </div>
        <div class="input-options">
          <label class="checkbox-label">
            <input type="checkbox" id="ignoreWishlistSideboard" checked>
            <span class="checkmark"></span>
            Ignore sideboard in wishlist
          </label>
        </div>
      </div>

      <div class="input-group">
        <label for="collection">Collection Cards:</label>
        <div class="input-tabs">
          <button class="input-tab-btn active" data-input-tab="collection-text">Text</button>
          <button class="input-tab-btn" data-input-tab="collection-url">Moxfield URL</button>
        </div>
        <div class="input-content active" id="collectionTextTab">
          <textarea id="collection" placeholder="Paste your collection here (Moxfield format)&#10;Example:&#10;1 Aether Channeler (DMU) 42 *F*&#10;3 Lightning Bolt (M10) 133"></textarea>
        </div>
        <div class="input-content" id="collectionUrlTab">
          <input type="url" id="collectionUrl" placeholder="https://www.moxfield.com/decks/..." class="url-input">
          <button id="loadCollectionBtn" class="load-btn">Load from URL</button>
        </div>
        <div class="input-options">
          <label class="checkbox-label">
            <input type="checkbox" id="ignoreCollectionSideboard" checked>
            <span class="checkmark"></span>
            Ignore sideboard in collection
          </label>
        </div>
      </div>
    </div>

    <div class="options-section">
      <div class="option-group">
        <label class="checkbox-label">
          <input type="checkbox" id="ignoreEdition">
          <span class="checkmark"></span>
          Ignore edition and search by card name only
        </label>
      </div>
      <div class="option-group">
        <label for="priceProvider" class="price-provider-label">Price Provider:</label>
        <select id="priceProvider" class="price-provider-select">
          <option value="cardkingdom">Card Kingdom</option>
          <option value="tcgplayer">TCGPlayer</option>
          <option value="starcitygames">Star City Games</option>
          <option value="coolstuffinc">CoolStuffInc</option>
          <option value="cardhoarder">CardHoarder</option>
          <option value="cardmarket">CardMarket</option>
        </select>
      </div>
    </div>

    <button id="searchBtn" class="search-btn">Search for Matches</button>

    <div class="results-section" id="resultsSection" style="display: none;">
      <h2>Results</h2>
      <div class="results-stats">
        <div class="stat">
          <span class="stat-number" id="totalWishlist">0</span>
          <span class="stat-label">Cards in Wishlist</span>
        </div>
        <div class="stat">
          <span class="stat-number" id="totalCollection">0</span>
          <span class="stat-label">Cards in Collection</span>
        </div>
        <div class="stat">
          <span class="stat-number" id="matchesFound">0</span>
          <span class="stat-label">Matches Found</span>
        </div>
      </div>
      
      <div class="results-tabs">
        <button class="tab-btn active" data-tab="matches">Matches (<span id="matchesCount">0</span>)</button>
        <button class="tab-btn" data-tab="missing">Missing (<span id="missingCount">0</span>)</button>
      </div>

      <div class="tab-content active" id="matchesTab">
        <div class="card-list" id="matchesList"></div>
      </div>

      <div class="tab-content" id="missingTab">
        <div class="card-list" id="missingList"></div>
      </div>
    </div>

    <div class="feedback-section" id="feedbackSection" style="display: none;">
      <h3>Parsing Errors</h3>
      <div class="feedback-stats">
        <div class="feedback-stat">
          <span class="feedback-stat-number" id="wishlistParsed">0</span>
          <span class="feedback-stat-label">Wishlist Cards Parsed</span>
        </div>
        <div class="feedback-stat">
          <span class="feedback-stat-number" id="collectionParsed">0</span>
          <span class="feedback-stat-label">Collection Cards Parsed</span>
        </div>
      </div>
      <div class="feedback-tabs">
        <button class="feedback-tab-btn active" data-feedback-tab="wishlist">Wishlist Errors (<span id="wishlistErrorCount">0</span>)</button>
        <button class="feedback-tab-btn" data-feedback-tab="collection">Collection Errors (<span id="collectionErrorCount">0</span>)</button>
      </div>
      <div class="feedback-content active" id="wishlistFeedbackTab">
        <div class="error-list" id="wishlistErrorList"></div>
      </div>
      <div class="feedback-content" id="collectionFeedbackTab">
        <div class="error-list" id="collectionErrorList"></div>
      </div>
    </div>
  </div>
`;

// Trigger DOMContentLoaded event
document.dispatchEvent(new Event('DOMContentLoaded')); 