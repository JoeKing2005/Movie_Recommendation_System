import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Landing from './Landing';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Landing Component', () => {
  test('renders header with brand and navigation', () => {
    renderWithRouter(<Landing />);
    expect(screen.getByText('Movie Recommendation System')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getAllByText('How it works')[0]).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
  });

  test('renders hero section with title and description', () => {
    renderWithRouter(<Landing />);
    expect(screen.getByText('Stop scrolling. Start watching.')).toBeInTheDocument();
    expect(screen.getByText(/Answer a quick questionnaire/i)).toBeInTheDocument();
  });

  test('renders CTA buttons', () => {
    renderWithRouter(<Landing />);
    const getStartedButtons = screen.getAllByText('Get started');
    expect(getStartedButtons.length).toBeGreaterThan(0);
  });

  test('renders statistics', () => {
    renderWithRouter(<Landing />);
    expect(screen.getByText('25k+')).toBeInTheDocument();
    expect(screen.getByText('< 60s')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  test('renders features section', () => {
    renderWithRouter(<Landing />);
    expect(screen.getByText('Fast onboarding')).toBeInTheDocument();
    expect(screen.getByText('Data-driven picks')).toBeInTheDocument();
    expect(screen.getByText('Save & bookmark')).toBeInTheDocument();
  });

  test('renders preview cards', () => {
    renderWithRouter(<Landing />);
    expect(screen.getByText('Hidden Figures (2016)')).toBeInTheDocument();
    expect(screen.getByText('Whiplash (2014)')).toBeInTheDocument();
  });

  test('renders navigation links correctly', () => {
    renderWithRouter(<Landing />);
    const loginLinks = screen.getAllByText('Log in');
    const signupLinks = screen.getAllByText('Sign up');
    expect(loginLinks.length).toBeGreaterThan(0);
    expect(signupLinks.length).toBeGreaterThan(0);
  });
});
