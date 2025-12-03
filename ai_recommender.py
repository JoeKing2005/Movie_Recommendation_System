"""
AI-Powered Movie Recommendation Backend
Your teammate can POST user answers and GET AI recommendations
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from typing import List, Dict
import random

app = Flask(__name__)
CORS(app)

# ============================================================================
# GENRE MAPPING - Simplified to basic genres
# ============================================================================

BASIC_GENRES = [
    'Action',
    'Comedy', 
    'Drama',
    'Horror',
    'Romance',
    'Thriller',
    'Sci-Fi',
    'Fantasy',
    'Animation',
    'Documentary'
]

GENRE_MAPPING = {
    # Map complex genres to basic ones
    'Science Fiction': 'Sci-Fi',
    'Sci-fi': 'Sci-Fi',
    'Science-Fiction': 'Sci-Fi',
    'Mystery': 'Thriller',
    'Crime': 'Thriller',
    'War': 'Action',
    'Western': 'Action',
    'Adventure': 'Action',
    'Family': 'Comedy',
    'Music': 'Drama',
    'History': 'Drama',
    'Biography': 'Drama',
    'Musical': 'Drama',
    'Sport': 'Drama',
    'Film-Noir': 'Thriller',
}

def normalize_genres(genre_list):
    """Convert complex genres to basic ones"""
    normalized = set()
    for genre in genre_list:
        # Check if it's already a basic genre
        if genre in BASIC_GENRES:
            normalized.add(genre)
        # Check if we have a mapping
        elif genre in GENRE_MAPPING:
            normalized.add(GENRE_MAPPING[genre])
        # Default to Drama if unknown
        else:
            normalized.add('Drama')
    return list(normalized)

# ============================================================================
# LOAD DATASET
# ============================================================================

try:
    df = pd.read_csv("cleaned_data.csv", low_memory=False)
    print(f"✅ Loaded {len(df)} movies")
    
    # Clean votes
    def convert_votes(votes):
        if pd.isna(votes):
            return 0
        if isinstance(votes, (int, float)):
            return float(votes)
        votes_str = str(votes).upper().replace(',', '')
        if 'K' in votes_str:
            try:
                return float(votes_str.replace('K', '')) * 1000
            except:
                return 0
        if 'M' in votes_str:
            try:
                return float(votes_str.replace('M', '')) * 1000000
            except:
                return 0
        try:
            return float(votes_str)
        except:
            return 0
    
    df['votes'] = df['votes'].apply(convert_votes)
    
    # Parse genres
    def safe_parse_genres(x):
        if pd.isna(x):
            return []
        if isinstance(x, list):
            return x
        if isinstance(x, str):
            if x.startswith('['):
                try:
                    return eval(x)
                except:
                    return []
            else:
                return [g.strip() for g in x.split(',') if g.strip()]
        return []
    
    df['genres'] = df['genres'].apply(safe_parse_genres)
    
    # Normalize all genres to basic ones
    df['basic_genres'] = df['genres'].apply(normalize_genres)
    
    # Fix year
    df['year'] = pd.to_numeric(df['year'], errors='coerce').fillna(2020).astype(int)
    
    # Fix rating
    if 'rating' in df.columns:
        df['rating'] = pd.to_numeric(df['rating'], errors='coerce').fillna(7.0)
    else:
        df['rating'] = 7.0
    
    # Extract actors from cast
    if 'cast' in df.columns:
        df['actors'] = df['cast'].apply(lambda x: [a.strip() for a in str(x).split(',')[:5]] if pd.notna(x) else [])
    else:
        df['actors'] = [[] for _ in range(len(df))]
    
    # Language
    if 'language' not in df.columns:
        df['language'] = 'English'
    
    print("✅ Dataset prepared with basic genres")
    
except Exception as e:
    print(f"❌ Error loading dataset: {e}")
    df = pd.DataFrame()

# ============================================================================
# AI RECOMMENDATION ENGINE
# ============================================================================

class AIRecommender:
    """AI-powered recommendation engine"""
    
    def __init__(self, dataframe):
        self.df = dataframe
    
    def get_recommendations(self, user_preferences: Dict, top_n=10) -> List[Dict]:
        """
        Generate AI-powered recommendations based on user preferences
        
        Expected user_preferences format:
        {
            "favorite_genres": ["Action", "Comedy"],
            "favorite_actors": ["Tom Cruise"],
            "mood": "exciting",  # optional
            "year_preference": "recent",  # "recent", "classic", "any"
            "language": "English"  # optional
        }
        """
        
        if self.df.empty:
            return []
        
        # Start with full dataset
        filtered = self.df.copy()
        
        # Filter by language if specified
        if 'language' in user_preferences and user_preferences['language']:
            filtered = filtered[filtered['language'] == user_preferences['language']]
        
        # Filter by year preference
        year_pref = user_preferences.get('year_preference', 'any')
        current_year = 2024
        
        if year_pref == 'recent':
            filtered = filtered[filtered['year'] >= current_year - 10]
        elif year_pref == 'classic':
            filtered = filtered[filtered['year'] < 2000]
        
        # Score based on genres
        favorite_genres = user_preferences.get('favorite_genres', [])
        if favorite_genres:
            genre_scores = []
            for _, row in filtered.iterrows():
                movie_genres = row['basic_genres']
                score = sum(3 for g in favorite_genres if g in movie_genres)
                genre_scores.append(score)
            filtered['genre_score'] = genre_scores
        else:
            filtered['genre_score'] = 0
        
        # Score based on actors
        favorite_actors = user_preferences.get('favorite_actors', [])
        if favorite_actors:
            actor_scores = []
            for _, row in filtered.iterrows():
                movie_actors = row['actors']
                score = sum(2 for a in favorite_actors if a in movie_actors)
                actor_scores.append(score)
            filtered['actor_score'] = actor_scores
        else:
            filtered['actor_score'] = 0
        
        # Mood-based adjustment
        mood = user_preferences.get('mood', 'any')
        mood_bonus = []
        
        for _, row in filtered.iterrows():
            bonus = 0
            genres = row['basic_genres']
            
            if mood == 'exciting':
                if 'Action' in genres or 'Thriller' in genres:
                    bonus += 2
            elif mood == 'funny':
                if 'Comedy' in genres:
                    bonus += 2
            elif mood == 'emotional':
                if 'Drama' in genres or 'Romance' in genres:
                    bonus += 2
            elif mood == 'scary':
                if 'Horror' in genres or 'Thriller' in genres:
                    bonus += 2
            
            mood_bonus.append(bonus)
        
        filtered['mood_score'] = mood_bonus
        
        # Calculate final AI score
        filtered['ai_score'] = (
            filtered['genre_score'] * 3.0 +
            filtered['actor_score'] * 2.0 +
            filtered['mood_score'] * 1.5 +
            filtered['rating'] * 0.5 +
            np.log1p(filtered['votes']) * 0.3
        )
        
        # Add some randomness for diversity (AI personality)
        filtered['ai_score'] += np.random.uniform(-0.5, 0.5, len(filtered))
        
        # Get top recommendations
        recommendations = filtered.nlargest(top_n, 'ai_score')
        
        # Format output
        results = []
        for _, movie in recommendations.iterrows():
            results.append({
                'title': movie['title'],
                'year': int(movie['year']),
                'genres': movie['basic_genres'],
                'rating': float(movie['rating']),
                'votes': int(movie['votes']),
                'description': movie.get('description', 'No description available'),
                'ai_confidence': round(float(movie['ai_score']) / 10, 2),  # Normalized score
                'match_reason': self._generate_match_reason(movie, user_preferences)
            })
        
        return results
    
    def _generate_match_reason(self, movie, preferences):
        """Generate AI explanation for why this movie was recommended"""
        reasons = []
        
        # Genre match
        fav_genres = preferences.get('favorite_genres', [])
        movie_genres = movie['basic_genres']
        matching_genres = [g for g in fav_genres if g in movie_genres]
        if matching_genres:
            reasons.append(f"Matches your love for {', '.join(matching_genres)}")
        
        # Actor match
        fav_actors = preferences.get('favorite_actors', [])
        movie_actors = movie['actors']
        matching_actors = [a for a in fav_actors if a in movie_actors]
        if matching_actors:
            reasons.append(f"Features {matching_actors[0]}")
        
        # High rating
        if movie['rating'] >= 8.0:
            reasons.append(f"Highly rated ({movie['rating']}/10)")
        
        # Popular
        if movie['votes'] > 50000:
            reasons.append("Fan favorite")
        
        return ' • '.join(reasons) if reasons else "Great match for your taste!"


# Initialize AI
ai_recommender = AIRecommender(df)

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/api/ai/info', methods=['GET'])
def get_ai_info():
    """Get available options for the AI"""
    return jsonify({
        "status": "success",
        "available_genres": BASIC_GENRES,
        "available_actors": df['actors'].explode().value_counts().head(100).index.tolist() if not df.empty else [],
        "year_preferences": ["recent", "classic", "any"],
        "moods": ["exciting", "funny", "emotional", "scary", "any"],
        "languages": df['language'].unique().tolist() if not df.empty else ["English"]
    })


@app.route('/api/ai/recommend', methods=['POST'])
def ai_recommend():
    """
    POST endpoint for AI recommendations
    
    Request body:
    {
        "favorite_genres": ["Action", "Comedy"],
        "favorite_actors": ["Tom Cruise"],
        "mood": "exciting",
        "year_preference": "recent",
        "language": "English",
        "num_recommendations": 10
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "status": "error",
                "message": "No data provided"
            }), 400
        
        # Extract preferences
        preferences = {
            "favorite_genres": data.get('favorite_genres', []),
            "favorite_actors": data.get('favorite_actors', []),
            "mood": data.get('mood', 'any'),
            "year_preference": data.get('year_preference', 'any'),
            "language": data.get('language', 'English')
        }
        
        num_recommendations = data.get('num_recommendations', 10)
        
        # Get AI recommendations
        recommendations = ai_recommender.get_recommendations(preferences, top_n=num_recommendations)
        
        return jsonify({
            "status": "success",
            "preferences": preferences,
            "recommendations": recommendations,
            "count": len(recommendations)
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/ai/quick-recommend', methods=['GET'])
def quick_recommend():
    """
    Quick recommendation with query parameters
    
    Example: /api/ai/quick-recommend?genres=Action,Comedy&mood=exciting&limit=5
    """
    try:
        genres = request.args.get('genres', '').split(',') if request.args.get('genres') else []
        actors = request.args.get('actors', '').split(',') if request.args.get('actors') else []
        mood = request.args.get('mood', 'any')
        year_pref = request.args.get('year_preference', 'any')
        limit = int(request.args.get('limit', 10))
        
        preferences = {
            "favorite_genres": [g.strip() for g in genres if g.strip()],
            "favorite_actors": [a.strip() for a in actors if a.strip()],
            "mood": mood,
            "year_preference": year_pref
        }
        
        recommendations = ai_recommender.get_recommendations(preferences, top_n=limit)
        
        return jsonify({
            "status": "success",
            "recommendations": recommendations,
            "count": len(recommendations)
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/ai/health', methods=['GET'])
def health_check():
    """Check if AI service is running"""
    return jsonify({
        "status": "success",
        "message": "AI Recommendation Service is running",
        "movies_loaded": len(df),
        "basic_genres": BASIC_GENRES
    }), 200


@app.route('/', methods=['GET'])
def home():
    """API documentation"""
    return jsonify({
        "message": "Netflix AI Recommendation API",
        "version": "2.0",
        "endpoints": {
            "GET /api/ai/health": "Health check",
            "GET /api/ai/info": "Get available genres, actors, moods, etc.",
            "POST /api/ai/recommend": "Get AI recommendations (see docs)",
            "GET /api/ai/quick-recommend?genres=Action,Comedy&mood=exciting&limit=5": "Quick recommendations with query params"
        },
        "example_request": {
            "url": "/api/ai/recommend",
            "method": "POST",
            "body": {
                "favorite_genres": ["Action", "Thriller"],
                "favorite_actors": ["Tom Cruise"],
                "mood": "exciting",
                "year_preference": "recent",
                "language": "English",
                "num_recommendations": 10
            }
        }
    }), 200


# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == '__main__':
    print("\n" + "="*70)
    print("🤖 AI-POWERED MOVIE RECOMMENDATION API")
    print("="*70)
    print(f"\n✅ Loaded {len(df)} movies with {len(BASIC_GENRES)} basic genres")
    print(f"📍 Server starting on http://localhost:5001")
    print("📖 API docs at http://localhost:5001\n")
    print("🎬 Basic Genres:", ", ".join(BASIC_GENRES))
    print("\n" + "="*70 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5001)