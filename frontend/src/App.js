import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserForm from './components/UserForm';
import CourseSchedule from './components/CourseSchedule';
import uwaImage2 from './assets/uwaimage2.png';
import './App.css'; // Add your custom styles here

function App() {
  return (
    <>
      <div className="hero-section" style={{ backgroundImage: `url(${uwaImage2})` }}>
        <div className="overlay">
          <h1>Welcome to the Study Planner</h1>
          <p>Plan your courses efficiently and smartly</p>
        </div>
      </div>
    <Router>
      <Routes>
        <Route path="/" element={<UserForm />} />
        <Route path="/schedule" element={<CourseSchedule />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
