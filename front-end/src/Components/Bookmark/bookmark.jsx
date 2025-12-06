import React, { useEffect, useState } from "react";
import './bookmark.css';
import movie_icon from '../assets/movie icon.png';
import { auth } from '../../firebase-config';
import fetchBookmarks from "../../utils/fetchBookmarks";
import { Link } from "react-router-dom";

const Bookmark = () => {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load bookmarks on component mount
    useEffect(() => {
        const loadBookmarks = async () => {
            const user = auth.currentUser;
            if (!user) return;

            try {
                const fetchedBookmarks = await fetchBookmarks(user.uid);
                setBookmarks(fetchedBookmarks || []);
            } catch (err) {
                console.error("Error fetching bookmarks:", err);
            } finally {
                setLoading(false);
            }
        };
        loadBookmarks();
    }, []);

    // Remove bookmark
    const removeBookmark = async (bookmarkId) => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const idToken = await user.getIdToken();
            const res = await fetch(`http://localhost:3001/api/web/users/${user.uid}/bookmarks/${bookmarkId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            if (res.status === 204) {
                setBookmarks(prev => prev.filter(b => b.bookmarkId !== bookmarkId));
            } else {
                console.error("Failed to delete bookmark", res.status);
            }
        } catch (err) {
            console.error("Error deleting bookmark:", err);
        }
    };

    // Add a bookmark (example, you can call this from a button elsewhere)
    const addBookmark = async (movie) => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const idToken = await user.getIdToken();
            const res = await fetch(`http://localhost:3001/api/web/users/${user.uid}/bookmarks/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    title: movie.title,
                    year: movie.year,
                    genres: movie.genres,
                    rating: movie.rating,
                    votes: movie.votes,
                    description: movie.description,
                    ai_confidence: movie.ai_confidence,
                    match_reason: movie.match_reason,
                }),
            });

            if (!res.ok) {
                console.error("Failed to add bookmark", res.status);
                return;
            }

            const newBookmark = await res.json();
            setBookmarks(prev => [...prev, newBookmark]);
        } catch (err) {
            console.error("Error adding bookmark:", err);
        }
    };

    return (
        <>
            <div className="top-right-container">
                <div className="title">Movie Recommendation System</div>
                <div className="logo">
                    <img src={movie_icon} height={50} width={50} alt="logo" />
                </div>
            </div>

            <div className='container'>
                <div className="header">
                    <div className="text">Current Bookmarks</div>
                    <div className="underline"></div>
                </div>

                {loading ? (
                    <p>Loading bookmarks...</p>
                ) : (
                    <div className="bookmarkGrid">
                        {bookmarks.length === 0 && <p>No bookmarks yet.</p>}
                        {bookmarks.map(movie => (
                            <div key={movie.bookmarkId} className="movieCard">
                                <h3 className="movieTitle">{movie.title}</h3>
                                <p className="movieYear">{movie.year}</p>
                                <div className="genreTags">
                                    {movie.genres.map(g => (
                                        <span key={g} className="genreTag">{g}</span>
                                    ))}
                                </div>
                                <button
                                    className="btnBookmarkRemove"
                                    onClick={() => removeBookmark(movie.bookmarkId)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ marginTop: "30px", textAlign: "center"}}>
                    <Link to ="/questionnaire">
                    <button className="btnPrimary">
                        Go to Questionnaire
                    </button>
                    </Link>
                </div>
            </div>
        </>
    );
};

export default Bookmark;
