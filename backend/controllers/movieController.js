import MovieService from "../services/movieService.js";

class MovieController {
    static async getMovie(req, res) {
        try {
            const id = req.params.id;
            const movie = await Service.getmovie(id);
            if (movie) res.status(200).json(movie);
            else res.status(404).send("Movie not found.");
        } catch (e) {
            console.error(e.message);
            console.trace();
            if (res.status) return res.status(res.status).send(e.message);
            else return res.status(500).send(e.message);
        }
    }

    static async getMovies(req, res) {
        try {
            const movies = await Service.getMovies();
            if (movies) res.status(200).json(movies);
            else throw("Cannot access movies.");
        } catch (e) {
            console.error(e.message);
            console.trace();
            if (res.status) return res.status(res.status).send(e.message);
            else return res.status(500).send(e.message);
        }
    }

    static async addMovie(req, res) {
        try {
            const movie = req.body;
            if (movie) {
                const result = await MovieService.addMovie(movie);
                if (result) res.status(201).send("Movie has been added successfully.");
                else throw("Failed to add movie.");
            } else {
                res.status(400);
                throw("No movie specified by client.");
            }
        } catch (e) {
            console.error(e.message);
            console.trace();
            if (res.status) return res.status(res.status).send(e.message);
            else return res.status(500).send(e.message);
        }
    }

    static async addMovies(req, res) {
        try {
            const movies = req.body;
            if (movies) {
                const result = await MovieService.addMovies(movies);
                if (result) res.status(201).send("Movies have been added successfully.");
                else throw("Failed to add movies.");
            } else {
                res.status(400);
                throw("No movies specified by client.");
            }
        } catch (e) {
            console.error(e.message);
            console.trace();
            if (res.status) return res.status(res.status).send(e.message);
            else return res.status(500).send(e.message);
        }
    }
}

export default MovieController;