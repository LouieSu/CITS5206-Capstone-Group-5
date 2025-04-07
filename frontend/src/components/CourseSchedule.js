import React from "react";
import { useLocation } from "react-router-dom";
import "./CourseSchedule.css";

function CourseSchedule() {
  const location = useLocation();
  const { name, year, semester, course, specialisation } = location.state || {};

  // example for the study plan
  const courses = [
    ["Course 1", "Course 2", "Course 3", "Course 4"],
    ["Course 5", "Course 6", "Course 7", "Course 8"],
    ["Course 9", "Course 10", "Course 11", "Course 12"],
    ["Course 13", "Course 14", "Course 15", "Course 16"],
  ];

  // base on the student information change the semester
  const semesters = semester === "S1"
    ? ["Y1S1", "Y1S2", "Y2S1", "Y2S2"]
    : ["Y1S2", "Y1S1", "Y2S2", "Y2S1"];

  return (
    <div className="schedule-container">
      <h2>Course Schedule for {name}</h2>
      <p>Year: {year}, Starting Semester: {semester}, Course: {course}</p>
      {specialisation && <p>Specialisation: {specialisation}</p>}

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
          {semesters.map((sem, index) => (
            <tr key={sem}>
              <td><strong>{sem}</strong></td>
              {courses[index].map((course, i) => (
                <td key={i}>{course}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CourseSchedule;
