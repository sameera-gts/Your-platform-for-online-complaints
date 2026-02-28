import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../api/AxiosInstance';
import { useSocket } from '../../context/ScoketContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminChatWindow from "./AdminChat";

const AdminDashboardComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { socket } = useSocket();
    const [selectedComplaintForChat, setSelectedComplaintForChat] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const complaintsRes = await axiosInstance.get('/api/allComplaints');
            setComplaints(complaintsRes.data);

            const agentsRes = await axiosInstance.get('/api/users/agents');
            setAgents(agentsRes.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to load dashboard data.';
            setError(errorMessage);
            console.error('Admin Dashboard error:', err);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();

        if (socket) {
            socket.emit('admin_alerts');

            const handleNewComplaintRegistered = (data) => {
                setComplaints(prevComplaints => {
                    const exists = prevComplaints.some(c => c._id === data.complaint._id);
                    if (!exists) {
                        toast.info(`New Complaint: "${data.complaint.title}" by ${data.complaint.userId?.username || data.complaint.userId?.email}`);
                        return [data.complaint, ...prevComplaints];
                    }
                    return prevComplaints;
                });
            };

            const handleNewMessageForUnassigned = (data) => {
                setComplaints(prevComplaints => prevComplaints.map(complaint => {
                    if (complaint._id === data.complaintId && !complaint.assignedTo) {
                        toast.info(`New Message in unassigned complaint "${complaint.title}"`);
                        return {
                            ...complaint,
                            hasNewUnassignedMessage: true
                        };
                    }
                    return complaint;
                }));
            };
            
            socket.on('newComplaintRegister', handleNewComplaintRegistered);
            socket.on('newMessage', handleNewMessageForUnassigned);

            return () => {
                socket.off('newComplaintRegister', handleNewComplaintRegistered);
                socket.off('newMessage', handleNewMessageForUnassigned);
            };
        }
    }, [socket, fetchDashboardData]);

    const handleAssignAgent = async (complaintId, agentId) => {
        try {
            await axiosInstance.put(`/api/complaint/${complaintId}/assign`, { agentId });
            setComplaints(prevComplaints => prevComplaints.map(c => {
                if (c._id === complaintId) {
                    const assignedAgent = agents.find(a => a._id === agentId);
                    const newStatus = c.status === 'Registered' ? 'In Progress' : c.status;
                    if (selectedComplaintForChat?._id === complaintId) {
                        setSelectedComplaintForChat(null);
                    }
                    return {
                        ...c,
                        assignedTo: assignedAgent,
                        status: newStatus,
                        hasNewUnassignedMessage: false
                    };
                }
                return c;
            }));
            toast.success('Agent assigned successfully!');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to assign agent.';
            setError(errorMessage);
            console.error('Error assigning agent:', err);
            toast.error(errorMessage);
        }
    };

    const handleChangeStatus = async (complaintId, newStatus) => {
        try {
            await axiosInstance.put(`/api/complaint/${complaintId}/status`, { status: newStatus });
            setComplaints(prevComplaints =>
                prevComplaints.map((c) => (c._id === complaintId ? { ...c, status: newStatus } : c))
            );
            toast.success(`Complaint status updated to ${newStatus}!`);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to change complaint status.';
            setError(errorMessage);
            console.error('Error changing status:', err);
            toast.error(errorMessage);
        }
    };

    const handleChatWithUser = (complaint) => {
        setSelectedComplaintForChat(complaint);
    };

    const handleCloseChat = () => {
        setSelectedComplaintForChat(null);
    };

    const statusOptions = ['Registered', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'];

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="ml-4 text-gray-700">Loading complaints...</p>
        </div>
    );

    if (error) return (
        <div className="text-center py-8 text-red-600">
            <p>{error}</p>
        </div>
    );

    if (complaints.length === 0 && !loading) return (
        <div className="text-center py-8 text-gray-600">
            <p>No complaints found.</p>
        </div>
    );

    return (
        <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">Admin Dashboard</h1>

            <h2 className="text-2xl font-semibold text-gray-700 mb-4 mt-8">All Complaints</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold">ID</th>
                            <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold">Title</th>
                            <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold">Customer</th>
                            <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold">Status</th>
                            <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold">Assigned To</th>
                            <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold">Date Filed</th>
                            <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold">Actions</th>
                            <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold">Assign Agent</th>
                        </tr>
                    </thead>
                    <tbody>
                        {complaints.map((complaint) => (
                            <tr
                                key={complaint._id}
                                className={`border-b hover:bg-gray-50 ${complaint.hasNewUnassignedMessage ? 'bg-orange-50' : ''}`}
                            >
                                <td className="py-3 px-4 text-gray-700 text-sm">{complaint._id.substring(0, 8)}...</td>
                                <td className="py-3 px-4 text-gray-700 text-sm">{complaint.title}</td>
                                <td className="py-3 px-4 text-gray-700 text-sm">
                                    {complaint.userId?.username || complaint.userId?.email || 'N/A'}
                                </td>
                                <td className="py-3 px-4">
                                    <select
                                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                                        value={complaint.status}
                                        onChange={(e) => handleChangeStatus(complaint._id, e.target.value)}
                                    >
                                        {statusOptions.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="py-3 px-4 text-gray-700 text-sm">
                                    {complaint.assignedTo ? complaint.assignedTo.name : 'Not Assigned'}
                                </td>
                                <td className="py-3 px-4 text-gray-700 text-sm">
                                    {new Date(complaint.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4">
                                    <button
                                        onClick={() => handleChatWithUser(complaint)}
                                        className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm transition-colors duration-200"
                                    >
                                        View / Chat
                                    </button>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="relative inline-block w-full text-sm">
                                        <select
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent pr-8 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            value={complaint.assignedTo ? complaint.assignedTo._id : ''}
                                            onChange={(e) => handleAssignAgent(complaint._id, e.target.value)}
                                            disabled={!!complaint.assignedTo}
                                        >
                                            <option value="">
                                                None
                                            </option>
                                            {agents.map((agent) => (
                                                <option key={agent._id} value={agent._id}>
                                                    {agent.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z"/></svg>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {selectedComplaintForChat && (
                <AdminChatWindow
                    complaint={selectedComplaintForChat}
                    onCloseChat={handleCloseChat}
                />
            )}
        </div>
    );
};

export default AdminDashboardComplaints;