import React from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { FaTasks, FaClock, FaHourglassHalf, FaCheckCircle, FaChartPie, FaChartBar } from 'react-icons/fa';
export const DashboardOverviewPage = ({heading1,heading2,heading3,total,pending,resolved,IconLinks}) => {

  const totalSubmissions = total;
  const pendingSubmissions =pending;
  const resolvedSubmissions = resolved;

  const resolutionRate = (resolvedSubmissions / totalSubmissions) * 100;
  const pendingPercentage = (pendingSubmissions / totalSubmissions) * 100;

  const submissionDataForBar = [
    { name: 'Total', value: totalSubmissions, color: '#007FFF' },
    { name: 'Pending', value: pendingSubmissions, color: '#FFD700' },
    { name: 'Resolved', value: resolvedSubmissions, color: '#32CD32' },
  ];

  const submissionDataForPie = [
    { name: 'Pending', value: pendingSubmissions, color: '#FFD700' },
    { name: 'Resolved', value: resolvedSubmissions, color: '#32CD32' },
  ];

  return (
    <div className="px-4 py-6 font-serif bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
  
          <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white p-6 rounded-lg shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-3xl font-extrabold">{heading1}</p>
                        <p className="text-2xl font-medium mt-1">{totalSubmissions.toLocaleString()}</p>
                        <p className="text-lg text-gray-700">All complaints received.</p>
                    </div>
                    <FaTasks className="text-6xl opacity-30" />
                </div>
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white p-6 rounded-lg shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-3xl font-extrabold">{heading2}</p>
                        <p className="text-2xl font-medium mt-1">{pendingSubmissions.toLocaleString()}</p>
                          <p className="text-lg text-gray-700">total pending complaints are {pendingPercentage.toFixed(2)}%</p>
                    </div>
                    <FaHourglassHalf className="text-6xl opacity-30" />
                </div>
                <div className="bg-gradient-to-r from-green-400 to-green-500 text-white p-6 rounded-lg shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-3xl font-extrabold">{heading3}</p>
                        <p className="text-2xl font-medium mt-1">{resolvedSubmissions.toLocaleString()}</p>
                          <p className="text-lg text-gray-700">Total resolved complaints are {resolutionRate.toFixed(2)}%</p>
                    </div>
                    <FaClock className="text-6xl opacity-30" />
                </div>

        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
          <h2 className="text-2xl font-extrabold text-[#007FFF] mb-4">
            Submission Status Overview
          </h2>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={submissionDataForBar}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="name" stroke="#555" />
                <YAxis stroke="#555" />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Legend />
                <Bar dataKey="value" name="Count">
                  {submissionDataForBar.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-600 mt-4 text-center">
            Visual representation of total, pending, and resolved submissions.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
          <h2 className="text-2xl font-extrabold text-[#007FFF] mb-4">
            Resolution Progress
          </h2>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={submissionDataForPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {submissionDataForPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-600 mt-4 text-center">
            Percentage breakdown of pending versus resolved submissions.
          </p>
        </div>
      </div>

      <div className="w-full">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-extrabold text-[#007FFF] mb-4">
            Quick Actions
          </h2>
          <div className="space-y-4">
          <Link to={IconLinks[0].link}>
            <button className="w-full bg-[#007FFF] hover:bg-[#005bb5] text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {IconLinks[0].name}
            </button>
            </Link>
            <Link to={IconLinks[1].link}>
            <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {IconLinks[1].name}
            </button>
            </Link>
            <Link to={IconLinks[2].link}>
            <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              {IconLinks[2].name}
            </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};