
import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../api/AxiosInstance';
import { toast } from 'react-toastify';
import { FaTasks, FaUserTag, FaUserSlash, FaChartPie, FaChartBar, FaUserTie } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF0000', '#A2D9CE', '#D2B4DE'];

const AdminWorkload = () => {
    const [adminWorkloadData, setAdminWorkloadData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAdminWorkloadData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axiosInstance.get('/api/workload'); 
            setAdminWorkloadData(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to load admin workload data.';
            setError(errorMessage);
            console.error('Admin Workload fetch error:', err);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdminWorkloadData();
    }, [fetchAdminWorkloadData]);

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="ml-4 text-gray-700">Loading admin workload data...</p>
        </div>
    );

    if (error) return (
        <div className="text-center py-8 text-red-600">
            <p>{error}</p>
        </div>
    );

    if (!adminWorkloadData) return null; 

    const { overall, systemStatusDistribution, systemDailyTrends, agentWorkloadDetails } = adminWorkloadData;

    const pieChartData = systemStatusDistribution.length > 0
        ? systemStatusDistribution.filter(item => item.value > 0)
        : [{ name: 'No Data', value: 1 }];

    return (
        <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">Admin Workload Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-5xl font-extrabold">{overall.total}</p>
                        <p className="text-lg font-medium mt-1">Total Complaints</p>
                    </div>
                    <FaTasks className="text-6xl opacity-30" />
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-5xl font-extrabold">{overall.assigned}</p>
                        <p className="text-lg font-medium mt-1">Assigned Complaints</p>
                    </div>
                    <FaUserTag className="text-6xl opacity-30" />
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-5xl font-extrabold">{overall.unassigned}</p>
                        <p className="text-lg font-medium mt-1">Unassigned Complaints</p>
                    </div>
                    <FaUserSlash className="text-6xl opacity-30" />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                <div className="bg-gray-50 rounded-lg shadow-sm p-6 border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                        <FaChartPie className="mr-2 text-blue-500" /> System-Wide Status Distribution
                    </h4>
                    {pieChartData.length === 1 && pieChartData[0].name === 'No Data' ? (
                         <p className="text-gray-500 text-center py-8">No system-wide complaint data to display.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieChartData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="bg-gray-50 rounded-lg shadow-sm p-6 border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                        <FaChartBar className="mr-2 text-blue-500" /> System-Wide Daily Trends (New vs. Resolved)
                    </h4>
                    {systemDailyTrends.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No trend data available for the last 7 days.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={systemDailyTrends}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="newComplaints" fill="#8884d8" name="New Complaints" />
                                <Bar dataKey="resolvedComplaints" fill="#82ca9d" name="Resolved Complaints" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Agent Workload Details Table */}
            <div className="bg-gray-50 rounded-lg shadow-sm p-6 border border-gray-100">
                <h4 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <FaUserTie className="mr-2 text-blue-500" /> Individual Agent Workload
                </h4>
                {agentWorkloadDetails.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No agents found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold">Agent Name</th>
                                    <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold">Assigned</th>
                                    <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold">Pending</th>
                                    <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold">In Progress</th>
                                    <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold">Resolved Today</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agentWorkloadDetails.map(agent => (
                                    <tr key={agent._id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4 text-gray-700 font-medium">{agent.username || agent.email}</td>
                                        <td className="py-3 px-4 text-gray-700">{agent.assigned}</td>
                                        <td className="py-3 px-4 text-gray-700">{agent.pending}</td>
                                        <td className="py-3 px-4 text-gray-700">{agent.inProgress}</td>
                                        <td className="py-3 px-4 text-gray-700">{agent.resolvedToday}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminWorkload;