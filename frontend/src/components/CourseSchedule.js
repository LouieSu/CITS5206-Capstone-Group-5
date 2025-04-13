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

  useEffect(() => {
    if (year === '2025' && course === 'MIT') {
      axios.get('http://localhost:8000/api/ruleset/MIT-2025')
        .then(res => setCourseRules(res.data))
        .catch(err => console.error(err));
    } else {
      setCourseRules(null); // 其它情况清空
    }
  }, [year, course]);

  // useEffect(() => {
  //   if (year === '2025' && course === 'MIT') {
  //     if (!specialisation) {
  //       setSpecialisation('ss');
  //     }
  //   } else {
  //     setSpecialisation('');
  //   }
  // }, [year, course, specialisation]);

  const semesterOrder = semester === "S1"
    ? ["Y1S1", "Y1S2", "Y2S1", "Y2S2"]
    : ["Y1S2", "Y1S1", "Y2S2", "Y2S1"];

  const courses = [
    ["Course 1", "Course 2", "Course 3", "Course 4"],
    ["Course 5", "Course 6", "Course 7", "Course 8"],
    ["Course 9", "Course 10", "Course 11", "Course 12"],
    ["Course 13", "Course 14", "Course 15", "Course 16"],
  ];

  const getSpecKey = (spec) =>
    spec.toLowerCase().split(' ').map(word => word[0]).join('');

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
          {specialisation && <p><strong>Specialisation:</strong> {specialisation}</p>}
        </div>

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
            {semesterOrder.map((sem, idx) => (
              <tr key={sem}>
                <td><strong>{sem}</strong></td>
                {courses[idx].map((c, i) => (
                  <td key={i}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="alt-courses-container">
        {courseRules && (
          Object.keys(courseRules.sections).map((key, i) => (
            <div key={i}>
              <h3>{courseRules.sections[key].name}</h3>
              <ul className="alt-course-list">
                {courseRules.sections[key].units.map((u, j) => (
                  <li key={j} className="alt-course">
                    <span className="course-dot specialisation"></span>
                    {u.code} {u.name}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}

        {courseRules && specialisation && (
          <div>
              <h3>{courseRules.specialisations[getSpecKey(specialisation)]?.name}</h3>
              <ul className="alt-course-list">
                {courseRules.specialisations &&
                  courseRules.specialisations[getSpecKey(specialisation)]?.units.map((u, i) => (
                    <li key={i} className="alt-course">
                      <span className="course-dot specialisation"></span>
                      {u.code} {u.name}
                    </li>
                  ))
                }
              </ul>
          </div>
        )}
      </div>

      
      {/* courseRules && year === '2025' && course === 'MIT' && (
        <div className="alt-courses-container">
          <h3>Conversion Units</h3>
          <ul className="alt-course-list">
            {courseRules.sections.conversion.units.map((u, i) => (
              <li key={i} className="alt-course">
                <span className="course-dot other"></span>
                {u.code} {u.name}
              </li>
            ))}
          </ul>

          <h3>Core Units</h3>
          <ul className="alt-course-list">
            {courseRules.sections.core.units.map((u, i) => (
              <li key={i} className="alt-course">
                <span className="course-dot core"></span>
                {u.code} {u.name}
              </li>
            ))}
          </ul>

          {specialisation && (
            <div>
              <h3>{specialisation} Units</h3>
              <ul className="alt-course-list">
                {courseRules.specialisations &&
                  courseRules.specialisations[getSpecKey(specialisation)]?.units.map((u, i) => (
                    <li key={i} className="alt-course">
                      <span className="course-dot specialisation"></span>
                      {u.code} {u.name}
                    </li>
                  ))
                }
              </ul>
            </div>
          )}

          <h3>Option A Units</h3>
          <ul className="alt-course-list">
            {courseRules.sections.optionA.units.map((u, i) => (
              <li key={i} className="alt-course">
                <span className="course-dot elective"></span>
                {u.code} {u.name}
              </li>
            ))}
          </ul>
        </div>
      )*/ }
    </div>
  );
}

export default CourseSchedule;
