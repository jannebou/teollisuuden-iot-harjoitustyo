import axios from 'axios';
import { useState, useEffect } from 'react';
import './App.css';

const GetGripperLatest = () => {
  const [latestData, setLatestData] = useState("Loading...");

  useEffect(() => {
    const fetchLatestGripper = () => {
      axios.get("http://localhost:5107/api/gripperlatest")
        .then(response => {
          // Ensure to extract only the data needed, avoid the entire object
          setLatestData(response.data ? JSON.stringify(response.data) : "No data available");
        })
        .catch(error => {
          console.error("Error fetching latest gripper data:", error);
          setLatestData("Error loading data");
        });
    };

    fetchLatestGripper(); // Initial fetch
    const interval = setInterval(fetchLatestGripper, 2000); // Fetch every second

    return () => clearInterval(interval); // Cleanup interval
  }, []);

  return <h2>Latest Gripper Data: {latestData}</h2>;
};

const GetGripper = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5107/api/gripper")
      .then(response => {
        // Here, ensure you map over `gripperData` if it's an array
        setData(response.data?.gripperData || []); // Safely handle response
      })
      .catch(error => {
        console.error("Error fetching gripper data:", error);
      });
  }, []);

  return (
    <div>
      <h2>Gripper Data:</h2>
      {data.length > 0 ? (
        <ul>
          {data.map((item, index) => (
            <li key={index}>{JSON.stringify(item)}</li> // Safe rendering of objects
          ))}
        </ul>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
};


function App() {
  return (
    <div className="App">
      <h1>React App</h1>
      <GetGripperLatest/>
      <GetGripper/>
    </div>
  );
}

export default App;