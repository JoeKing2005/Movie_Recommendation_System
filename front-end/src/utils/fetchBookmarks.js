import { auth } from '../firebase-config';

const fetchBookmarks = async (uid) => {
  if (!uid) return [];

  
    const user = auth.currentUser;
    if (!user) return [];
    try {
    const idToken = await user.getIdToken();

    const res = await fetch(`http://localhost:3001/api/web/users/${uid}/bookmarks`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error("Failed to fetch bookmarks", res.status);
      return [];
    }

    return await res.json();

  } catch (err) {
    console.error("Bookmark fetch error:", err);
    return [];
  }
};

export default fetchBookmarks;
