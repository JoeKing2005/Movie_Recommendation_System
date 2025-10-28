import UserController from "./userController.js";
import WebUserService from "../services/webUserService.js";

class WebUserController extends UserController {
    static async createUserProfile(req, res) {
        return await super.createUserProfile(WebUserService, req, res);
    }

    static async getUserProfile(req, res) {
        return await super.getUserProfile(WebUserService, req, res);
    }

    static async updateUserProfile(req, res) {
        return await super.updateUserProfile(WebUserService, req, res);
    }

    static async deleteUserProfile(req, res) {
        return await super.deleteUserProfile(WebUserService, req, res);
    }
}

export default WebUserController;