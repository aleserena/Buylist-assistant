/**
 * Theme Manager Module
 * Handles dark/light mode switching and persistence
 */
export class ThemeManager {
    constructor() {
        this.THEME_KEY = 'mtg-comparator-theme';
        this.darkMode = false;
        this.init();
    }

    /**
     * Initialize theme based on saved preference or system preference
     */
    init() {
        // Check for saved preference
        const savedTheme = localStorage.getItem(this.THEME_KEY);

        if (savedTheme) {
            this.darkMode = savedTheme === 'dark';
        } else if (window.matchMedia) {
            // Use system preference if no saved preference and matchMedia is available
            this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        } else {
            // Default to light mode in environments without matchMedia (like tests)
            this.darkMode = false;
        }

        this.applyTheme();

        // Listen for system theme changes (only if matchMedia is available)
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // Only auto-switch if user hasn't manually set a preference
                if (!localStorage.getItem(this.THEME_KEY)) {
                    this.darkMode = e.matches;
                    this.applyTheme();
                }
            });
        }
    }

    /**
     * Toggle between dark and light mode
     */
    toggle() {
        this.darkMode = !this.darkMode;
        this.applyTheme();
        this.savePreference();
    }

    /**
     * Apply the current theme
     */
    applyTheme() {
        if (this.darkMode) {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }

        // Trigger event for other components that might need to react
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { darkMode: this.darkMode }
        }));
    }

    /**
     * Save theme preference to localStorage
     */
    savePreference() {
        localStorage.setItem(this.THEME_KEY, this.darkMode ? 'dark' : 'light');
    }

    /**
     * Get current theme state
     */
    isDarkMode() {
        return this.darkMode;
    }
}
