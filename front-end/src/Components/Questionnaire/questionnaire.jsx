import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './questionnaire.css';
import { auth } from '../../firebase-config';
import movie_icon from '../assets/movie icon.png';

const Questionnaire = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  const [userPreferences, setUserPreferences] = useState({
    favorite_genres: [],
    favorite_actors: [],
    mood: '',
    year_preference: '',
    language: ''
  });

  const [actorInput, setActorInput] = useState('');

  const availableGenres = ['Action','Comedy','Drama','Horror','Romance','Thriller','Sci-Fi','Fantasy','Animation','Documentary'];
  const availableMoods = ['exciting','funny','emotional','scary','any'];
  const availableYears = ['recent','classic','any'];
  const availableLanguages = ['English','French','Spanish','German','Italian','Japanese','Korean','Hindi'];

  // -------------------- USER & BOOKMARKS --------------------
    const loadBookmarks = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      setLoadingBookmarks(true);

      try {
        const idToken = await user.getIdToken();
        const res = await fetch(`http://localhost:3001/api/web/users/${user.uid}/bookmarks`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        if (!res.ok) throw new Error('Could not load bookmarks');
        const data = await res.json();
        setBookmarks(data);
      } catch (err) {
        console.error(err);
      }

      setLoadingBookmarks(false);
    };
    useEffect (() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (!user) {
                navigate('/login');
            } else {
                loadBookmarks();
            }
    })

    return () => unsubscribe();
  }, [navigate]);

  const toggleBookmark = async (movie) => {
    const user = auth.currentUser;
    if (!user) return;

    const existing = bookmarks.find(b => b.title === movie.title);

    try {
      const idToken = await user.getIdToken();

      if (existing) {
        // DELETE bookmark
        const res = await fetch(`http://localhost:3001/api/web/users/${user.uid}/bookmarks/${existing.bookmarkId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (res.status === 204) {
          setBookmarks(bookmarks.filter(b => b.bookmarkId !== existing.bookmarkId));
        }
      } else {
        // ADD bookmark
        const { title, year, genres, rating, votes, description, ai_confidence, match_reason } = movie;
        const id = movie.title.replace(/\s+/g, '_');
        const res = await fetch(`http://localhost:3001/api/web/users/${user.uid}/bookmarks/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ id, title, year, genres, rating, votes, description, ai_confidence, match_reason}),
        });

        if (res.status === 201) {
          setBookmarks([...bookmarks, { movie, bookmarkId: id }]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isBookmarked = (movie) => bookmarks.some(b => b.title === movie.title);

  // -------------------- QUESTIONNAIRE LOGIC --------------------
  const toggleGenre = (genre) => {
    setUserPreferences(prev => ({
      ...prev,
      favorite_genres: prev.favorite_genres.includes(genre)
        ? prev.favorite_genres.filter(g => g !== genre)
        : [...prev.favorite_genres, genre]
    }));
  };

  const addActor = () => {
    if (actorInput.trim() && !userPreferences.favorite_actors.includes(actorInput)) {
      setUserPreferences(prev => ({
        ...prev,
        favorite_actors: [...prev.favorite_actors, actorInput.trim()]
      }));
      setActorInput('');
    }
  };

  const removeActor = (actor) => {
    setUserPreferences(prev => ({
      ...prev,
      favorite_actors: prev.favorite_actors.filter(a => a !== actor)
    }));
  };

  const getRecommendations = async () => {
    if (userPreferences.favorite_genres.length === 0) {
      alert("Please select at least one genre!");
      return;
    }

    if (userPreferences.favorite_genres.includes("Documentary") && !userPreferences.year_preference) {
      alert("Please select a preferred year for Documentaries!");
      setCurrentStep(4);
      return;
    }

    if (userPreferences.favorite_genres.includes("Animation") && !userPreferences.language) {
      alert("Please select a language for Animation!");
      setCurrentStep(5);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5001/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userPreferences,
          num_recommendations: 12
        })
      });

      const data = await response.json();

      if (data.status === "success") {
        setRecommendations(data.recommendations);
        setCurrentStep(6);
      } else {
        setError("AI could not generate recommendations.");
      }
    } catch (err) {
      console.error(err);
      setError("Cannot connect to AI backend. Make sure Flask server is running.");
    }

    setLoading(false);
  };

  const restart = () => {
    setCurrentStep(1);
    setRecommendations([]);
    setError(null);
    setUserPreferences({
      favorite_genres: [],
      favorite_actors: [],
      mood: 'any',
      year_preference: 'any',
      language: 'English'
    });
    setActorInput('');
  };

  const formatVotes = (votes) => {
    if (votes >= 1_000_000) return (votes / 1_000_000).toFixed(1) + "M";
    if (votes >= 1_000) return (votes / 1_000).toFixed(1) + "K";
    return votes;
  };

  const moodLabels = {
    exciting: "🔥 Exciting",
    funny: "😄 Funny",
    emotional: "💔 Emotional",
    scary: "😱 Scary",
    any: "🎭 Any"
  };

  const yearLabels = {
    recent: "🆕 Recent (2014+)",
    classic: "⭐ Classic (Before 2000)",
    any: "🎬 Any Era"
  };

  if (loadingBookmarks) {
    return <p className="loading">Loading your profile...</p>;
  }
  return (
    <div className="container">
      <div className="innerContainer">
        <div className="top-right-container">
  <div className="title">Movie Recommendation System</div>
  <div className="logo">
    <img src={movie_icon} height={30} width={30} alt="logo" />
    </div>
  </div>


        <div className="card">

          {currentStep < 6 && (
            <div className="stepIndicator">
              {[1,2,3,4,5].map(step => (
                <div key={step} className={
                  `step ${step === currentStep ? 'stepActive' : ''} ${step < currentStep ? 'stepCompleted' : ''}`
                }>{step}</div>
              ))}
            </div>
          )}

          {error && (
            <p style={{color: "#ff4444", textAlign: "center", marginBottom: "20px"}}>
              ❌ {error}
            </p>
          )}

          {currentStep === 1 && (
            <div className="questionContainer">
              <h2 className="questionTitle">What genres do you enjoy?</h2>
              <div className="optionsGrid">
                {availableGenres.map(genre => (
                  <button 
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`optionBtn ${userPreferences.favorite_genres.includes(genre) ? 'optionBtnSelected' : ''}`}
                  >
                    {genre}
                  </button>
                ))}
              </div>

              <button className="btnPrimary" onClick={() => setCurrentStep(2)}>Next</button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="questionContainer">
              <h2 className="questionTitle">Favorite actors? (optional)</h2>

              <input
                value={actorInput}
                onChange={(e) => setActorInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" ? addActor() : null}
                placeholder="Type a name and press Enter"
                className="input"
              />

              <div className="actorTags">
                {userPreferences.favorite_actors.map(actor => (
                  <div key={actor} className="actorTag">
                    {actor}
                    <button className="removeBtn" onClick={() => removeActor(actor)}>×</button>
                  </div>
                ))}
              </div>

              <div className="navButtons">
                <button className="btnSecondary" onClick={() => setCurrentStep(1)}>Back</button>
                <button className="btnPrimary" onClick={() => setCurrentStep(3)}>Next</button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="questionContainer">
              <h2 className="questionTitle">What's your mood?</h2>
              <div className="optionsGrid">
                {availableMoods.map(m => (
                  <button 
                    key={m}
                    onClick={() => setUserPreferences(prev => ({...prev, mood: m}))}
                    className={`optionBtn ${userPreferences.mood === m ? 'optionBtnSelected' : ''}`}
                  >
                    {moodLabels[m]}
                  </button>
                ))}
              </div>

              <div className="navButtons">
                <button className="btnSecondary" onClick={() => setCurrentStep(2)}>Back</button>
                <button className="btnPrimary" onClick={() => setCurrentStep(4)}>Next</button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="questionContainer">
              <h2 className="questionTitle">Preferred era?</h2>
              <div className="optionsGridLarge">
                {availableYears.map(year => (
                  <button
                    key={year}
                    onClick={() => setUserPreferences(prev => ({ ...prev, year_preference: year }))}
                    className={`optionBtn ${userPreferences.year_preference === year ? 'optionBtnSelected' : ''}`}
                  >
                    {yearLabels[year]}
                  </button>
                ))}
              </div>

              <div className="navButtons">
                <button className="btnSecondary" onClick={() => setCurrentStep(3)}>Back</button>
                <button className="btnPrimary" onClick={() => setCurrentStep(5)}>Next</button>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="questionContainer">
              <h2 className="questionTitle">Language?</h2>

              <div className="optionsGrid">
                {availableLanguages.map(lang => (
                  <button
                    key={lang}
                    onClick={() => setUserPreferences(prev => ({ ...prev, language: lang }))}
                    className={`optionBtn ${userPreferences.language === lang ? 'optionBtnSelected' : ''}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <div className="navButtons">
                <button className="btnSecondary" onClick={() => setCurrentStep(4)}>Back</button>
                <button className="btnPrimary" onClick={getRecommendations}>
                  Get Recommendations!
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="loadingContainer">
              <div className="spinner"></div>
              <p>Finding movies...</p>
            </div>
          )}

          {currentStep === 6 && !loading && recommendations.length > 0 && (
            <div className="questionContainer">
              <h2 className="questionTitle">Your Recommendations</h2>

              <div className="movieGrid">
                {recommendations.map((movie, i) => (
                  <div key={i} className="movieCard">
                    <h3 className="movieTitle">{movie.title}</h3>
                    <p className="movieYear">{movie.year}</p>

                    <div className="genreTags">
                      {movie.genres.map(g => <span key={g} className="genreTag">{g}</span>)}
                    </div>

                    <div className="movieRating">
                      <span>⭐ {movie.rating.toFixed(1)}</span>
                      <span>|</span>
                      <span>👥 {formatVotes(movie.votes)}</span>
                    </div>

                    <div className="matchBox">
                      <strong>🎯 {Math.round(movie.ai_confidence * 100)}% Match</strong>
                      <br />
                      {movie.match_reason}
                    </div>
                    <button className={`btnBookmark ${isBookmarked(movie) ? 'bookmarked' : ''}`}
                    onClick={() => toggleBookmark(movie)} >
                        {isBookmarked(movie) ? '★ Bookmarked' : '☆ Bookmark'}
                    </button>
                  </div>
                ))}
              </div>

              <button className="btnPrimary" style={{ margin: "30px auto", display: "block" }} onClick={restart}>
                Start Over
              </button>

              <Link to="/bookmark">
              <button className="btnPrimary">
                View My Bookmarks
              </button>
              </Link> 
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Questionnaire;