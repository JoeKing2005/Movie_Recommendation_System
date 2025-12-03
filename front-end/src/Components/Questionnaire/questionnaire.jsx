import React, { useState } from 'react';

const Questionnaire = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  const [userPreferences, setUserPreferences] = useState({
    favorite_genres: [],
    favorite_actors: [],
    mood: 'any',
    year_preference: 'any',
    language: 'English'
  });

  const [actorInput, setActorInput] = useState('');

  const availableGenres = ['Action','Comedy','Drama','Horror','Romance','Thriller','Sci-Fi','Fantasy','Animation','Documentary'];
  const availableMoods = ['exciting','funny','emotional','scary','any'];
  const availableYears = ['recent','classic','any'];
  const availableLanguages = ['English','French','Spanish','German','Italian','Japanese','Korean','Hindi'];

  const getRecommendations = async () => {
    if (userPreferences.favorite_genres.length === 0) {
      alert("Please select at least one genre!");
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

  const formatVotes = (votes) => {
    if (votes >= 1_000_000) return (votes / 1_000_000).toFixed(1) + "M";
    if (votes >= 1_000) return (votes / 1_000).toFixed(1) + "K";
    return votes;
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


  // UI Elements + Styles
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

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes fadeIn { from {opacity:0;} to {opacity:1;} }
        @keyframes slideUp { from {transform: translateY(30px); opacity:0;} to {transform:translateY(0); opacity:1;} }
        @keyframes spin { 0%{transform:rotate(0);} 100%{transform:rotate(360deg);} }
      `}</style>

      <div style={styles.innerContainer}>
        <div style={styles.header}>
          <h1 style={styles.title}>🎬 CineMatch</h1>
          <p style={styles.subtitle}>AI-Powered Movie Recommendations</p>
        </div>

        <div style={styles.card}>

          {/* STEP INDICATOR */}
          {currentStep < 6 && (
            <div style={styles.stepIndicator}>
              {[1,2,3,4,5].map(step => (
                <div key={step} style={{
                  ...styles.step,
                  ...(step === currentStep ? styles.stepActive : {}),
                  ...(step < currentStep ? styles.stepCompleted : {})
                }}>{step}</div>
              ))}
            </div>
          )}

          {error && (
            <p style={{color: "#ff4444", textAlign: "center", marginBottom: "20px"}}>
              ❌ {error}
            </p>
          )}

          {/* STEPS */}
          {currentStep === 1 && (
            <div style={styles.questionContainer}>
              <h2 style={styles.questionTitle}>What genres do you enjoy?</h2>
              <div style={styles.optionsGrid}>
                {availableGenres.map(genre => (
                  <button 
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    style={{
                      ...styles.optionBtn,
                      ...(userPreferences.favorite_genres.includes(genre) ? styles.optionBtnSelected : {})
                    }}
                  >
                    {genre}
                  </button>
                ))}
              </div>

              <button style={styles.btnPrimary} onClick={() => setCurrentStep(2)}>Next</button>
            </div>
          )}

          {currentStep === 2 && (
            <div style={styles.questionContainer}>
              <h2 style={styles.questionTitle}>Favorite actors? (optional)</h2>

              <input
                value={actorInput}
                onChange={(e) => setActorInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" ? addActor() : null}
                placeholder="Type a name and press Enter"
                style={styles.input}
              />

              <div style={styles.actorTags}>
                {userPreferences.favorite_actors.map(actor => (
                  <div key={actor} style={styles.actorTag}>
                    {actor}
                    <button style={styles.removeBtn} onClick={() => removeActor(actor)}>×</button>
                  </div>
                ))}
              </div>

              <div style={styles.navButtons}>
                <button style={styles.btnSecondary} onClick={() => setCurrentStep(1)}>Back</button>
                <button style={styles.btnPrimary} onClick={() => setCurrentStep(3)}>Next</button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div style={styles.questionContainer}>
              <h2 style={styles.questionTitle}>What's your mood?</h2>
              <div style={styles.optionsGrid}>
                {availableMoods.map(m => (
                  <button 
                    key={m}
                    onClick={() => setUserPreferences(prev => ({...prev, mood: m}))}
                    style={{
                      ...styles.optionBtn,
                      ...(userPreferences.mood === m ? styles.optionBtnSelected : {})
                    }}
                  >
                    {moodLabels[m]}
                  </button>
                ))}
              </div>

              <div style={styles.navButtons}>
                <button style={styles.btnSecondary} onClick={() => setCurrentStep(2)}>Back</button>
                <button style={styles.btnPrimary} onClick={() => setCurrentStep(4)}>Next</button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div style={styles.questionContainer}>
              <h2 style={styles.questionTitle}>Preferred era?</h2>
              <div style={styles.optionsGridLarge}>
                {availableYears.map(year => (
                  <button
                    key={year}
                    onClick={() => setUserPreferences(prev => ({ ...prev, year_preference: year }))}
                    style={{
                      ...styles.optionBtn,
                      ...(userPreferences.year_preference === year ? styles.optionBtnSelected : {})
                    }}
                  >
                    {yearLabels[year]}
                  </button>
                ))}
              </div>

              <div style={styles.navButtons}>
                <button style={styles.btnSecondary} onClick={() => setCurrentStep(3)}>Back</button>
                <button style={styles.btnPrimary} onClick={() => setCurrentStep(5)}>Next</button>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div style={styles.questionContainer}>
              <h2 style={styles.questionTitle}>Language?</h2>

              <div style={styles.optionsGrid}>
                {availableLanguages.map(lang => (
                  <button
                    key={lang}
                    onClick={() => setUserPreferences(prev => ({ ...prev, language: lang }))}
                    style={{
                      ...styles.optionBtn,
                      ...(userPreferences.language === lang ? styles.optionBtnSelected : {})
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <div style={styles.navButtons}>
                <button style={styles.btnSecondary} onClick={() => setCurrentStep(4)}>Back</button>
                <button style={styles.btnPrimary} onClick={getRecommendations}>
                  Get Recommendations!
                </button>
              </div>
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Finding movies...</p>
            </div>
          )}

          {/* RESULTS */}
          {currentStep === 6 && !loading && recommendations.length > 0 && (
            <div style={styles.questionContainer}>
              <h2 style={styles.questionTitle}>Your Recommendations</h2>

              <div style={styles.movieGrid}>
                {recommendations.map((movie, i) => (
                  <div key={i} style={styles.movieCard}>
                    <h3 style={styles.movieTitle}>{movie.title}</h3>
                    <p style={styles.movieYear}>{movie.year}</p>

                    <div style={styles.genreTags}>
                      {movie.genres.map(g => <span key={g} style={styles.genreTag}>{g}</span>)}
                    </div>

                    <div style={styles.movieRating}>
                      <span>⭐ {movie.rating.toFixed(1)}</span>
                      <span>|</span>
                      <span>👥 {formatVotes(movie.votes)}</span>
                    </div>

                    <div style={styles.matchBox}>
                      <strong>🎯 {Math.round(movie.ai_confidence * 100)}% Match</strong>
                      <br />
                      {movie.match_reason}
                    </div>
                  </div>
                ))}
              </div>

              <button style={{ ...styles.btnPrimary, margin: "30px auto", display: "block" }} onClick={restart}>
                Start Over
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// ----- STYLES -----
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
    fontFamily: "Roboto, sans-serif"
  },
  innerContainer: { maxWidth: "1200px", margin: "0 auto" },
  header: { textAlign: "center", color: "white", marginBottom: "40px" },
  title: { fontSize: "3.5rem", marginBottom: "10px" },
  subtitle: { opacity: 0.9, fontSize: "1.2rem" },
  card: {
    background: "white",
    borderRadius: "20px",
    padding: "40px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
  },
  stepIndicator: { display: "flex", justifyContent: "center", marginBottom: "40px", gap: "10px" },
  step: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#e0e0e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "0.3s"
  },
  stepActive: { background: "#667eea", color: "white", transform: "scale(1.2)" },
  stepCompleted: { background: "#4caf50", color: "white" },
  questionContainer: { animation: "fadeIn 0.4s" },
  questionTitle: { textAlign: "center", marginBottom: "30px", fontSize: "1.8rem" },
  optionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))",
    gap: "15px",
    marginBottom: "30px"
  },
  optionsGridLarge: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
    gap: "20px",
    marginBottom: "30px"
  },
  optionBtn: {
    padding: "20px",
    borderRadius: "12px",
    border: "2px solid #e0e0e0",
    background: "white",
    cursor: "pointer",
    transition: "0.3s",
    fontSize: "1rem"
  },
  optionBtnSelected: { background: "#667eea", color: "white", borderColor: "#667eea" },
  input: {
    width: "100%", padding: "15px", borderRadius: "10px", border: "2px solid #ccc", marginBottom: "20px"
  },
  actorTags: { display: "flex", gap: "10px", flexWrap: "wrap" },
  actorTag: {
    background: "#667eea", padding: "8px 15px", color: "white", borderRadius: "20px", display: "flex", gap: "10px"
  },
  removeBtn: { border: "none", background: "transparent", color: "white", cursor: "pointer" },
  navButtons: { display: "flex", justifyContent: "space-between", marginTop: "30px" },
  btnPrimary: { padding: "15px 40px", background: "#667eea", color: "white", borderRadius: "12px", cursor: "pointer", border: "none" },
  btnSecondary: { padding: "15px 40px", background: "#ccc", borderRadius: "12px", cursor: "pointer", border: "none" },
  loadingContainer: { textAlign: "center", padding: "60px" },
  spinner: {
    width: "50px", height: "50px", border: "4px solid #eee", borderTop: "4px solid #667eea",
    borderRadius: "50%", animation: "spin 1s linear infinite", margin: "20px auto"
  },
  movieGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: "20px" },
  movieCard: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "25px", borderRadius: "15px", color: "white"
  },
  movieTitle: { fontSize: "1.4rem", fontWeight: "bold" },
  movieYear: { opacity: 0.8 },
  genreTags: { display: "flex", gap: "8px", flexWrap: "wrap", margin: "10px 0" },
  genreTag: { padding: "5px 12px", background: "rgba(255,255,255,0.2)", borderRadius: "12px" },
  movieRating: { display: "flex", gap: "10px", marginBottom: "10px" },
  matchBox: {
    background: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "8px"
  }
};

export default Questionnaire;
