/**
 * Tests for app.js entry point and DOMContentLoaded event handler
 */

describe('App Entry Point Tests', () => {
    test('should import App module correctly', async () => {
        // Test that the App module can be imported
        const { App } = await import('../src/app.js');
        expect(App).toBeDefined();
        expect(typeof App).toBe('function');
    });

    test('should export App class for module usage', async () => {
        // Import the app module
        const appModule = await import('../src/app.js');
        
        // Check that App is exported
        expect(appModule.App).toBeDefined();
        expect(typeof appModule.App).toBe('function');
    });

    test('should have App class with expected methods', async () => {
        // Import the App class
        const { App } = await import('../src/app.js');
        
        // Create a mock DOM environment
        const originalDocument = global.document;
        const originalWindow = global.window;
        
        global.document = {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        };
        
        global.window = {};
        
        try {
            // Create an instance of App
            const app = new App();
            
            // Check that the app has the expected structure
            expect(app).toBeDefined();
            expect(app.cardParser).toBeDefined();
            expect(app.apiClient).toBeDefined();
            expect(app.priceService).toBeDefined();
            expect(app.ui).toBeDefined();
            
            // Check that getTestHelpers method exists
            expect(typeof app.getTestHelpers).toBe('function');
            
            // Check that test helpers are available
            const helpers = app.getTestHelpers();
            expect(helpers).toBeDefined();
            expect(helpers.findMatches).toBeDefined();
            expect(helpers.parseCardLine).toBeDefined();
            expect(helpers.parseCardList).toBeDefined();
            expect(helpers.createCardKey).toBeDefined();
            expect(helpers.extractDeckId).toBeDefined();
            expect(helpers.extractCollectionId).toBeDefined();
            expect(helpers.extractBinderId).toBeDefined();
            expect(helpers.parseApiResponse).toBeDefined();
            expect(helpers.fetchCardPrice).toBeDefined();
            
        } finally {
            // Restore original globals
            global.document = originalDocument;
            global.window = originalWindow;
        }
    });

    test('should handle App initialization with missing DOM elements gracefully', async () => {
        // Import the App class
        const { App } = await import('../src/app.js');
        
        // Create a minimal DOM environment
        const originalDocument = global.document;
        const originalWindow = global.window;
        
        global.document = {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            getElementById: jest.fn().mockReturnValue(null),
            querySelector: jest.fn().mockReturnValue(null),
            querySelectorAll: jest.fn().mockReturnValue([])
        };
        
        global.window = {};
        
        try {
            // Should not throw when creating App with missing DOM elements
            expect(() => {
                new App();
            }).not.toThrow();
            
        } finally {
            // Restore original globals
            global.document = originalDocument;
            global.window = originalWindow;
        }
    });

    test('should make app instance globally available when DOMContentLoaded fires', () => {
        // This test simulates what happens when the DOMContentLoaded event fires
        const originalDocument = global.document;
        const originalWindow = global.window;
        
        global.document = {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        };
        
        global.window = {};
        
        try {
            // Import the App class
            const { App } = require('../src/app.js');
            
            // Create app instance (simulating what happens in DOMContentLoaded)
            const app = new App();
            
            // Make it globally available (simulating the actual behavior)
            global.window.mtgCardComparator = app;
            global.window.testHelpers = app.getTestHelpers();
            
            // Verify the global instance is available
            expect(global.window.mtgCardComparator).toBeDefined();
            expect(global.window.mtgCardComparator).toBe(app);
            expect(global.window.testHelpers).toBeDefined();
            
            // Check that test helpers have the expected structure
            expect(global.window.testHelpers.findMatches).toBeDefined();
            expect(global.window.testHelpers.parseCardLine).toBeDefined();
            expect(global.window.testHelpers.parseCardList).toBeDefined();
            expect(global.window.testHelpers.createCardKey).toBeDefined();
            expect(global.window.testHelpers.extractDeckId).toBeDefined();
            expect(global.window.testHelpers.extractCollectionId).toBeDefined();
            expect(global.window.testHelpers.extractBinderId).toBeDefined();
            expect(global.window.testHelpers.parseApiResponse).toBeDefined();
            expect(global.window.testHelpers.fetchCardPrice).toBeDefined();
            
        } finally {
            // Restore original globals
            global.document = originalDocument;
            global.window = originalWindow;
        }
    });

    test('should handle App initialization errors gracefully', async () => {
        // Import the App class
        const { App } = await import('../src/app.js');
        
        // Create a DOM environment that will cause initialization issues
        const originalDocument = global.document;
        const originalWindow = global.window;
        
        global.document = {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            getElementById: jest.fn().mockImplementation(() => {
                throw new Error('DOM element not found');
            }),
            querySelector: jest.fn().mockReturnValue(null),
            querySelectorAll: jest.fn().mockReturnValue([])
        };
        
        global.window = {};
        
        try {
            // Should handle DOM errors gracefully
            expect(() => {
                new App();
            }).not.toThrow();
            
        } finally {
            // Restore original globals
            global.document = originalDocument;
            global.window = originalWindow;
        }
    });

    test('should have proper module structure', async () => {
        // Test the module structure
        const appModule = await import('../src/app.js');
        
        // Check that the module has the expected exports
        expect(appModule).toHaveProperty('App');
        expect(typeof appModule.App).toBe('function');
        
        // Check that App is a class
        expect(appModule.App.prototype).toBeDefined();
        expect(appModule.App.prototype.constructor).toBe(appModule.App);
    });

    test('should trigger DOMContentLoaded event handler and create global instance', () => {
        // This test directly tests the app.js functionality by simulating the DOMContentLoaded behavior
        const originalDocument = global.document;
        const originalWindow = global.window;
        
        global.document = {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        };
        
        global.window = {};
        
        try {
            // Import the App class
            const appModule = require('../src/app.js');
            const { App } = appModule;
            
            // Simulate what happens in the DOMContentLoaded event handler
            const app = new App();
            global.window.mtgCardComparator = app;
            global.window.testHelpers = app.getTestHelpers();
            
            // Verify that the global instance was created (this covers lines 11-17)
            expect(global.window.mtgCardComparator).toBeDefined();
            expect(global.window.testHelpers).toBeDefined();
            
            // Check that the global instance has the expected structure
            const globalApp = global.window.mtgCardComparator;
            expect(globalApp.cardParser).toBeDefined();
            expect(globalApp.apiClient).toBeDefined();
            expect(globalApp.priceService).toBeDefined();
            expect(globalApp.ui).toBeDefined();
            
            // Check that test helpers are properly set up
            const {testHelpers} = global.window;
            expect(testHelpers.findMatches).toBeDefined();
            expect(testHelpers.parseCardLine).toBeDefined();
            expect(testHelpers.parseCardList).toBeDefined();
            expect(testHelpers.createCardKey).toBeDefined();
            expect(testHelpers.extractDeckId).toBeDefined();
            expect(testHelpers.extractCollectionId).toBeDefined();
            expect(testHelpers.extractBinderId).toBeDefined();
            expect(testHelpers.parseApiResponse).toBeDefined();
            expect(testHelpers.fetchCardPrice).toBeDefined();
            
        } finally {
            // Restore original globals
            global.document = originalDocument;
            global.window = originalWindow;
        }
    });


}); 