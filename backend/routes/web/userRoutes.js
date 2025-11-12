import express from 'express';
import WebUserController from '../../controllers/webUserController.js';
import authenticateToken from '../../middleware/authenticateToken.js';

const router = express.Router();

router.get('/:uid/profile', authenticateToken, WebUserController.getUserProfile);
router.post('/:uid/profile', authenticateToken, WebUserController.createUserProfile);
router.put('/:uid/profile', authenticateToken, WebUserController.updateUserProfile);
router.delete('/:uid/profile', authenticateToken, WebUserController.deleteUserProfile);

export default router;