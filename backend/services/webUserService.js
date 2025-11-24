import UserService from "./userService.js";
import WebUserModel from "../models/webUserModel.js";
import MovieModel from "../models/movieModel.js";


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

    static async addBookmark(uid, bookmarkID) {
        const bookmark = await MovieModel.getMovie(bookmarkID);
        if (bookmark) return await WebUserModel.addBookmark(uid, bookmarkID);
        else return null;
    }

    static async getBookmarks(uid) {
        const bookmarks = [];
        const bookmarkIDs = await WebUserModel.getBookmarks(uid);
        if (bookmarkIDs){
            for (b of bookmarkIDs) {
                const bookmark = await MovieModel.getMovie(b);
                bookmarks.push(bookmark);
            }
        } else return null;
        return bookmarks;
    }

    static async removeBookmark(uid, bookmarkID) {
        return await WebUserModel.removeBookmark(uid, bookmarkID);
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

        if (results) return questionnaire;
        else return null;
    }
}

export default WebUserService;