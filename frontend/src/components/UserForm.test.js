import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import UserForm from './UserForm';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('UserForm', () => {
  beforeEach(() => {
    render(
      <Router>
        <UserForm />
      </Router>
    );
  });

  test('renders initial step (Enter Your Name)', () => {
    expect(screen.getByText(/Enter Your Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Your Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Next/i)).toBeDisabled();
  });

  test('enables Next button when name is entered', () => {
    fireEvent.change(screen.getByPlaceholderText(/Your Name/i), { target: { value: 'Test User' } });
    expect(screen.getByText(/Next/i)).not.toBeDisabled();
  });

  test('progresses to step 2 (Select Your Start Year) on Next click', () => {
    fireEvent.change(screen.getByPlaceholderText(/Your Name/i), { target: { value: 'Test User' } });
    fireEvent.click(screen.getByText(/Next/i));
    expect(screen.getByText(/Select Your Start Year/i)).toBeInTheDocument();
    expect(screen.getByText(/Previous/i)).toBeInTheDocument();
    expect(screen.getByText(/Next/i)).toBeDisabled();
  });

  test('progresses through all steps and submits', () => {
    // Step 1: Name
    fireEvent.change(screen.getByPlaceholderText(/Your Name/i), { target: { value: 'Test User' } });
    fireEvent.click(screen.getByText(/Next/i));

    // Step 2: Year
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2025' } });
    fireEvent.click(screen.getByText(/Next/i));

    // Step 3: Semester
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'S1' } });
    fireEvent.click(screen.getByText(/Next/i));

    // Step 4: Course
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'MIT' } });
    fireEvent.click(screen.getByText(/Next/i));

    // Step 5: Specialisation (conditionally rendered for MIT 2025)
    expect(screen.getByText(/Select Your Specialisation/i)).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Software Systems' } });
    fireEvent.click(screen.getByText(/Next/i));
    
    // Step 6: Confirmation
    expect(screen.getByText(/Confirm Your Details/i)).toBeInTheDocument();
    // Use a function to match text content within the <p> tag
    expect(screen.getByText((content, node) => {
      const hasText = node => node.textContent.replace(/\s+/g, ' ').trim() === 'Name: Test User';
      return hasText(node) && node.tagName.toLowerCase() === 'p';
    })).toBeInTheDocument();
    expect(screen.getByText((content, node) => {
      const hasText = node => node.textContent.replace(/\s+/g, ' ').trim() === 'Year: 2025';
      return hasText(node) && node.tagName.toLowerCase() === 'p';
    })).toBeInTheDocument();
    expect(screen.getByText((content, node) => {
      const hasText = node => node.textContent.replace(/\s+/g, ' ').trim() === 'Semester: S1';
      return hasText(node) && node.tagName.toLowerCase() === 'p';
    })).toBeInTheDocument();
    expect(screen.getByText((content, node) => {
      const hasText = node => node.textContent.replace(/\s+/g, ' ').trim() === 'Course: MIT';
      return hasText(node) && node.tagName.toLowerCase() === 'p';
    })).toBeInTheDocument();
    expect(screen.getByText((content, node) => {
      const hasText = node => node.textContent.replace(/\s+/g, ' ').trim() === 'Specialisation: Software Systems';
      return hasText(node) && node.tagName.toLowerCase() === 'p';
    })).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Submit/i));
    expect(mockNavigate).toHaveBeenCalledWith('/schedule', {
      state: {
        name: 'Test User',
        year: '2025',
        semester: 'S1',
        course: 'MIT',
        specialisation: 'Software Systems',
      },
    });
  });

  test('skips specialisation step for non-MIT 2025 courses', () => {
    // Step 1: Name
    fireEvent.change(screen.getByPlaceholderText(/Your Name/i), { target: { value: 'Test User' } });
    fireEvent.click(screen.getByText(/Next/i));

    // Step 2: Year
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2024' } });
    fireEvent.click(screen.getByText(/Next/i));

    // Step 3: Semester
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'S1' } });
    fireEvent.click(screen.getByText(/Next/i));

    // Step 4: Course
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'MDS' } });
    fireEvent.click(screen.getByText(/Next/i));

    // Step 5: Confirmation (specialisation step should be skipped)
    expect(screen.getByText(/Confirm Your Details/i)).toBeInTheDocument();
    expect(screen.queryByText(/Select Your Specialisation/i)).not.toBeInTheDocument();
    // Use a function to match text content within the <p> tag
    expect(screen.getByText((content, node) => {
      const hasText = node => node.textContent.replace(/\s+/g, ' ').trim() === 'Name: Test User';
      return hasText(node) && node.tagName.toLowerCase() === 'p';
    })).toBeInTheDocument();
    expect(screen.getByText((content, node) => {
      const hasText = node => node.textContent.replace(/\s+/g, ' ').trim() === 'Year: 2024';
      return hasText(node) && node.tagName.toLowerCase() === 'p';
    })).toBeInTheDocument();
    expect(screen.getByText((content, node) => {
      const hasText = node => node.textContent.replace(/\s+/g, ' ').trim() === 'Semester: S1';
      return hasText(node) && node.tagName.toLowerCase() === 'p';
    })).toBeInTheDocument();
    expect(screen.getByText((content, node) => {
      const hasText = node => node.textContent.replace(/\s+/g, ' ').trim() === 'Course: MDS';
      return hasText(node) && node.tagName.toLowerCase() === 'p';
    })).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Submit/i));
    expect(mockNavigate).toHaveBeenCalledWith('/schedule', {
      state: {
        name: 'Test User',
        year: '2024',
        semester: 'S1',
        course: 'MDS',
        specialisation: '', // Should be empty as it was skipped
      },
    });
  });
});
