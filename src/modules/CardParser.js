/**
 * Card Parser Module
 * Handles parsing of MTG card lines and lists
 */
export class CardParser {
    /**
     * Parse a single card line into a structured object
     * @param {string} line - The card line to parse
     * @returns {Object|null} - Parsed card object or null if invalid
     */
    parseCardLine(line) {
        line = line.trim();
        if (!line) return null;

        // 1. Full format: "1 Aether Channeler (DMU) 42 *F*" or "1 Aether Channeler (DMU) 42 *E*"
        let regex = /^(\d+)\s+([^(]+?)\s*\(([^)]+)\)\s*([A-Z0-9\-★]+[a-z]*)\s*(\*[A-Z]\*)?$/;
        let match = line.match(regex);
        if (match) {
            const foilIndicator = match[5];
            return {
                quantity: parseInt(match[1]),
                name: match[2].trim(),
                set: match[3].trim(),
                number: match[4],
                foil: foilIndicator === '*F*',
                etched: foilIndicator === '*E*'
            };
        }

        // 2. No quantity: "Aether Channeler (DMU) 42 *F*" or "Aether Channeler (DMU) 42 *E*"
        regex = /^([^(]+?)\s*\(([^)]+)\)\s*([A-Z0-9\-★]+[a-z]*)\s*(\*[A-Z]\*)?$/;
        match = line.match(regex);
        if (match) {
            const foilIndicator = match[4];
            return {
                quantity: 1,
                name: match[1].trim(),
                set: match[2].trim(),
                number: match[3],
                foil: foilIndicator === '*F*',
                etched: foilIndicator === '*E*'
            };
        }

        // 3. No set code: "1 Aether Channeler 42 *F*" or "1 Aether Channeler 42 *E*"
        regex = /^(\d+)\s+([^(]+?)\s+([A-Z0-9\-★]+[a-z]*)\s*(\*[A-Z]\*)?$/;
        match = line.match(regex);
        if (match) {
            const foilIndicator = match[4];
            // Make sure this is actually a number/collector number, not just a word
            const numberPart = match[3];
            if (/^[A-Z0-9\-★]+$/.test(numberPart)) {
                return {
                    quantity: parseInt(match[1]),
                    name: match[2].trim(),
                    set: '',
                    number: match[3],
                    foil: foilIndicator === '*F*',
                    etched: foilIndicator === '*E*'
                };
            }
        }

        // 4. No quantity and set code: "Aether Channeler 42 *F*" or "Aether Channeler 42 *E*"
        regex = /^([^(]+?)\s+([A-Z0-9\-★]+[a-z]*)\s*(\*[A-Z]\*)?$/;
        match = line.match(regex);
        if (match) {
            const foilIndicator = match[3];
            // Make sure this is actually a number/collector number, not just a word
            const numberPart = match[2];
            if (/^[A-Z0-9\-★]+$/.test(numberPart)) {
                return {
                    quantity: 1,
                    name: match[1].trim(),
                    set: '',
                    number: match[2],
                    foil: foilIndicator === '*F*',
                    etched: foilIndicator === '*E*'
                };
            }
        }

        // 5. With set code but no number: "1 Aether Channeler (DMU) *F*" or "1 Aether Channeler (DMU) *E*"
        regex = /^(\d+)\s+([^(]+?)\s*\(([^)]+)\)\s*(\*[A-Z]\*)?$/;
        match = line.match(regex);
        if (match) {
            const foilIndicator = match[4];
            return {
                quantity: parseInt(match[1]),
                name: match[2].trim(),
                set: match[3].trim(),
                number: '',
                foil: foilIndicator === '*F*',
                etched: foilIndicator === '*E*'
            };
        }

        // 6. No quantity, set code, and number: "Aether Channeler (DMU) *F*" or "Aether Channeler (DMU) *E*"
        regex = /^([^(]+?)\s*\(([^)]+)\)\s*(\*[A-Z]\*)?$/;
        match = line.match(regex);
        if (match) {
            const foilIndicator = match[3];
            return {
                quantity: 1,
                name: match[1].trim(),
                set: match[2].trim(),
                number: '',
                foil: foilIndicator === '*F*',
                etched: foilIndicator === '*E*'
            };
        }

        // 7. Just quantity and name: "1 Aether Channeler"
        // Use a more specific pattern that captures the entire name
        regex = /^(\d+)\s+(.+)$/;
        match = line.match(regex);
        if (match) {
            const name = match[2].trim();
            // Validate that this looks like a card name (no special characters that indicate other formats)
            if (!name.includes('*') && !name.includes('(') && !name.includes(')') && 
                !/\d/.test(name) && !name.toLowerCase().includes('invalid') && 
                !name.toLowerCase().includes('line') && !name.match(/^[A-Z0-9\-★]+$/)) {
                return {
                    quantity: parseInt(match[1]),
                    name,
                    set: '',
                    number: '',
                    foil: false,
                    etched: false
                };
            }
        }

        // 8. Just name: "Aether Channeler"
        // Use a more specific pattern that captures the entire name
        regex = /^(.+)$/;
        match = line.match(regex);
        if (match) {
            const name = match[1].trim();
            // Validate that this looks like a card name (no special characters that indicate other formats)
            if (!name.includes('*') && !name.includes('(') && !name.includes(')') && 
                !/\d/.test(name) && !name.toLowerCase().includes('invalid') && 
                !name.toLowerCase().includes('line') && !name.match(/^[A-Z0-9\-★]+$/)) {
                return {
                    quantity: 1,
                    name,
                    set: '',
                    number: '',
                    foil: false,
                    etched: false
                };
            }
        }

        return null;
    }

    /**
     * Parse a list of card lines
     * @param {string} input - The input text containing card lines
     * @param {boolean} ignoreSideboard - Whether to ignore sideboard cards
     * @returns {Object} - Object containing cards and errors
     */
    parseCardList(input, ignoreSideboard = false) {
        const lines = input.split('\n');
        const cards = [];
        const errors = [];
        let inSideboard = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (!line) continue;

            // Check for sideboard separator
            if (line.toUpperCase().includes('SIDEBOARD')) {
                inSideboard = true;
                continue;
            }

            // Skip sideboard cards if ignoring sideboard
            if (inSideboard && ignoreSideboard) {
                continue;
            }

            const card = this.parseCardLine(line);
            if (card) {
                cards.push(card);
            } else {
                errors.push({
                    line: i + 1,
                    content: line,
                    message: 'Invalid card format'
                });
            }
        }

        return { cards, errors };
    }

    /**
     * Create a unique key for a card
     * @param {Object} card - The card object
     * @param {boolean} ignoreEdition - Whether to ignore edition differences
     * @returns {string} - The unique key
     */
    createCardKey(card, ignoreEdition = false) {
        const name = card.name.toLowerCase();
        const set = card.set.toLowerCase() || 'unknown';
        const number = card.number.toLowerCase() || 'unknown';
        const foil = card.foil ? 'foil' : 'nonfoil';
        const etched = card.etched ? 'etched' : 'nonetched';

        if (ignoreEdition) {
            return `${name}`;
        }

        return `${name}-${set}-${number}-${foil}-${etched}`;
    }
} 