import { jest } from '@jest/globals';

const mockDb = {
    ref: jest.fn()
};

jest.unstable_mockModule('../utils/firebaseConfig.js', () => ({
    db: mockDb
}));

const { default: UserModel } = await import('./userModel.js');
const db = mockDb;

describe('UserModel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createUserProfile', () => {
        it('should create and return user profile', async () => {
            const mockProfile = { username: 'test', email: 'test@test.com' };
            const mockSet = jest.fn().mockResolvedValue(undefined);
            const mockOnce = jest.fn().mockResolvedValue({
                exists: () => true,
                val: () => mockProfile
            });
            db.ref = jest.fn().mockReturnValue({ set: mockSet, once: mockOnce });

            const result = await UserModel.createUserProfile('users', 'uid123', mockProfile);

            expect(result).toEqual(mockProfile);
            expect(mockSet).toHaveBeenCalledWith(mockProfile);
        });

        it('should return null if profile does not exist after creation', async () => {
            const mockProfile = { username: 'test', email: 'test@test.com' };
            const mockSet = jest.fn().mockResolvedValue(undefined);
            const mockOnce = jest.fn().mockResolvedValue({
                exists: () => false
            });
            db.ref = jest.fn().mockReturnValue({ set: mockSet, once: mockOnce });

            const result = await UserModel.createUserProfile('users', 'uid123', mockProfile);

            expect(result).toBeNull();
        });
    });

    describe('getUserProfile', () => {
        it('should return user profile if exists', async () => {
            const mockProfile = { username: 'test' };
            const mockOnce = jest.fn().mockResolvedValue({
                exists: () => true,
                val: () => mockProfile
            });
            db.ref = jest.fn().mockReturnValue({ once: mockOnce });

            const result = await UserModel.getUserProfile('users', 'uid123');

            expect(result).toEqual(mockProfile);
        });

        it('should return null if profile does not exist', async () => {
            const mockOnce = jest.fn().mockResolvedValue({
                exists: () => false
            });
            db.ref = jest.fn().mockReturnValue({ once: mockOnce });

            const result = await UserModel.getUserProfile('users', 'uid123');

            expect(result).toBeNull();
        });
    });

    describe('updateUserProfile', () => {
        it('should update existing profile', async () => {
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

            const result = await UserModel.updateUserProfile('users', 'uid123', newData);

            expect(result.username).toBe('new');
            expect(result.createdAt).toBe(oldProfile.createdAt);
        });

        it('should return null if updated profile does not exist', async () => {
            const oldProfile = { username: 'old', createdAt: '2024-01-01' };
            const newData = { username: 'new', email: 'new@test.com' };
            const mockUpdate = jest.fn().mockResolvedValue(undefined);
            const mockOnce = jest.fn()
                .mockResolvedValueOnce({
                    exists: () => true,
                    val: () => oldProfile
                })
                .mockResolvedValueOnce({
                    exists: () => false
                });
            db.ref = jest.fn().mockReturnValue({ once: mockOnce, update: mockUpdate });

            const result = await UserModel.updateUserProfile('users', 'uid123', newData);

            expect(result).toBeNull();
        });

        it('should create new profile if it does not exist', async () => {
            const newData = { username: 'new', email: 'new@test.com' };
            const mockSet = jest.fn().mockResolvedValue(undefined);
            const mockOnce = jest.fn()
                .mockResolvedValueOnce({
                    exists: () => false
                })
                .mockResolvedValueOnce({
                    exists: () => true,
                    val: () => ({ ...newData, createdAt: expect.any(String) })
                });
            db.ref = jest.fn().mockReturnValue({ once: mockOnce, set: mockSet });

            const result = await UserModel.updateUserProfile('users', 'uid123', newData);

            expect(result.username).toBe('new');
            expect(result).toHaveProperty('createdAt');
            expect(mockSet).toHaveBeenCalled();
        });
    });

    describe('deleteUserProfile', () => {
        it('should delete profile and return true', async () => {
            const mockRemove = jest.fn().mockResolvedValue(undefined);
            db.ref = jest.fn().mockReturnValue({ remove: mockRemove });

            const result = await UserModel.deleteUserProfile('users', 'uid123');

            expect(result).toBe(true);
            expect(mockRemove).toHaveBeenCalled();
        });

        it('should return false on error', async () => {
            const mockRemove = jest.fn().mockRejectedValue(new Error('Delete failed'));
            db.ref = jest.fn().mockReturnValue({ remove: mockRemove });

            const result = await UserModel.deleteUserProfile('users', 'uid123');

            expect(result).toBe(false);
        });
    });
});
