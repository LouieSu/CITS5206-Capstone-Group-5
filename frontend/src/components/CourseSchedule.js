import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './CourseSchedule.css';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const ItemTypes = { UNIT: 'unit' };

function DraggableUnit({ unit, children, availability, prereq }) {
  const [, drag] = useDrag(() => ({
    type: ItemTypes.UNIT,
    item: { unit },
  }), [unit]);

  // Check if the unit is unsatisfied based on availability or prereq
  const isUnavailable = availability?.some(a => a.unit === unit.code && !a.available);
  const hasPrereqIssue = prereq?.some(p => p[0] === unit.code);

  const isUnsatisfied = isUnavailable || hasPrereqIssue; // A unit is unsatisfied if it's unavailable or has a prereq issue
  const [showTooltip, setShowTooltip] = useState(false); // State for showing/hiding the tooltip

  // Tooltip message logic
  const availabilityMessage = isUnavailable
    ? `${unit.code} is not available in ${availability.find(a => a.unit === unit.code)?.semester}`
    : null;

  const prereqMessage = hasPrereqIssue
    ? prereq.find(p => p[0] === unit.code)?.[1]
    : null;

  const tooltipMessages = [
    { type: 'availability', message: availabilityMessage },
    { type: 'prereq', message: prereqMessage },
  ].filter(msg => msg.message); // Collect all messages with types

  return (
    <div
      ref={drag}
      className={`alt-course draggable-unit ${isUnsatisfied ? 'unsatisfied-unit' : ''}`}
      draggable
      onMouseEnter={() => isUnsatisfied && setShowTooltip(true)} // Show tooltip on hover
      onMouseLeave={() => setShowTooltip(false)} // Hide tooltip when mouse leaves
    >
      {children}
      {isUnsatisfied && <span className="exclamation-icon">!</span>}
      {showTooltip && (
        <div className="tooltip">
          {tooltipMessages.map((msg, index) => (
            <div
              key={index}
              className={`tooltip-message ${msg.type === 'availability' ? 'availability-message' : 'prereq-message'}`}
            >
              {msg.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DroppableCell({ onDrop, children }) {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.UNIT,
    drop: (item) => onDrop(item.unit),
  }), [onDrop]);

  return (
    <td ref={drop} className="drop-cell">
      {children || '-'}
    </td>
  );
}

function DroppablePanel({ section, children, onDropUnit }) {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.UNIT,
    drop: (item) => onDropUnit(item.unit),
  }), [onDropUnit]);

  return (
    <div ref={drop}>
      <h3>{section.name}</h3>
      <ul className="alt-course-list">{children}</ul>
    </div>
  );
}

function CourseSchedule() {
  const location = useLocation();
  const initialState = location.state || {};

  const [year, setYear] = useState(initialState.year || '2025');
  const [semester, setSemester] = useState(initialState.semester || 'S1');
  const [course, setCourse] = useState(initialState.course || 'MIT');
  const [specialisation, setSpecialisation] = useState(initialState.specialisation || 'Software Systems');
  const [courseRules, setCourseRules] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const isImportingRef = useRef(false);

  const getSpecKey = useCallback((spec) => spec.toLowerCase().split(' ').map(w => w[0]).join(''), []);
  const getRulesetCode = useCallback(() => `${course}-${year}`, [course, year]);
  const getStartCode = useCallback(() => year.slice(2) + semester, [year, semester]);
  const getPlanApiUrl = useCallback(() => {
    const specKey = (year === '2025' && course === 'MIT') ? getSpecKey(specialisation) : 'none';
    return `${API_BASE_URL}/plan/${getRulesetCode()}/${getStartCode()}/${specKey}`;
  }, [year, course, specialisation, getSpecKey, getRulesetCode, getStartCode]);

  const [validationResults, setValidationResults] = useState({
    valid: null,
    completedSpecialisations: [],
    issues: [],
  });

  const [availability, setAvailability] = useState([]);
  const [prereq, setPrereq] = useState([]);

  const _get_validation_API_name = useCallback(() => `${API_BASE_URL}/validate-${course.toLowerCase()}${year}`, [course, year]);
  const _transform_timetable = useCallback(() => (
    { 
      "timetable": studyPlan?.plan?.map(l => l.units) || [],
      "starting_sem": year.slice(-2) + semester
    }
  ), [studyPlan, semester, year]);

const handle_validation_result = useCallback((res) => {
  const specialisationMap = { ac: 'Applied Computing', ai: 'Artificial Intelligence', ss: 'Software Systems' };
  if (res.data) {
    const { completed_specialisations, issues, valid } = res.data.validation;
    const availability  = res.data.prereq.availability; 
    const prereq = res.data.prereq.prerequisite_issues; 

    const mappedSpecialisations = (completed_specialisations || []).map(spec => specialisationMap[spec] || spec);

    setValidationResults({ valid, completedSpecialisations: mappedSpecialisations, issues: issues || [] });
    setAvailability(availability || []); // Store availability in state
    setPrereq(prereq || []); // Store prereq in state
  } else {
    setValidationResults({ valid: false, completedSpecialisations: [], issues: ['Validation response is empty or invalid.'] });
    setAvailability([]);
    setPrereq([]);
  }
}, []);



  const request_validation = useCallback(() => {
    axios.post(_get_validation_API_name(), _transform_timetable())
      .then(res => handle_validation_result(res))
      .catch(err => console.error('Validation failed:', err.response?.data || err.message));
  }, [_get_validation_API_name, _transform_timetable, handle_validation_result]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/ruleset/${getRulesetCode()}`)
      .then(res => setCourseRules(res.data))
      .catch(() => setCourseRules(null));
  }, [getRulesetCode]);

  useEffect(() => {
    if (isImportingRef.current) {
      isImportingRef.current = false;
      return;
    }
    setLoading(true);
    axios.get(getPlanApiUrl())
      .then(res => setStudyPlan(res.data))
      .catch(() => setStudyPlan(null))
      .finally(() => setLoading(false));
  }, [getPlanApiUrl]);

  useEffect(() => { request_validation(); }, [studyPlan, request_validation]);

  const semesterLabels = studyPlan?.plan?.map(s => s.semester) || [];

  const isUnitInPlan = (code) => studyPlan?.plan?.some(sem => sem.units.includes(code));

  const handleDropToCell = (semIdx, unit) => {
    if (!studyPlan || isUnitInPlan(unit.code)) return;
    const updatedPlan = [...studyPlan.plan];
    if (updatedPlan[semIdx].units.length < 4) {
      updatedPlan[semIdx].units.push(unit.code);
      setStudyPlan({ ...studyPlan, plan: updatedPlan });
    }
  };

  const handleRemoveFromTable = (unit) => {
    const updatedPlan = studyPlan.plan.map(sem => ({ ...sem, units: sem.units.filter(code => code !== unit.code) }));
    setStudyPlan({ ...studyPlan, plan: updatedPlan });
  };

  const handleExportPlan = () => {
    if (!studyPlan) return alert('No study plan to export.');
    const specKey = (year === '2025' && course === 'MIT') ? getSpecKey(specialisation) : 'none';
    const filename = `${year}-${course.toLowerCase()}-${semester.toLowerCase()}-${specKey}.json`;
    const blob = new Blob([JSON.stringify(studyPlan, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportPlan = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (!importedData || !importedData.plan || !importedData.ruleset_code || !importedData.start)
          throw new Error('Invalid study plan format');
        const [importedCourse, importedYear] = importedData.ruleset_code.split('-');
        const importedSemester = importedData.start.slice(2);
        const importedSpecKey = importedData.specialisation || 'none';
        const specMap = { ac: 'Applied Computing', ai: 'Artificial Intelligence', ss: 'Software Systems' };
        setYear(importedYear);
        setCourse(importedCourse);
        setSemester(importedSemester);
        if (importedCourse === 'MIT' && importedYear === '2025') {
          setSpecialisation(specMap[importedSpecKey] || 'Software Systems');
        }
        isImportingRef.current = true;
        setStudyPlan(importedData);
        const ruleUrl = `${API_BASE_URL}/ruleset/${importedCourse}-${importedYear}`;
        const ruleRes = await axios.get(ruleUrl);
        setCourseRules(ruleRes.data);
      } catch (err) {
        alert('Failed to import study plan: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <DndProvider backend={HTML5Backend}>
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
          {year === '2025' && course === 'MIT' && (
            <div className="filter-group">
              <label>Specialisation:</label>
              <select value={specialisation} onChange={(e) => setSpecialisation(e.target.value)}>
                <option value="Applied Computing">Applied Computing</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Software Systems">Software Systems</option>
              </select>
            </div>
          )}
          <div className="filter-group">
            <button className="export-button" onClick={handleExportPlan}>
              Export Plan
            </button>
          </div>
          <div className="filter-group">
            <button
              className="import-button"
              onClick={() => document.getElementById('importInput').click()}
            >
              Import Plan
            </button>
            <input
              type="file"
              id="importInput"
              accept=".json"
              onChange={handleImportPlan}
              style={{ display: "none" }}
            />
          </div>


        </div>

        

        {/* Main Table */}
        {loading ? <p>Loading...</p> : studyPlan && courseRules && (
          <>
            <div className="schedule-table-container">
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
                    {semesterLabels.map((sem, semIdx) => (
                      <tr key={sem}>
                        <td><strong>{sem}</strong></td>
                        {[0, 1, 2, 3].map(i => {
                          const unitCode = studyPlan.plan[semIdx].units[i];
                          const unit = Object.values(courseRules.sections).flatMap(s => s.units)
                            .concat(Object.values(courseRules.specialisations || {}).flatMap(s => s.units || []))
                            .find(u => u.code === unitCode);
                          return (
                            <DroppableCell
                              key={i}
                              onDrop={(newUnit) => handleDropToCell(semIdx, newUnit)}
                            >
                              {unit && (
                                <DraggableUnit unit={unit} availability={availability} prereq={prereq}>
                                  <div onDoubleClick={() => handleRemoveFromTable(unit)}>
                                    {unit.code} - {unit.name}
                                  </div>
                                </DraggableUnit>
                              )}
                            </DroppableCell>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Message Area */}
              <div className="user-message">
              {validationResults.completedSpecialisations.length > 0 && (
                <p className="info-message">
                    Matched Specialisations: {validationResults.completedSpecialisations.join(", ")}
                </p>
              )}

                {validationResults.valid === null ? (
                  <p className="info-message main-message">Choose more courses</p>
                ) : validationResults.valid ? (
                  <p className="success-message main-message">Study Plan Ready!</p>
                ) : (
                  <p className="error-message main-message">Incomplete study plan.</p>
                )}
                
                {validationResults.issues.length > 0 && (
                  <div className="issues-list">
                    {validationResults.issues.map((issue, index) => (
                      <p key={index} className="error-message issue-item">- <b>{issue[0]}</b>: {issue[1]} </p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right-side Unit Panel */}
            <div className="alt-courses-container">
              {Object.entries(courseRules.sections).map(([key, section], idx) => (
                <DroppablePanel key={idx} section={section} onDropUnit={handleRemoveFromTable}>
                  {section.units.filter(u => !isUnitInPlan(u.code)).map((u, i) => (
                    <li key={i}>
                      <DraggableUnit unit={u}>{u.code} - {u.name}</DraggableUnit>
                    </li>
                  ))}
                </DroppablePanel>
              ))}
              {year === '2025' && course === 'MIT' && courseRules.specialisations && courseRules.specialisations[getSpecKey(specialisation)] && (
                <DroppablePanel
                  section={courseRules.specialisations[getSpecKey(specialisation)]}
                  onDropUnit={handleRemoveFromTable}
                >
                  {courseRules.specialisations[getSpecKey(specialisation)].units
                    .filter(u => !isUnitInPlan(u.code))
                    .map((u, i) => (
                      <li key={i}>
                        <DraggableUnit unit={u}>{u.code} - {u.name}</DraggableUnit>
                      </li>
                    ))}
                </DroppablePanel>
              )}
            </div>
          </>
        )}
      </div>
    </DndProvider>
  );
}

export default CourseSchedule;
