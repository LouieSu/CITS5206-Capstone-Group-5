import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 让按钮可以跳转页面
import '../App.css';

function UserForm() {
  const navigate = useNavigate(); // 获取 `navigate` 函数
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [course, setCourse] = useState('');
  const [specialisation, setSpecialisation] = useState('');

  // 处理输入的函数
  const handleNameChange = (e) => setName(e.target.value);
  const handleYearChange = (e) => setYear(e.target.value);
  const handleSemesterChange = (e) => setSemester(e.target.value);
  const handleCourseChange = (e) => setCourse(e.target.value);
  const handleSpecialisationChange = (e) => setSpecialisation(e.target.value);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  // 点击提交时，跳转到 CourseSchedule 页面，并传递用户信息
  const handleSubmit = () => {
    const userData = { name, year, semester, course, specialisation };
    navigate('/schedule', { state: userData }); // 跳转到 /schedule 并传递数据
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
              onChange={handleNameChange} 
            />
            <div className="button-group">
              <button className="next-btn" onClick={nextStep} disabled={!name}>Next</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-container">
            <h2>Select Your Start Year</h2>
            <select value={year} onChange={handleYearChange}>
              <option value="">Select Year</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
            <div className="button-group">
              <button className="prev-btn" onClick={prevStep}>Previous</button>
              <button className="next-btn" onClick={nextStep} disabled={!year}>Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-container">
            <h2>Select Your Semester</h2>
            <select value={semester} onChange={handleSemesterChange}>
              <option value="">Select Semester</option>
              <option value="S1">S1</option>
              <option value="S2">S2</option>
            </select>
            <div className="button-group">
              <button className="prev-btn" onClick={prevStep}>Previous</button>
              <button className="next-btn" onClick={nextStep} disabled={!semester}>Next</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step-container">
            <h2>Select Your Course</h2>
            <select value={course} onChange={handleCourseChange}>
              <option value="">Select Course</option>
              <option value="mit">Master of Information Technology</option>
              <option value="mds">Master of Data Science</option>
            </select>
            <div className="button-group">
              <button className="prev-btn" onClick={prevStep}>Previous</button>
              <button className="next-btn" onClick={nextStep} disabled={!course}>Next</button>
            </div>
          </div>
        )}

        {step === 5 && year === "2025" && course === "mit" && (
          <div className="step-container">
            <h2>Select Your Specialisation</h2>
            <select value={specialisation} onChange={handleSpecialisationChange}>
              <option value="">Select Specialisation</option>
              <option value="Applied Computing">Applied Computing</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Software Systems">Software Systems</option>
            </select>
            <div className="button-group">
              <button className="prev-btn" onClick={prevStep}>Previous</button>
              <button className="next-btn" onClick={nextStep} disabled={!specialisation}>Next</button>
            </div>
          </div>
        )}

        {step === 5 && !(year === "2025" && course === "mit") && (
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

        {step === 6 && (
          <div className="step-container">
            <h2>Confirm Your Details</h2>
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Year:</strong> {year}</p>
            <p><strong>Semester:</strong> {semester}</p>
            <p><strong>Course:</strong> {course}</p>
            {year === "2025" && course === "mit" && (
              <p><strong>Specialisation:</strong> {specialisation}</p>
            )}
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