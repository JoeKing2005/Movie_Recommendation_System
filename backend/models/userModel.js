import { getDatabase } from 'firebase-admin/database';
import FirebaseConfig from '../utils/firebaseConfig.js';

class UserModel {
  static async createUserProfile(dbRef, uid, profileData) {
    const db = await FirebaseConfig.getFirebaseApp().getDatabase();
    const userProfileRef = db.ref(`${dbRef}/${uid}`);
    await userProfileRef.set(profileData);
    return await userProfileRef.once('value').val();
  }

  static async getUserProfile(dbRef, uid) {
    const db = await FirebaseConfig.getFirebaseApp().getDatabase();
    const userProfileRef = db.ref(`${dbRef}/${uid}`);
    const snapshot = await userProfileRef.once('value');

    if (snapshot.exists()) return snapshot.val();
    else return null;
  }

  static async updateUserProfile(dbRef, uid, profileDataUpdate) {
    const db = await FirebaseConfig.getFirebaseApp().getDatabase();
    const userProfileRef = db.ref(`${dbRef}/${uid}`);
    await userProfileRef.update(profileDataUpdate)
    return await userProfileRef.once('value').val();
  }

  static async deleteUserProfile(dbRef, uid) {
    const db = await FirebaseConfig.getFirebaseApp().getDatabase();
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
