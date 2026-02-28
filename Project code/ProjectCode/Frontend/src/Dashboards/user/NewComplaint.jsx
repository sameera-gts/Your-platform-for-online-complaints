import React from 'react'
import AddComplaintForm from "../../Pages/Dashboard/AddComplaintForm"
import axiosInstance from "../../api/AxiosInstance"

export const NewComplaint = () => {
    const handleComplaintSubmit = async (data) => {
        const complaintFormData = new FormData();

        complaintFormData.append('title', data.title);
        complaintFormData.append('description', data.description);
        complaintFormData.append('productName', data.productName);
        complaintFormData.append('purchaseDate', data.purchaseDate);
        complaintFormData.append('contactDetails', JSON.stringify(data.contactDetails));
        complaintFormData.append('status', data.status);
        complaintFormData.append('createdAt', data.createdAt.toISOString());
        complaintFormData.append('updatedAt', data.updatedAt.toISOString());
        console.log(data);
        data.attachments.forEach(file => {
            complaintFormData.append('attachments', file);
        });

        try {
            const response = await axiosInstance.post('/api/complaint',complaintFormData);
            if (response.status === 200 || response.status === 201) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    const onFormCancel = () => {
        console.log("cancelled");
    }

    return (
        <AddComplaintForm
            onComplaintSubmit={handleComplaintSubmit}
            onCancel={onFormCancel}
        />
    )
}