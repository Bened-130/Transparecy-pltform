import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Candidate {
  id: string;
  name: string;
  party: string;
  color: string;
  votes: number;
}

interface LiveTallyProps {
  candidates: Candidate[];
  totalVotes: number;
  lastUpdated: string;
}

export const LiveTally: React.FC<LiveTallyProps> = ({ candidates, totalVotes, lastUpdated }) => {
  const [chartData, setChartData] = useState<
    Array<{ name: string; votes: number; percentage: number }>
  >([]);

  useEffect(() => {
    const data = candidates.map((candidate) => ({
      name: candidate.name,
      votes: candidate.votes,
      percentage: totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0,
    }));
    setChartData(data);
  }, [candidates, totalVotes]);

  const COLORS = candidates.map((c) => c.color);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Live Vote Tally</h2>
        <p className="text-gray-500 text-sm">Last updated: {new Date(lastUpdated).toLocaleTimeString()}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Bar dataKey="votes" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="percentage"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vote Summary Table */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-700">Candidate</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Party</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-right">Votes</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-right">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index] }}
                    ></div>
                    {row.name}
                  </div>
                </td>
                <td className="px-4 py-3">{candidates[index]?.party}</td>
                <td className="px-4 py-3 text-right font-semibold">{row.votes.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{row.percentage.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
