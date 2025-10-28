import { NameValidationError, EmailValidationError } from "../utils/errors.js";

class UserService {
    static validateUserProfileInputs(username, email) {
        const nameRegex = /^[a-z0-9_]{4,16}$/g
        const emailRegex = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/g // Source: https://regex101.com/r/lHs2R3/1

        username = username.toLowerCase();
        if (!username || username.trim() === '' || !nameRegex.test(username)) {
            throw new NameValidationError();
        } else if (!email || email.trim() === '' || !emailRegex.test(email)) {
            throw new EmailValidationError();
        }
    }

    static async createUserProfile(Model, uid, username, email) {
        try {
            this.validateUserProfileInputs(username, email);
        } catch (e) {
            throw e;
        }

        const date = new Date().toISOString();

        const profileData = {
        username: username,
        email: email,
        createdAt: date,
        updatedAt: date
        };

        return await Model.createUserProfile(uid, profileData);
    }

    static async getUserProfile(Model, uid) {
        return await Model.getUserProfile(uid);
    }

    static async updateUserProfile(Model, uid, username, email) {
        try {
            this.validateUserProfileInputs(username, email);
        } catch (e) {
            throw e;
        }

        const profileDataUpdate = {
        username: username,
        email: email,
        updatedAt: new Date().toISOString()
        };

        return await Model.updateUserProfile(uid, profileDataUpdate);
    }

    static async deleteUserProfile(Model, uid) {
        return await Model.deleteUserProfile(uid);
    }
}

export default UserService;
