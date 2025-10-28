import { getAuth } from 'firebase-admin/auth';
import FirebaseConfig from '../utils/firebaseConfig.js';

async function authenticateToken(req, res, next) {
  const fb = await FirebaseConfig.getFirebaseApp();
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized: No token provided or malformed.');
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await fb.getAuth().verifyIdToken(idToken);
    req.user = decodedToken;
    console.log(`User ${req.user.uid} authenticated.`);
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(403).send('Unauthorized: Invalid or expired token.');
  }
}

export default authenticateToken;
