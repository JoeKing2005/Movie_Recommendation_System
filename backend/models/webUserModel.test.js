import { jest } from '@jest/globals';

const mockDb = {
    ref: jest.fn()
};

jest.unstable_mockModule('../utils/firebaseConfig.js', () => ({
    db: mockDb
}));

const { default: WebUserModel } = await import('./webUserModel.js');
const db = mockDb;

describe('WebUserModel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createUserProfile', () => {
        it('should create user profile', async () => {
            const mockProfile = { username: 'test' };
            const mockSet = jest.fn().mockResolvedValue(undefined);
            const mockOnce = jest.fn().mockResolvedValue({
                exists: () => true,
                val: () => mockProfile
            });
            db.ref = jest.fn().mockReturnValue({ set: mockSet, once: mockOnce });

            const result = await WebUserModel.createUserProfile('uid123', mockProfile);

            expect(result).toEqual(mockProfile);
        });
    });

    describe('getUserProfile', () => {
        it('should get user profile', async () => {
            const mockProfile = { username: 'test', email: 'test@test.com' };
            const mockOnce = jest.fn().mockResolvedValue({
                exists: () => true,
                val: () => mockProfile
            });
            db.ref = jest.fn().mockReturnValue({ once: mockOnce });

            const result = await WebUserModel.getUserProfile('uid123');

            expect(result).toEqual(mockProfile);
        });
    });

    describe('updateUserProfile', () => {
        it('should update user profile', async () => {
            const oldProfile = { username: 'old', createdAt: '2024-01-01' };
            const newData = { username: 'new', email: 'new@test.com' };
            const mockUpdate = jest.fn().mockResolvedValue(undefined);
            const mockOnce = jest.fn()
                .mockResolvedValueOnce({
                    exists: () => true,
                    val: () => oldProfile
                })
                .mockResolvedValueOnce({
                    exists: () => true,
                    val: () => ({ ...newData, createdAt: oldProfile.createdAt })
                });
            db.ref = jest.fn().mockReturnValue({ once: mockOnce, update: mockUpdate });

            const result = await WebUserModel.updateUserProfile('uid123', newData);

            expect(result.username).toBe('new');
            expect(result.createdAt).toBe(oldProfile.createdAt);
        });
    });

    describe('deleteUserProfile', () => {
        it('should delete user profile and bookmarks', async () => {
            const mockRemove = jest.fn().mockResolvedValue(undefined);
            db.ref = jest.fn().mockReturnValue({ remove: mockRemove });

            const result = await WebUserModel.deleteUserProfile('uid123');

            expect(result).toBe(true);
            expect(mockRemove).toHaveBeenCalledTimes(2); // Once for bookmarks, once for profile
        });

        it('should return false on error', async () => {
            const mockRemove = jest.fn().mockRejectedValue(new Error('Delete failed'));
            db.ref = jest.fn().mockReturnValue({ remove: mockRemove });

            const result = await WebUserModel.deleteUserProfile('uid123');

            expect(result).toBe(false);
        });
    });

    describe('getBookmarks with error', () => {
        it('should return null on error', async () => {
            const mockOnce = jest.fn().mockRejectedValue(new Error('Database error'));
            db.ref = jest.fn().mockReturnValue({ once: mockOnce });

            const result = await WebUserModel.getBookmarks('uid123');

            expect(result).toBeNull();
        });
    });

    describe('addBookmark', () => {
        it('should add bookmark and return movie with bookmarkId', async () => {
            const movieData = {
                title: 'Inception',
                year: 2010,
                genres: ['Action', 'Sci-Fi', 'Thriller'],
                rating: 8.8,
                votes: 2400000,
                description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
                ai_confidence: 0.95,
                match_reason: 'Matches your love for Sci-Fi, Thriller • Highly rated (8.8/10) • Fan favorite'
            };
            const mockPush = jest.fn().mockResolvedValue({ 
                key: '-NqZ8xKj4lP9mQrSvWtY',
                ref: { toString: () => 'web/users/uid123/bookmarks/-NqZ8xKj4lP9mQrSvWtY' }
            });
            db.ref = jest.fn().mockReturnValue({ push: mockPush });

            const result = await WebUserModel.addBookmark('uid123', movieData);

            expect(result).toEqual({ ...movieData, bookmarkId: '-NqZ8xKj4lP9mQrSvWtY' });
            expect(mockPush).toHaveBeenCalledWith(movieData);
        });

        it('should return null on error', async () => {
            const mockPush = jest.fn().mockRejectedValue(new Error('Failed'));
            db.ref = jest.fn().mockReturnValue({ push: mockPush });

            const movieData = { title: 'Test Movie', year: 2024, genres: ['Drama'] };
            const result = await WebUserModel.addBookmark('uid123', movieData);

            expect(result).toBeNull();
        });
    });

    describe('getBookmarks', () => {
        it('should return bookmarks array with movie objects', async () => {
            const mockBookmarks = {
                '-NqZ8xKj4lP9mQrSvWtY': {
                    title: 'The Dark Knight',
                    year: 2008,
                    genres: ['Action', 'Crime', 'Drama'],
                    rating: 9.0,
                    votes: 2800000,
                    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
                    ai_confidence: 0.92,
                    match_reason: 'Matches your love for Action, Drama • Highly rated (9.0/10) • Fan favorite'
                },
                '-NqZ8xKj4lP9mQrSvWtZ': {
                    title: 'Pulp Fiction',
                    year: 1994,
                    genres: ['Crime', 'Drama'],
                    rating: 8.9,
                    votes: 2100000,
                    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
                    ai_confidence: 0.88,
                    match_reason: 'Matches your love for Drama, Crime • Highly rated (8.9/10) • Fan favorite'
                }
            };
            const mockOnce = jest.fn().mockResolvedValue({
                val: () => mockBookmarks
            });
            db.ref = jest.fn().mockReturnValue({ once: mockOnce });

            const result = await WebUserModel.getBookmarks('uid123');

            expect(result).toHaveLength(2);
            expect(result[0]).toHaveProperty('bookmarkId');
            expect(result[0]).toHaveProperty('title');
            expect(result[0]).toHaveProperty('genres');
        });

        it('should return null if no bookmarks', async () => {
            const mockOnce = jest.fn().mockResolvedValue({
                val: () => null
            });
            db.ref = jest.fn().mockReturnValue({ once: mockOnce });

            const result = await WebUserModel.getBookmarks('uid123');

            expect(result).toBeNull();
        });
    });

    describe('removeBookmark', () => {
        it('should remove bookmark and return ID', async () => {
            const bookmarkId = '-NqZ8xKj4lP9mQrSvWtY';
            const mockRemove = jest.fn().mockResolvedValue(undefined);
            db.ref = jest.fn().mockReturnValue({ remove: mockRemove });

            const result = await WebUserModel.removeBookmark('uid123', bookmarkId);

            expect(result).toBe(bookmarkId);
            expect(mockRemove).toHaveBeenCalled();
        });

        it('should return null on error', async () => {
            const mockRemove = jest.fn().mockRejectedValue(new Error('Failed'));
            db.ref = jest.fn().mockReturnValue({ remove: mockRemove });

            const result = await WebUserModel.removeBookmark('uid123', '-InvalidKey');

            expect(result).toBeNull();
        });
    });
});
