import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LogIn from './Login';
import { signInWithEmailAndPassword } from 'firebase/auth';

jest.mock('firebase/auth');
jest.mock('../../firebase-config', () => ({
  auth: {}
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

global.fetch = jest.fn();

describe('LogIn Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    render(<BrowserRouter><LogIn /></BrowserRouter>);
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  test('renders links to signup and reset password', () => {
    render(<BrowserRouter><LogIn /></BrowserRouter>);
    expect(screen.getByText(/Sign up/i)).toBeInTheDocument();
    expect(screen.getByText(/Reset Password/i)).toBeInTheDocument();
  });

  test('successful login flow', async () => {
    const mockUser = {
      uid: 'test-uid',
      getIdToken: jest.fn().mockResolvedValue('test-token')
    };

    signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    
    global.fetch
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ username: 'testuser' }) });

    render(<BrowserRouter><LogIn /></BrowserRouter>);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalled();
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/questionnaire');
  });

  test('handles login error', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    signInWithEmailAndPassword.mockRejectedValue(new Error('Invalid credentials'));

    render(<BrowserRouter><LogIn /></BrowserRouter>);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'wrong@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrong' }
    });

    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Invalid credentials');
    });

    alertMock.mockRestore();
  });

  test('handles profile fetch error', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const mockUser = {
      uid: 'test-uid',
      getIdToken: jest.fn().mockResolvedValue('test-token')
    };

    signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    global.fetch
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false });

    render(<BrowserRouter><LogIn /></BrowserRouter>);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Could not load user profile');
    });

    alertMock.mockRestore();
  });
});
