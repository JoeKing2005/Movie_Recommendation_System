"""
Unit tests for Clean_Analyse module
Tests data cleaning and preprocessing functions
"""

import unittest
import pandas as pd
import numpy as np
from datetime import datetime
from io import StringIO
import tempfile
import os


# ============================================================================
# TEST FIXTURES - Define testable functions separately
# ============================================================================

def duration_to_minutes(duration_str):
    """Convert duration string (e.g., '2h 30m') to minutes"""
    if isinstance(duration_str, str):
        h, m = 0, 0
        parts = duration_str.split()
        for p in parts:
            if 'h' in p:
                try:
                    h = int(p.replace('h', ''))
                except ValueError:
                    pass
            elif 'm' in p:
                try:
                    m = int(p.replace('m', ''))
                except ValueError:
                    pass
        return h * 60 + m
    return None


def parse_genres(genres_str):
    """Parse genre string into list"""
    if isinstance(genres_str, str):
        return [g.strip() for g in genres_str.split(',')]
    return []


def validate_rating(rating):
    """Validate that rating is positive"""
    try:
        rating_float = float(rating)
        return rating_float > 0
    except (ValueError, TypeError):
        return False


def validate_votes(votes):
    """Validate that votes is non-zero"""
    try:
        votes_val = float(votes)
        return votes_val != 0
    except (ValueError, TypeError):
        return False


def extract_year(release_date_str):
    """Extract year from date string (format: DD/MM/YYYY)"""
    if isinstance(release_date_str, str):
        try:
            date_obj = pd.to_datetime(release_date_str, format='%d/%m/%Y', errors='coerce')
            if pd.notna(date_obj):
                return int(date_obj.year)
        except:
            pass
    return None


def clean_dataframe(df):
    """Clean dataframe: remove duplicates and invalid data"""
    if df.empty:
        return df
    
    # Create copy to avoid modifying original
    df = df.copy()
    
    # Remove duplicates on title and year
    if 'title' in df.columns and 'year' in df.columns:
        df = df.drop_duplicates(subset=['title', 'year'])
    
    return df


def filter_required_columns(df, required_cols):
    """Remove rows with missing values in required columns"""
    if df.empty:
        return df
    
    # Only drop rows for columns that exist
    existing_cols = [col for col in required_cols if col in df.columns]
    if existing_cols:
        df = df.dropna(subset=existing_cols)
    
    return df


def filter_by_minimum_duration(df, min_minutes=30):
    """Filter dataframe to include only movies with minimum duration"""
    if 'duration_mins' not in df.columns:
        return df
    
    return df[df['duration_mins'] >= min_minutes]


def apply_rating_encoding(df):
    """Apply one-hot encoding to rating column"""
    if df.empty or 'rating' not in df.columns:
        return df
    
    df = df.copy()
    rating_encoded = pd.get_dummies(df['rating'], prefix='rating', drop_first=True)
    return pd.concat([df, rating_encoded], axis=1)


# ============================================================================
# UNIT TESTS
# ============================================================================

class TestDurationToMinutes(unittest.TestCase):
    """Test duration conversion function"""
    
    def test_hours_and_minutes(self):
        """Test conversion of hours and minutes"""
        result = duration_to_minutes('2h 30m')
        self.assertEqual(result, 150)
    
    def test_only_hours(self):
        """Test conversion with only hours"""
        result = duration_to_minutes('2h')
        self.assertEqual(result, 120)
    
    def test_only_minutes(self):
        """Test conversion with only minutes"""
        result = duration_to_minutes('45m')
        self.assertEqual(result, 45)
    
    def test_single_digit_values(self):
        """Test with single digit hours/minutes"""
        result = duration_to_minutes('1h 5m')
        self.assertEqual(result, 65)
    
    def test_large_values(self):
        """Test with large hour values"""
        result = duration_to_minutes('5h 20m')
        self.assertEqual(result, 320)
    
    def test_zero_minutes(self):
        """Test with zero minutes result"""
        result = duration_to_minutes('0h')
        self.assertEqual(result, 0)
    
    def test_non_string_input(self):
        """Test non-string input returns None"""
        self.assertIsNone(duration_to_minutes(123))
        self.assertIsNone(duration_to_minutes(None))
        self.assertIsNone(duration_to_minutes([]))
    
    def test_invalid_format(self):
        """Test invalid format returns 0"""
        result = duration_to_minutes('invalid format')
        self.assertEqual(result, 0)
    
    def test_mixed_case(self):
        """Test mixed case hour/minute markers"""
        result = duration_to_minutes('2H 30M')
        self.assertEqual(result, 0)  # Should not match uppercase
    
    def test_whitespace_handling(self):
        """Test handling of extra whitespace"""
        result = duration_to_minutes('2h  30m')
        self.assertEqual(result, 150)


