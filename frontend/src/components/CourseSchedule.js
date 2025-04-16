import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './CourseSchedule.css';

function CourseSchedule() {
  const location = useLocation();
  const initialState = location.state || {};

  const [name] = useState(initialState.name || '');
  const [year, setYear] = useState(initialState.year || '2025');
  const [semester, setSemester] = useState(initialState.semester || 'S1');
  const [course, setCourse] = useState(initialState.course || 'MIT');
  const [specialisation, setSpecialisation] = useState(initialState.specialisation || 'Software Systems');

  const [courseRules, setCourseRules] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const getSpecKey = (spec) => spec.toLowerCase().split(' ').map(word => word[0]).join('');
  const getRulesetCode = () => `${course}-${year}`;
  const getStartCode = () => year.slice(2) + semester;

  const getPlanApiUrl = () => {
    const specKey = (year === '2025' && course === 'MIT') ? getSpecKey(specialisation) : 'none';
    return `http://localhost:8000/api/plan/${getRulesetCode()}/${getStartCode()}/${specKey}`;
  };

  useEffect(() => {
    axios.get(`http://localhost:8000/api/ruleset/${getRulesetCode()}`)
      .then(res => setCourseRules(res.data))
      .catch(err => {
        console.warn('Failed to fetch course rules', err);
        setCourseRules(null);
      });
  }, [year, course]);

  useEffect(() => {
    setLoading(true);
    axios.get(getPlanApiUrl())
      .then(res => {
        console.log("Study plan API result:", res.data);
        setStudyPlan(res.data);
      })
      .catch(err => {
        console.warn('Failed to fetch study plan', err);
        setStudyPlan(null);
      })
      .finally(() => setLoading(false));
  }, [year, course, semester, specialisation]);

  const semesterLabels = studyPlan && studyPlan.plan
    ? [...new Set(studyPlan.plan.map(s => s.semester))].sort()
    : [];

  return (
    <div className="schedule-page">

      <div className="filter-bar">
        <div className="filter-group">
          <label>Year:</label>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Semester:</label>
          <select value={semester} onChange={(e) => setSemester(e.target.value)}>
            <option value="S1">S1</option>
            <option value="S2">S2</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Course:</label>
          <select value={course} onChange={(e) => setCourse(e.target.value)}>
            <option value="MIT">MIT</option>
            <option value="MDS">MDS</option>
          </select>
        </div>

        {year === "2025" && course === "MIT" && (
          <div className="filter-group">
            <label>Specialisation:</label>
            <select value={specialisation} onChange={(e) => setSpecialisation(e.target.value)}>
              <option value="Applied Computing">Applied Computing</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Software Systems">Software Systems</option>
            </select>
          </div>
        )}
      </div>

      <div className="schedule-container">
        <h2>Course Schedule for {name}</h2>
        <div className="schedule-info">
          <p><strong>Year:</strong> {year}</p>
          <p><strong>Starting Semester:</strong> {semester}</p>
          <p><strong>Course:</strong> {course}</p>
          {year === "2025" && course === "MIT" && (
            <p><strong>Specialisation:</strong> {specialisation}</p>
          )}
        </div>

        {loading ? (
          <p>Loading study plan...</p>
        ) : !studyPlan ? (
          <p>No study plan data available.</p>
        ) : (
          <div className="schedule-table-wrapper">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Semester</th>
                  <th>Course 1</th>
                  <th>Course 2</th>
                  <th>Course 3</th>
                  <th>Course 4</th>
                </tr>
              </thead>
              <tbody>
                {semesterLabels.map(sem => (
                  <tr key={sem}>
                    <td><strong>{sem}</strong></td>
                    {
                      (studyPlan.plan.find(s => s.semester === sem)?.units || []).map((unit, i) => {
                        let courseName = '';
                        for (const section of Object.values(courseRules?.sections || {})) {
                          const found = section.units.find(u => u.code === unit);
                          if (found) {
                            courseName = found.name;
                            break;
                          }
                        }
                        if (!courseName && year === "2025" && course === "MIT") {
                          const specUnits = courseRules.specialisations?.[getSpecKey(specialisation)]?.units || [];
                          const found = specUnits.find(u => u.code === unit);
                          if (found) {
                            courseName = found.name;
                          }
                        }
                        return (
                          <td key={i}>
                            {unit} {courseName ? `- ${courseName}` : ''}
                          </td>
                        );
                      })
                    }
                    {Array.from({ length: 4 - (studyPlan.plan.find(s => s.semester === sem)?.units.length || 0) }).map((_, idx) => (
                      <td key={`empty-${idx}`}>-</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Optional and specialisation units display */}
      {courseRules && studyPlan && (
        <div className="alt-courses-container">
          {courseRules.sections && Object.keys(courseRules.sections).map((key, i) => (
            <div key={i}>
              <h3>{courseRules.sections[key].name}</h3>
              <ul className="alt-course-list">
                {courseRules.sections[key].units.map((u, j) => (
                  <li key={j} className="alt-course">
                    <span className="course-dot core"></span>
                    {u.code} {u.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {year === "2025" && course === "MIT" && courseRules.specialisations && (
            <div>
              <h3>{courseRules.specialisations[getSpecKey(specialisation)]?.name}</h3>
              <ul className="alt-course-list">
                {courseRules.specialisations[getSpecKey(specialisation)]?.units.map((u, i) => (
                  <li key={i} className="alt-course">
                    <span className="course-dot specialisation"></span>
                    {u.code} {u.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CourseSchedule;
