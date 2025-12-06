import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Questionnaire from './questionnaire';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

let mockAuthUser = {
  uid: 'test-uid',
  getIdToken: jest.fn().mockResolvedValue('test-token')
};

const mockUnsubscribe = jest.fn();

jest.mock('../../firebase-config', () => ({
  auth: {
    get currentUser() {
      return mockAuthUser;
    },
    onAuthStateChanged: jest.fn((callback) => {
      callback(mockAuthUser);
      return mockUnsubscribe;
    })
  }
}));

global.fetch = jest.fn();

describe('Questionnaire Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthUser = {
      uid: 'test-uid',
      getIdToken: jest.fn().mockResolvedValue('test-token')
    };
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => []
    });
    const { auth } = require('../../firebase-config');
    auth.onAuthStateChanged.mockImplementation((callback) => {
      callback(mockAuthUser);
      return mockUnsubscribe;
    });
  });

  test('renders questionnaire and loads bookmarks', async () => {
    render(<BrowserRouter><Questionnaire /></BrowserRouter>);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  test('redirects to login if not authenticated', async () => {
    mockAuthUser = null;
    const { auth } = require('../../firebase-config');
    auth.onAuthStateChanged.mockImplementationOnce((callback) => {
      callback(null);
      return jest.fn();
    });

    render(<BrowserRouter><Questionnaire /></BrowserRouter>);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    mockAuthUser = {
      uid: 'test-uid',
      getIdToken: jest.fn().mockResolvedValue('test-token')
    };
  });

  test('renders genre buttons', async () => {
    render(<BrowserRouter><Questionnaire /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });

  test('toggles genre', async () => {
    render(<BrowserRouter><Questionnaire /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
    const actionButton = screen.getByText('Action');
    fireEvent.click(actionButton);
  });

  test('navigates to step 2 - actors', async () => {
    render(<BrowserRouter><Questionnaire /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Action'));
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type a name/i)).toBeInTheDocument();
    });
  });

  test('adds actor', async () => {
    render(<BrowserRouter><Questionnaire /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Action'));
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/Type a name/i);
      fireEvent.change(input, { target: { value: 'Tom Hanks' } });
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    await waitFor(() => {
      expect(screen.getByText('Tom Hanks')).toBeInTheDocument();
    });
  });

  test('removes actor', async () => {
    render(<BrowserRouter><Questionnaire /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Action'));
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/Type a name/i);
      fireEvent.change(input, { target: { value: 'Tom Hanks' } });
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    await waitFor(() => {
      expect(screen.getByText('Tom Hanks')).toBeInTheDocument();
    });
    const removeButton = screen.getByText('×');
    fireEvent.click(removeButton);
    await waitFor(() => {
      expect(screen.queryByText('Tom Hanks')).not.toBeInTheDocument();
    });
  });

  test('uses Back button', async () => {
    render(<BrowserRouter><Questionnaire /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Action'));
    fireEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.getByText('Back')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Back'));
    await waitFor(() => {
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });
});

