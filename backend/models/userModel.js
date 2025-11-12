import { db } from '../utils/firebaseConfig.js';

class UserModel {
  static async createUserProfile(dbRef, uid, profileData) {
    const userProfileRef = db.ref(`${dbRef}/${uid}`);
    await userProfileRef.set(profileData);
    const snapshot = await userProfileRef.once('value');
    if (snapshot.exists()) return snapshot.val();
    else return null;
  }

  static async getUserProfile(dbRef, uid) {
    const userProfileRef = db.ref(`${dbRef}/${uid}`);
    const snapshot = await userProfileRef.once('value');

    if (snapshot.exists()) return snapshot.val();
    else return null;
  }

  static async updateUserProfile(dbRef, uid, profileDataUpdate) {
    const userProfileRef = db.ref(`${dbRef}/${uid}`);
    await userProfileRef.update(profileDataUpdate)
    const snapshot = await userProfileRef.once('value');
    if (snapshot.exists()) return snapshot.val();
    else return null;
  }

  static async deleteUserProfile(dbRef, uid) {
    const userProfileRef = db.ref(`${dbRef}/${uid}`);
    try {
      await userProfileRef.remove();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}

export default UserModel;
