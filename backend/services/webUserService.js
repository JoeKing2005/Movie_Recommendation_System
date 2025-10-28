import UserService from "./userService.js";
import WebUserModel from "../models/webUserModel.js";

class WebUserService extends UserService {
    static async createUserProfile(uid, username, email) {
        return await super.createUserProfile(WebUserModel, uid, username, email);
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
}

export default WebUserService;