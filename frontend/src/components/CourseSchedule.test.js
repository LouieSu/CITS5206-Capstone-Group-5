import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import axios from 'axios';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CourseSchedule from './CourseSchedule';

jest.mock('axios');

// Mock react-router-dom's useLocation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

const mockCourseRules = {
  sections: {
    conversion: {
      name: 'Conversion',
      units: [
        { code: 'CITS1003', name: 'Introduction to Cybersecurity' },
        { code: 'CITS1401', name: 'Computational Thinking with Python' },
        { code: 'CITS1402', name: 'Relational Database Management Systems' },
        { code: 'CITS2002', name: 'Systems Programming' },
        { code: 'CITS2005', name: 'Object Oriented Programming' },
      ],
    },
    core: {
      name: 'Core',
      units: [
        { code: 'CITS4401', name: 'Software Requirements and Design' },
        { code: 'CITS5206', name: 'Information Technology Capstone Project' },
        { code: 'CITS5505', name: 'Agile Web Development' },
        { code: 'PHIL4100', name: 'Ethics and Critical Thinking' },
      ],
    },
    optionA: {
      name: 'Option - Group A',
      units: [ // A selection of units from MIT-2025 optionA
        { code: 'AUTO4508', name: 'Mobile Robots' },
        { code: 'CITS4009', name: 'Computational Data Analysis' },
        { code: 'CITS4012', name: 'Natural Language Processing' },
        { code: 'CITS4402', name: 'Computer Vision' },
        { code: 'CITS5504', name: 'CITS5504' }, // Name not in provided units.xml snippet
      ],
    },
  },
  specialisations: {
    ac: {
      name: 'Applied Computing specialisation',
      units: [ // A selection of units from MIT-2025 ac specialisation
        { code: 'CITS4009', name: 'Computational Data Analysis' },
        { code: 'CITS4012', name: 'Natural Language Processing' },
        { code: 'CITS4402', name: 'Computer Vision' },
        { code: 'CITS5501', name: 'Software Testing and Quality Assurance' },
      ],
    },
    ai: {
      name: 'Artificial Intelligence specialisation',
      units: [
        { code: 'CITS4012', name: 'Natural Language Processing' },
        { code: 'CITS4404', name: 'Artificial Intelligence and Adaptive Systems' },
        { code: 'CITS5017', name: 'Deep Learning' },
        { code: 'CITS5508', name: 'CITS5508' }, // Name not in provided units.xml snippet
      ],
    },
    ss: {
      name: 'Software Systems specialisation',
      units: [
        { code: 'CITS5501', name: 'Software Testing and Quality Assurance' },
        { code: 'CITS5503', name: 'Cloud Computing' },
        { code: 'CITS5506', name: 'CITS5506' }, // Name not in provided units.xml snippet
        { code: 'CITS5507', name: 'CITS5507' }, // Name not in provided units.xml snippet
      ],
    },
  },
};

const mockStudyPlan = {
  plan: [
    { semester: '2025 S1', units: ['CITS4401', 'CITS5501', 'CITS5206', 'CITS5505'] }, // 4 units, including CITS5501
    { semester: '2025 S2', units: [] },
  ],
  ruleset_code: 'MIT-2025',
  start: '25S1',
  specialisation: 'ss',
};

const mockValidationResult = {
  validation: {
    valid: false,
    completed_specialisations: [],
    issues: [['CITS5501', 'Prerequisite not met']],
  },
  prereq: {
    availability: [{ unit: 'CITS5501', available: true, semester: '2025 S1' }],
    prerequisite_issues: [['CITS5501', 'Prerequisite for CITS5501 not met']],
  },
  suggestion: { suggestions: [] }, // <-- Fix: wrap suggestions in a suggestion object
};

let getElementByIdSpy;

afterEach(() => {
  if (getElementByIdSpy) {
    getElementByIdSpy.mockRestore();
    getElementByIdSpy = null;
  }
  axios.get.mockClear();
  axios.post.mockClear();
  // Ensure useLocation mock is reset if needed, though it's set per render call here
  jest.restoreAllMocks(); // Add this to restore all mocks, including document.createElement
});

