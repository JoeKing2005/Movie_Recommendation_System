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

    static async submitQuestionnaire(req, res) {
        try {
            const questionnaire = req.body;

            for (q in questionnaire) {
                if (questionnaire[q] == "") return res.status(400).send("All questions must be answered.");
            }

            const result = await MovieService.submitQuestionnaire(req.user.uid, questionnaire);
            res.status(201).json(result);
        } catch (e) {
            console.error(e.message);
            console.trace();
            if (res.status) return res.status(res.status).send(e.message);
            else return res.status(500).send(e.message);
        }
    }

}

export default WebUserController;