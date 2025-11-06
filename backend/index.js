import express from 'express';
import Env from './env.config.js';
import cors from 'cors';
import webUserRoutes from './routes/web/userRoutes.js';
import FirebaseConfig from './utils/firebaseConfig.js';

const env = new Env();

const fb = FirebaseConfig.getFirebaseApp();

const isDevelopment = () => {
  return process.env.NODE_ENV === "development";
}

if (isDevelopment()) {
  try {
    console.log("Connecting to Firebase Emulators...");
    console.log("Connecting to Auth Emulator...");
    const auth = fb.getAuth();
    auth.useEmulator(process.env.AUTH_URL);
    console.log("Success! Connecting to Database Emulator...");
    const db = fb.getDatabase();
    db.useEmulator(process.env.DATABASE_URL, process.env.DATABASE_PORT);
    console.log("Success!")
  } catch (error) {
    console.error("Error occurred connecting to emulators:", error);
    process.exit(1);
  }
}

const expressApp = express();
const port = process.env.PORT || 3001;

expressApp.use(cors());
expressApp.use(express.json());

expressApp.use('/api/web/users', webUserRoutes);

expressApp.listen(port, console.log(`Express app listening on ${port}`));