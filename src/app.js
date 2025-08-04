/**
 * Main Application Entry Point
 * MTG Card List Comparator - Modular Version
 */

import { App } from './modules/App.js';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create the main app instance
    const app = new App();
    
    // Make it globally available for testing
    window.mtgCardComparator = app;
    
    // Make test helpers available
    window.testHelpers = app.getTestHelpers();
});

// Export for module usage
export { App }; 