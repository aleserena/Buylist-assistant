/**
 * Tests for Moxfield parsing functionality
 */

/* global MTGCardComparator */

describe('Moxfield Parsing Tests', () => {
    let comparator;

    beforeEach(() => {
    // Get the comparator instance from the global scope
        comparator = window.mtgCardComparator || new MTGCardComparator();
    });

    describe('parseCardLine', () => {
        test('should parse full format with quantity, name, set, number, and foil', () => {
            const result = comparator.parseCardLine('1 Aether Channeler (DMU) 42 *F*');
            expect(result).toMatchObject({
                quantity: 1,
                name: 'Aether Channeler',
                set: 'DMU',
                number: '42',
                foil: true,
                etched: false
            });
        });

        test('should parse format without quantity', () => {
            const result = comparator.parseCardLine('Aether Channeler (DMU) 42 *F*');
            expect(result).toMatchObject({
                quantity: 1,
                name: 'Aether Channeler',
                set: 'DMU',
                number: '42',
                foil: true,
                etched: false
            });
        });

        test('should parse format without set code', () => {
            const result = comparator.parseCardLine('1 Aether Channeler 42 *F*');
            expect(result).toMatchObject({
                quantity: 1,
                name: 'Aether Channeler',
                set: '',
                number: '42',
                foil: true,
                etched: false
            });
        });

        test('should parse format without quantity and set code', () => {
            const result = comparator.parseCardLine('Aether Channeler 42 *F*');
            expect(result).toMatchObject({
                quantity: 1,
                name: 'Aether Channeler',
                set: '',
                number: '42',
                foil: true,
                etched: false
            });
        });

        test('should parse format with set code but no number', () => {
            const result = comparator.parseCardLine('1 Aether Channeler (DMU) *F*');
            expect(result).toMatchObject({
                quantity: 1,
                name: 'Aether Channeler',
                set: 'DMU',
                number: '',
                foil: true,
                etched: false
            });
        });

        test('should parse format without quantity, set code, and number', () => {
            const result = comparator.parseCardLine('Aether Channeler (DMU) *F*');
            expect(result).toMatchObject({
                quantity: 1,
                name: 'Aether Channeler',
                set: 'DMU',
                number: '',
                foil: true,
                etched: false
            });
        });

        test('should parse format with just quantity and name', () => {
            const result = comparator.parseCardLine('1 Aether Channeler');
            expect(result).toMatchObject({
                quantity: 1,
                name: 'Aether Channeler',
                set: '',
                number: '',
                foil: false,
                etched: false
            });
        });

        test('should parse format with just name', () => {
            const result = comparator.parseCardLine('Aether Channeler');
            expect(result).toMatchObject({
                quantity: 1,
                name: 'Aether Channeler',
                set: '',
                number: '',
                foil: false,
                etched: false
            });
        });

        test('should handle etched foil indicator', () => {
            const result = comparator.parseCardLine('1 Lightning Bolt (M10) 133 *E*');
            expect(result).toMatchObject({
                quantity: 1,
                name: 'Lightning Bolt',
                set: 'M10',
                number: '133',
                foil: false,
                etched: true
            });
        });

        test('should handle multiple quantities', () => {
            const result = comparator.parseCardLine('3 Lightning Bolt (M10) 133');
            expect(result).toMatchObject({
                quantity: 3,
                name: 'Lightning Bolt',
                set: 'M10',
                number: '133',
                foil: false,
                etched: false
            });
        });

        test('should handle cards with hyphens in names', () => {
            const result = comparator.parseCardLine('1 Lightning-Bolt (M10) 133');
            expect(result).toMatchObject({
                quantity: 1,
                name: 'Lightning-Bolt',
                set: 'M10',
                number: '133',
                foil: false,
                etched: false
            });
        });

        test('should handle cards with apostrophes in names', () => {
            const result = comparator.parseCardLine('1 Jace\'s Phantasm (ISD) 56');
            expect(result).toMatchObject({
                quantity: 1,
                name: 'Jace\'s Phantasm',
                set: 'ISD',
                number: '56',
                foil: false,
                etched: false
            });
        });

        test('should parse card with star in collector number', () => {
            const result = comparator.parseCardLine('1 Lathril, Blade of the Elves (PKHM) 2★ *E*');
            expect(result).toMatchObject({
                quantity: 1,
                name: 'Lathril, Blade of the Elves',
                set: 'PKHM',
                number: '2★',
                foil: false,
                etched: true
            });
        });

        test('should parse card with star in collector number without foil indicator', () => {
            const result = comparator.parseCardLine('1 Lathril, Blade of the Elves (PKHM) 2★');
            expect(result).toMatchObject({
                quantity: 1,
                name: 'Lathril, Blade of the Elves',
                set: 'PKHM',
                number: '2★',
                foil: false,
                etched: false
            });
        });

        test('should parse card with star in collector number and foil indicator', () => {
            const result = comparator.parseCardLine('1 Lathril, Blade of the Elves (PKHM) 2★ *F*');
            expect(result).toMatchObject({
                quantity: 1,
                name: 'Lathril, Blade of the Elves',
                set: 'PKHM',
                number: '2★',
                foil: true,
                etched: false
            });
        });

        test('should return null for empty lines', () => {
            const result = comparator.parseCardLine('');
            expect(result).toBeNull();
        });

        test('should return null for whitespace-only lines', () => {
            const result = comparator.parseCardLine('   ');
            expect(result).toBeNull();
        });

        test('should return null for invalid formats', () => {
            const result = comparator.parseCardLine('Invalid card format');
            expect(result).toBeNull();
        });
    });

    describe('parseCardList', () => {
        test('should parse a simple card list', () => {
            const input = `1 Aether Channeler (DMU) 42 *F*
2 Lightning Bolt (M10) 133`;
      
            const result = comparator.parseCardList(input);
      
            expect(result.cards).toHaveLength(2);
            expect(result.cards[0]).toEqual({
                quantity: 1,
                name: 'Aether Channeler',
                set: 'DMU',
                number: '42',
                foil: true,
                etched: false
            });
            expect(result.cards[1]).toEqual({
                quantity: 2,
                name: 'Lightning Bolt',
                set: 'M10',
                number: '133',
                foil: false,
                etched: false
            });
            expect(result.errors).toHaveLength(0);
        });

        test('should handle sideboard when ignoreSideboard is false', () => {
            const input = `1 Aether Channeler (DMU) 42 *F*
2 Lightning Bolt (M10) 133

SIDEBOARD:
1 Counterspell (M10) 50`;
      
            const result = comparator.parseCardList(input, false);
      
            expect(result.cards).toHaveLength(3);
            expect(result.cards[0].name).toBe('Aether Channeler');
            expect(result.cards[1].name).toBe('Lightning Bolt');
            expect(result.cards[2].name).toBe('Counterspell');
        });

        test('should ignore sideboard when ignoreSideboard is true', () => {
            const input = `1 Aether Channeler (DMU) 42 *F*
2 Lightning Bolt (M10) 133

SIDEBOARD:
1 Counterspell (M10) 50`;
      
            const result = comparator.parseCardList(input, true);
      
            expect(result.cards).toHaveLength(2);
            expect(result.cards[0].name).toBe('Aether Channeler');
            expect(result.cards[1].name).toBe('Lightning Bolt');
            expect(result.errors).toHaveLength(0);
        });

        test('should handle empty lines and whitespace', () => {
            const input = `1 Aether Channeler (DMU) 42 *F*

2 Lightning Bolt (M10) 133
   
3 Counterspell (M10) 50`;
      
            const result = comparator.parseCardList(input);
      
            expect(result.cards).toHaveLength(3);
            expect(result.errors).toHaveLength(0);
        });

        test('should report parsing errors', () => {
            const input = `1 Aether Channeler (DMU) 42 *F*
Invalid line
2 Lightning Bolt (M10) 133
Another invalid line`;
      
            const result = comparator.parseCardList(input);
      
            expect(result.cards).toHaveLength(2);
            expect(result.errors).toHaveLength(2);
            expect(result.errors[0]).toEqual({
                line: 2,
                content: 'Invalid line',
                message: 'Invalid card format'
            });
            expect(result.errors[1]).toEqual({
                line: 4,
                content: 'Another invalid line',
                message: 'Invalid card format'
            });
        });

        test('should handle mixed valid and invalid lines', () => {
            const input = `1 Aether Channeler (DMU) 42 *F*
Invalid line
2 Lightning Bolt (M10) 133
Another invalid line
3 Counterspell (M10) 50`;
      
            const result = comparator.parseCardList(input);
      
            expect(result.cards).toHaveLength(3);
            expect(result.errors).toHaveLength(2);
        });
    });

    describe('createCardKey', () => {
        test('should create unique keys for different cards', () => {
            const card1 = { name: 'Lightning Bolt', set: 'M10', number: '133', foil: false };
            const card2 = { name: 'Lightning Bolt', set: 'M11', number: '133', foil: false };
      
            const key1 = comparator.createCardKey(card1, false);
            const key2 = comparator.createCardKey(card2, false);
      
            expect(key1).not.toBe(key2);
        });

        test('should create same keys for same cards', () => {
            const card1 = { name: 'Lightning Bolt', set: 'M10', number: '133', foil: false };
            const card2 = { name: 'Lightning Bolt', set: 'M10', number: '133', foil: false };
      
            const key1 = comparator.createCardKey(card1, false);
            const key2 = comparator.createCardKey(card2, false);
      
            expect(key1).toBe(key2);
        });

        test('should create different keys for foil vs non-foil', () => {
            const card1 = { name: 'Lightning Bolt', set: 'M10', number: '133', foil: false };
            const card2 = { name: 'Lightning Bolt', set: 'M10', number: '133', foil: true };
      
            const key1 = comparator.createCardKey(card1, false);
            const key2 = comparator.createCardKey(card2, false);
      
            expect(key1).not.toBe(key2);
        });

        test('should ignore edition when ignoreEdition is true', () => {
            const card1 = { name: 'Lightning Bolt', set: 'M10', number: '133', foil: false };
            const card2 = { name: 'Lightning Bolt', set: 'M11', number: '133', foil: false };
      
            const key1 = comparator.createCardKey(card1, true);
            const key2 = comparator.createCardKey(card2, true);
      
            expect(key1).toBe(key2);
        });

        test('should handle cards with empty set and number', () => {
            const card = { name: 'Lightning Bolt', set: '', number: '', foil: false };
            const key = comparator.createCardKey(card, false);
        
            expect(key).toBe('lightning bolt-unknown-unknown-nonfoil-nonetched');
        });
    });
}); 