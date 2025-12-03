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

            for (const q in questionnaire) {
                if (questionnaire[q] === "") {
                    return res.status(400).send("All questions must be answered.");
                }
            }

            const result = await WebUserService.submitQuestionnaire(questionnaire);
            if (result) {
                return res.status(200).json(result);
            } else {
                return res.status(500).send("Failure submitting questionnaire.");
            }
        } catch (e) {
            console.error(e?.message || e);
            console.trace();
            return res.status(500).send(e?.message || "Internal Server Error");
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
            return res.status(500).send(e.message);
        }
    }

    static async addBookmark(req, res) {
        try {
            const movieData = req.body;
            const uid = req.user.uid;

            if (!movieData || !movieData.title) {
                return res.status(400).send("Invalid movie data provided.");
            }

            const addedBookmark = await WebUserService.addBookmark(uid, movieData);
            if (addedBookmark) return res.status(201).json(addedBookmark);
            else {
                return res.status(500).send("Failed to add bookmark.");
            }
        } catch (e) {
            console.error(e?.message || e);
            console.trace();
            return res.status(500).send(e?.message || "Internal Server Error");
        }
    }

    static async deleteBookmark(req, res) {
        try {
            const bookmarkId = req.params.id;
            const uid = req.user.uid;

            if (!bookmarkId) {
                return res.status(400).send("No bookmark ID specified.");
            }

            const deletedId = await WebUserService.removeBookmark(uid, bookmarkId);
            if (deletedId) return res.status(204).send(`Removed bookmark with ID ${deletedId}`);
            else {
                return res.status(404).send(`No bookmark found with ID ${bookmarkId}`);
            }
        } catch (e) {
            console.error(e?.message || e);
            console.trace();
            return res.status(500).send(e?.message || "Internal Server Error");
        }
    }

}

export default WebUserController;