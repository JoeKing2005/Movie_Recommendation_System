import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResetPassword from './resetPassword';
import { sendPasswordResetEmail } from 'firebase/auth';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  sendPasswordResetEmail: jest.fn()
}));

describe('ResetPassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders reset password form', () => {
    render(<BrowserRouter><ResetPassword /></BrowserRouter>);
    expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
  });

  test('renders link to signup', () => {
    render(<BrowserRouter><ResetPassword /></BrowserRouter>);
    expect(screen.getByText(/Sign up/i)).toBeInTheDocument();
  });

  test('shows error when email is empty', async () => {
    render(<BrowserRouter><ResetPassword /></BrowserRouter>);

    fireEvent.click(screen.getByText('Send Email'));

    await waitFor(() => {
      expect(screen.getByText('Please enter your email.')).toBeInTheDocument();
    });
  });

  test('successful password reset', async () => {
    sendPasswordResetEmail.mockResolvedValue();

    render(<BrowserRouter><ResetPassword /></BrowserRouter>);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'valid@example.com' }
    });

    fireEvent.click(screen.getByText('Send Email'));

    await waitFor(() => {
      expect(sendPasswordResetEmail).toHaveBeenCalled();
    });
  });

  test('sends password reset email successfully', async () => {
    sendPasswordResetEmail.mockResolvedValue();

    render(<BrowserRouter><ResetPassword /></BrowserRouter>);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });

    fireEvent.click(screen.getByText('Send Email'));

    await waitFor(() => {
      expect(screen.getByText('Email sent, Check your inbox')).toBeInTheDocument();
    });
  });

  test('handles password reset error', async () => {
    sendPasswordResetEmail.mockRejectedValue(new Error('User not found'));

    render(<BrowserRouter><ResetPassword /></BrowserRouter>);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'nonexistent@example.com' }
    });

    fireEvent.click(screen.getByText('Send Email'));

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  test('updates email input value', () => {
    render(<BrowserRouter><ResetPassword /></BrowserRouter>);
    const input = screen.getByPlaceholderText('Email');

    fireEvent.change(input, { target: { value: 'test@example.com' } });

    expect(input.value).toBe('test@example.com');
  });
});
