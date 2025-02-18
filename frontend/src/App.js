import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import './App.css';

const GetGripperLatest = ({ onNewData }) => {
  const [latestData, setLatestData] = useState(null);
  const lastFetchedData = useRef(null); // Store last fetched data to prevent duplicates

  useEffect(() => {
    const fetchLatestGripper = async () => {
      try {
        const response = await axios.get("http://localhost:5107/api/gripperlatest");
        if (response.data && response.data._embedded?._state?.length > 0) {
          const cleanData = response.data._embedded._state[0];

          // Update latest data
          setLatestData(cleanData);

          // Only add new data to history if it is different from the last one
          if (JSON.stringify(cleanData) !== JSON.stringify(lastFetchedData.current)) {
            lastFetchedData.current = cleanData; // Update reference
            onNewData(cleanData); // Add to history
          }
        }
      } catch (error) {
        console.error("Error fetching latest gripper data:", error);
        setLatestData(null);
      }
    };

    fetchLatestGripper();
    const interval = setInterval(fetchLatestGripper, 1000); // Update every 1 second

    return () => clearInterval(interval);
  }, [onNewData]);

  return (
    <div className="container">
      <h2>Latest Gripper Data:</h2>
      {latestData ? <GripperTable data={[latestData]} /> : <p className="loading-text">Loading...</p>}
    </div>
  );
};

const GetGripperHistory = ({ history }) => (
  <div className="container">
    <h2>Gripper State History:</h2>
    {history.length > 0 ? <GripperTable data={history} /> : <p className="loading-text">No history available.</p>}
  </div>
);

const GripperTable = ({ data }) => {
  if (!data.length) return <p className="loading-text">No data available</p>;

  const headers = Object.keys(data[0]).filter(key => !["_links", "_type", "_title"].includes(key));

  return (
    <table className="data-table">
      <thead>
        <tr>
          {headers.map((key, index) => <th key={index}>{key}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {headers.map((key, colIndex) => (
              <td key={colIndex}>{typeof row[key] === "object" ? JSON.stringify(row[key]) : row[key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

function App() {
  const [gripperHistory, setGripperHistory] = useState([]);

  const handleNewGripperData = (newData) => {
    setGripperHistory(prevHistory => [newData, ...prevHistory]); // Add new state to history
  };

  return (
    document.title = "Teollisuuden IoT Harjoitustyö",
    <div className="app">
      <h1 className="title">Teollisuuden IoT Harjoitustyö</h1>
      <GetGripperLatest onNewData={handleNewGripperData} />
      <GetGripperHistory history={gripperHistory} />
    </div>
  );
}

export default App;
