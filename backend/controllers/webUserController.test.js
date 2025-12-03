import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/firebaseConfig.js', () => ({
    db: { ref: jest.fn() }
}));

jest.unstable_mockModule('../services/webUserService.js', () => ({
    default: {
        createUserProfile: jest.fn(),
        getBookmarks: jest.fn(),
        addBookmark: jest.fn(),
        removeBookmark: jest.fn(),
        submitQuestionnaire: jest.fn()
    }
}));

const { default: WebUserController } = await import('./webUserController.js');
const { default: WebUserService } = await import('../services/webUserService.js');

describe('WebUserController', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            params: {},
            body: {},
            user: { uid: 'uid123', email: 'test@test.com' }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
    });

    describe('createUserProfile', () => {
        it('should create user profile', async () => {
            req.body = 'testuser';
            const mockProfile = { username: 'testuser' };
            WebUserService.createUserProfile = jest.fn().mockResolvedValue(mockProfile);

            await WebUserController.createUserProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should handle errors', async () => {
            req.body = 'testuser';
            WebUserService.createUserProfile = jest.fn().mockRejectedValue(new Error('Create failed'));

            await WebUserController.createUserProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getBookmarks', () => {
        it('should return bookmarks with 200', async () => {
            const mockBookmarks = [
                {
                    title: 'The Shawshank Redemption',
                    year: 1994,
                    genres: ['Drama'],
                    rating: 9.3,
                    votes: 2700000,
                    description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
                    ai_confidence: 0.96,
                    match_reason: 'Matches your love for Drama • Highly rated (9.3/10) • Fan favorite',
                    bookmarkId: '-NqZ8xKj4lP9mQrSvWtY'
                }
            ];
            WebUserService.getBookmarks = jest.fn().mockResolvedValue(mockBookmarks);

            await WebUserController.getBookmarks(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockBookmarks);
        });

        it('should return 404 if no bookmarks', async () => {
            WebUserService.getBookmarks = jest.fn().mockResolvedValue(null);

            await WebUserController.getBookmarks(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 500 on error', async () => {
            WebUserService.getBookmarks = jest.fn().mockRejectedValue(new Error('Database error'));

            await WebUserController.getBookmarks(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('addBookmark', () => {
        it('should add bookmark and return 201 with movie data', async () => {
            const movieData = {
                title: 'The Godfather',
                year: 1972,
                genres: ['Crime', 'Drama'],
                rating: 9.2,
                votes: 1900000,
                description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
                ai_confidence: 0.94,
                match_reason: 'Matches your love for Crime, Drama • Highly rated (9.2/10) • Fan favorite'
            };
            const expectedResult = { ...movieData, bookmarkId: '-NqZ8xKj4lP9mQrSvWtY' };
            req.body = movieData;
            WebUserService.addBookmark = jest.fn().mockResolvedValue(expectedResult);

            await WebUserController.addBookmark(req, res);

            expect(WebUserService.addBookmark).toHaveBeenCalledWith('uid123', movieData);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expectedResult);
        });

        it('should return 400 if no movie data provided', async () => {
            req.body = {};

            await WebUserController.addBookmark(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 500 if bookmark fails to add', async () => {
            const movieData = { title: 'Test Movie', year: 2024, genres: ['Drama'] };
            req.body = movieData;
            WebUserService.addBookmark = jest.fn().mockResolvedValue(null);

            await WebUserController.addBookmark(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('deleteBookmark', () => {
        it('should delete bookmark and return 204', async () => {
            req.params.id = '-NqZ8xKj4lP9mQrSvWtY';
            WebUserService.removeBookmark = jest.fn().mockResolvedValue('-NqZ8xKj4lP9mQrSvWtY');

            await WebUserController.deleteBookmark(req, res);

            expect(res.status).toHaveBeenCalledWith(204);
        });

        it('should return 400 if no bookmark ID provided', async () => {
            req.params.id = null;

            await WebUserController.deleteBookmark(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 404 if bookmark not found', async () => {
            req.params.id = '-InvalidKey';
            WebUserService.removeBookmark = jest.fn().mockResolvedValue(null);

            await WebUserController.deleteBookmark(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 500 on error', async () => {
            req.params.id = '-NqZ8xKj4lP9mQrSvWtY';
            WebUserService.removeBookmark = jest.fn().mockRejectedValue(new Error('Delete failed'));

            await WebUserController.deleteBookmark(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('submitQuestionnaire', () => {
        it('should submit questionnaire and return movie recommendations', async () => {
            req.body = { q1: 'answer1', q2: 'answer2' };
            const mockRecommendations = [
                {
                    title: 'Inception',
                    year: 2010,
                    genres: ['Action', 'Sci-Fi', 'Thriller'],
                    rating: 8.8,
                    votes: 2400000,
                    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
                    ai_confidence: 0.95,
                    match_reason: 'Matches your love for Sci-Fi, Thriller • Highly rated (8.8/10) • Fan favorite'
                }
            ];
            WebUserService.submitQuestionnaire = jest.fn().mockResolvedValue(mockRecommendations);

            await WebUserController.submitQuestionnaire(req, res);

            expect(WebUserService.submitQuestionnaire).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockRecommendations);
        });

        it('should return 400 if questions not answered', async () => {
            req.body = { q1: '', q2: 'answer' };

            await WebUserController.submitQuestionnaire(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 500 on error', async () => {
            req.body = { q1: 'answer1', q2: 'answer2' };
            WebUserService.submitQuestionnaire = jest.fn().mockRejectedValue(new Error('AI service failed'));

            await WebUserController.submitQuestionnaire(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
