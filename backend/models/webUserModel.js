import UserModel from './userModel.js';

class WebUserModel extends UserModel {
  static _dbRef = "web/users";

  static async createUserProfile(uid, profileData) {
    return await super.createUserProfile(this._dbRef, uid, profileData);
  }

  static async getUserProfile(uid) {
    return await super.getUserProfile(this._dbRef, uid);
  }

  static async updateUserProfile(uid, profileDataUpdate) {
    return await super.updateUserProfile(this._dbRef, uid, profileDataUpdate);
  }

  static async deleteUserProfile(uid) {
      try {
        await db.ref(`${this._dbRef}/${uid}/bookmarks`).remove();
        return await super.deleteUserProfile(this._dbRef, uid);
      } catch (e) {
        console.error(e);
        console.trace();
        return false;
      }
    }

  static async addBookmark(uid, bookmarkID) {
    const bookmarkRef = db.ref(`${this._dbRef}/${uid}/bookmarks`);
    try {
      const snapshot = await bookmarkRef.push({id: bookmarkID});
      console.log("New bookmark with ID", bookmarkID, "for user", uid, "with key:", snapshot.key);
      console.log("Full reference:", snapshot.ref.toString());
      return bookmarkID;
    } catch (e) {
      console.error("Error adding bookmark:", e);
      return null;
    }
  }

  static async getBookmarks(uid) {
    const bookmarkRef = db.ref(`${this._dbRef}/${uid}/bookmarks`);
    try {
      const snapshot = await bookmarkRef.once('value');
      const bookmarksObject = snapshot.val();

      if (bookmarksObject) {
        const bookmarksArray = Object.keys(bookmarksObject).map(key => {return {...bookmarksObject[key]}});
        return bookmarksArray;
      } else return null;
    } catch (e) {
      console.error("Error getting bookmarks:", e);
    }
  }

  static async removeBookmark(uid, bookmarkID) {
    const bookmarkRef = db.ref(`${this._dbRef}/${uid}/bookmarks/${bookmarkID}`);
    try {
      await bookmarkRef.remove()
      console.log("Removed bookmark with ID:", bookmarkID, "for user:", uid);
      return bookmarkID;
    } catch (e) {
      console.error("Error removing bookmark with ID:", bookmarkID, "for user:", uid, "Error:", error);
      return null;
    }
  }
}

export default WebUserModel;
