import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";

const DataVisualization = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:8000/results/${id}`).then(res => setData(res.data));
  }, [id]);

  if (!data) return <h1>Loading...</h1>;

  return (
    <div
      className="min-h-screen p-10 text-white"
      style={{ backgroundImage: "url('/assets/bg.jpg')" }}
    >
      <h1 className="text-4xl font-bold mb-10">Prediction Results</h1>

      {Object.entries(data.results).map(([trait, values]) => (
        <div key={trait} className="glass p-6 rounded-xl mb-10">
          <Line
            data={{
              labels: values.map((_, i) => i+1),
              datasets: [{ label: trait, data: values, borderWidth: 2 }]
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default DataVisualization;
