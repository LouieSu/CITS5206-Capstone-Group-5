import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function UserForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [course, setCourse] = useState('');
  const [specialisation, setSpecialisation] = useState('');

  const handleSubmit = () => {
    navigate('/schedule', {
      state: {
        name,
        year,
        semester,
        course,
        // Only include specialisation if it's relevant and filled
        specialisation: (year === "2025" && course === "MIT" && specialisation) ? specialisation : undefined,
      }
    });
  };

  // Conditions for showing each part of the form
  const showNameSection = true; // Name is always shown
  const showYearSection = !!name;
  const showSemesterSection = !!name && !!year;
  const showCourseSection = !!name && !!year && !!semester;
  const showSpecialisationSection = !!name && !!year && !!semester && !!course && year === "2025" && course === "MIT";

  // Condition for showing the confirmation and submit button
  const showConfirmationSection = () => {
    // Prerequisite: name, year, semester, course must be filled for any path
    if (!name || !year || !semester || !course) return false;

    // If specialisation is applicable (2025 MIT), it must also be filled
    if (year === "2025" && course === "MIT") {
      return !!specialisation;
    }
    // Otherwise (not 2025 MIT), specialisation is not required
    return true;
  };

  const handleYearChange = (e) => {
    const newYear = e.target.value;
    setYear(newYear);
    // If new year or current course makes specialisation irrelevant, clear it
    if (newYear !== "2025" || course !== "MIT") {
      setSpecialisation('');
    }
  };

  const handleCourseChange = (e) => {
    const newCourse = e.target.value;
    setCourse(newCourse);
    // If current year or new course makes specialisation irrelevant, clear it
    if (year !== "2025" || newCourse !== "MIT") {
      setSpecialisation('');
    }
  };

  return (
    <div className="app-container">
      <div className="dialog-box">
        {/* Name Input */}
        {showNameSection && (
          <div className="step-container">
            <h2>Enter Your Name</h2>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        {/* Year Selection */}
        {showYearSection && (
          <div className="step-container">
            <h2>Select Your Start Year</h2>
            <select value={year} onChange={handleYearChange}>
              <option value="">Select Year</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>
        )}

        {/* Semester Selection */}
        {showSemesterSection && (
          <div className="step-container">
            <h2>Select Your Semester</h2>
            <select value={semester} onChange={(e) => setSemester(e.target.value)}>
              <option value="">Select Semester</option>
              <option value="S1">S1</option>
              <option value="S2">S2</option>
            </select>
          </div>
        )}

        {/* Course Selection */}
        {showCourseSection && (
          <div className="step-container">
            <h2>Select Your Course</h2>
            <select value={course} onChange={handleCourseChange}>
              <option value="">Select Course</option>
              <option value="MIT">Master of Information Technology</option>
              <option value="MDS">Master of Data Science</option>
            </select>
          </div>
        )}

        {/* Specialisation Selection */}
        {showSpecialisationSection && (
          <div className="step-container">
            <h2>Select Your Specialisation</h2>
            <select value={specialisation} onChange={(e) => setSpecialisation(e.target.value)}>
              <option value="">Select Specialisation</option>
              <option value="Applied Computing">Applied Computing</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Software Systems">Software Systems</option>
            </select>
          </div>
        )}

        {/* Confirmation Details */}
        {showConfirmationSection() && (
          <div className="step-container">
            <h2>Confirm Your Details</h2>
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Year:</strong> {year}</p>
            <p><strong>Semester:</strong> {semester}</p>
            <p><strong>Course:</strong> {course}</p>
            {year === "2025" && course === "MIT" && specialisation && (
              <p><strong>Specialisation:</strong> {specialisation}</p>
            )}
            <div className="button-group">
              <button className="submit-btn" onClick={handleSubmit}>Submit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserForm;
