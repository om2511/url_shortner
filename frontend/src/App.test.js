import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

test('renders the application header', () => {
  render(<App />);
  const headingElement = screen.getByText(/url shortener/i);
  expect(headingElement).toBeInTheDocument();
});
