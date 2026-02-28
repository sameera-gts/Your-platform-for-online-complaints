import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {ComplaintDetailInfo} from "./ComplaintDetailInfo.jsx"
import ComplaintChatSection from "./ComplaintChatSection.jsx"
export const ComplaintDetailContent = ({ complaint,onFeedbackSubmit }) => {
    const {user}=useAuth();
     if (!complaint) {
        return <p className="text-center text-gray-700 text-lg mt-10">Complaint not found.</p>;
    }

    return (
        <div className="grid   gap-6 p-6 bg-gray-100 min-h-screen">
            <div className=" flex flex-col space-y-6">
                <ComplaintDetailInfo complaint={complaint} currentUserId={user?._id} onFeedbackSubmit={onFeedbackSubmit}/>
            </div>

            <div className="lg:col-span-1 flex flex-col h-full">
                <ComplaintChatSection
                    complaintId={complaint?._id}
                    currentConversations={complaint.conversations}
                />
            </div>
        </div>
    )
};