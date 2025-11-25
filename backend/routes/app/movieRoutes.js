import express from 'express';
import MovieController from '../../controllers/movieController.js';
import authenticateToken from '../../middleware/authenticateToken.js';

const router = express.Router();

/*
    NOTE
================================================================================================
When using a route that Requires Authentication via Firebase include the following HTTP header:
    "Authorization": `Bearer ${idToken}`

    Where idToken is the token returned from Firebase via the getIdToken method
------------------------------------------------------------------------------------------------
When using a route that expects JSON data include the following HTTP header:
    "Content-Type": "application/json"
------------------------------------------------------------------------------------------------
When using a route that expects MP3 data include the following HTTP header:
    "Content-Type": "multipart/form-data"
------------------------------------------------------------------------------------------------
*/

/**
 * Get Movie
 * 
 * URL: /api/movies/:id
 * @param req
 * Method: GET
 * Body: None
 * @returns
 * On Success: 200
 * Body: {
 *      id: string
 *      ...
 * }
 * On Failure: 404 "Movie not found."
 * 500
 */
router.get('/:id', MovieController.getMovie);

/**
 * Get All Movies
 * 
 * URL: /api/movies/
 * @param req
 * Method: GET
 * Body: None
 * @returns
 * On Success: 200
 * Body: [
 *  {
 *      id: string,
 *      ...
 *  },
 *  {
 * 
 *  }
 * ]
 * On Failure: 500 "Cannot access movies"
 */
router.get('/', MovieController.getMovies);

/**
 * Add Movie
 * 
 * Requires Authentication
 * URL: /api/movies/
 * @param req
 * Method: POST
 * Body: {
 *      ...
 * }
 * ^ all of the movie fields we have except id, id will be replaced by its Firebase DB id
 * @returns
 * On Success: 201 "Movie has been added successfully."
 * On Failure: 400 "No movie specified by client."
 * 500 "Failed to add movie."
 */
router.post('/', authenticateToken, MovieController.addMovie);

/**
 * Add All Movies
 * 
 * URL: /api/movies/addAll
 * @param req
 * Method: POST
 * Body: [
 * {
 *      ...
 * },
 * {
 * 
 * }, ...
 * ]
 * ^ all of the movie fields we have except id, id will be replaced by its Firebase DB id
 * @returns
 * On Success: 201 "Movies have been added successfully."
 * On Failure: 400 "No movies specified by client."
 * 500 "Failed to add movies."
 */
router.post('/addAll', MovieController.addMovies);

export default router;