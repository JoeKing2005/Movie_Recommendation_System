import express from 'express';
import WebUserController from '../../controllers/webUserController.js';
import authenticateToken from '../../middleware/authenticateToken.js';

const router = express.Router();

router.get('/:uid/profile', authenticateToken, WebUserController.getUserProfile);
router.post('/:uid/profile', authenticateToken, WebUserController.createUserProfile);
router.put('/:uid/profile', authenticateToken, WebUserController.updateUserProfile);
router.delete('/:uid/profile', authenticateToken, WebUserController.deleteUserProfile);

router.post('/:uid/questionnaire', authenticateToken, WebUserController.submitQuestionnaire);

router.get('/:uid/bookmarks', authenticateToken, WebUserController.getBookmarks);
router.post('/:uid/bookmarks/id', authenticateToken, WebUserController.addBookmark);
router.delete('/:uid/bookmarks/id', authenticateToken, WebUserController.deleteBookmark);

export default router;