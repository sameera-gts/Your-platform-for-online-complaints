import React, { useState } from 'react';

const AddComplaintForm = ({ onComplaintSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    productName: '',
    purchaseDate: '',
    contactDetails: {
      email: '',
      phoneNumber: '',
      address: '',
    },
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submissionStatus, setSubmissionStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('contactDetails.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactDetails: {
          ...prev.contactDetails,
          [field]: value,
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    setFormErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Complaint title is required.';
    if (!formData.description.trim()) errors.description = 'Complaint description is required.';
    if (!formData.contactDetails.email.trim()) errors['contactDetails.email'] = 'Email is required.';
    if (formData.contactDetails.email.trim() && !/\S+@\S+\.\S+/.test(formData.contactDetails.email)) errors['contactDetails.email'] = 'Email is invalid.';
    if (!formData.contactDetails.phoneNumber.trim()) errors['contactDetails.phoneNumber'] = 'Phone number is required.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setSubmissionStatus('error');
      return;
    }

    setSubmissionStatus('submitting');

  

    const complaintData = {
      ...formData,
      attachments:selectedFiles,
      status: 'Registered',
      createdAt: new Date(),
      updatedAt: new Date(),
    
    };

    try {
    const response= await onComplaintSubmit(complaintData);
      if(response){
        setSubmissionStatus('success');
      setFormData({
        title: '',
        description: '',
        productName: '',
        purchaseDate: '',
        contactDetails: {
          email: '',
          phoneNumber: '',
          address: '',
        },
      });
      setSelectedFiles([]);
      setFormErrors({});
      }
      else{
        setSubmissionStatus('failed');
      }
    
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setSubmissionStatus('error');
      setFormErrors({ general: 'Failed to submit complaint. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  font-inter ">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Register New Complaint</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Complaint Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${formErrors.title ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-400'}`}
              placeholder="e.g., Damaged Product, Billing Error"
            />
            {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description of the Issue <span className="text-red-500">*</span></label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${formErrors.description ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-400'} resize-y`}
              placeholder="Provide detailed information about your complaint..."
            ></textarea>
            {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">Product/Service Name</label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g., Smartphone X, Premium Cloud Service"
              />
            </div>
            <div>
              <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
              <input
                type="date"
                id="purchaseDate"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <fieldset className="border border-gray-300 p-4 rounded-lg">
            <legend className="text-lg font-semibold text-gray-800 px-2 -ml-2">Your Contact Details</legend>
            <div className="space-y-4 mt-2">
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactDetails.email"
                  value={formData.contactDetails.email}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${formErrors['contactDetails.email'] ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-400'}`}
                  placeholder="your.email@example.com"
                />
                {formErrors['contactDetails.email'] && <p className="text-red-500 text-xs mt-1">{formErrors['contactDetails.email']}</p>}
              </div>
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactDetails.phoneNumber"
                  value={formData.contactDetails.phoneNumber}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${formErrors['contactDetails.phoneNumber'] ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-400'}`}
                  placeholder="e.g., +1234567890"
                />
                {formErrors['contactDetails.phoneNumber'] && <p className="text-red-500 text-xs mt-1">{formErrors['contactDetails.phoneNumber']}</p>}
              </div>
              <div>
                <label htmlFor="contactAddress" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  id="contactAddress"
                  name="contactDetails.address"
                  value={formData.contactDetails.address}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Street, City, State, Zip"
                />
              </div>
            </div>
          </fieldset>

          <div>
            <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-1">Attachments (Optional)</label>
            <input
              type="file"
              id="attachments"
              name="attachments"
              multiple
              onChange={handleFileChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">Selected Files:</p>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                    <span className="text-sm text-gray-800 truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {submissionStatus === 'submitting' && (
            <div className="text-center text-blue-600 font-medium">Submitting complaint...</div>
          )}
          {submissionStatus === 'success' && (
            <div className="text-center text-green-600 font-medium">Complaint submitted successfully!</div>
          )}
          {submissionStatus === 'error' && (
            <div className="text-center text-red-600 font-medium">
              {formErrors.general || 'There was an error submitting your complaint.'}
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-150 ease-in-out"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              disabled={submissionStatus === 'submitting'}
            >
              Submit Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddComplaintForm;
