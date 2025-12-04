import unittest, os, contextlib
from pathlib import Path
from preparedata import str_to_list, str_to_first_item, normalize_genres, normalize_language, main as preparedata_main

img_path = Path('genre_correlation_heatmap.png')

class TestPrepareData(unittest.TestCase):

    def test_str_to_list(self):
        self.assertEqual(sorted(str_to_list("['Action', 'Comedy']")), sorted(['Action', 'Comedy']))
        self.assertEqual(str_to_list("[]"), [])
        self.assertEqual(str_to_list(None), [])

    def test_str_to_first_item(self):
        self.assertEqual(str_to_first_item("['Action', 'Comedy']"), 'Action')
        self.assertEqual(str_to_first_item("[]"), None)
        self.assertEqual(str_to_first_item(None), None)

    def test_normalize_genres(self):
        self.assertEqual(sorted(normalize_genres(['Action', 'Sci-Fi'])), sorted(['Action', 'Sci-Fi']))
        self.assertEqual(sorted(normalize_genres(['Mystery', 'Comedy'])), sorted(['Thriller', 'Comedy']))
        self.assertEqual(normalize_genres(['Test Genre']), ['Drama'])

    def test_normalize_language(self):
        self.assertEqual(normalize_language('English'), 'English')
        self.assertEqual(normalize_language('Spanish'), 'Spanish')
        self.assertEqual(normalize_language('Test Language'), 'English')

    def test_main(self):
        # suppress output from main during test
        with open(os.devnull, 'w') as f, contextlib.redirect_stdout(f):
            preparedata_main()
        self.assertTrue(img_path.exists())
        img_path.unlink()  # cleanup after test

if __name__ == '__main__':
    unittest.main()