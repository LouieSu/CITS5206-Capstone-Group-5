import './App.css';
import axios from 'axios';

function App() {

  // initial API call for test purpose
  axios.get('api/setup_signal')
  .then(response => {
    console.log(response.data);  // Response from Django API
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });


  return (
    <div className="App" style={styles.app}>
      <div style={styles.rectangle}>
        <div style={styles.textLine}>UWA</div>
        <div style={styles.textLine}>Study Planner</div>
      </div>
      <div style={styles.formContainer}>
        <div style={styles.dropdownContainer}>
          <div style={styles.dropdownTitle}>Select Your Course</div>
          <select style={styles.dropdown}>
            <option value="mit">Master of Information Technology</option>
            <option value="mds">Master of Data Science</option>
          </select>
        </div>
        <div style={styles.dropdownContainer}>
          <div style={styles.dropdownTitle}>Start Year</div>
          <select style={styles.dropdown}>
            <option value="2024-s1">2024 S1</option>
            <option value="2024-s2">2024 S2</option>
            <option value="2025-s1">2025 S1</option>
            <option value="2025-s2">2025 S2</option>
          </select>
        </div>
      </div>
    </div>
  );
}

const styles = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f9f9f9',
    margin: 0,
    fontFamily: 'Arial, sans-serif',
  },
  rectangle: {
    backgroundColor: '#333',
    color: '#fff',
    padding: '30px 50px',
    textAlign: 'center',
    borderRadius: '12px',
    marginBottom: '30px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  textLine: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '10px 0',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  dropdownContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  dropdownTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#555',
  },
  dropdown: {
    padding: '12px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    cursor: 'pointer',
    outline: 'none',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  },
};

export default App;
