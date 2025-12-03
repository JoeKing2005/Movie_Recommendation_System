import UserService from "./userService.js";
import WebUserModel from "../models/webUserModel.js";


class WebUserService extends UserService {
    static async createUserProfile(uid, username, email) {
        const createdProfile = await super.createUserProfile(WebUserModel, uid, username, email);
        return createdProfile;
    }

    static async getUserProfile(uid) {
        return await super.getUserProfile(WebUserModel, uid);
    }

    static async updateUserProfile(uid, username, email) {
        return await super.updateUserProfile(WebUserModel, uid, username, email);
    }

    static async deleteUserProfile(uid) {
        return await super.deleteUserProfile(WebUserModel, uid);
    }

    static async addBookmark(uid, movieData) {
        return await WebUserModel.addBookmark(uid, movieData);
    }

    static async getBookmarks(uid) {
        return await WebUserModel.getBookmarks(uid);
    }

    static async removeBookmark(uid, bookmarkId) {
        return await WebUserModel.removeBookmark(uid, bookmarkId);
    }

    static async submitQuestionnaire(questionnaire) {
        let results;

        await fetch("http://localhost:3002/questionnaire", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(questionnaire)
        })
        .then(response => response.json())
        .then(data => results = data)
        .catch(error => console.error("Error:", error));

        if (results) return results;
        else return null;
    }
}

export default WebUserService;