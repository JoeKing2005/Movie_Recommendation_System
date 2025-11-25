import { db } from '../utils/firebaseConfig.js';

class MovieModel {
  static _dbRef = "movies";

  static async addMovie(movie) {
    try {
      const movieRef = db.ref(this._dbRef);
      const newMovieRef = movieRef.push();

      const key = newMovieRef.key;

      if (!key) {
        console.error("Failed to generate key for movie:", movie.title);
        return null;
      }

      const movieWithId = {
        ...movie,
        id: key
      };

      await newMovieRef.set(movieWithId);

      return key;
    } catch (e) {
      console.error("Error adding movie to list:", e.message);
      return null;
    }
  }

  static async addMovies(movies) {
    const movieRef = db.ref(this._dbRef);
    const updates = {};
    const generatedKeys = [];

    for (const movie of movies) {
      const newMovieRef = movieRef.push();
      const key = newMovieRef.key;

      if (!key) {
        console.error("Failed to generate key for movie:", movie.title);
        continue;
      }

      const movieWithId = {
        ...movie,
        id: key
      };

      updates[key] = movieWithId;

      generatedKeys.push(key);
    }

    try {
      await movieRef.update(updates);
      console.log(`Successfully added ${movies.length} items.`);
      return generatedKeys;
    } catch (e) {
      console.error("Error adding movies:", e);
      return null;
    }
  }

  static async getMovie(id) {
    const movieSnapshot = await db.ref(`${this._dbRef}/${id}`).once('value');
    if (movieSnapshot.exists()) return movieSnapshot.val();
    else return null;
  }

  static async getMovies() {
    const moviesSnapshot = await db.ref(this._dbRef).once('value');
    if (moviesSnapshot.exists()) {
      const moviesObject = moviesSnapshot.val();
      if (typeof moviesObject === "object" && moviesObject != null) {
        return Object.values(moviesObject);
      } else {
        console.error("Expected movies object, got", typeof moviesObject);
        return null;
      }
    } else return null;
  }
}

export default MovieModel;
