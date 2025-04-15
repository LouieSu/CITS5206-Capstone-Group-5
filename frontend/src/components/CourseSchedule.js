import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './CourseSchedule.css';

function CourseSchedule() {
  // Retrieve passed state from the previous page via React Router
  const location = useLocation();
  const initialState = location.state || {};

  // Initialize user input states
  const [name] = useState(initialState.name || '');
  const [year, setYear] = useState(initialState.year || '2025');
  const [semester, setSemester] = useState(initialState.semester || 'S1');
  const [course, setCourse] = useState(initialState.course || 'MIT');
  const [specialisation, setSpecialisation] = useState(initialState.specialisation || 'Software Systems');

  // Data states for course rules and study plan fetched from API
  const [courseRules, setCourseRules] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Convert specialisation full name to API key.
   * e.g., "Software Systems" -> "ss"
   */
  const getSpecKey = (spec) =>
    spec.toLowerCase().split(' ').map(word => word[0]).join('');

  /**
   * Construct the ruleset code based on selected course and year.
   * e.g., "MIT" and "2025" -> "MIT-2025"
   */
  const getRulesetCode = () => `${course}-${year}`;

  /**
   * Construct starting semester code.
   * e.g., "2025" and "S1" -> "25S1"
   */
  const getStartCode = () => year.slice(2) + semester;

  /**
   * Construct the API URL for fetching study plan data.
   * If specialisation is applicable (MIT 2025), include it in the URL.
   */
  const getPlanApiUrl = () => {
    const baseUrl = `http://localhost:8000/api/plan/${getRulesetCode()}/${getStartCode()}`;
    if (year === '2025' && course === 'MIT') {
      return `${baseUrl}/${getSpecKey(specialisation)}`;
    }
    return baseUrl;
  };

  /**
   * Fetch course ruleset data whenever year or course changes.
   */
  useEffect(() => {
    axios.get(`http://localhost:8000/api/ruleset/${getRulesetCode()}`)
      .then(res => setCourseRules(res.data))
      .catch(err => {
        console.warn('Failed to fetch course rules', err);
        setCourseRules(null);
      });
  }, [year, course]);

  /**
   * Fetch study plan data whenever relevant user selections change.
   */
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

  /**
   * Extract all semester labels from the study plan data
   * and sort them in ascending order.
   */
  const semesterLabels = studyPlan && studyPlan.plan
    ? [...new Set(studyPlan.plan.map(s => s.semester))].sort()
    : [];

  return (
    <div className="schedule-page">

      {/* Top filter bar for selecting year, semester, course, and specialisation */}
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

        {/* Specialisation selection appears only for MIT 2025 */}
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

      {/* Main course schedule display */}
      <div className="schedule-container">
        <h2>Course Schedule for {name}</h2>

        {/* Display selected information */}
        <div className="schedule-info">
          <p><strong>Year:</strong> {year}</p>
          <p><strong>Starting Semester:</strong> {semester}</p>
          <p><strong>Course:</strong> {course}</p>
          {year === "2025" && course === "MIT" && (
            <p><strong>Specialisation:</strong> {specialisation}</p>
          )}
        </div>

        {/* Loading indicator or error message */}
        {loading ? (
          <p>Loading study plan...</p>
        ) : !studyPlan ? (
          <p>No study plan data available.</p>
        ) : (
          // Study plan table
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
              {/* Generate a row for each semester */}
              {semesterLabels.map(sem => (
                <tr key={sem}>
                  <td><strong>{sem}</strong></td>
                  {/* For each unit in the semester, display its code and name */}
                  {
                    (studyPlan.plan.find(s => s.semester === sem)?.units || []).map((unit, i) => {
                      // Lookup course name from courseRules sections
                      let courseName = '';
                      for (const section of Object.values(courseRules.sections || {})) {
                        const found = section.units.find(u => u.code === unit);
                        if (found) {
                          courseName = found.name;
                          break;
                        }
                      }
                      // If not found, check specialisation units
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
                  {/* Fill empty cells if fewer than 4 units */}
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

      {/* Display optional units and specialisation units */}
      {courseRules && (
        <div className="alt-courses-container">
          {/* List core and elective units by section */}
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

          {/* List specialisation-specific units if applicable */}
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
