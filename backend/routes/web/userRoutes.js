import express from 'express';
import WebUserController from '../../controllers/webUserController.js';
import authenticateToken from '../../middleware/authenticateToken.js';

const router = express.Router();

router.get('/profile', authenticateToken, WebUserController.getUserProfile);
router.post('/profile', authenticateToken, WebUserController.createUserProfile);
router.put('/profile', authenticateToken, WebUserController.updateUserProfile);
router.delete('/profile', authenticateToken, WebUserController.deleteUserProfile);

export default router;