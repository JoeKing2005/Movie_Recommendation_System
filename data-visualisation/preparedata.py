from ast import literal_eval
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

def str_to_list(s):
    """Convert string representation of list to list"""
    if pd.isna(s):
        return []
    try:
        s = s.strip()
        l = literal_eval(s)

        if isinstance(l, list):
            return l
        else:
            return []
        
    except (ValueError):
        return []

def str_to_first_item(s):
    """Convert string representation of list to list then return first item"""
    l = str_to_list(s)
    return l[0] if l else None

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

BASIC_LANGUAGES = [
    'English',
    'French',
    'Spanish',
    'German',
    'Italian',
    'Japanese',
    'Korean',
    'Hindi'
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
        if genre in BASIC_GENRES:
            normalized.add(genre)
        elif genre in GENRE_MAPPING:
            normalized.add(GENRE_MAPPING[genre])
        # Default to Drama if unknown
        else:
            normalized.add('Drama')
    return list(normalized)

def normalize_language(lang):
    """Keep only basic languages, default to English"""
    if lang in BASIC_LANGUAGES:
        return lang
    return 'English'


def main():
    # load dataset
    data = pd.read_csv("../cleaned_data.csv")

    # encoded data
    encoded = pd.DataFrame()

    # temporary dataframe
    tmp = pd.DataFrame()

    # evaluate list strings as series
    data['genres'] = data['genres'].apply(str_to_list)
    data['genres'] = data['genres'].apply(normalize_genres)
    tmp['languages'] = data['languages'].apply(str_to_first_item)
    tmp['languages'] = tmp['languages'].apply(normalize_language)

    # cut years into int labelled bins
    bins = [1900, 2000, 2015, 2025]
    encoded['year'] = pd.cut(data['year'], bins=bins, ordered=False, labels=[0, 1, 2])

    # one-hot encoding
    encoded = pd.concat([encoded, pd.get_dummies(tmp, columns=['languages'], prefix='language', drop_first=False, dtype=int)], axis=1)

    # one-hot encode genres
    # this must be done differently since each movie can have multiple genres
    encoded_genres = list()
    for g in BASIC_GENRES:
        encoded_genres.append(f'genre_{g}')
        encoded[f'genre_{g}'] = data['genres'].apply(lambda x: 1 if g in x else 0)

    # print sample of encoded data
    print("Encoded Data Sample:")
    print(encoded.head())

    # calculate pearson coefficient matrix
    corr_matrix = encoded.corr(method='pearson').loc[encoded.drop(encoded_genres, axis=1).columns, encoded_genres]

    # print correlation matrix
    print("\nCorrelation Matrix:")
    print(corr_matrix)

    # plot heatmap and save
    plt.figure(figsize=(10, 6))
    sns.heatmap(corr_matrix, annot=True, cmap='coolwarm')
    plt.title('Correlation between genres and years/languages')
    plt.savefig('genre_correlation_heatmap.png', dpi=300, bbox_inches='tight')

if __name__ == "__main__":
    main()
    
    