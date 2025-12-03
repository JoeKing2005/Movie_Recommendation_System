import { jest } from '@jest/globals';

// Mock firebase-admin before importing firebaseConfig
const mockAuth = {
    verifyIdToken: jest.fn()
};

const mockDatabase = {
    ref: jest.fn().mockReturnValue({
        once: jest.fn(),
        set: jest.fn(),
        push: jest.fn(),
        update: jest.fn(),
        remove: jest.fn()
    })
};

const mockApp = {};

jest.unstable_mockModule('firebase-admin', () => ({
    default: {
        initializeApp: jest.fn(() => mockApp),
        credential: {
            cert: jest.fn()
        },
        auth: jest.fn(() => mockAuth),
        database: jest.fn(() => mockDatabase)
    }
}));

jest.unstable_mockModule('firebase-admin/auth', () => ({
    Auth: class Auth {},
    getAuth: jest.fn(() => mockAuth)
}));

const { auth, db } = await import('./firebaseConfig.js');

describe('Firebase Config', () => {
    test("auth object is defined", () => {
        expect(auth).toBeDefined();
    });

    test("db object is defined", () => {
        expect(db).toBeDefined();
    });

    test("db has ref method", () => {
        expect(db.ref).toBeDefined();
        expect(typeof db.ref).toBe('function');
    });
});