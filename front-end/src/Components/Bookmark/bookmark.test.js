import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Bookmark from './bookmark';
import fetchBookmarks from '../../utils/fetchBookmarks';

jest.mock('../../firebase-config', () => ({
  auth: {
    currentUser: {
      uid: 'test-uid',
      getIdToken: jest.fn().mockResolvedValue('test-token')
    }
  }
}));

jest.mock('../../utils/fetchBookmarks');

global.fetch = jest.fn();

describe('Bookmark Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders bookmark page', () => {
    fetchBookmarks.mockResolvedValue([]);
    render(<BrowserRouter><Bookmark /></BrowserRouter>);
    expect(screen.getByText('Movie Recommendation System')).toBeInTheDocument();
  });

  test('loads and displays bookmarks', async () => {
    const mockBookmarks = [
      {
        bookmarkId: 'bm1',
        title: 'Inception',
        year: 2010,
        genres: ['Sci-Fi', 'Thriller'],
        rating: 8.8,
        votes: 2000000,
        description: 'A mind-bending thriller'
      }
    ];

    fetchBookmarks.mockResolvedValue(mockBookmarks);

    render(<BrowserRouter><Bookmark /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
      expect(screen.getByText('2010')).toBeInTheDocument();
    });
  });

  test('handles fetch error gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    fetchBookmarks.mockRejectedValue(new Error('Network error'));

    render(<BrowserRouter><Bookmark /></BrowserRouter>);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Error fetching bookmarks:',
        expect.any(Error)
      );
    });

    consoleError.mockRestore();
  });

  test('removes bookmark successfully', async () => {
    const mockBookmarks = [
      {
        bookmarkId: 'bm1',
        title: 'Inception',
        year: 2010,
        genres: ['Sci-Fi'],
        rating: 8.8,
        votes: 2000000
      }
    ];

    fetchBookmarks.mockResolvedValue(mockBookmarks);
    global.fetch.mockResolvedValue({ status: 204 });

    render(<BrowserRouter><Bookmark /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });

    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/bookmarks/bm1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  test('handles remove bookmark error', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockBookmarks = [
      { bookmarkId: 'bm1', title: 'Inception', year: 2010, genres: ['Sci-Fi'], rating: 8.8, votes: 2000000 }
    ];

    fetchBookmarks.mockResolvedValue(mockBookmarks);
    global.fetch.mockResolvedValue({ status: 500 });

    render(<BrowserRouter><Bookmark /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Remove'));

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Failed to delete bookmark', 500);
    });

    consoleError.mockRestore();
  });

  test('displays loading state initially', () => {
    fetchBookmarks.mockImplementation(() => new Promise(() => {}));
    render(<BrowserRouter><Bookmark /></BrowserRouter>);
    expect(screen.getByText('Loading bookmarks...')).toBeInTheDocument();
  });

  test('handles delete bookmark network error', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockBookmarks = [
      { bookmarkId: 'bm1', title: 'Test Movie', year: 2020, genres: ['Action'], rating: 7.0, votes: 1000 }
    ];

    fetchBookmarks.mockResolvedValue(mockBookmarks);
    global.fetch.mockRejectedValue(new Error('Network error'));

    render(<BrowserRouter><Bookmark /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Remove'));

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Error deleting bookmark:', expect.any(Error));
    });

    consoleError.mockRestore();
  });

  test('adds bookmark successfully', async () => {
    fetchBookmarks.mockResolvedValue([]);
    
    const newBookmark = {
      bookmarkId: 'bm2',
      title: 'New Movie',
      year: 2021,
      genres: ['Comedy'],
      rating: 7.5,
      votes: 5000
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => newBookmark
    });

    render(<BrowserRouter><Bookmark /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('Movie Recommendation System')).toBeInTheDocument();
    });
  });

  test('handles add bookmark error - non-ok response', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    fetchBookmarks.mockResolvedValue([]);
    
    global.fetch.mockResolvedValue({
      ok: false,
      status: 400
    });

    render(<BrowserRouter><Bookmark /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('Movie Recommendation System')).toBeInTheDocument();
    });

    consoleError.mockRestore();
  });

  test('handles add bookmark network error', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    fetchBookmarks.mockResolvedValue([]);
    
    global.fetch.mockRejectedValue(new Error('Network error'));

    render(<BrowserRouter><Bookmark /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('Movie Recommendation System')).toBeInTheDocument();
    });

    consoleError.mockRestore();
  });
});
