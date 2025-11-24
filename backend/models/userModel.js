import { db } from '../utils/firebaseConfig.js';

class UserModel {
  static async createUserProfile(dbRef, uid, profileData) {
    const userProfileRef = db.ref(`${dbRef}/${uid}/profile`);
    await userProfileRef.set(profileData);
    const snapshot = await userProfileRef.once('value');
    if (snapshot.exists()) return snapshot.val();
    else return null;
  }

  static async getUserProfile(dbRef, uid) {
    const userProfileRef = db.ref(`${dbRef}/${uid}/profile`);
    const snapshot = await userProfileRef.once('value');

    if (snapshot.exists()) return snapshot.val();
    else return null;
  }

  static async updateUserProfile(dbRef, uid, profileDataUpdate) {
    const userProfileRef = db.ref(`${dbRef}/${uid}/profile`);
    const oldSnapshot = await userProfileRef.once('value');
    if (oldSnapshot.exists()) {
      const newProfileData = {
        ...profileDataUpdate,
        createdAt: oldSnapshot.val().createdAt
      }

      await userProfileRef.update(newProfileData);

      const newSnapshot = await userProfileRef.once('value');
      if (newSnapshot.exists()) return newSnapshot.val();
      else return null;
    } else {
      const profileData = {
        ...profileDataUpdate,
        createdAt: new Date().toISOString()
      }

      return await this.createUserProfile(dbRef, uid, profileData)
    }
  }

  static async deleteUserProfile(dbRef, uid) {
    const userProfileRef = db.ref(`${dbRef}/${uid}/profile`);
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
