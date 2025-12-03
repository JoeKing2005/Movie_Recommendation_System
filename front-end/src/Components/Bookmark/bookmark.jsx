import React, { useEffect, useState } from "react";
import './bookmark.css'
import movie_icon from '../assets/movie icon.png'
import { auth } from '../../firebase-config';

const Bookmark = () => {
    const [bookmarks, setBookmarks] = useState([]);

    useEffect(() => {
        const fetchBookmarks = async () => {
            const user = auth.currentUser;
            if (!user) return;

            const idToken = await user.getIdToken();
            try {
                const res = await fetch(`http://localhost:5001/api/web/users/${user.uid}/bookmarks`, {
                    headers: {Authorization: `Bearer ${idToken}`}
                });
                if (!res.ok) throw new Error("No bookmarks found");
                const data = await res.json();
                setBookmarks(data);
            } catch (err) {
                console.error(err);
                setBookmarks([]);
            }
        };
        fetchBookmarks();
    }, []);

    const removeBookmark = async (bookmarkID) => {
        const user = auth.currentUser;
        if (!user) return;

        const idToken = await user.getIdToken();
        try {
            const res = await fetch(`http://localhost:5001/api/web/users/${user.uid}/bookmarks/${bookmarkID}`, {
                method: 'DELETE',
                headers: {Authorization: `Bearer ${idToken}`}
            });
            if (res.status === 204) {
                setBookmarks(bookmarks.filter(b => b.bookmarkID !== bookmarkID));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <div className="top-right-container">
                <div className="title">Movie Recommendation System</div>
                <div className="logo">
                    <img src = {movie_icon} height ={50} width={50} alt="" />
                </div>
            </div>

            <div className='container'>
                <div className="header">
                    <div className="text">Current Bookmarks</div>
                    <div className="underline"></div>
                </div>

                <div className="bookmarkGrid">
                    {bookmarks.length === 0 && <p>No bookmarks yet.</p>}
                    {bookmarks.map(movie => (
                        <div key={movie.bookmarkID} className="movieCard">
                            <h3 className="movieTitle">{movie.title}</h3>
                            <p className="movieYear">{movie.year}</p>
                            <div className="genreTags">
                                {movie.genres.map(g => <span key={g} className="genreTag">{g}</span>)} 
                            </div>
                            <button className="btnBookmarkRemove" onClick={() => removeBookmark(movie.bookmarkID)}>
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Bookmark