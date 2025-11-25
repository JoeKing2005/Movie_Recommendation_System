import UserController from "./userController.js";
import WebUserService from "../services/webUserService.js";
import MovieService from "../services/movieService.js";

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

            const result = await WebUserService.submitQuestionnaire(questionnaire);
            if (result) {
                return await MovieService.getMoviesByIds(result);
            } else throw("Failure submitting questionnaire.");
        } catch (e) {
            console.error(e.message);
            console.trace();
            if (res.status) return res.status(res.status).send(e.message);
            else return res.status(500).send(e.message);
        }
    }

    static async getBookmarks(req, res) {
        try {
            const uid = req.user.uid;
            const bookmarks = await WebUserService.getBookmarks(uid);
            if (bookmarks) return res.status(200).json(bookmarks);
            else {
                res.status(404).send("No bookmarks found.");
            }
        } catch (e) {
            console.error(e.message);
            console.trace();
            if (res.status) return res.status(res.status).send(e.message);
            else return res.status(500).send(e.message);
        }
    }

    static async addBookmark(req, res) {
        try {
            const bookmarkID = req.params.id;
            const uid = req.user.uid;

            if (!bookmarkID) {
                res.status(400);
                throw("No Bookmark ID specified.");
            }

            const addedID = await WebUserService.addBookmark(uid, bookmarkID);
            if (addedID) return res.status(201).send(`Added bookmark with ID ${addedID}`);
            else {
                res.status(404);
                throw("No bookmark found with ID", bookmarkID);
            }
        } catch (e) {
            console.error(e.message);
            console.trace();
            if (res.status) return res.status(res.status).send(e.message);
            else return res.status(500).send(e.message);
        }
    }

    static async deleteBookmark(req, res) {
        try {
            const bookmarkID = req.params.id;
            const uid = req.user.uid;

            if (!bookmarkID) {
                res.status(400);
                throw("No Bookmark ID specified.");
            }

            const deletedID = await WebUserService.removeBookmark(uid, bookmarkID);
            if (deletedID) return res.status(204).send(`Removed bookmark with ID ${removedID}`);
            else {
                res.status(404);
                throw("No bookmark found with ID", bookmarkID);
            }
        } catch (e) {
            console.error(e.message);
            console.trace();
            if (res.status) return res.status(res.status).send(e.message);
            else return res.status(500).send(e.message);
        }
    }

}

export default WebUserController;