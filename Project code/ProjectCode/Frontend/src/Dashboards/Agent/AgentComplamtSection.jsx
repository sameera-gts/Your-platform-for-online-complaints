import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../api/AxiosInstance';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/ScoketContext';
import AssignedComplaintDetail from "./AgentComplaintDetail"
const AgentComplaintsSection = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const handleViewComplaint = (complaint) => {
            setSelectedComplaint(complaint);
        };
    const fetchAgentComplaints = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axiosInstance.get('/api/my');
            setComplaints(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch complaints.';
            setError(errorMessage);
            console.error('Agent Complaints fetch error:', err);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAgentComplaints();

        if (socket && user?._id) {
            socket.emit(user._id.toString());

            const handleComplaintAssigned = () => {
                toast.info('A new complaint has been assigned to you!');
                fetchAgentComplaints();
            };

            const handleNewChatNotification = (data) => {
                const isAssignedToMe = complaints.some(c => c._id === data.complaintId && c.assignedTo?._id === user._id);
                if (isAssignedToMe && data.sender !== user._id) {
                     toast.info(`New message in complaint "${data.title || data.complaintId}" from ${data.senderUsername || 'Customer'}`);
                }
                fetchAgentComplaints();
            };

            socket.on('complaintAssigned', handleComplaintAssigned);
            socket.on('newChatNotification', handleNewChatNotification);

            return () => {
                socket.off('complaintAssigned', handleComplaintAssigned);
                socket.off('newChatNotification', handleNewChatNotification);
            };
        }
    }, [fetchAgentComplaints, socket, user]);

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="ml-4 text-gray-700">Loading your complaints...</p>
        </div>
    );

    if (error) return (
        <div className="text-center py-8 text-red-600">
            <p>{error}</p>
        </div>
    );

    return (
        <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">My Assigned Complaints</h1>

            {complaints.length === 0 ? (
                <p className="text-center text-gray-600 text-lg py-10">No complaints currently assigned to you.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold">Complaint ID</th>
                                <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold">Title</th>
                                <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold">Customer</th>
                                <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold">Status</th>
                                <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold">Filed On</th>
                                <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold">Last Update</th>
                                <th className="py-3 px-4 border-b text-left text-gray-600 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {complaints.map((complaint) => (
                                <tr key={complaint._id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4 text-gray-700 text-sm">{complaint._id.substring(0, 8)}...</td>
                                    <td className="py-3 px-4 text-gray-700 text-sm">{complaint.title}</td>
                                    <td className="py-3 px-4 text-gray-700 text-sm">
                                        {complaint.userId?.username || complaint.userId?.email || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-gray-700 text-sm">{complaint.status}</td>
                                    <td className="py-3 px-4 text-gray-700 text-sm">
                                        {new Date(complaint.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-4 text-gray-700 text-sm">
                                        {new Date(complaint.updatedAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-4">
                                        <h1
                                            onClick={()=>handleViewComplaint(complaint)}
                                            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm transition-colors duration-200"
                                        >
                                            View Details / Chat
                                        </h1>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
             {selectedComplaint && (
                <div className="mt-8">
                    <AssignedComplaintDetail 
                        complaint={selectedComplaint} 
                        
                    />
                    <div className="mt-4 text-center">
                        <button 
                            onClick={() => setSelectedComplaint(null)} 
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
                        >
                            Back to List
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentComplaintsSection;