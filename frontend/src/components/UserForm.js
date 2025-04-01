import { useState } from 'react';
import axios from 'axios';

function UserForm() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [course, setCourse] = useState('');
  const [mitTrack, setMitTrack] = useState('');

  // 处理输入变化
  const handleNextStep = () => setStep(step + 1);
  const handleSubmit = () => {
    const userData = { name, year, semester, course, mitTrack };

    axios.post('/api/save_user_info', userData)
      .then(response => console.log('Success:', response.data))
      .catch(error => console.error('Error:', error));
  };

  return (
    <div style={styles.container}>
      <h2>UWA Study Planner</h2>

      {step === 1 && (
        <div>
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          <button onClick={handleNextStep} disabled={!name}>Next</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <label>Start Year:</label>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">Select Year</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
          <button onClick={handleNextStep} disabled={!year}>Next</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <label>Semester:</label>
          <select value={semester} onChange={(e) => setSemester(e.target.value)}>
            <option value="">Select Semester</option>
            <option value="S1">S1</option>
            <option value="S2">S2</option>
          </select>
          <button onClick={handleNextStep} disabled={!semester}>Next</button>
        </div>
      )}

      {step === 4 && (
        <div>
          <label>Course:</label>
          <select value={course} onChange={(e) => setCourse(e.target.value)}>
            <option value="">Select Course</option>
            <option value="mit">Master of Information Technology</option>
            <option value="mds">Master of Data Science</option>
          </select>
          <button onClick={handleNextStep} disabled={!course}>Next</button>
        </div>
      )}

      {step === 5 && course === 'mit' && year === '2025' && (
        <div>
          <label>MIT Specialization:</label>
          <select value={mitTrack} onChange={(e) => setMitTrack(e.target.value)}>
            <option value="">Select Specialization</option>
            <option value="AI">Artificial Intelligence</option>
            <option value="Software">Software Engineering</option>
            <option value="General">General</option>
          </select>
          <button onClick={handleSubmit} disabled={!mitTrack}>Submit</button>
        </div>
      )}

      {step === 5 && (course !== 'mit' || year !== '2025') && (
        <button onClick={handleSubmit}>Submit</button>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
};

export default UserForm;
