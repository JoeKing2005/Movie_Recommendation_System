import MovieModel from "../models/movieModel";

class MovieService {
    static async getMovie(id) {
        return await MovieModel.getMovie(id);
    }

    static async getMovies() {
        return await MovieModel.getMovies();
    }

    static async addMovie(movie) {
        return await MovieModel.addMovie(movie);
    }

    static async addMovies(movies) {
        return await MovieModel.addMovies(movies);
    }
}

export default MovieService;