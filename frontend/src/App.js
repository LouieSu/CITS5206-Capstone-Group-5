import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserForm from './components/UserForm';
import CourseSchedule from './components/CourseSchedule';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserForm />} />
        <Route path="/schedule" element={<CourseSchedule />} />
      </Routes>
    </Router>
  );
}

export default App;