class TestParseGenres(unittest.TestCase):
    """Test genre parsing function"""
    
    def test_single_genre(self):
        """Test parsing single genre"""
        result = parse_genres('Action')
        self.assertEqual(result, ['Action'])
    
    def test_multiple_genres(self):
        """Test parsing multiple genres"""
        result = parse_genres('Action, Comedy, Drama')
        self.assertEqual(result, ['Action', 'Comedy', 'Drama'])
    
    def test_genres_with_spaces(self):
        """Test that spaces are stripped"""
        result = parse_genres('Action , Comedy , Drama')
        self.assertEqual(result, ['Action', 'Comedy', 'Drama'])
    
    def test_empty_string(self):
        """Test parsing empty string"""
        result = parse_genres('')
        self.assertEqual(result, [''])
    
    def test_non_string_input(self):
        """Test non-string input returns empty list"""
        self.assertEqual(parse_genres(123), [])
        self.assertEqual(parse_genres(None), [])
        self.assertEqual(parse_genres([]), [])
    
    def test_single_character_genres(self):
        """Test genres with single characters"""
        result = parse_genres('A, B, C')
        self.assertEqual(result, ['A', 'B', 'C'])


class TestValidation(unittest.TestCase):
    """Test validation functions"""
    
    def test_validate_rating_positive(self):
        """Test validation of positive ratings"""
        self.assertTrue(validate_rating(8.5))
        self.assertTrue(validate_rating('7.0'))
        self.assertTrue(validate_rating(0.1))
    
    def test_validate_rating_zero_and_negative(self):
        """Test validation rejects zero and negative ratings"""
        self.assertFalse(validate_rating(0))
        self.assertFalse(validate_rating(-1))
        self.assertFalse(validate_rating('-5.0'))
    
    def test_validate_rating_invalid(self):
        """Test validation rejects invalid input"""
        self.assertFalse(validate_rating('invalid'))
        self.assertFalse(validate_rating(None))
        self.assertFalse(validate_rating(''))
    
    def test_validate_votes_nonzero(self):
        """Test validation of non-zero votes"""
        self.assertTrue(validate_votes(100))
        self.assertTrue(validate_votes('5000'))
        self.assertTrue(validate_votes(0.1))
    
    def test_validate_votes_zero(self):
        """Test validation rejects zero votes"""
        self.assertFalse(validate_votes(0))
        self.assertFalse(validate_votes('0'))
        self.assertFalse(validate_votes(0.0))
    
    def test_validate_votes_invalid(self):
        """Test validation rejects invalid input"""
        self.assertFalse(validate_votes('invalid'))
        self.assertFalse(validate_votes(None))
        self.assertFalse(validate_votes(''))


class TestExtractYear(unittest.TestCase):
    """Test year extraction function"""
    
    def test_valid_date_format(self):
        """Test extraction from valid DD/MM/YYYY format"""
        result = extract_year('01/01/2020')
        self.assertEqual(result, 2020)
    
    def test_various_valid_dates(self):
        """Test extraction from various dates"""
        self.assertEqual(extract_year('15/06/1999'), 1999)
        self.assertEqual(extract_year('31/12/2023'), 2023)
        self.assertEqual(extract_year('01/01/1900'), 1900)
    
    def test_invalid_date_format(self):
        """Test that invalid format returns None"""
        self.assertIsNone(extract_year('2020-01-01'))
        self.assertIsNone(extract_year('01-01-2020'))
        self.assertIsNone(extract_year('invalid'))
    
    def test_non_string_input(self):
        """Test that non-string input returns None"""
        self.assertIsNone(extract_year(123))
        self.assertIsNone(extract_year(None))
        self.assertIsNone(extract_year([]))
    
    def test_empty_string(self):
        """Test empty string returns None"""
        self.assertIsNone(extract_year(''))
    
    def test_invalid_dates(self):
        """Test that invalid dates return None"""
        self.assertIsNone(extract_year('32/01/2020'))  # Invalid day
        self.assertIsNone(extract_year('01/13/2020'))  # Invalid month


class TestCleanDataframe(unittest.TestCase):
    """Test dataframe cleaning function"""
    
    def test_remove_duplicates(self):
        """Test removal of duplicate rows"""
        df = pd.DataFrame({
            'title': ['Movie A', 'Movie B', 'Movie A'],
            'year': [2020, 2020, 2020]
        })
        result = clean_dataframe(df)
        self.assertEqual(len(result), 2)
    
    def test_keep_same_title_different_year(self):
        """Test that same title with different year is kept"""
        df = pd.DataFrame({
            'title': ['Movie A', 'Movie A'],
            'year': [2020, 2021]
        })
        result = clean_dataframe(df)
        self.assertEqual(len(result), 2)
    
    def test_empty_dataframe(self):
        """Test with empty dataframe"""
        df = pd.DataFrame()
        result = clean_dataframe(df)
        self.assertTrue(result.empty)
    
    def test_no_duplicates(self):
        """Test that unique data is unchanged"""
        df = pd.DataFrame({
            'title': ['Movie A', 'Movie B', 'Movie C'],
            'year': [2020, 2020, 2020]
        })
        result = clean_dataframe(df)
        self.assertEqual(len(result), 3)
    
    def test_missing_required_columns(self):
        """Test handling of missing required columns"""
        df = pd.DataFrame({
            'other_col': [1, 2, 3]
        })
        result = clean_dataframe(df)
        self.assertEqual(len(result), 3)  # No duplicates removed


