import express from 'express';
import MovieController from '../../controllers/movieController.js';
import authenticateToken from '../../middleware/authenticateToken.js';

const router = express.Router();

router.get('/:id', MovieController.getMovie);
router.get('/', MovieController.getMovies);

router.post('/', authenticateToken, MovieController.addMovie);
router.post('/addAll', authenticateToken, MovieController.addMovies);

export default router;