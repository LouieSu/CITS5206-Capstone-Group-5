import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../App.css'; 

function UserForm() {
  const navigate = useNavigate(); // jump to the study plan page
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [course, setCourse] = useState('');
  const [specialisation, setSpecialisation] = useState('');

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = () => {
    // Jump after submission and transfer data
    navigate('/schedule', {
      state: {
        name,
        year,
        semester,
        course,
        specialisation
      }
    });
  };

  return (
    <div className="app-container">
      <div className="dialog-box">
        {step === 1 && (
          <div className="step-container">
            <h2>Enter Your Name</h2>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="button-group">
              <button className="next-btn" onClick={nextStep} disabled={!name}>
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-container">
            <h2>Select Your Start Year</h2>
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">Select Year</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
            <div className="button-group">
              <button className="prev-btn" onClick={prevStep}>Previous</button>
              <button className="next-btn" onClick={nextStep} disabled={!year}>
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-container">
            <h2>Select Your Semester</h2>
            <select value={semester} onChange={(e) => setSemester(e.target.value)}>
              <option value="">Select Semester</option>
              <option value="S1">S1</option>
              <option value="S2">S2</option>
            </select>
            <div className="button-group">
              <button className="prev-btn" onClick={prevStep}>Previous</button>
              <button className="next-btn" onClick={nextStep} disabled={!semester}>
                Next
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step-container">
            <h2>Select Your Course</h2>
            <select value={course} onChange={(e) => setCourse(e.target.value)}>
              <option value="">Select Course</option>
              <option value="mit">Master of Information Technology</option>
              <option value="mds">Master of Data Science</option>
            </select>
            <div className="button-group">
              <button className="prev-btn" onClick={prevStep}>Previous</button>
              <button className="next-btn" onClick={nextStep} disabled={!course}>
                Next
              </button>
            </div>
          </div>
        )}

        {step === 5 && year === "2025" && course === "mit" && (
          <div className="step-container">
            <h2>Select Your Specialisation</h2>
            <select value={specialisation} onChange={(e) => setSpecialisation(e.target.value)}>
              <option value="">Select Specialisation</option>
              <option value="Applied Computing">Applied Computing</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Software Systems">Software Systems</option>
            </select>
            <div className="button-group">
              <button className="prev-btn" onClick={prevStep}>Previous</button>
              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={!specialisation}
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {(step === 5 && !(year === "2025" && course === "mit")) && (
          <div className="step-container">
            <h2>Confirm Your Details</h2>
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Year:</strong> {year}</p>
            <p><strong>Semester:</strong> {semester}</p>
            <p><strong>Course:</strong> {course}</p>
            <div className="button-group">
              <button className="prev-btn" onClick={prevStep}>Previous</button>
              <button className="submit-btn" onClick={handleSubmit}>Submit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserForm;
