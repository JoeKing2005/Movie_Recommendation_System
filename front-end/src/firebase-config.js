import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";

const firebaseConfig = {

  apiKey: "AIzaSyCDsDQKfkCIRfhoCFnMFnAiES9Kd9AXgS4",

  authDomain: "movie-recommendation-sys-9b138.firebaseapp.com",

  databaseURL: "https://movie-recommendation-sys-9b138-default-rtdb.europe-west1.firebasedatabase.app",

  projectId: "movie-recommendation-sys-9b138",

  storageBucket: "movie-recommendation-sys-9b138.firebasestorage.app",

  messagingSenderId: "1016574351839",

  appId: "1:1016574351839:web:17bf1a476b6e7ed3970c6a"

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

connectAuthEmulator(auth, "http://127.0.0.1:9099");
connectDatabaseEmulator(db, "127.0.0.1", 9000);

export { app, auth, db };