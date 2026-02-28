import React, { useState } from 'react';
import { FaUser, FaLock, FaEnvelope, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from "axios";
import { useNotification } from '../../context/Notification.jsx';
import {useNavigate} from "react-router-dom"
import {toast} from 'react-toastify';
export const Login = () => {
  const addNotification = useNotification();
  const navigate=useNavigate();
  const [activeTab, setActiveTab] = useState("Login");
  const [isAgent, setIsAgent] = useState(false);
  const [showEmailVerificationMessage, setShowEmailVerificationMessage] = useState(false);
  const [showPasswordSetSuccess, setShowPasswordSetSuccess] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [emailVerificationEmail, setEmailVerificationEmail] = useState(''); // New state for email verification flow
  const [passwordError, setPasswordError] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number.";
    }
    if (!/(?=.*[!@#$%^&*()_+={}\[\]|:;"'<>,.?/~`\-])/.test(password)) {
      return "Password must contain at least one special character (!@#$%^&*...).";
    }
    return '';
  };

  const handlePasswordChange = (setter, value) => {
    setter(value);
    if (passwordError) {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (activeTab === "Login") {
      const url = `${import.meta.env.VITE_SERVER_URL}/api/login`;
      const error = validatePassword(loginPassword);
      if (error) {
        setPasswordError(error);
        return;
      }
      try {
        const response = await axios.post(url, { email: loginEmail, password: loginPassword }, { withCredentials: true });
        if (response.data?.status === true) {
          addNotification(response.data?.message, "success");
          if (response.data.token) {
            localStorage.setItem('jwtToken', response.data.token);
          }
          navigate('/')
        } else if (response.status === 200) {
          addNotification(response.data?.message, "success");
        }
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          addNotification(error.response.data.message, 'error');
        } else {
          addNotification("An unexpected error occurred. Please try again.", 'error');
        }
      }
    } else if (activeTab === "SignUp") {
      const error = validatePassword(signupPassword);
      if (error) {
        setPasswordError(error);
        return;
      }
      const url = `${import.meta.env.VITE_SERVER_URL}/api/register`;
      try {
        const response = await axios.post(url, { name: signupUsername, password: signupPassword, email: signupEmail, type: isAgent ? 'agent' : 'user' }, { withCredentials: true });
        
        if (response.data?.status === "pending_email_verification") {
          addNotification(response.data.message, 'success');
          setEmailVerificationEmail(response.data.email);
          setActiveTab("VerifyEmail");
        } else if (response.data?.message) {
          addNotification(response.data.message, 'success');
        } else {
          addNotification("Registration successful!", 'success');
        }
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          addNotification(error.response.data.message, 'error');
        } else {
          addNotification("An unexpected error occurred during registration. Please try again.", 'error');
        }
      }
    } else if (activeTab === "ForgotPassword") {
      const url = `${import.meta.env.VITE_SERVER_URL}/api/forgot-password`;
      try {
        const response = await axios.post(url, { email: forgotPasswordEmail });
        addNotification(response.data?.message, response.data?.status === 'success' ? 'success' : 'error');
        setActiveTab("VerifyOTP");
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          addNotification(error.response.data.message, 'error');
        } else {
          addNotification("Failed to send OTP. Please try again.", 'error');
        }
      }
    } else if (activeTab === "VerifyOTP") {
      const url = `${import.meta.env.VITE_SERVER_URL}/api/verify-otp`;
      console.log(`Verifying OTP for password reset: ${otp}`);
      setActiveTab("ResetPassword");
      addNotification("OTP verified. Please set your new password.", "success");

      try {
        const response = await axios.post(url, { email: forgotPasswordEmail, otp: otp });
        addNotification(response.data?.message, 'success');
        setActiveTab("ResetPassword");
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          addNotification(error.response.data.message, 'error');
        } else {
          addNotification("OTP verification failed. Please try again.", 'error');
        }
      }
    } else if (activeTab === "ResetPassword") {
      if (newPassword !== confirmNewPassword) {
        addNotification("New password and confirm new password do not match!", 'error');
        return;
      }
      const passwordValidationError = validatePassword(newPassword);
      if (passwordValidationError) {
        addNotification(passwordValidationError, 'error');
        return;
      }

      const url = `${import.meta.env.VITE_SERVER_URL}/api/reset-password`;
      try {
        const response = await axios.post(url, {
          email: forgotPasswordEmail,
          otp: otp,
          newPassword: newPassword
        });
        addNotification(response.data?.message, 'success');
        setShowPasswordSetSuccess(true);
        setNewPassword('');
        setConfirmNewPassword('');
        setOtp(''); // Clear OTP after use
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          addNotification(error.response.data.message, 'error');
        } else {
          addNotification("Failed to reset password. Please try again.", 'error');
        }
      }
    } else if (activeTab === "VerifyEmail") { // New handler for Email Verification OTP
      const url = `${import.meta.env.VITE_SERVER_URL}/api/verify-email-otp`;
      try {
        const response = await axios.post(url, { email: emailVerificationEmail, otp: otp });
        addNotification(response.data?.message, 'success');
        setShowEmailVerificationMessage(false); // Hide the message if it was shown previously
        setActiveTab("Login"); // Redirect to login after successful verification
        setOtp(''); // Clear OTP
        setEmailVerificationEmail(''); // Clear email
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          addNotification(error.response.data.message, 'error');
        } else {
          addNotification("Email verification failed. Please try again.", 'error');
        }
      }
    }
  };

  const renderContent = () => {
    if (showEmailVerificationMessage && activeTab === "SignUp") { // This path is now mostly handled by status in handleSubmit
      return (
        <div className="p-8 text-center bg-gray-50 rounded-b-lg animate-fade-in">
          <h2 className="text-3xl font-bold text-green-600 mb-4">Verification Sent!</h2>
          <p className="text-gray-700 text-lg mb-6">
            A verification link has been sent to <span className="font-semibold text-[#007FFF]">{signupEmail}</span>.
            Please check your inbox and click the link to activate your account.
          </p>
          <button
            onClick={() => {
              setShowEmailVerificationMessage(false);
              setActiveTab("Login");
            }}
            className="w-full bg-[#007FFF] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 text-lg font-semibold shadow-md"
          >
            Back to Login
          </button>
        </div>
      );
    }

    if (showPasswordSetSuccess && activeTab === "ResetPassword") {
      return (
        <div className="p-8 text-center bg-gray-50 rounded-b-lg animate-fade-in">
          <h2 className="text-3xl font-bold text-green-600 mb-4">Password Reset!</h2>
          <p className="text-gray-700 text-lg mb-6">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <button
            onClick={() => {
              setShowPasswordSetSuccess(false);
              setActiveTab("Login");
            }}
            className="w-full bg-[#007FFF] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 text-lg font-semibold shadow-md"
          >
            Back to Login
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case "Login":
        return (
          <form onSubmit={handleSubmit} className="space-y-6 p-8 bg-white rounded-b-xl">
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#007FFF] focus:border-transparent text-lg shadow-sm transition duration-200"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type={showLoginPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#007FFF] focus:border-transparent text-lg shadow-sm transition duration-200"
                value={loginPassword}
                onChange={(e) => handlePasswordChange(setLoginPassword, e.target.value)}
                required
              />
              <span
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
              >
                {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2">
              <p
                className="text-gray-600 text-sm cursor-pointer hover:text-[#007FFF] transition duration-200"
                onClick={() => setActiveTab("SignUp")}
              >
                Don't have an account? <span className="font-semibold text-[#007FFF]">Sign Up</span>
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("ForgotPassword")}
                className="text-sm font-semibold text-[#007FFF] hover:text-blue-700 transition duration-300"
              >
                Forgot Password?
              </button>
              {passwordError && <p className="text-red-500 text-sm mt-2">{passwordError}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-[#007FFF] text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition duration-300 text-xl font-semibold shadow-md"
            >
              Login
            </button>
          </form>
        );
      case "SignUp":
        return (
          <form onSubmit={handleSubmit} className="space-y-6 p-8 bg-white rounded-b-xl">
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Choose a username"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#007FFF] focus:border-transparent text-lg shadow-sm transition duration-200"
                value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#007FFF] focus:border-transparent text-lg shadow-sm transition duration-200"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type={showSignupPassword ? "text" : "password"}
                placeholder="Create a password"
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#007FFF] focus:border-transparent text-lg shadow-sm transition duration-200"
                value={signupPassword}
                onChange={(e) => handlePasswordChange(setSignupPassword, e.target.value)}
                required
              />
              <span
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                onClick={() => setShowSignupPassword(!showSignupPassword)}
              >
                {showSignupPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="agent-checkbox-signup"
                className="h-5 w-5 text-[#007FFF] rounded border-gray-300 focus:ring-[#007FFF] cursor-pointer"
                checked={isAgent}
                onChange={(e) => setIsAgent(e.target.checked)}
              />
              <label htmlFor="agent-checkbox-signup" className="ml-2 block text-gray-700 text-md cursor-pointer">
                Consider me as an Agent
              </label>
            </div>
            <div className="flex items-center">
              <p
                className="text-gray-600 text-sm cursor-pointer hover:text-[#007FFF] transition duration-200"
                onClick={() => setActiveTab("Login")}
              >
                Already have an account? <span className="font-semibold text-[#007FFF]">Login</span>
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-[#007FFF] text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition duration-300 text-xl font-semibold shadow-md"
            >
              Sign Up
            </button>
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </form>
        );
      case "ForgotPassword":
        return (
          <form onSubmit={handleSubmit} className="space-y-6 p-8 bg-white rounded-b-xl">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Forgot Password</h2>
            <p className="text-gray-600 text-center mb-4">
              Enter your email to receive a verification code.
            </p>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#007FFF] focus:border-transparent text-lg shadow-sm transition duration-200"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#007FFF] text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition duration-300 text-xl font-semibold shadow-md"
            >
              Send Verification Code
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("Login")}
              className="w-full text-[#007FFF] mt-4 py-2 hover:underline text-md font-medium"
            >
              Back to Login
            </button>
          </form>
        );
      case "VerifyOTP": // This case is for Password Reset OTP
        return (
          <form onSubmit={handleSubmit} className="space-y-6 p-8 bg-white rounded-b-xl">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Verify Code</h2>
            <p className="text-gray-600 text-center mb-4">
              An OTP has been sent to <span className="font-semibold text-[#007FFF]">{forgotPasswordEmail}</span>.
              Please enter it below.
            </p>
            <div className="relative">
              <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Enter OTP"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#007FFF] focus:border-transparent text-lg shadow-sm transition duration-200"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#007FFF] text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition duration-300 text-xl font-semibold shadow-md"
            >
              Verify OTP
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ForgotPassword")}
              className="w-full text-[#007FFF] mt-4 py-2 hover:underline text-md font-medium"
            >
              Resend Code
            </button>
          </form>
        );
      case "VerifyEmail": // New case for Email Verification OTP
        return (
          <form onSubmit={handleSubmit} className="space-y-6 p-8 bg-white rounded-b-xl">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Verify Email</h2>
            <p className="text-gray-600 text-center mb-4">
              An OTP has been sent to <span className="font-semibold text-[#007FFF]">{emailVerificationEmail}</span>.
              Please enter it below to activate your account.
            </p>
            <div className="relative">
              <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Enter Email OTP"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#007FFF] focus:border-transparent text-lg shadow-sm transition duration-200"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#007FFF] text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition duration-300 text-xl font-semibold shadow-md"
            >
              Verify Email
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("Login")} // Or some other appropriate action
              className="w-full text-[#007FFF] mt-4 py-2 hover:underline text-md font-medium"
            >
              Back to Login
            </button>
          </form>
        );
      case "ResetPassword":
        return (
          <form onSubmit={handleSubmit} className="space-y-6 p-8 bg-white rounded-b-xl">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Set New Password</h2>
            <p className="text-gray-600 text-center mb-4">
              Enter your new password below.
            </p>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                className="w-full pl-12 pr-12 py-1 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#007FFF] focus:border-transparent text-lg shadow-sm transition duration-200"
                value={newPassword}
                onChange={(e) => handlePasswordChange(setNewPassword, e.target.value)}
                required
              />
              <span
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type={showConfirmNewPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#007FFF] focus:border-transparent text-lg shadow-sm transition duration-200"
                value={confirmNewPassword}
                onChange={(e) => handlePasswordChange(setConfirmNewPassword, e.target.value)}
                required
              />
              <span
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
              >
                {showConfirmNewPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <button
              type="submit"
              className="w-full bg-[#007FFF] text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition duration-300 text-xl font-semibold shadow-md"
            >
              Reset Password
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("Login")}
              className="w-full text-[#007FFF] mt-4 py-2 hover:underline text-md font-medium"
            >
              Back to Login
            </button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className='bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center p-4'>
      <div className='bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-md transform '>
        {(activeTab === "Login" || activeTab === "SignUp") && (
          <div className='flex justify-between items-center bg-gray-50 border-b border-gray-200'>
            {["Login", "SignUp"].map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveTab(item);
                  setShowEmailVerificationMessage(false);
                  setShowPasswordSetSuccess(false);
                  setPasswordError('');
                }}
                className={`flex-1 text-center py-2 text-xl font-semibold transition-all duration-300
                  ${activeTab === item
                    ? "text-[#007FFF] border-b-4 border-[#007FFF]"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
};
