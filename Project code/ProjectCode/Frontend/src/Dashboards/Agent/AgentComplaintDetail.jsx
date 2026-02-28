// import React, { useEffect, useState, useCallback } from 'react';
// import { useParams } from 'react-router-dom';
// import axiosInstance from '../../api/AxiosInstance';
// import { toast } from 'react-toastify';
// import { useAuth } from '../../context/AuthContext';
// import ComplaintChatSection from './ComplaintChatSection';

// const AssignedComplaintDetail = ({complaint}) => {
//     const { id } = useParams();
//     const { user } = useAuth();
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [newStatus, setNewStatus] = useState('');
//     useEffect(()=>{
//         if(complaint){
//             setLoading(false);
//         }
//     },[])
//     const statusOptions = ['Registered', 'In Progress', 'Resolved', 'Closed', 'Reopened', 'Rejected'];
//     const handleChangeStatus = async () => {
//         try {
//             if (!newStatus || newStatus === complaint.status) return;
//             console.log(newStatus);
//             await axiosInstance.put(`/api/complaint/${complaint._id}/status`, { status: newStatus });
//             toast.success(`Complaint status updated to ${newStatus}!`);
//         } catch (err) {
//             const errorMessage = err.response?.data?.message || 'Failed to change complaint status.';
//             setError(errorMessage);
//             console.error('Error changing status:', err);
//             toast.error(errorMessage);
//         }
//     };

//     if (loading) return (
//         <div className="flex justify-center items-center h-screen">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
//             <p className="ml-4 text-gray-700">Loading complaint details...</p>
//         </div>
//     );

//     if (error) return (
//         <div className="text-center py-8 text-red-600">
//             <p>{error}</p>
//         </div>
//     );

//     if (!complaint) return (
//         <div className="text-center py-8 text-gray-600">
//             <p>Complaint not found.</p>
//         </div>
//     );


//     return (
//         <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg min-h-screen">
//             <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">Complaint Details: {complaint.title}</h1>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//                 <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
//                     <h2 className="text-xl font-semibold text-gray-700 mb-4">Complaint Information</h2>
//                     <div className="space-y-3 text-gray-700">
//                         <p><strong>ID:</strong> {complaint._id}</p>
//                         <p><strong>Description:</strong> {complaint.description}</p>
//                         <p><strong>Customer:</strong> {complaint.userId?.username || complaint.userId?.email || 'N/A'}</p>
//                         <p><strong>Current Status:</strong> <span className="font-semibold">{complaint.status}</span></p>
//                         <p><strong>Assigned To:</strong> {complaint.assignedTo?.username || 'Not Assigned'}</p>
//                         <p><strong>Filed On:</strong> {new Date(complaint.createdAt).toLocaleString()}</p>
//                         {complaint.assignedAt && <p><strong>Assigned On:</strong> {new Date(complaint.assignedAt).toLocaleString()}</p>}
//                         {complaint.status === 'Resolved' && complaint.resolutionDate && 
//                             <p><strong>Resolved On:</strong> {new Date(complaint.resolutionDate).toLocaleString()}</p>}
//                         {complaint.resolutionDetails && <p><strong>Resolution Details:</strong> {complaint.resolutionDetails}</p>}
//                     </div>

//                     <div className="mt-6">
//                         <h3 className="text-lg font-semibold text-gray-700 mb-3">Change Status</h3>
//                         <div className="flex items-center gap-4">
//                             <select
//                                 className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
//                                 value={newStatus}
//                                 onChange={(e) => setNewStatus(e.target.value)}
//                             >
//                                 {statusOptions.map((status) => (
//                                     <option key={status} value={status}>
//                                         {status}
//                                     </option>
//                                 ))}
//                             </select>
//                             <button
//                                 onClick={handleChangeStatus}
//                                 disabled={newStatus === complaint.status}
//                                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
//                             >
//                                 Update Status
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col">
//                     <h2 className="text-xl font-semibold text-gray-700 mb-4">Complaint Chat</h2>
//                     <ComplaintChatSection 
//                         complaintId={complaint._id} 
//                         currentConversations={complaint.conversations} 
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AssignedComplaintDetail;

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../api/AxiosInstance';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import ComplaintChatSection from './ComplaintChatSection';

