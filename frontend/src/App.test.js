import { render, screen } from '@testing-library/react';
import App from './App';

test('renders user form', () => {
  render(<App />);
  const headingElement = screen.getByText(/Enter Your Name/i);
  expect(headingElement).toBeInTheDocument();
});
