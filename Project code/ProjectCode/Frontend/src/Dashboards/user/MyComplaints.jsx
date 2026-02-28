    import React, { useState, useEffect } from 'react';
    import axiosInstance from "../../api/AxiosInstance";
    import {ComplaintListTable} from "../../Pages/Dashboard/ComplaintTable"
    import {ComplaintDetailContent} from "../../Pages/Dashboard/ComplaintDetail"
    import { toast } from 'react-toastify';
    import { useSocket } from "../../context/ScoketContext"
    import { useAuth } from "../../context/AuthContext";
    export const MyComplaints = () => {
    const {socket}=useSocket();
    const { user }=useAuth();
    const [viewMode, setViewMode] = useState('list');
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [loading,setLoading]=useState(false);
    const [complaint,setComplaint]=useState();
    useEffect(()=>{
        setLoading(true);
        const fetch=async(req,res)=>{
            try{
            const response=await axiosInstance.get('/api/my');
            if(response.status===200 || response.status===201){
                setComplaint(response.data);
                console.log(response.data)
            }
            else{
                alert("error");
            }
        }catch(error){
            console.log(error);
        }
        finally{
            setLoading(false);
        }
        }
    fetch();
    },[])
    useEffect(()=>{
        if(socket){
            socket.emit(user?.id);
            const complaintStatusUpdate = (data) => {
                const { complaintId, newStatus, complaint } = data;
                toast.info(`A Complaint Status is Updated ${newStatus}`);
                setComplaint(prevComplaints => {
                    return prevComplaints.map(comp => {
                        if (comp?._id?.toString() === complaintId) {
                            return complaint;
                        }
                        return comp;
                    });
                });
            };
            socket.on("complaintStatusUpdate",complaintStatusUpdate);

            return ()=>{
                socket.off("complaintStatusUpdate",complaintStatusUpdate);
            }
        }
    })
    const handleViewComplaint = (complaint) => {
        setSelectedComplaint(complaint);
        setViewMode('detail');
    };
    const onFeedbackSubmit=async(id,data)=>{
        try{
        const response=await axiosInstance.put(`/api/complaint/${id}/feedback`,data);
        if(response.status===200){
            toast.info("successfully submited the feedback.");
        }
        }
        catch(error){
            console.log(error);
            toast.info("error submitting the feedback")
        }
    }
    const handleBackToList = () => {
        setSelectedComplaint(null);
        setViewMode('list');
    };
    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="ml-4 text-gray-700">Loading complaints...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br  font-inter ">
        <div className="max-w-9xl mx-auto bg-white rounded-xl  overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <h1 className="text-3xl font-bold text-gray-800">
                {viewMode === 'list' ? 'My Complaints' : 'Complaint Details'}
            </h1>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto items-center">
                {viewMode === 'detail' && (
                <button
                    onClick={handleBackToList}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white font-medium rounded-lg shadow hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition ease-in-out duration-150"
                >
                    ← Back to List
                </button>
                )}
            </div>
            </div>

            {viewMode === 'list' ? (
            <ComplaintListTable complaints={complaint} onView={handleViewComplaint} />
            ) : (
            selectedComplaint && (
                <ComplaintDetailContent
                complaint={selectedComplaint}
                onFeedbackSubmit={onFeedbackSubmit}
                />
            )
            )}
        </div>
        </div>
    );
    };