import { jest } from '@jest/globals';

// Mock fetch globally
global.fetch = jest.fn();

jest.unstable_mockModule('../utils/firebaseConfig.js', () => ({
    db: { ref: jest.fn() }
}));

jest.unstable_mockModule('../models/webUserModel.js', () => ({
    default: {
        createUserProfile: jest.fn(),
        getUserProfile: jest.fn(),
        updateUserProfile: jest.fn(),
        deleteUserProfile: jest.fn(),
        addBookmark: jest.fn(),
        getBookmarks: jest.fn(),
        removeBookmark: jest.fn()
    }
}));

const { default: WebUserService } = await import('./webUserService.js');
const { default: WebUserModel } = await import('../models/webUserModel.js');

describe('WebUserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch.mockClear();
    });

    describe('createUserProfile', () => {
        it('should create user profile', async () => {
            const mockProfile = { username: 'test', email: 'test@test.com', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' };
            WebUserModel.createUserProfile = jest.fn().mockResolvedValue(mockProfile);

            const result = await WebUserService.createUserProfile('uid', 'test', 'test@test.com');

            expect(WebUserModel.createUserProfile).toHaveBeenCalledWith('uid', {
                username: 'test',
                email: 'test@test.com',
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
            });
            expect(result).toEqual(mockProfile);
        });
    });

    describe('getUserProfile', () => {
        it('should get user profile', async () => {
            const mockProfile = { username: 'test', email: 'test@test.com' };
            WebUserModel.getUserProfile = jest.fn().mockResolvedValue(mockProfile);

            const result = await WebUserService.getUserProfile('uid');

            expect(WebUserModel.getUserProfile).toHaveBeenCalledWith('uid');
            expect(result).toEqual(mockProfile);
        });
    });

    describe('updateUserProfile', () => {
        it('should update user profile', async () => {
            const mockProfile = { username: 'updated', email: 'new@test.com', updatedAt: expect.any(String) };
            WebUserModel.updateUserProfile = jest.fn().mockResolvedValue(mockProfile);

            const result = await WebUserService.updateUserProfile('uid', 'updated', 'new@test.com');

            expect(WebUserModel.updateUserProfile).toHaveBeenCalledWith('uid', {
                username: 'updated',
                email: 'new@test.com',
                updatedAt: expect.any(String)
            });
            expect(result).toEqual(mockProfile);
        });
    });

    describe('deleteUserProfile', () => {
        it('should delete user profile', async () => {
            WebUserModel.deleteUserProfile = jest.fn().mockResolvedValue(true);

            const result = await WebUserService.deleteUserProfile('uid');

            expect(WebUserModel.deleteUserProfile).toHaveBeenCalledWith('uid');
            expect(result).toBe(true);
        });
    });

    describe('addBookmark', () => {
        it('should add bookmark with movie data', async () => {
            const movieData = {
                title: 'Interstellar',
                year: 2014,
                genres: ['Adventure', 'Drama', 'Sci-Fi'],
                rating: 8.6,
                votes: 1900000,
                description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
                ai_confidence: 0.91,
                match_reason: 'Matches your love for Sci-Fi, Drama • Highly rated (8.6/10) • Fan favorite'
            };
            const expectedResult = { ...movieData, bookmarkId: '-NqZ8xKj4lP9mQrSvWtY' };
            WebUserModel.addBookmark = jest.fn().mockResolvedValue(expectedResult);

            const result = await WebUserService.addBookmark('uid', movieData);

            expect(result).toEqual(expectedResult);
            expect(WebUserModel.addBookmark).toHaveBeenCalledWith('uid', movieData);
        });

        it('should return null if bookmark fails to add', async () => {
            const movieData = { title: 'Test Movie', year: 2024, genres: ['Drama'] };
            WebUserModel.addBookmark = jest.fn().mockResolvedValue(null);

            const result = await WebUserService.addBookmark('uid', movieData);

            expect(result).toBeNull();
        });
    });

    describe('getBookmarks', () => {
        it('should return bookmarks with movie data', async () => {
            const mockBookmarks = [
                {
                    title: 'The Matrix',
                    year: 1999,
                    genres: ['Action', 'Sci-Fi'],
                    rating: 8.7,
                    votes: 1900000,
                    description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
                    ai_confidence: 0.89,
                    match_reason: 'Matches your love for Action, Sci-Fi • Highly rated (8.7/10) • Fan favorite',
                    bookmarkId: '-NqZ8xKj4lP9mQrSvWtY'
                },
                {
                    title: 'Forrest Gump',
                    year: 1994,
                    genres: ['Drama', 'Romance'],
                    rating: 8.8,
                    votes: 2100000,
                    description: 'The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold from the perspective of an Alabama man.',
                    ai_confidence: 0.87,
                    match_reason: 'Matches your love for Drama • Highly rated (8.8/10) • Fan favorite',
                    bookmarkId: '-NqZ8xKj4lP9mQrSvWtZ'
                }
            ];
            WebUserModel.getBookmarks = jest.fn().mockResolvedValue(mockBookmarks);

            const result = await WebUserService.getBookmarks('uid');

            expect(result).toHaveLength(2);
            expect(result[0]).toHaveProperty('title');
            expect(result[0]).toHaveProperty('bookmarkId');
        });

        it('should return null if no bookmarks', async () => {
            WebUserModel.getBookmarks = jest.fn().mockResolvedValue(null);

            const result = await WebUserService.getBookmarks('uid');

            expect(result).toBeNull();
        });
    });

    describe('removeBookmark', () => {
        it('should remove bookmark', async () => {
            const bookmarkId = '-NqZ8xKj4lP9mQrSvWtY';
            WebUserModel.removeBookmark = jest.fn().mockResolvedValue(bookmarkId);

            const result = await WebUserService.removeBookmark('uid', bookmarkId);

            expect(result).toBe(bookmarkId);
            expect(WebUserModel.removeBookmark).toHaveBeenCalledWith('uid', bookmarkId);
        });
    });

    describe('submitQuestionnaire', () => {
        it('should submit questionnaire and return results', async () => {
            const questionnaire = {
                favorite_genres: ['Action', 'Sci-Fi'],
                mood: 'exciting',
                year_preference: 'recent'
            };
            const mockRecommendations = [
                {
                    title: 'Inception',
                    year: 2010,
                    genres: ['Action', 'Sci-Fi', 'Thriller'],
                    rating: 8.8,
                    votes: 2400000,
                    description: 'A thief who steals corporate secrets...',
                    ai_confidence: 0.95,
                    match_reason: 'Matches your love for Sci-Fi, Action'
                }
            ];

            global.fetch.mockResolvedValue({
                json: jest.fn().mockResolvedValue(mockRecommendations)
            });

            const result = await WebUserService.submitQuestionnaire(questionnaire);

            expect(global.fetch).toHaveBeenCalledWith('http://localhost:3002/questionnaire', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(questionnaire)
            });
            expect(result).toEqual(mockRecommendations);
        });

        it('should return null if fetch fails', async () => {
            const questionnaire = { favorite_genres: ['Action'] };

            global.fetch.mockRejectedValue(new Error('Network error'));

            const result = await WebUserService.submitQuestionnaire(questionnaire);

            expect(result).toBeNull();
        });

        it('should return null if response has no results', async () => {
            const questionnaire = { favorite_genres: ['Action'] };

            global.fetch.mockResolvedValue({
                json: jest.fn().mockResolvedValue(null)
            });

            const result = await WebUserService.submitQuestionnaire(questionnaire);

            expect(result).toBeNull();
        });
    });
});
