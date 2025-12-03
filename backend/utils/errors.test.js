import {
    ProfileValidationError,
    NameValidationError,
    EmailValidationError,
    ProfileCreationError
} from './errors.js';

describe('Error Classes', () => {
    describe('ProfileValidationError', () => {
        it('should create error with default message', () => {
            const error = new ProfileValidationError();
            expect(error.message).toBe('Profile fields failed to validate.');
            expect(error.name).toBe('ProfileValidationError');
            expect(error.status).toBe(400);
        });

        it('should create error with custom message', () => {
            const customMessage = 'Custom validation error';
            const error = new ProfileValidationError(customMessage);
            expect(error.message).toBe(customMessage);
            expect(error.name).toBe('ProfileValidationError');
            expect(error.status).toBe(400);
        });
    });

    describe('NameValidationError', () => {
        it('should create error with default message', () => {
            const error = new NameValidationError();
            expect(error.message).toBe('Name must not be blank and can only contain letters, dashes or spaces.');
            expect(error.name).toBe('NameValidationError');
            expect(error).toBeInstanceOf(ProfileValidationError);
        });

        it('should create error with custom message', () => {
            const customMessage = 'Custom name error';
            const error = new NameValidationError(customMessage);
            expect(error.message).toBe(customMessage);
            expect(error.name).toBe('NameValidationError');
        });
    });

    describe('EmailValidationError', () => {
        it('should create error with default message', () => {
            const error = new EmailValidationError();
            expect(error.message).toBe('Email Address is invalid.');
            expect(error.name).toBe('EmailValidationError');
            expect(error).toBeInstanceOf(ProfileValidationError);
        });

        it('should create error with custom message', () => {
            const customMessage = 'Custom email error';
            const error = new EmailValidationError(customMessage);
            expect(error.message).toBe(customMessage);
        });
    });

    describe('ProfileCreationError', () => {
        it('should create error with default message', () => {
            const error = new ProfileCreationError();
            expect(error.message).toBe('Server failed to create profile.');
            expect(error.name).toBe('ProfileCreationError');
            expect(error.status).toBe(500);
        });

        it('should create error with custom message', () => {
            const customMessage = 'Custom creation error';
            const error = new ProfileCreationError(customMessage);
            expect(error.message).toBe(customMessage);
            expect(error.status).toBe(500);
        });
    });
});
