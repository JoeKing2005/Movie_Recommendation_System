"""
AI-Powered Movie Recommendation Backend - FIXED VERSION
Fixed: Language filtering and actor matching
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
        if genre in BASIC_GENRES:
            normalized.add(genre)
        elif genre in GENRE_MAPPING:
            normalized.add(GENRE_MAPPING[genre])
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
    df['basic_genres'] = df['genres'].apply(normalize_genres)
    
    # Fix year
    df['year'] = pd.to_numeric(df['year'], errors='coerce').fillna(2020).astype(int)
    
    # Fix rating
    if 'rating' in df.columns:
        df['rating'] = pd.to_numeric(df['rating'], errors='coerce').fillna(7.0)
    else:
        df['rating'] = 7.0
    
    # FIX 1: Parse stars column (not cast) and create lowercase version for matching
    if 'stars' in df.columns:
        def parse_stars(x):
            if pd.isna(x):
                return []
            if isinstance(x, list):
                return x
            if isinstance(x, str):
                # Handle list strings like "['Actor1', 'Actor2']"
                if x.startswith('['):
                    try:
                        stars_list = eval(x)
                        return [s.strip() for s in stars_list]
                    except:
                        return []
                else:
                    # Handle comma-separated strings
                    return [s.strip() for s in x.split(',')]
            return []
        
        df['actors'] = df['stars'].apply(parse_stars)
        # Create lowercase version for case-insensitive matching
        df['actors_lower'] = df['actors'].apply(lambda x: [a.lower() for a in x])
    else:
        df['actors'] = [[] for _ in range(len(df))]
        df['actors_lower'] = [[] for _ in range(len(df))]
    
    # FIX 2: Parse languages column properly and create lowercase version
    if 'languages' in df.columns:
        def parse_languages(x):
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
                    return [lang.strip() for lang in x.split(',')]
            return []
        
        df['language_list'] = df['languages'].apply(parse_languages)
        # Create lowercase version for case-insensitive matching
        df['language_list_lower'] = df['language_list'].apply(lambda x: [l.lower() for l in x])
    elif 'language' in df.columns:
        df['language_list'] = df['language'].apply(lambda x: [x] if pd.notna(x) else ['English'])
        df['language_list_lower'] = df['language_list'].apply(lambda x: [l.lower() for l in x])
    else:
        df['language_list'] = [['English'] for _ in range(len(df))]
        df['language_list_lower'] = [['english'] for _ in range(len(df))]
    
    print(" Dataset prepared with basic genres")
    # print(f" Sample languages: {df['language_list'].head()}")
    # print(f" Sample actors: {df['actors'].head()}")
    
except Exception as e:
    print(f" Error loading dataset: {e}")
    df = pd.DataFrame()

# ============================================================================
# AI RECOMMENDATION ENGINE
# ============================================================================

class AIRecommender:
    """AI-powered recommendation engine"""
    
    def __init__(self, dataframe):
        self.df = dataframe
    
    def get_recommendations(self, user_preferences: Dict, top_n=10) -> List[Dict]:
        """Generate AI-powered recommendations based on user preferences"""
        
        if self.df.empty:
            return []
        
        # Start with full dataset
        filtered = self.df.copy()
        
        # FIX 3: Language filtering - check FIRST language only (original language)
        if 'language' in user_preferences and user_preferences['language'] and user_preferences['language'].lower() != 'any':
            user_lang = user_preferences['language'].lower().strip()
            initial_count = len(filtered)
            
            # Only check the FIRST language in the list (original language of the movie)
            # This prevents showing dubbed movies
            filtered = filtered[filtered['language_list_lower'].apply(
                lambda langs: len(langs) > 0 and langs[0].strip() == user_lang
            )]
            
            # print(f"🌍 Language filter: '{user_preferences['language']}' (original language only)")
            # print(f"🌍 Before filter: {initial_count} movies")
            # print(f"🌍 After filter: {len(filtered)} movies")
            
            # If language filter resulted in too few movies, relax to include if it's in top 2 languages
            if len(filtered) < 20:
                print("⚠️ Too few results, relaxing to top 2 languages...")
                filtered = self.df.copy()
                filtered = filtered[filtered['language_list_lower'].apply(
                    lambda langs: len(langs) > 0 and user_lang in [l.strip() for l in langs[:2]]
                )]
                
                # Apply year filter again if needed since we reset
                year_pref = user_preferences.get('year_preference', 'any')
                current_year = 2024
                if year_pref == 'recent':
                    filtered = filtered[filtered['year'] >= current_year - 10]
                elif year_pref == 'classic':
                    filtered = filtered[filtered['year'] < 2000]
        
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
        
        # FIX 4: Improved actor scoring (strict matching - must match full name)
        favorite_actors = user_preferences.get('favorite_actors', [])
        if favorite_actors:
            # Convert favorite actors to lowercase for matching
            favorite_actors_lower = [a.lower().strip() for a in favorite_actors]
            
            actor_scores = []
            matching_movies = 0
            for _, row in filtered.iterrows():
                movie_actors_lower = row['actors_lower']
                score = 0
                
                # Check if any favorite actor matches exactly (STRICT - must be exact match)
                for fav_actor in favorite_actors_lower:
                    for movie_actor in movie_actors_lower:
                        # STRICT: Only exact match, no partial matching
                        # This prevents "Tom Holland" from matching "Tom Hollander"
                        if fav_actor == movie_actor:
                            score += 10  # Strong boost for actor match
                            matching_movies += 1
                            break
                
                actor_scores.append(score)
            
            filtered['actor_score'] = actor_scores
            print(f" Actor scoring complete. Found {matching_movies} movies with matching actors")
            print(f" Searching for: {favorite_actors}")
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
        # Give much higher weight to actor matches
        filtered['ai_score'] = (
            filtered['genre_score'] * 3.0 +
            filtered['actor_score'] * 5.0 +  # Increased from 2.0 to 5.0
            filtered['mood_score'] * 1.5 +
            filtered['rating'] * 0.5 +
            np.log1p(filtered['votes']) * 0.3
        )
        
        # Only add randomness to movies WITHOUT actor matches
        randomness = []
        for _, row in filtered.iterrows():
            if row['actor_score'] > 0:
                randomness.append(0)  # No randomness for actor matches
            else:
                randomness.append(np.random.uniform(-0.5, 0.5))
        
        filtered['ai_score'] += randomness
        
        # Get top recommendations
        recommendations = filtered.nlargest(top_n, 'ai_score')
        
        # Calculate max possible score for normalization
        max_possible_score = (
            len(user_preferences.get('favorite_genres', [])) * 3.0 * 3.0 +  # genre_score * weight
            len(user_preferences.get('favorite_actors', [])) * 10.0 * 5.0 +  # actor_score * weight
            2.0 * 1.5 +  # max mood_score * weight
            10.0 * 0.5 +  # max rating * weight
            np.log1p(1000000) * 0.3  # high votes score
        )
        
        # Ensure max_possible_score is at least 20 to avoid division issues
        if max_possible_score < 20:
            max_possible_score = 20
        
        # Format output
        results = []
        for _, movie in recommendations.iterrows():
            # Calculate normalized confidence percentage (0-100%)
            normalized_confidence = min(100, (movie['ai_score'] / max_possible_score) * 100)
            
            results.append({
                'title': movie['title'],
                'year': int(movie['year']),
                'genres': movie['basic_genres'],
                'rating': float(movie['rating']),
                'votes': int(movie['votes']),
                'description': movie.get('description', 'No description available'),
                'actors': movie['actors'][:5],  # Include top 5 actors
                'languages': movie['language_list'],  # Include languages
                'ai_confidence': round(normalized_confidence / 100, 2),  # Store as 0-1 for frontend
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
        
        # Actor match (STRICT - exact match only)
        fav_actors = preferences.get('favorite_actors', [])
        if fav_actors:
            fav_actors_lower = [a.lower().strip() for a in fav_actors]
            movie_actors_lower = movie['actors_lower']
            
            # Find exactly matching actors (original case)
            matching_actors = []
            for i, actor_lower in enumerate(movie_actors_lower):
                if actor_lower in fav_actors_lower:  # Exact match only
                    matching_actors.append(movie['actors'][i])
            
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
    # Get unique languages from the dataset
    all_languages = set()
    for lang_list in df['language_list']:
        all_languages.update(lang_list)
    
    # Get popular actors
    all_actors = []
    for actor_list in df['actors']:
        all_actors.extend(actor_list)
    
    from collections import Counter
    actor_counts = Counter(all_actors)
    popular_actors = [actor for actor, count in actor_counts.most_common(100)]
    
    return jsonify({
        "status": "success",
        "available_genres": BASIC_GENRES,
        "available_actors": popular_actors,
        "year_preferences": ["recent", "classic", "any"],
        "moods": ["exciting", "funny", "emotional", "scary", "any"],
        "languages": sorted(list(all_languages))
    })


@app.route('/api/ai/recommend', methods=['POST'])
def ai_recommend():
    """POST endpoint for AI recommendations"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "status": "error",
                "message": "No data provided"
            }), 400
        
        preferences = {
            "favorite_genres": data.get('favorite_genres', []),
            "favorite_actors": data.get('favorite_actors', []),
            "mood": data.get('mood', 'any'),
            "year_preference": data.get('year_preference', 'any'),
            "language": data.get('language', 'English')
        }
        
        num_recommendations = data.get('num_recommendations', 10)
        
        print(f"🎯 Received request: {preferences}")
        
        # Get AI recommendations
        recommendations = ai_recommender.get_recommendations(preferences, top_n=num_recommendations)
        
        print(f"✅ Returning {len(recommendations)} recommendations")
        
        return jsonify({
            "status": "success",
            "preferences": preferences,
            "recommendations": recommendations,
            "count": len(recommendations)
        }), 200
        
    except Exception as e:
        print(f" Error: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/ai/quick-recommend', methods=['GET'])
def quick_recommend():
    """Quick recommendation with query parameters"""
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
        "version": "2.1",
        "endpoints": {
            "GET /api/ai/health": "Health check",
            "GET /api/ai/info": "Get available genres, actors, moods, etc.",
            "POST /api/ai/recommend": "Get AI recommendations",
            "GET /api/ai/quick-recommend": "Quick recommendations with query params"
        },
        "example_request": {
            "url": "/api/ai/recommend",
            "method": "POST",
            "body": {
                "favorite_genres": ["Action", "Thriller"],
                "favorite_actors": ["Tom Holland"],
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
    print("="*70)
    print(f"\n Loaded {len(df)} movies with {len(BASIC_GENRES)} basic genres")
    print(f"🔧 Server starting on http://localhost:5001")
    print(" API docs at http://localhost:5001\n")
    print("\n" + "="*70 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5001)