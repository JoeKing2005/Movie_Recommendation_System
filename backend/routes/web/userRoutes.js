import express from 'express';
import WebUserController from '../../controllers/webUserController.js';
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
 * Get User Profile
 * 
 * Requires Authentication
 * URL: /api/web/users/:uid/profile
 * @param req
 * Method: GET
 * Body: None
 * @returns
 * On Success: 200
 * Body: {
        username: string,
        email: string,
        createdAt: string,
        updatedAt: string
    }
 * On Failure: 404 "User Profile not found."
 * 500
 */
router.get('/:uid/profile', authenticateToken, WebUserController.getUserProfile);

/**
 * Create User Profile
 * 
 * Requires Authentication
 * URL: /api/web/users/:uid/profile
 * @param req
 * Method: POST
 * Body: {
 *      username: string
 * }
 * @returns
 * On Success: 201
 * Body: {
        username: string,
        email: string,
        createdAt: string,
        updatedAt: string
    }
 * On Failure: 400 "Username is required."
 * 500
 */
router.post('/:uid/profile', authenticateToken, WebUserController.createUserProfile);

/**
 * Update User Profile
 * 
 * Requires Authentication
 * URL: /api/web/users/:uid/profile
 * @param req
 * Method: PUT
 * Body: {
 *      username: string
 * }
 * @returns
 * On Success: 200
 * Body: {
        username: string,
        email: string,
        createdAt: string,
        updatedAt: string
    }
 * On Failure: 400 "Username is required."
 * 500
 */
router.put('/:uid/profile', authenticateToken, WebUserController.updateUserProfile);

/**
 * Delete User Profile
 * 
 * Requires Authentication
 * URL: /api/web/users/:uid/profile
 * @param req
 * Method: DELETE
 * Body: None
 * @returns
 * On Success: 204 "User profile successfully deleted."
 * On Failure: 404 "User Profile not found."
 * 500
 */
router.delete('/:uid/profile', authenticateToken, WebUserController.deleteUserProfile);

/**
 * Submit Questionnaire
 * 
 * Requires Authentication
 * URL: /api/web/users/:uid/questionnaire
 * @param req
 * Method: POST
 * Body: {
 *      q1: string
 *      ...
 * }
 * @returns
 * On Success: 201
 * Body: [
 *  {
 *      id: string,
 *      ...
 *  },
 *  {
 * 
 *  }
 * ]
 * On Failure: 400 "All questions must be answered."
 * 500 "Failure submitting questionnaire."
 */
router.post('/:uid/questionnaire', authenticateToken, WebUserController.submitQuestionnaire);

/**
 * Get Bookmarks
 * 
 * Requires Authentication
 * URL: /api/web/users/:uid/bookmarks
 * @param req
 * Method: GET
 * Body: None
 * @returns
 * On Success: 200
 * Body: [
 *      movieId1,
 *      movieId2...
 * ]
 * On Failure: 404 "No bookmarks found."
 * 500
 */
router.get('/:uid/bookmarks', authenticateToken, WebUserController.getBookmarks);

/**
 * Add Bookmark
 * 
 * Requires Authentication
 * URL: /api/web/users/:uid/bookmarks/:id
 * @param req
 * Method: POST
 * Body: None
 * @returns
 * On Success: 201 "Added bookmark with ID 1"
 * On Failure: 400 "No Bookmark ID specified."
 * 500
 */
router.post('/:uid/bookmarks/:id', authenticateToken, WebUserController.addBookmark);

/**
 * Delete Bookmark
 * 
 * Requires Authentication
 * URL: /api/web/users/:uid/bookmarks/:id
 * @param req
 * Method: DELETE
 * Body: None
 * @returns
 * On Success: 204 "Removed bookmark with ID 1"
 * On Failure: 404 "No bookmark found with ID 1"
 * 500
 */
router.delete('/:uid/bookmarks/:id', authenticateToken, WebUserController.deleteBookmark);

export default router;