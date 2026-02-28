
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'react-toastify';
import { FaTasks, FaClock, FaHourglassHalf, FaCheckCircle, FaChartPie, FaChartBar } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import axiosInstance from "../../api/AxiosInstance.jsx"
const COLORS = ['#0088FE', '#FFBB28', '#FF8042', '#00C49F', '#AF19FF'];

const AgentWorkloadPage = () => {
    const { user } = useAuth();
    const token=localStorage.getItem('jwtToken');
    const [workload, setWorkload] = useState({
        assigned: 0,
        pending: 0,
        inProgress: 0,
        resolvedToday: 0,
        statusDistribution: [],
        dailyResolved: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchWorkload = async () => {
            if (!user?._id) {
                setLoading(false);
                return;
            }
            setLoading(true);
            setError('');
            try {
                const response = await axiosInstance.get(`/api/${user._id}/workload`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.status!==200) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = response.data;
                setWorkload(data);
            } catch (err) {
                console.error("Failed to fetch agent workload:", err);
                setError("Failed to load workload. Please try again.");
                toast.error("Failed to load workload.");
            } finally {
                setLoading(false);
            }
        };

        fetchWorkload();
    }, [user, token]);

    const pieChartData = workload.statusDistribution.length > 0
        ? workload.statusDistribution.filter(item => item.value > 0)
        : [{ name: 'No Data', value: 1 }]; 
    const barChartData = workload.dailyResolved.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: item.count
    }));

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8 animate-pulse border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">My Workload Summary</h3>
                <p className="text-gray-500 text-center py-10">Loading your workload data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 rounded-lg shadow-md p-8 border border-red-200 text-red-700">
                <h3 className="text-2xl font-bold mb-6">My Workload Summary</h3>
                <p className="text-center">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-8">My Workload Summary</h3>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white p-6 rounded-lg shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-5xl font-extrabold">{workload.assigned}</p>
                        <p className="text-lg font-medium mt-1">Assigned Complaints</p>
                    </div>
                    <FaTasks className="text-6xl opacity-30" />
                </div>
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white p-6 rounded-lg shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-5xl font-extrabold">{workload.pending}</p>
                        <p className="text-lg font-medium mt-1">Pending My Action</p>
                    </div>
                    <FaHourglassHalf className="text-6xl opacity-30" />
                </div>
                <div className="bg-gradient-to-r from-purple-400 to-purple-500 text-white p-6 rounded-lg shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-5xl font-extrabold">{workload.inProgress}</p>
                        <p className="text-lg font-medium mt-1">In Progress</p>
                    </div>
                    <FaClock className="text-6xl opacity-30" />
                </div>
                <div className="bg-gradient-to-r from-green-400 to-green-500 text-white p-6 rounded-lg shadow-lg flex items-center justify-between">
                    <div>
                        <p className="text-5xl font-extrabold">{workload.resolvedToday}</p>
                        <p className="text-lg font-medium mt-1">Resolved Today</p>
                    </div>
                    <FaCheckCircle className="text-6xl opacity-30" />
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Complaint Status Distribution Pie Chart */}
                <div className="bg-gray-50 rounded-lg shadow-sm p-6 border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                        <FaChartPie className="mr-2 text-blue-500" /> Complaint Status Distribution
                    </h4>
                    {pieChartData.length === 1 && pieChartData[0].name === 'No Data' ? (
                         <p className="text-gray-500 text-center py-8">No complaint data to display.</p>
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

                {/* Daily Resolved Complaints Bar Chart */}
                <div className="bg-gray-50 rounded-lg shadow-sm p-6 border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                        <FaChartBar className="mr-2 text-blue-500" /> Daily Resolved Complaints (Last 7 Days)
                    </h4>
                    {barChartData.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No resolved complaints in the last 7 days.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={barChartData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <XAxis dataKey="date" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#82ca9d" name="Resolved Complaints" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Optional: Add a link or button to view all complaints based on status */}
            <div className="mt-8 text-center">
                <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150">
                    View All My Complaints
                </button>
            </div>
        </div>
    );
};

export default AgentWorkloadPage;