import { useState } from 'react';
import '../App.css';

function UserForm() {
  const [step, setStep] = useState(1);
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [course, setCourse] = useState('');

  const handleYearChange = (e) => setYear(e.target.value);
  const handleSemesterChange = (e) => setSemester(e.target.value);
  const handleCourseChange = (e) => setCourse(e.target.value);

  const nextStep = () => setStep(step + 1);
  const handleSubmit = () => console.log({ year, semester, course });

  return (
    <div className="app-container">
      <div className="dialog-box">
        {step === 1 && (
          <div className="step-container">
            <h2>Select Your Start Year</h2>
            <select value={year} onChange={handleYearChange}>
              <option value="">Select Year</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
            <button onClick={nextStep} disabled={!year}>Next</button>
          </div>
        )}

        {step === 2 && (
          <div className="step-container">
            <h2>Select Your Semester</h2>
            <select value={semester} onChange={handleSemesterChange}>
              <option value="">Select Semester</option>
              <option value="S1">S1</option>
              <option value="S2">S2</option>
            </select>
            <button onClick={nextStep} disabled={!semester}>Next</button>
          </div>
        )}

        {step === 3 && (
          <div className="step-container">
            <h2>Select Your Course</h2>
            <select value={course} onChange={handleCourseChange}>
              <option value="">Select Course</option>
              <option value="mit">Master of Information Technology</option>
              <option value="mds">Master of Data Science</option>
            </select>
            <button onClick={handleSubmit} disabled={!course}>Submit</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserForm;
