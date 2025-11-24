import UserModel from './userModel.js';

class WebUserModel extends UserModel {
  static _dbRef = "web/users";

  static async createUserProfile(uid, profileData) {
    return await super.createUserProfile(this._dbRef, uid, profileData);
  }

  /*static async createDoctorData(uid, details) {
      try {
        await db.ref(`${this._dbRef}/${uid}/patients`).set(details.patients);
        await db.ref(`${this._dbRef}/${uid}/results`).set(details.results);
        return true;
      } catch (e) {
        console.error(e);
        console.trace();
        return false;
      }
    }*/

  static async getUserProfile(uid) {
    return await super.getUserProfile(this._dbRef, uid);
  }

  static async updateUserProfile(uid, profileDataUpdate) {
    return await super.updateUserProfile(this._dbRef, uid, profileDataUpdate);
  }

  static async deleteUserProfile(uid) {
      try {
        await db.ref(`${this._dbRef}/${uid}/patients`).remove();
        return await super.deleteUserProfile(this._dbRef, uid);
      } catch (e) {
        console.error(e);
        console.trace();
        return false;
      }
    }

  static async addPatient(uid, patientUID) {
    const patientRef = db.ref(`${this._dbRef}/${uid}/patients`);
    questionnaireRef.push({uid: patientUID})
    .then((snapshot) => {
      console.log("New patient with UID", patientUID, "for user", uid, "with key:", snapshot.key);
      console.log("Full reference:", snapshot.ref.toString());
      return patientUID;
    })
    .catch((error) => {
      console.error("Error adding patient:", error);
      return null;
    });
  }

  static async getPatients(uid) {
    const patientRef = db.ref(`${this._dbRef}/${uid}/patients`);
    patientRef.once('value').then((snapshot) => {
        const patientsObject = snapshot.val();
        if (patientsObject) {
          const patientsArray = Object.keys(patientsObject).map(key => {return {...patientsObject[key]}});
          return patientsArray;
        } else return null;
    })
    .catch((e) => {
      console.error("Error getting patients:", e);
    });
  }

  static async removePatient(uid, patientUID) {
    const patientRef = db.ref(`${this._dbRef}/${uid}/patients/${patientUID}`);
    return patientRef.remove()
    .then(() => {
      console.log("Removed patient with ID:", patientUID, "for user:", uid);
      return patientUID;
    })
    .catch((error) => {
      console.error("Error removing patient with ID:", patientUID, "for user:", uid, "Error:", error);
      return null;
    });
  }
}

export default WebUserModel;
