import { auth } from '../utils/firebaseConfig.js';

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized: No token provided or malformed.');
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(idToken);

    if (!decodedToken) {
        console.error("Decoded token is null or undefined");
        return res.status(500).send('Internal Server Error: Token verification returned no data.');
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    console.log(`User ${req.user.uid} authenticated.`);
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    console.trace();
    return res.status(403).send('Unauthorized: Invalid or expired token.');
  }
}

export default authenticateToken;
