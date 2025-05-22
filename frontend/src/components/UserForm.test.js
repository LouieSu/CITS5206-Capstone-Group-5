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
  });

  test('shows year selection when name is entered', () => {
    fireEvent.change(screen.getByPlaceholderText(/Your Name/i), { target: { value: 'Test User' } });
    expect(screen.getByText(/Select Your Start Year/i)).toBeInTheDocument();
  });

  test('progresses through all steps and submits', () => {
    // Step 1: Name
    fireEvent.change(screen.getByPlaceholderText(/Your Name/i), { target: { value: 'Test User' } });

    // Step 2: Year
    // The year dropdown should be visible now
    fireEvent.change(screen.getByText(/Select Year/i).closest('select'), { target: { value: '2025' } });

    // Step 3: Semester
    // The semester dropdown should be visible now
    fireEvent.change(screen.getByText(/Select Semester/i).closest('select'), { target: { value: 'S1' } });

    // Step 4: Course
    // The course dropdown should be visible now
    fireEvent.change(screen.getByText(/Select Course/i).closest('select'), { target: { value: 'MIT' } });

    // Step 5: Specialisation (conditionally rendered for MIT 2025)
    expect(screen.getByText(/Select Your Specialisation/i)).toBeInTheDocument();
    fireEvent.change(screen.getByText(/Select Specialisation/i).closest('select'), { target: { value: 'Software Systems' } });
    
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

    // Step 2: Year
    fireEvent.change(screen.getByText(/Select Year/i).closest('select'), { target: { value: '2024' } });

    // Step 3: Semester
    fireEvent.change(screen.getByText(/Select Semester/i).closest('select'), { target: { value: 'S1' } });

    // Step 4: Course
    fireEvent.change(screen.getByText(/Select Course/i).closest('select'), { target: { value: 'MDS' } });

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
        specialisation: undefined, // Should be undefined as it was skipped and reset
      },
    });
  });
});
