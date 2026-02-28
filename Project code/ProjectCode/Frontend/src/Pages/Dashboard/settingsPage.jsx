import React, { useState, useEffect } from 'react';
import axiosInstance from "../../api/AxiosInstance";

const simulateApiCall = (data, delay = 1000) => {
  return new Promise(resolve => setTimeout(() => resolve(data), delay));
};

const SettingsPage = ({ userId, initialUserData }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const token = localStorage.getItem('jwtToken');

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    gender: '',
    age: '',
  });
  const [profileEditStatus, setProfileEditStatus] = useState('');
  const [profileFormErrors, setProfileFormErrors] = useState({});

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    otp: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordChangeStatus, setPasswordChangeStatus] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [passwordFormErrors, setPasswordFormErrors] = useState({});

  useEffect(() => {
    if (initialUserData) {
      console.log(initialUserData);
      setUserData({
        name: initialUserData.name || '', 
        email: initialUserData.email || '',
        gender: initialUserData.gender || '',
        age: initialUserData.age || '',
      });
    }
  }, [initialUserData, userId]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    setProfileFormErrors(prev => ({ ...prev, [name]: undefined }));
    setProfileEditStatus('');
  };

  const validateProfileForm = () => {
    const errors = {};
    if (!userData.name.trim()) errors.name = 'Name is required.';
    if (!userData.email.trim()) errors.email = 'Email is required.';
    if (userData.email.trim() && !/\S+@\S+\.\S+/.test(userData.email)) errors.email = 'Invalid email format.';
    if (userData.age && (isNaN(userData.age) || userData.age < 1 || userData.age > 100)) errors.age = 'Age must be between 1 and 100.';
    setProfileFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfileForm()) {
      setProfileEditStatus('error');
      return;
    }

    setProfileEditStatus('submitting');
    try {
      const response = await axiosInstance.post('/api/setting', { userData }, { headers: { Authorization: `Bearer ${token}` } });
      if (response.status === 200) {
        console.log('Profile update response:', response);
        setProfileEditStatus('success');
      } else {
        setProfileEditStatus('error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileEditStatus('error');
      setProfileFormErrors(prev => ({ ...prev, general: 'Failed to update profile. Please try again.' }));
    }
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    setPasswordFormErrors(prev => ({ ...prev, [name]: undefined }));
    setPasswordChangeStatus('');
  };

  const handleSendOtp = async () => {
    if (!passwordForm.currentPassword.trim()) {
      setPasswordFormErrors(prev => ({ ...prev, currentPassword: 'Current password is required.' }));
      return;
    }

    setPasswordChangeStatus('sending_otp');
    setPasswordFormErrors({});
    try {
      const response = await axiosInstance.post('/api/password', {
        email: userData.email,
        password: passwordForm.currentPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        console.log('Send OTP response:', response.data);
        setOtpSent(true);
        setPasswordChangeStatus('otp_sent');
      } else {
        setPasswordChangeStatus('error');
        setPasswordFormErrors(prev => ({ ...prev, general: response.data.message || 'Failed to send OTP.' }));
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setPasswordChangeStatus('error');
      setPasswordFormErrors(prev => ({ ...prev, general: error.response?.data?.message || 'Failed to send OTP. Please try again.' }));
    }
  };

  const handleVerifyOtp = async () => {
    if (!passwordForm.otp.trim()) {
      setPasswordFormErrors(prev => ({ ...prev, otp: 'OTP is required.' }));
      return;
    }

    setPasswordChangeStatus('verifying_otp');
    setPasswordFormErrors({});
    try {
      const response = await axiosInstance.post('/api/verify-email-otp', {
        email: userData.email,
        otp: passwordForm.otp,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        console.log('Verify OTP response:', response.data);
        setOtpVerified(true);
        setPasswordChangeStatus('otp_verified');
      } else {
        setPasswordChangeStatus('error');
        setPasswordFormErrors(prev => ({ ...prev, otp: response.data.message || 'Invalid OTP.' }));
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setPasswordChangeStatus('error');
      setPasswordFormErrors(prev => ({ ...prev, otp: error.response?.data?.message || 'Failed to verify OTP. Please try again.' }));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      setPasswordFormErrors(prev => ({ ...prev, general: 'Please verify OTP first.' }));
      setPasswordChangeStatus('error');
      return;
    }
    if (!passwordForm.newPassword.trim()) {
      setPasswordFormErrors(prev => ({ ...prev, newPassword: 'New password is required.' }));
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordFormErrors(prev => ({ ...prev, newPassword: 'Password must be at least 6 characters long.' }));
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordFormErrors(prev => ({ ...prev, confirmNewPassword: 'Passwords do not match.' }));
      return;
    }

    setPasswordChangeStatus('changing_password');
    setPasswordFormErrors({});
    try {
      const response = await axiosInstance.post('/api/changePassword', {
        email: userData.email,
        newPassword: passwordForm.newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        console.log('Change password response:', response.data);
        setPasswordChangeStatus('success');
        setPasswordForm({
          currentPassword: '',
          otp: '',
          newPassword: '',
          confirmNewPassword: '',
        });
        setOtpSent(false);
        setOtpVerified(false);
      } else {
        setPasswordChangeStatus('error');
        setPasswordFormErrors(prev => ({ ...prev, general: response.data.message || 'Failed to change password.' }));
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordChangeStatus('error');
      setPasswordFormErrors(prev => ({ ...prev, general: error.response?.data?.message || 'Failed to change password. Please try again.' }));
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={userData.name}
                onChange={handleProfileChange}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${profileFormErrors.name ? 'border-red-500 ring-red-300' : 'border-gray-300 ring-blue-400'}`}
              />
              {profileFormErrors.name && <p className="text-red-500 text-xs mt-1">{profileFormErrors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email (Read-only)</label>
              <input
                type="email"
                id="email"
                name="email"
                value={userData.email}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                id="gender"
                name="gender"
                value={userData.gender}
                onChange={handleProfileChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                value={userData.age}
                onChange={handleProfileChange}
                min="1"
                max="100"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${profileFormErrors.age ? 'border-red-500 ring-red-300' : 'border-gray-300 ring-blue-400'}`}
              />
              {profileFormErrors.age && <p className="text-red-500 text-xs mt-1">{profileFormErrors.age}</p>}
            </div>
            <div className="pt-4">
              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                disabled={profileEditStatus === 'submitting'}
              >
                {profileEditStatus === 'submitting' ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
            {profileEditStatus === 'success' && <p className="text-green-600 text-sm mt-2 text-center">Profile updated successfully!</p>}
            {profileEditStatus === 'error' && <p className="text-red-600 text-sm mt-2 text-center">{profileFormErrors.general || 'Failed to update profile.'}</p>}
          </form>
        );
      case 'password':
        return (
          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordFormChange}
                disabled={otpSent}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${passwordFormErrors.currentPassword ? 'border-red-500 ring-red-300' : 'border-gray-300 ring-blue-400'}`}
              />
              {passwordFormErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{passwordFormErrors.currentPassword}</p>}
            </div>

            {!otpSent && (
              <button
                type="button"
                onClick={handleSendOtp}
                className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                disabled={passwordChangeStatus === 'sending_otp'}
              >
                {passwordChangeStatus === 'sending_otp' ? 'Sending OTP...' : 'Send OTP'}
              </button>
            )}
            {passwordChangeStatus === 'otp_sent' && <p className="text-green-600 text-sm mt-2 text-center">OTP sent to your email.</p>}

            {otpSent && !otpVerified && (
              <>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={passwordForm.otp}
                    onChange={handlePasswordFormChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${passwordFormErrors.otp ? 'border-red-500 ring-red-300' : 'border-gray-300 ring-blue-400'}`}
                    placeholder="Enter 6-digit OTP"
                  />
                  {passwordFormErrors.otp && <p className="text-red-500 text-xs mt-1">{passwordFormErrors.otp}</p>}
                </div>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                  disabled={passwordChangeStatus === 'verifying_otp'}
                >
                  {passwordChangeStatus === 'verifying_otp' ? 'Verifying...' : 'Verify OTP'}
                </button>
              </>
            )}

            {otpVerified && (
              <>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordFormChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${passwordFormErrors.newPassword ? 'border-red-500 ring-red-300' : 'border-gray-300 ring-blue-400'}`}
                  />
                  {passwordFormErrors.newPassword && <p className="text-red-500 text-xs mt-1">{passwordFormErrors.newPassword}</p>}
                </div>
                <div>
                  <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    value={passwordForm.confirmNewPassword}
                    onChange={handlePasswordFormChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${passwordFormErrors.confirmNewPassword ? 'border-red-500 ring-red-300' : 'border-gray-300 ring-blue-400'}`}
                  />
                  {passwordFormErrors.confirmNewPassword && <p className="text-red-500 text-xs mt-1">{passwordFormErrors.confirmNewPassword}</p>}
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    disabled={passwordChangeStatus === 'changing_password'}
                  >
                    {passwordChangeStatus === 'changing_password' ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </>
            )}
            {passwordChangeStatus === 'success' && <p className="text-green-600 text-sm mt-2 text-center">Password changed successfully!</p>}
            {passwordChangeStatus === 'error' && <p className="text-red-600 text-sm mt-2 text-center">{passwordFormErrors.general || 'Failed to change password.'}</p>}
          </form>
        );
      case 'notifications':
        return (
          <div className="space-y-4">
            <p className="text-gray-700">Manage your notification preferences here.</p>
            <div className="flex items-center">
              <input type="checkbox" id="emailNotifications" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" defaultChecked />
              <label htmlFor="emailNotifications" className="ml-2 text-gray-700">Receive email notifications</label>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Notification Settings</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  font-inter ">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800 text-center">Settings</h1>
        </div>

        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/4 p-6 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === 'profile' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === 'password' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Change Password
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === 'notifications' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Notification Preferences
              </button>
            </nav>
          </div>

          <div className="lg:w-3/4 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
              {activeTab === 'profile' && 'Edit Profile Information'}
              {activeTab === 'password' && 'Change Password'}
              {activeTab === 'notifications' && 'Notification Preferences'}
            </h2>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;