const renderCourseSchedule = async (locationState = {}) => {
  useLocation.mockReturnValue({ state: locationState });
  axios.get.mockImplementation((url) => {
    if (url.includes('/ruleset/')) {
      return Promise.resolve({ data: mockCourseRules });
    }
    if (url.includes('/plan/')) {
      return Promise.resolve({ data: mockStudyPlan });
    }
    return Promise.reject(new Error('not found'));
  });
  // Use mockImplementation for more explicit control
  axios.post.mockImplementation(() => Promise.resolve({ data: mockValidationResult }));

  render(
    <DndProvider backend={HTML5Backend}>
      <Router>
        <CourseSchedule />
      </Router>
    </DndProvider>
  );
  // Wait for a common element that indicates initial data load and processing is complete
  await screen.findByText(/Year:/i); // Changed from /Incomplete study plan./i
};

describe('CourseSchedule', () => {
  beforeEach(() => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/ruleset/')) {
        return Promise.resolve({ data: mockCourseRules });
      }
      if (url.includes('/plan/')) {
        return Promise.resolve({ data: mockStudyPlan });
      }
      return Promise.reject(new Error('not found'));
    });
    // Use mockImplementation for more explicit control
    axios.post.mockImplementation(() => Promise.resolve({ data: mockValidationResult }));
  });

  test('renders loading state initially', () => {
    useLocation.mockReturnValue({ state: {} }); // Provide a default mock return value
    renderCourseSchedule();
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  test('renders schedule table after data fetching', async () => {
    await renderCourseSchedule({ year: '2025', semester: 'S1', course: 'MIT', specialisation: 'Software Systems' });
    await waitFor(() => {
      expect(screen.getByText(/2025 S1/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/CITS4401 - Software Requirements and Design/i)).toBeInTheDocument();
  });

  test('allows changing year, semester, course, and specialisation', async () => {
    await renderCourseSchedule(); // Wait for initial render and load

    const allSelects = screen.getAllByRole('combobox');

    // Year change
    await act(async () => {
      fireEvent.change(allSelects[0], { target: { value: '2024' } }); // Year is the first select
    });
    await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('MIT-2024'));
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/plan/MIT-2024/24S1/none'));
    });

    // Semester change
    await act(async () => {
      fireEvent.change(allSelects[1], { target: { value: 'S2' } }); // Semester is the second select
    });
    await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/plan/MIT-2024/24S2/none'));
    });

    // Course change
    await act(async () => {
      fireEvent.change(allSelects[2], { target: { value: 'MDS' } }); // Course is the third select
    });
    await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('MDS-2024'));
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/plan/MDS-2024/24S2/none'));
    });
  });

  test('export plan button triggers download', async () => {
    await renderCourseSchedule({ year: '2025', semester: 'S1', course: 'MIT', specialisation: 'Software Systems' });
    await waitFor(() => expect(screen.getByText('Export Plan')).toBeInTheDocument());

    const mockCreateObjectURL = jest.fn(() => 'mock-url');
    const mockRevokeObjectURL = jest.fn();
    // Store original URL methods
    const originalCreateObjectURL = global.URL.createObjectURL;
    const originalRevokeObjectURL = global.URL.revokeObjectURL;

    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    
    const mockLinkClick = jest.fn();
    // Spy on document.createElement and ensure it's restored
    const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: mockLinkClick,
          // Add other properties if needed by the component
          setAttribute: jest.fn(),
          removeAttribute: jest.fn(),
          style: {},
        };
      }
      // For other elements, call the original implementation if possible, or a basic mock
      return document.createElementNS('http://www.w3.org/1999/xhtml', tagName); // Use NS version for proper element creation
    });

    fireEvent.click(screen.getByText('Export Plan'));
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockLinkClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-url');

    // Restore mocked methods
    global.URL.createObjectURL = originalCreateObjectURL;
    global.URL.revokeObjectURL = originalRevokeObjectURL;
    createElementSpy.mockRestore(); // Restore the spy
  });

  test('import plan button triggers file input click', async () => {
    const mockFileInputClick = jest.fn();
    const mockInput = document.createElement('input');
    mockInput.type = 'file';
    mockInput.style.display = 'none';
    mockInput.id = 'importInput';
    mockInput.click = mockFileInputClick;

    const originalDocumentGetElementById = document.getElementById;
    getElementByIdSpy = jest.spyOn(document, 'getElementById').mockImplementation(id => {
      if (id === 'importInput') {
        return mockInput;
      }
      return originalDocumentGetElementById.call(document, id);
    });

    await renderCourseSchedule();

    fireEvent.click(screen.getByText(/Import Plan/i));
    expect(mockFileInputClick).toHaveBeenCalled();
    // spy will be restored in afterEach
  });

});
