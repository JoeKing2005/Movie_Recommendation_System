import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignUp from './SignUp';
import { createUserWithEmailAndPassword } from 'firebase/auth';

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

describe('SignUp Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders signup form', () => {
    render(<BrowserRouter><SignUp /></BrowserRouter>);
    expect(screen.getByText('Create an Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  test('renders link to signin', () => {
    render(<BrowserRouter><SignUp /></BrowserRouter>);
    expect(screen.getByText(/Sign in/i)).toBeInTheDocument();
  });

  test('successful signup flow', async () => {
    const mockUser = {
      uid: 'new-uid',
      getIdToken: jest.fn().mockResolvedValue('new-token')
    };

    createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    global.fetch
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ username: 'newuser' }) });

    render(<BrowserRouter><SignUp /></BrowserRouter>);

    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'newuser' }
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'new@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByText('Sign Up'));

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalled();
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/questionnaire');
  });

  test('handles signup error', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    createUserWithEmailAndPassword.mockRejectedValue(new Error('Email already in use'));

    render(<BrowserRouter><SignUp /></BrowserRouter>);

    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'existing@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByText('Sign Up'));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Email already in use');
    });

    alertMock.mockRestore();
  });

  test('handles backend profile creation error', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const mockUser = {
      uid: 'new-uid',
      getIdToken: jest.fn().mockResolvedValue('new-token')
    };

    createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    global.fetch
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false });

    render(<BrowserRouter><SignUp /></BrowserRouter>);

    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'newuser' }
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'new@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByText('Sign Up'));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Failed to create profile on backend');
    });

    alertMock.mockRestore();
  });
});
