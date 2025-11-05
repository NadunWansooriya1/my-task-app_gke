import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app title', () => {
  render(<App />);
  // Check for the actual title of your app
  const titleElement = screen.getByText(/My Daily Task/i);
  expect(titleElement).toBeInTheDocument();
});