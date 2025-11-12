import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Equipment & Resources page with seed items', async () => {
  render(<App />);
  expect(await screen.findByText(/Equipment & Resources/i)).toBeInTheDocument();
  expect(screen.getByText(/Microscope/i)).toBeInTheDocument();
  expect(screen.getByText(/3D Printer/i)).toBeInTheDocument();
  expect(screen.getByText(/Meeting Room/i)).toBeInTheDocument();
});
