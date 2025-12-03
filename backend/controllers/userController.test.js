import { jest } from '@jest/globals';
import UserController from './userController.js';

describe('UserController', () => {
    let req, res, MockService;

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

        MockService = {
            createUserProfile: jest.fn(),
            getUserProfile: jest.fn(),
            updateUserProfile: jest.fn(),
            deleteUserProfile: jest.fn()
        };
    });

    describe('createUserProfile', () => {
        it('should create user profile and return 201', async () => {
            req.body = 'testuser';
            const mockProfile = { username: 'testuser', email: 'test@test.com' };
            MockService.createUserProfile.mockResolvedValue(mockProfile);

            await UserController.createUserProfile(MockService, req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockProfile);
        });

        it('should return 400 if no username', async () => {
            req.body = null;

            await UserController.createUserProfile(MockService, req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 500 on service error', async () => {
            req.body = 'testuser';
            MockService.createUserProfile.mockRejectedValue(new Error('Database error'));

            await UserController.createUserProfile(MockService, req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getUserProfile', () => {
        it('should return user profile with 200', async () => {
            const mockProfile = { username: 'test' };
            MockService.getUserProfile.mockResolvedValue(mockProfile);

            await UserController.getUserProfile(MockService, req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockProfile);
        });

        it('should return 404 if profile not found', async () => {
            MockService.getUserProfile.mockResolvedValue(null);

            await UserController.getUserProfile(MockService, req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 500 on error', async () => {
            MockService.getUserProfile.mockRejectedValue(new Error('Database error'));

            await UserController.getUserProfile(MockService, req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('updateUserProfile', () => {
        it('should update profile and return 200', async () => {
            req.body = 'newusername';
            const mockProfile = { username: 'newusername' };
            MockService.updateUserProfile.mockResolvedValue(mockProfile);

            await UserController.updateUserProfile(MockService, req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockProfile);
        });

        it('should return 500 on error', async () => {
            req.body = 'newusername';
            MockService.updateUserProfile.mockRejectedValue(new Error('Update failed'));

            await UserController.updateUserProfile(MockService, req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('deleteUserProfile', () => {
        it('should delete profile and return 204', async () => {
            MockService.deleteUserProfile.mockResolvedValue(true);

            await UserController.deleteUserProfile(MockService, req, res);

            expect(res.status).toHaveBeenCalledWith(204);
        });

        it('should return 404 if profile not found', async () => {
            MockService.deleteUserProfile.mockResolvedValue(false);

            await UserController.deleteUserProfile(MockService, req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 500 on error', async () => {
            MockService.deleteUserProfile.mockRejectedValue(new Error('Delete failed'));

            await UserController.deleteUserProfile(MockService, req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
