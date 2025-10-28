import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';

class FirebaseConfig {
    static app;

    static async getFirebaseApp() {
        const firebaseConfig = {
            credential: applicationDefault(),
            databaseURL: process.env.DATABASE_URL
        };

        if (getApps().length === 0) {
            this.app = initializeApp(firebaseConfig);
        } else {
            this.app = getApps()[0];
        }
    }
}

export default FirebaseConfig;