const AssignedComplaintDetail = ({ complaint, onComplaintUpdated }) => {
    const { id } = useParams();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [resolutionDetails, setResolutionDetails] = useState('');
    const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);

    useEffect(() => {
        if (complaint) {
            setLoading(false);
            setNewStatus(complaint.status);
            if (complaint.status === 'Resolved' && complaint.resolutionDetails) {
                setResolutionDetails(complaint.resolutionDetails);
            } else {
                setResolutionDetails('');
            }
        }
    }, [complaint]);

    const statusOptions = ['Registered', 'In Progress', 'Resolved', 'Closed', 'Reopened', 'Rejected'];

    const handleChangeStatus = async () => {
        if (!newStatus || newStatus === complaint.status) return;

        let dataToSend = { status: newStatus };

        if (newStatus === 'Resolved') {
            if (!resolutionDetails.trim()) {
                toast.error("Please provide resolution details before marking as Resolved.");
                return;
            }
            dataToSend.resolutionDetails = resolutionDetails;
            dataToSend.resolutionDate = new Date().toISOString();
        }

        try {
            await axiosInstance.put(`/api/complaint/${complaint._id}/status`, dataToSend);
            toast.success(`Complaint status updated to ${newStatus}!`);
            if (onComplaintUpdated) {
                onComplaintUpdated();
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to change complaint status.';
            setError(errorMessage);
            console.error(errorMessage);
            toast.error(errorMessage);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="ml-4 text-gray-700">Loading complaint details...</p>
        </div>
    );

    if (error) return (
        <div className="text-center py-8 text-red-600">
            <p>{error}</p>
        </div>
    );

    if (!complaint) return (
        <div className="text-center py-8 text-gray-600">
            <p>Complaint not found.</p>
        </div>
    );

    const isAgentOrAdmin = user && (user.role.includes('agent') || user.role.includes('admin'));

    return (
        <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">Complaint Details: {complaint.title}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Complaint Information</h2>
                    <div className="space-y-3 text-gray-700">
                        <p><strong>ID:</strong> {complaint._id}</p>
                        <p><strong>Description:</strong> {complaint.description}</p>
                        <p><strong>Customer:</strong> {complaint.userId?.username || complaint.userId?.email || 'N/A'}</p>
                        <p><strong>Current Status:</strong> <span className="font-semibold">{complaint.status}</span></p>
                        <p><strong>Assigned To:</strong> {complaint.assignedTo?.username || 'Not Assigned'}</p>
                        <p><strong>Filed On:</strong> {new Date(complaint.createdAt).toLocaleString()}</p>
                        {complaint.assignedAt && <p><strong>Assigned On:</strong> {new Date(complaint.assignedAt).toLocaleString()}</p>}
                        {complaint.status === 'Resolved' && complaint.resolutionDate &&
                            <p><strong>Resolved On:</strong> {new Date(complaint.resolutionDate).toLocaleString()}</p>}
                        {complaint.resolutionDetails && <p><strong>Resolution Details:</strong> {complaint.resolutionDetails}</p>}
                    </div>

                    {isAgentOrAdmin && (
                        <div className="mt-6 border-t pt-4">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">Manage Status & Resolution</h3>
                            <div className="flex flex-col gap-4">
                                <label htmlFor="status-select" className="block text-sm font-medium text-gray-700">Change Status:</label>
                                <select
                                    id="status-select"
                                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    {statusOptions.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>

                                {newStatus === 'Resolved' && (
                                    <div className="mt-4">
                                        <label htmlFor="resolution-details" className="block text-sm font-medium text-gray-700 mb-1">Resolution Details:</label>
                                        <textarea
                                            id="resolution-details"
                                            rows="4"
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-sm resize-y"
                                            placeholder="Enter details of how the complaint was resolved..."
                                            value={resolutionDetails}
                                            onChange={(e) => setResolutionDetails(e.target.value)}
                                        ></textarea>
                                    </div>
                                )}

                                <button
                                    onClick={handleChangeStatus}
                                    disabled={newStatus === complaint.status && (newStatus !== 'Resolved' || resolutionDetails === complaint.resolutionDetails)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Update Complaint
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Complaint Chat</h2>
                    <ComplaintChatSection
                        complaintId={complaint._id}
                        currentConversations={complaint.conversations}
                    />
                </div>
            </div>
        </div>
    );
};

export default AssignedComplaintDetail;