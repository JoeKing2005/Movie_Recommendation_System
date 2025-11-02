import pandas as pd
from sklearn.preprocessing import MultiLabelBinarizer

# load dataset
pf = pd.read_csv("netflix_dataset.csv")
print("Initial shape:", pf.shape)

# convert and extract year
pf['release_date'] = pd.to_datetime(pf['release_date'], format='%d/%m/%Y', errors='coerce')
pf['year'] = pf['release_date'].dt.year
pf = pf.dropna(subset=['year'])
pf['year'] = pf['year'].astype(int)

# remove duplicates
pf.drop_duplicates(subset=['title', 'year'], inplace=True)

# handle missing / invalid data
essential_cols = ['title', 'genres', 'rating', 'votes', 'description']
pf = pf.dropna(subset=essential_cols)
pf = pf[(pf['rating'] > 0) & (pf['votes'] != 0)]

# Convert duration to minutes
def duration_to_minutes(duration_str):
    if isinstance(duration_str, str):
        h, m = 0, 0
        parts = duration_str.split()
        for p in parts:
            if 'h' in p:
                h = int(p.replace('h', ''))
            elif 'm' in p:
                m = int(p.replace('m', ''))
        return h * 60 + m
    return None

pf['duration_mins'] = pf['duration'].apply(duration_to_minutes)
pf = pf[pf['duration_mins'] >= 30]

# reduce dataset size
pf = pf.sort_values(by='votes', ascending=False).head(25000)


# Split multiple genres into lists
pf['genres'] = pf['genres'].apply(lambda x: [g.strip() for g in x.split(',')] if isinstance(x, str) else [])

# initialize
mlb = MultiLabelBinarizer()
genre_encoded = pd.DataFrame(mlb.fit_transform(pf['genres']), columns=mlb.classes_)

# prefix for clarity
genre_encoded = genre_encoded.add_prefix('genre_')

# Concatenate back with original dataframe
pf = pd.concat([pf, genre_encoded], axis=1)

# one-hot encoding for rating
pf = pd.get_dummies(pf, columns=['rating'], drop_first=True)

# Reset index and save cleaned + encoded dataset
pf.reset_index(drop=True, inplace=True)
pf.to_csv("cleaned_data_encoded.csv", index=False)

print("Cleaned and Encoded dataset shape:", pf.shape)
print("Cleaned data :  saved to cleaned_data_encoded.csv")

print("Encoded genre columns:", list(genre_encoded.columns))