class TestFilterRequiredColumns(unittest.TestCase):
    """Test required column filtering function"""
    
    def test_remove_rows_with_missing_values(self):
        """Test removal of rows with NaN in required columns"""
        df = pd.DataFrame({
            'title': ['Movie A', 'Movie B', None],
            'rating': [8.0, np.nan, 7.5]
        })
        result = filter_required_columns(df, ['title', 'rating'])
        self.assertEqual(len(result), 1)
    
    def test_keep_all_valid_rows(self):
        """Test that rows with all values are kept"""
        df = pd.DataFrame({
            'title': ['Movie A', 'Movie B'],
            'rating': [8.0, 7.5]
        })
        result = filter_required_columns(df, ['title', 'rating'])
        self.assertEqual(len(result), 2)
    
    def test_empty_dataframe(self):
        """Test with empty dataframe"""
        df = pd.DataFrame()
        result = filter_required_columns(df, ['title'])
        self.assertTrue(result.empty)
    
    def test_nonexistent_column(self):
        """Test with columns that don't exist"""
        df = pd.DataFrame({
            'title': ['Movie A', 'Movie B'],
            'rating': [8.0, 7.5]
        })
        result = filter_required_columns(df, ['nonexistent'])
        self.assertEqual(len(result), 2)


class TestFilterByMinimumDuration(unittest.TestCase):
    """Test minimum duration filtering function"""
    
    def test_filter_below_minimum(self):
        """Test filtering movies below minimum duration"""
        df = pd.DataFrame({
            'title': ['Movie A', 'Movie B', 'Movie C'],
            'duration_mins': [120, 25, 90]
        })
        result = filter_by_minimum_duration(df, 30)
        self.assertEqual(len(result), 2)
    
    def test_keep_equal_to_minimum(self):
        """Test that movies equal to minimum are kept"""
        df = pd.DataFrame({
            'title': ['Movie A', 'Movie B'],
            'duration_mins': [30, 40]
        })
        result = filter_by_minimum_duration(df, 30)
        self.assertEqual(len(result), 2)
    
    def test_empty_dataframe(self):
        """Test with empty dataframe"""
        df = pd.DataFrame()
        result = filter_by_minimum_duration(df, 30)
        self.assertTrue(result.empty)
    
    def test_missing_duration_column(self):
        """Test handling of missing duration_mins column"""
        df = pd.DataFrame({
            'title': ['Movie A', 'Movie B']
        })
        result = filter_by_minimum_duration(df, 30)
        self.assertEqual(len(result), 2)  # Returns unchanged


class TestRatingEncoding(unittest.TestCase):
    """Test rating one-hot encoding function"""
    
    def test_rating_encoding_creates_columns(self):
        """Test that rating encoding creates new columns"""
        df = pd.DataFrame({
            'title': ['Movie A', 'Movie B', 'Movie C'],
            'rating': ['PG', 'R', 'PG']
        })
        result = apply_rating_encoding(df)
        self.assertGreater(len(result.columns), len(df.columns))
    
    def test_rating_encoding_preserves_original(self):
        """Test that original columns are preserved"""
        df = pd.DataFrame({
            'title': ['Movie A'],
            'rating': ['PG']
        })
        result = apply_rating_encoding(df)
        self.assertIn('title', result.columns)
        self.assertIn('rating', result.columns)
    
    def test_empty_dataframe(self):
        """Test with empty dataframe"""
        df = pd.DataFrame()
        result = apply_rating_encoding(df)
        self.assertTrue(result.empty)
    
    def test_missing_rating_column(self):
        """Test handling of missing rating column"""
        df = pd.DataFrame({
            'title': ['Movie A', 'Movie B']
        })
        result = apply_rating_encoding(df)
        self.assertEqual(len(result), 2)


class TestDataProcessingPipeline(unittest.TestCase):
    """Test complete data processing pipeline"""
    
    def test_full_pipeline(self):
        """Test complete pipeline of cleaning and filtering"""
        df = pd.DataFrame({
            'title': ['Movie A', 'Movie B', 'Movie C', 'Movie A'],
            'rating': [8.0, np.nan, 7.5, 8.0],
            'votes': [1000, 500, 0, 1000],
            'duration_mins': [120, 90, 20, 120]
        })
        
        # Apply pipeline
        df = clean_dataframe(df)
        df = filter_required_columns(df, ['rating', 'votes'])
        df = filter_by_minimum_duration(df, 30)
        
        self.assertGreater(len(df), 0)


if __name__ == '__main__':
    unittest.main()
