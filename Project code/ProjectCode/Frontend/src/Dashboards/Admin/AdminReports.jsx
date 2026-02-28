
import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../api/AxiosInstance.jsx';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF0000', '#A2D9CE', '#D2B4DE'];

const AdminReports = () => {
    const [statusDistribution, setStatusDistribution] = useState([]);
    const [complaintTrends, setComplaintTrends] = useState([]);
    const [agentPerformance, setAgentPerformance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchReportData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const statusRes = await axiosInstance.get('/api/admin/reports/status-distribution');
            setStatusDistribution(statusRes.data);

            const trendsRes = await axiosInstance.get('/api/admin/reports/trends');
            setComplaintTrends(trendsRes.data);

            const agentPerfRes = await axiosInstance.get('/api/admin/reports/agent-performance');
            setAgentPerformance(agentPerfRes.data);

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to load report data.';
            setError(errorMessage);
            console.error('Admin Reports error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReportData();
    }, [fetchReportData]);

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="ml-4 text-gray-700">Loading reports...</p>
        </div>
    );

    if (error) return (
        <div className="text-center py-8 text-red-600">
            <p>{error}</p>
        </div>
    );

    return (
        <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">Admin Reports & Analytics</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Complaint Status Distribution</h2>
                    {statusDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statusDistribution}
                                    dataKey="count"
                                    nameKey="status"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    label
                                >
                                    {statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-gray-500 py-4">No status distribution data available.</p>
                    )}
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Complaint Trends (New vs. Resolved)</h2>
                    {complaintTrends.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={complaintTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="newComplaints" stroke="#8884d8" name="New Complaints" activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="resolvedComplaints" stroke="#82ca9d" name="Resolved Complaints" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-gray-500 py-4">No trend data available.</p>
                    )}
                </div>

                <div className="lg:col-span-2 bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Agent Performance (Resolved Complaints)</h2>
                    {agentPerformance.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={agentPerformance} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="agentName" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="resolvedCount" fill="#8884d8" name="Resolved Complaints" />
                                <Bar dataKey="avgResolutionTimeDays" fill="#82ca9d" name="Avg Resolution Days" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-gray-500 py-4">No agent performance data available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminReports;