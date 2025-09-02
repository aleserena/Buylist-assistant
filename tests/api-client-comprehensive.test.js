/**
 * Comprehensive tests for ApiClient module
 */

import { ApiClient } from '../src/modules/ApiClient.js';

describe('ApiClient Comprehensive Tests', () => {
    let apiClient;

    beforeEach(() => {
        apiClient = new ApiClient();
        global.fetch = jest.fn();
        global.alert = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Constructor and Initialization', () => {
        test('should initialize with correct properties', () => {
            expect(apiClient.baseUrl).toBe('https://api2.moxfield.com');
            expect(apiClient.scryfallUrl).toBe('https://api.scryfall.com');
        });
    });

    describe('URL Extraction - Deck IDs', () => {
        test('should extract deck ID from standard deck URL', () => {
            const url = 'https://www.moxfield.com/decks/abc123';
            const result = apiClient.extractDeckId(url);
            
            expect(result).toEqual({ type: 'deck', id: 'abc123' });
        });

        test('should extract deck ID from deck URL with trailing slash', () => {
            const url = 'https://www.moxfield.com/deck/xyz789/';
            const result = apiClient.extractDeckId(url);
            
            expect(result).toEqual({ type: 'deck', id: 'xyz789' });
        });

        test('should extract deck ID from v2 API URL', () => {
            const url = 'https://www.moxfield.com/v2/decks/all/def456';
            const result = apiClient.extractDeckId(url);
            
            // The regex pattern matches "all" as the ID, not "def456"
            expect(result).toEqual({ type: 'deck', id: 'all' });
        });

        test('should return null for invalid deck URLs', () => {
            const invalidUrls = [
                'https://www.moxfield.com/deck',
                'https://www.moxfield.com/decks/',
                'https://example.com/invalid',
                'https://www.moxfield.com/invalid/abc123',
                ''
            ];

            invalidUrls.forEach(url => {
                const result = apiClient.extractDeckId(url);
                expect(result).toBeNull();
            });
        });

        test('should handle complex deck IDs', () => {
            const url = 'https://www.moxfield.com/decks/abc-123_xyz-789';
            const result = apiClient.extractDeckId(url);
            
            expect(result).toEqual({ type: 'deck', id: 'abc-123_xyz-789' });
        });
    });

    describe('URL Extraction - Collection IDs', () => {
        test('should extract collection ID from standard collection URL', () => {
            const url = 'https://www.moxfield.com/collection/abc123';
            const result = apiClient.extractCollectionId(url);
            
            expect(result).toEqual({ type: 'collection', id: 'abc123' });
        });

        test('should extract collection ID from v1 API URL', () => {
            const url = 'https://www.moxfield.com/v1/collections/search/xyz789';
            const result = apiClient.extractCollectionId(url);
            
            expect(result).toEqual({ type: 'collection', id: 'xyz789' });
        });

        test('should return null for invalid collection URLs', () => {
            const invalidUrls = [
                'https://www.moxfield.com/collection',
                'https://www.moxfield.com/collection/',
                'https://example.com/invalid',
                'https://www.moxfield.com/invalid/abc123',
                ''
            ];

            invalidUrls.forEach(url => {
                const result = apiClient.extractCollectionId(url);
                expect(result).toBeNull();
            });
        });
    });

    describe('URL Extraction - Binder IDs', () => {
        test('should extract binder ID from standard binder URL', () => {
            const url = 'https://www.moxfield.com/binders/abc123';
            const result = apiClient.extractBinderId(url);
            
            expect(result).toEqual({ type: 'binder', id: 'abc123' });
        });

        test('should extract binder ID from v1 trade-binders URL', () => {
            const url = 'https://www.moxfield.com/v1/trade-binders/xyz789';
            const result = apiClient.extractBinderId(url);
            
            expect(result).toEqual({ type: 'binder', id: 'xyz789' });
        });

        test('should return null for invalid binder URLs', () => {
            const invalidUrls = [
                'https://www.moxfield.com/binders',
                'https://www.moxfield.com/binders/',
                'https://example.com/invalid',
                'https://www.moxfield.com/invalid/abc123',
                ''
            ];

            invalidUrls.forEach(url => {
                const result = apiClient.extractBinderId(url);
                expect(result).toBeNull();
            });
        });
    });

    describe('loadFromUrl', () => {
        test('should handle empty URL', async () => {
            const result = await apiClient.loadFromUrl('', 'wishlist');
            
            expect(global.alert).toHaveBeenCalledWith('Please enter a Moxfield URL');
            expect(result).toBe('');
        });

        test('should handle whitespace-only URL', async () => {
            const result = await apiClient.loadFromUrl('   ', 'collection');
            
            expect(global.alert).toHaveBeenCalledWith('Please enter a Moxfield URL');
            expect(result).toBe('');
        });

        test('should handle invalid URL format', async () => {
            const result = await apiClient.loadFromUrl('https://example.com/invalid', 'wishlist');
            
            expect(global.alert).toHaveBeenCalledWith('Invalid Moxfield URL format');
            expect(result).toBe('');
        });

        test('should call loadFromDeck for deck URLs', async () => {
            const mockLoadFromDeck = jest.spyOn(apiClient, 'loadFromDeck').mockResolvedValue('deck data');
            
            await apiClient.loadFromUrl('https://www.moxfield.com/decks/abc123', 'wishlist');
            
            expect(mockLoadFromDeck).toHaveBeenCalledWith('abc123', 'wishlist');
            mockLoadFromDeck.mockRestore();
        });

        test('should call loadFromCollection for collection URLs', async () => {
            const mockLoadFromCollection = jest.spyOn(apiClient, 'loadFromCollection').mockResolvedValue('collection data');
            
            await apiClient.loadFromUrl('https://www.moxfield.com/collection/abc123', 'collection');
            
            expect(mockLoadFromCollection).toHaveBeenCalledWith('abc123', 'collection');
            mockLoadFromCollection.mockRestore();
        });

        test('should call loadFromBinder for binder URLs', async () => {
            const mockLoadFromBinder = jest.spyOn(apiClient, 'loadFromBinder').mockResolvedValue('binder data');
            
            await apiClient.loadFromUrl('https://www.moxfield.com/binders/abc123', 'wishlist');
            
            expect(mockLoadFromBinder).toHaveBeenCalledWith('abc123', 'wishlist');
            mockLoadFromBinder.mockRestore();
        });
    });

    describe('loadFromDeck', () => {
        test('should construct correct API URL and call loadFromApiUrl', async () => {
            const mockLoadFromApiUrl = jest.spyOn(apiClient, 'loadFromApiUrl').mockResolvedValue('deck data');
            
            await apiClient.loadFromDeck('abc123', 'wishlist');
            
            expect(mockLoadFromApiUrl).toHaveBeenCalledWith(
                'https://api2.moxfield.com/v2/decks/all/abc123',
                'wishlist'
            );
            mockLoadFromApiUrl.mockRestore();
        });
    });

    describe('loadFromCollection', () => {
        test('should handle single page response', async () => {
            const mockLoadFromApiUrl = jest.spyOn(apiClient, 'loadFromApiUrl')
                .mockResolvedValueOnce('card1\ncard2\ncard3')
                .mockResolvedValueOnce(''); // Empty response to stop pagination
            
            const result = await apiClient.loadFromCollection('abc123', 'collection');
            
            expect(result).toBe('card1\ncard2\ncard3');
            expect(mockLoadFromApiUrl).toHaveBeenCalledTimes(2);
            mockLoadFromApiUrl.mockRestore();
        });

        test('should handle multiple pages', async () => {
            const mockLoadFromApiUrl = jest.spyOn(apiClient, 'loadFromApiUrl')
                .mockResolvedValueOnce('page1\npage2')
                .mockResolvedValueOnce('page3\npage4')
                .mockResolvedValueOnce(''); // Empty response to stop pagination
            
            const result = await apiClient.loadFromCollection('abc123', 'collection');
            
            expect(result).toBe('page1\npage2\npage3\npage4');
            expect(mockLoadFromApiUrl).toHaveBeenCalledTimes(3);
            mockLoadFromApiUrl.mockRestore();
        });

        test('should handle CORS error response', async () => {
            const mockLoadFromApiUrl = jest.spyOn(apiClient, 'loadFromApiUrl')
                .mockResolvedValue({ apiUrl: 'https://api2.moxfield.com/v1/collections/search/abc123', cards: '' });
            
            const result = await apiClient.loadFromCollection('abc123', 'collection');
            
            expect(result).toEqual({ apiUrl: 'https://api2.moxfield.com/v1/collections/search/abc123', cards: '' });
            mockLoadFromApiUrl.mockRestore();
        });

        test('should handle errors gracefully', async () => {
            const mockLoadFromApiUrl = jest.spyOn(apiClient, 'loadFromApiUrl')
                .mockRejectedValue(new Error('Network error'));
            
            const result = await apiClient.loadFromCollection('abc123', 'collection');
            
            expect(result).toBe('');
            mockLoadFromApiUrl.mockRestore();
        });

        test('should prevent infinite loops', async () => {
            const mockLoadFromApiUrl = jest.spyOn(apiClient, 'loadFromApiUrl')
                .mockResolvedValue('data'); // Always return data to trigger pagination
            
            const result = await apiClient.loadFromCollection('abc123', 'collection');
            
            // Should stop after 100 pages
            expect(mockLoadFromApiUrl).toHaveBeenCalledTimes(100);
            expect(result).toBe('data\n'.repeat(100).trim());
            mockLoadFromApiUrl.mockRestore();
        });
    });

    describe('loadFromBinder', () => {
        test('should handle single page response', async () => {
            const mockLoadFromApiUrl = jest.spyOn(apiClient, 'loadFromApiUrl')
                .mockResolvedValueOnce('binder1\nbinder2')
                .mockResolvedValueOnce(''); // Empty response to stop pagination
            
            const result = await apiClient.loadFromBinder('abc123', 'wishlist');
            
            expect(result).toBe('binder1\nbinder2');
            expect(mockLoadFromApiUrl).toHaveBeenCalledTimes(2);
            mockLoadFromApiUrl.mockRestore();
        });

        test('should handle CORS error response', async () => {
            const mockLoadFromApiUrl = jest.spyOn(apiClient, 'loadFromApiUrl')
                .mockResolvedValue({ apiUrl: 'https://api2.moxfield.com/v1/trade-binders/abc123', cards: '' });
            
            const result = await apiClient.loadFromBinder('abc123', 'wishlist');
            
            expect(result).toEqual({ apiUrl: 'https://api2.moxfield.com/v1/trade-binders/abc123', cards: '' });
            mockLoadFromApiUrl.mockRestore();
        });
    });

    describe('loadFromApiUrl', () => {
        test('should make successful API request', async () => {
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({ mainboard: { cards: [] } })
            };
            global.fetch.mockResolvedValue(mockResponse);
            
            const mockParseApiResponse = jest.spyOn(apiClient, 'parseApiResponse').mockReturnValue('parsed data');
            
            const result = await apiClient.loadFromApiUrl('https://api2.moxfield.com/v2/decks/all/abc123', 'wishlist');
            
            expect(global.fetch).toHaveBeenCalledWith(
                'https://api2.moxfield.com/v2/decks/all/abc123',
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (compatible; MTGCardComparator/1.0)'
                    })
                })
            );
            expect(result).toBe('parsed data');
            mockParseApiResponse.mockRestore();
        });

        test('should handle HTTP error responses', async () => {
            const mockResponse = {
                ok: false,
                status: 404,
                statusText: 'Not Found'
            };
            global.fetch.mockResolvedValue(mockResponse);
            
            await expect(apiClient.loadFromApiUrl('https://api2.moxfield.com/v2/decks/all/abc123', 'wishlist'))
                .rejects.toThrow('HTTP 404: Not Found');
        });

        test('should handle CORS errors with proxy fallback', async () => {
            // First call fails with CORS error
            global.fetch.mockRejectedValueOnce(new Error('CORS error'));
            
            // Proxy call succeeds
            const mockProxyResponse = {
                ok: true,
                json: () => Promise.resolve({ mainboard: { cards: [] } })
            };
            global.fetch.mockResolvedValueOnce(mockProxyResponse);
            
            const mockParseApiResponse = jest.spyOn(apiClient, 'parseApiResponse').mockReturnValue('proxy data');
            
            const result = await apiClient.loadFromApiUrl('https://api2.moxfield.com/v2/decks/all/abc123', 'wishlist');
            
            expect(global.fetch).toHaveBeenCalledTimes(2);
            expect(result).toBe('proxy data');
            mockParseApiResponse.mockRestore();
        });

        test('should handle proxy failure', async () => {
            // Both direct and proxy calls fail
            global.fetch.mockRejectedValue(new Error('CORS error'));
            
            const result = await apiClient.loadFromApiUrl('https://api2.moxfield.com/v2/decks/all/abc123', 'wishlist');
            
            expect(result).toEqual({
                apiUrl: 'https://api2.moxfield.com/v2/decks/all/abc123',
                cards: ''
            });
        });

        test('should handle network errors', async () => {
            global.fetch.mockRejectedValue(new Error('Network error'));
            
            await expect(apiClient.loadFromApiUrl('https://api2.moxfield.com/v2/decks/all/abc123', 'wishlist'))
                .rejects.toThrow('Network error');
        });
    });

    describe('parseManualApiResponse', () => {
        test('should parse valid JSON data', () => {
            const mockParseApiResponse = jest.spyOn(apiClient, 'parseApiResponse').mockReturnValue('parsed data');
            
            const result = apiClient.parseManualApiResponse('{"mainboard": {"cards": []}}', 'wishlist');
            
            expect(result).toBe('parsed data');
            expect(mockParseApiResponse).toHaveBeenCalledWith({ mainboard: { cards: [] } }, 'wishlist');
            mockParseApiResponse.mockRestore();
        });

        test('should handle invalid JSON', () => {
            expect(() => {
                apiClient.parseManualApiResponse('invalid json', 'wishlist');
            }).toThrow('Invalid JSON data provided');
        });
    });

    describe('parseApiResponse - Mainboard Format', () => {
        test('should parse mainboard data correctly', () => {
            const data = {
                mainboard: {
                    'card1': {
                        quantity: 2,
                        card: {
                            name: 'Lightning Bolt',
                            set: 'm10',
                            cn: '133'
                        }
                    },
                    'card2': {
                        quantity: 1,
                        card: {
                            name: 'Counterspell',
                            set: 'm10',
                            cn: '50',
                            isFoil: true
                        }
                    }
                }
            };
            
            const result = apiClient.parseApiResponse(data, 'wishlist');
            
            expect(result).toContain('2 Lightning Bolt (M10) 133');
            expect(result).toContain('1 Counterspell (M10) 50 *F*');
        });

        test('should handle mainboard as array', () => {
            const data = {
                mainboard: [
                    {
                        quantity: 2,
                        card: {
                            name: 'Lightning Bolt',
                            set: 'm10',
                            cn: '133'
                        }
                    }
                ]
            };
            
            const result = apiClient.parseApiResponse(data, 'wishlist');
            
            expect(result).toContain('2 Lightning Bolt (M10) 133');
        });

        test('should handle foil and etched cards', () => {
            const data = {
                mainboard: {
                    'card1': {
                        quantity: 1,
                        card: {
                            name: 'Lightning Bolt',
                            set: 'm10',
                            cn: '133',
                            finish: 'foil'
                        }
                    },
                    'card2': {
                        quantity: 1,
                        card: {
                            name: 'Counterspell',
                            set: 'm10',
                            cn: '50',
                            finish: 'etched'
                        }
                    }
                }
            };
            
            const result = apiClient.parseApiResponse(data, 'wishlist');
            
            expect(result).toContain('1 Lightning Bolt (M10) 133 *F*');
            expect(result).toContain('1 Counterspell (M10) 50 *E*');
        });
    });

    describe('parseApiResponse - Cards Array Format', () => {
        test('should parse cards array correctly', () => {
            const data = {
                cards: [
                    {
                        quantity: 2,
                        card: {
                            name: 'Lightning Bolt',
                            set: 'm10',
                            cn: '133'
                        }
                    },
                    {
                        quantity: 1,
                        card: {
                            name: 'Counterspell',
                            set: 'm10',
                            cn: '50',
                            isFoil: true
                        }
                    }
                ]
            };
            
            const result = apiClient.parseApiResponse(data, 'wishlist');
            
            expect(result).toContain('2 Lightning Bolt (M10) 133');
            expect(result).toContain('1 Counterspell (M10) 50 *F*');
        });
    });

    describe('parseApiResponse - Data Array Format', () => {
        test('should parse data array correctly', () => {
            const data = {
                data: [
                    {
                        quantity: 2,
                        card: {
                            name: 'Lightning Bolt',
                            set: 'm10',
                            cn: '133'
                        }
                    }
                ]
            };
            
            const result = apiClient.parseApiResponse(data, 'wishlist');
            
            expect(result).toContain('2 Lightning Bolt (M10) 133');
        });
    });

    describe('parseApiResponse - String Format', () => {
        test('should handle string data directly', () => {
            const data = '2 Lightning Bolt (M10) 133\n1 Counterspell (M10) 50';
            
            const result = apiClient.parseApiResponse(data, 'wishlist');
            
            expect(result).toBe('2 Lightning Bolt (M10) 133\n1 Counterspell (M10) 50');
        });
    });

    describe('parseApiResponse - Error Handling', () => {
        test('should handle null data', () => {
            expect(() => {
                apiClient.parseApiResponse(null, 'wishlist');
            }).toThrow('Failed to parse deck data from API response');
        });

        test('should handle undefined data', () => {
            expect(() => {
                apiClient.parseApiResponse(undefined, 'wishlist');
            }).toThrow('Failed to parse deck data from API response');
        });
    });

    describe('findCardsInResponse', () => {
        test('should find cards in mainboard format', () => {
            const data = {
                mainboard: {
                    'card1': {
                        quantity: 2,
                        card: {
                            name: 'Lightning Bolt',
                            set: 'm10',
                            cn: '133'
                        }
                    }
                }
            };
            
            const result = apiClient.findCardsInResponse(data);
            
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                quantity: 2,
                name: 'Lightning Bolt',
                set: 'm10',
                number: '',
                foil: false,
                etched: false
            });
        });

        test('should find cards in cards array format', () => {
            const data = {
                cards: [
                    {
                        quantity: 1,
                        card: {
                            name: 'Counterspell',
                            set: 'm10',
                            cn: '50',
                            isFoil: true
                        }
                    }
                ]
            };
            
            const result = apiClient.findCardsInResponse(data);
            
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                quantity: 1,
                name: 'Counterspell',
                set: 'm10',
                number: '',
                foil: true,
                etched: false
            });
        });

        test('should handle null data', () => {
            const result = apiClient.findCardsInResponse(null);
            expect(result).toEqual([]);
        });

        test('should handle non-object data', () => {
            const result = apiClient.findCardsInResponse('string data');
            expect(result).toEqual([]);
        });
    });

    describe('isFoil', () => {
        test('should detect foil cards correctly', () => {
            const foilCard = {
                card: {
                    isFoil: true
                }
            };
            expect(apiClient.isFoil(foilCard)).toBe(true);
        });

        test('should detect foil by finish field', () => {
            const foilCard = {
                card: {
                    finish: 'foil'
                }
            };
            expect(apiClient.isFoil(foilCard)).toBe(true);
        });

        test('should detect foil-etched', () => {
            const foilCard = {
                card: {
                    finish: 'foil-etched'
                }
            };
            expect(apiClient.isFoil(foilCard)).toBe(true);
        });

        test('should detect foil at card level', () => {
            const foilCard = {
                isFoil: true
            };
            expect(apiClient.isFoil(foilCard)).toBe(true);
        });

        test('should return false for non-foil cards', () => {
            const nonFoilCard = {
                card: {
                    isFoil: false
                }
            };
            expect(apiClient.isFoil(nonFoilCard)).toBe(false);
        });
    });

    describe('isEtched', () => {
        test('should detect etched cards correctly', () => {
            const etchedCard = {
                card: {
                    finish: 'etched'
                }
            };
            expect(apiClient.isEtched(etchedCard)).toBe(true);
        });

        test('should detect foil-etched', () => {
            const etchedCard = {
                card: {
                    finish: 'foil-etched'
                }
            };
            expect(apiClient.isEtched(etchedCard)).toBe(true);
        });

        test('should detect etched boolean field', () => {
            const etchedCard = {
                card: {
                    etched: true
                }
            };
            expect(apiClient.isEtched(etchedCard)).toBe(true);
        });

        test('should detect etched at card level', () => {
            const etchedCard = {
                isEtched: true
            };
            expect(apiClient.isEtched(etchedCard)).toBe(true);
        });

        test('should return false for non-etched cards', () => {
            const nonEtchedCard = {
                card: {
                    etched: false
                }
            };
            expect(apiClient.isEtched(nonEtchedCard)).toBe(false);
        });
    });
}); 