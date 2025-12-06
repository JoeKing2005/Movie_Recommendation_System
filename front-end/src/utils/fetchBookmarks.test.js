import fetchBookmarks from './fetchBookmarks';
import { auth } from '../firebase-config';

jest.mock('../firebase-config', () => ({
  auth: {
    currentUser: null
  }
}));

global.fetch = jest.fn();

describe('fetchBookmarks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns empty array when uid is not provided', async () => {
    const result = await fetchBookmarks(null);
    expect(result).toEqual([]);
  });

  test('returns empty array when user is not authenticated', async () => {
    auth.currentUser = null;
    const result = await fetchBookmarks('test-uid');
    expect(result).toEqual([]);
  });

  test('fetches bookmarks successfully', async () => {
    const mockBookmarks = [
      { bookmarkId: 'bm1', title: 'Test Movie 1' },
      { bookmarkId: 'bm2', title: 'Test Movie 2' }
    ];

    auth.currentUser = {
      getIdToken: jest.fn().mockResolvedValue('test-token')
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockBookmarks
    });

    const result = await fetchBookmarks('test-uid');

    expect(result).toEqual(mockBookmarks);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/web/users/test-uid/bookmarks',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token'
        })
      })
    );
  });

  test('returns empty array when fetch fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    auth.currentUser = {
      getIdToken: jest.fn().mockResolvedValue('test-token')
    };

    global.fetch.mockResolvedValue({
      ok: false,
      status: 404
    });

    const result = await fetchBookmarks('test-uid');

    expect(result).toEqual([]);
    expect(consoleError).toHaveBeenCalledWith('Failed to fetch bookmarks', 404);
    
    consoleError.mockRestore();
  });

  test('handles network errors', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    auth.currentUser = {
      getIdToken: jest.fn().mockResolvedValue('test-token')
    };

    global.fetch.mockRejectedValue(new Error('Network error'));

    const result = await fetchBookmarks('test-uid');

    expect(result).toEqual([]);
    expect(consoleError).toHaveBeenCalledWith('Bookmark fetch error:', expect.any(Error));
    
    consoleError.mockRestore();
  });

  test('handles token retrieval error', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    auth.currentUser = {
      getIdToken: jest.fn().mockRejectedValue(new Error('Token error'))
    };

    const result = await fetchBookmarks('test-uid');

    expect(result).toEqual([]);
    expect(consoleError).toHaveBeenCalledWith('Bookmark fetch error:', expect.any(Error));
    
    consoleError.mockRestore();
  });
});
