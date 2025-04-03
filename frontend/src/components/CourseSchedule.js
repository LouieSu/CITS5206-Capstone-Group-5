import React from "react";
import "../App.css"; // 确保样式文件存在

const CourseSchedule = ({ semester }) => {
  // 预填充 4x4 课程数据
  const tableData = [
    ["1", "2", "3", "4"], // Semester 1
    ["1", "2", "3", "4"], // Semester 2
    ["1", "2", "3", "4"], // Semester 3
    ["1", "2", "3", "4"], // Semester 4
  ];

  // 确定学期顺序：如果选择 S1, S2 位置交换
  const semesterOrder = semester === "S1" ? tableData : [tableData[1], tableData[0], tableData[2], tableData[3]];

  return (
    <div className="schedule-container">
      <h2>Course Schedule</h2>
      <table className="schedule-table">
        <thead>
          <tr>
            <th>Semester 1</th>
            <th>Semester 2</th>
            <th>Semester 3</th>
            <th>Semester 4</th>
          </tr>
        </thead>
        <tbody>
          {semesterOrder.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td key={colIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourseSchedule;