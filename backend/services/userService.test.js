import { jest } from '@jest/globals';
import UserService from './userService.js';
import { NameValidationError, EmailValidationError } from '../utils/errors.js';

describe('UserService', () => {
    const MockModel = {
        createUserProfile: jest.fn(),
        getUserProfile: jest.fn(),
        updateUserProfile: jest.fn(),
        deleteUserProfile: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('validateUserProfileInputs', () => {
        it('should throw NameValidationError for short username', () => {
            expect(() => {
                UserService.validateUserProfileInputs('ab', 'test@test.com');
            }).toThrow(NameValidationError);
        });

        it('should throw EmailValidationError for invalid email', () => {
            expect(() => {
                UserService.validateUserProfileInputs('username', 'invalid-email');
            }).toThrow(EmailValidationError);
        });

        it('should not throw for valid inputs', () => {
            expect(() => {
                UserService.validateUserProfileInputs('username', 'test@test.com');
            }).not.toThrow();
        });
    });

    describe('createUserProfile', () => {
        it('should create user profile', async () => {
            const mockProfile = { username: 'test', email: 'test@test.com' };
            MockModel.createUserProfile.mockResolvedValue(mockProfile);

            const result = await UserService.createUserProfile(MockModel, 'uid', 'test', 'test@test.com');

            expect(result).toEqual(mockProfile);
            expect(MockModel.createUserProfile).toHaveBeenCalled();
        });

        it('should throw on validation error', async () => {
            await expect(
                UserService.createUserProfile(MockModel, 'uid', 'ab', 'test@test.com')
            ).rejects.toThrow(NameValidationError);
        });
    });

    describe('getUserProfile', () => {
        it('should get user profile', async () => {
            const mockProfile = { username: 'test' };
            MockModel.getUserProfile.mockResolvedValue(mockProfile);

            const result = await UserService.getUserProfile(MockModel, 'uid');

            expect(result).toEqual(mockProfile);
        });
    });

    describe('updateUserProfile', () => {
        it('should update user profile', async () => {
            const mockProfile = { username: 'updated' };
            MockModel.updateUserProfile.mockResolvedValue(mockProfile);

            const result = await UserService.updateUserProfile(MockModel, 'uid', 'updated', 'test@test.com');

            expect(result).toEqual(mockProfile);
        });

        it('should throw on validation error', async () => {
            await expect(
                UserService.updateUserProfile(MockModel, 'uid', 'ab', 'test@test.com')
            ).rejects.toThrow(NameValidationError);
        });
    });

    describe('deleteUserProfile', () => {
        it('should delete user profile', async () => {
            MockModel.deleteUserProfile.mockResolvedValue(true);

            const result = await UserService.deleteUserProfile(MockModel, 'uid');

            expect(result).toBe(true);
        });
    });
});
