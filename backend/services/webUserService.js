import UserService from "./userService.js";
import WebUserModel from "../models/webUserModel.js";
import MovieModel from "../models/movieModel.js";


class WebUserService extends UserService {
    static async createUserProfile(uid, firstName, lastName, email) {
        const createdProfile = await super.createUserProfile(WebUserModel, uid, firstName, lastName, email, "1970-01-01");
        // if (createdProfile) await WebUserModel.createDoctorData(uid, {patients: []});
        return createdProfile;
    }

    static async getUserProfile(uid) {
        return await super.getUserProfile(WebUserModel, uid);
    }

    static async updateUserProfile(uid, firstName, lastName, email) {
        return await super.updateUserProfile(WebUserModel, uid, firstName, lastName, email, "1970-01-01");
    }

    static async deleteUserProfile(uid) {
        return await super.deleteUserProfile(WebUserModel, uid);
    }

    static async addPatient(uid, patientUID) {
        // Instead of rewriting this function, getting the patient profile to confirm the patient exists
        const patient = await MovieModel.getUserProfile(patientUID);
        if (patient) return await WebUserModel.addPatient(uid, patientUID);
        else return null;
    }

    static async getPatients(uid) {
        let patients = [];
        const patientUIDs = await WebUserModel.getPatients(uid);
        if (patientUIDs){
            for (p of patientUIDs) {
                let patient = await MovieModel.getUserProfile(uid);
                let patientSummary = {
                    firstName: patient.profile.firstName,
                    lastName: patient.profile.lastName,
                    dateOfBirth: patient.profile.dateOfBirth,
                    averageRisk: patient.results.averageRisk,
                    questionnaireAverageRisk: patient.results.questionnaireAverageRisk,
                    voiceAverageRisk: patient.results.voiceAverageRisk, 
                }
                patients += patientSummary;
            }
        } else return null;
        return patients;
    }

    static async removePatient(uid, patientUID) {
        return await WebUserModel.removePatient(uid, patientUID);
    }

    static async generateReport(patientUID) {
        const patient = await MovieModel.getUserProfile(patientUID);
        if (patient) {
            return {
                profile: {
                    firstName: patient.profile.firstName,
                    lastName: patient.profile.lastName,
                    dateOfBirth: patient.profile.dateOfBirth
                },
                riskFactors: patient.riskFactors,
                results: patient.results
            }
        }
        else return null;
    }
}

export default WebUserService;