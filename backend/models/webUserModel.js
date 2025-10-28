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
    return await super.deleteUserProfile(this._dbRef, uid);
  }
}

export default WebUserModel;
