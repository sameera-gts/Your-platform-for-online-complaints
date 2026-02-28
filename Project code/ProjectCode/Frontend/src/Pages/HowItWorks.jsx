import React from 'react'
import { Heading } from './Heading'

export const HowItWorks = () => {
  return (
    <div  className="py-20 bg-indigo-50">
        <div className='max-w-6xl mx-auto px-6 lg:px-8'>
          <Heading Heading={"How ResolveFlow Works"}/>
          <p className="text-lg text-gray-700 mb-10 text-center max-w-3xl mx-auto">
            Experience a seamless journey from complaint submission to resolution.
          </p>

          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-blue-300"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center md:text-right md:items-end p-4 rounded-lg bg-white shadow-md">
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-3xl md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:-top-8 md:z-10 border-4 border-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-plus"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-2">User Registration & Login</h3>
                <p className="text-gray-700 max-w-md">
                  John visits the website, clicks "Sign Up," fills out the form with his name, email, and password. He receives a verification email, confirms his account, and then securely logs in to access the dashboard.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center md:text-left md:items-start p-4 rounded-lg bg-white shadow-md">
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-3xl md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:-top-8 md:z-10 border-4 border-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-plus"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 18v-6"/><path d="M9 15h6"/></svg>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-2">Complaint Submission</h3>
                <p className="text-gray-700 max-w-md">
                  From the dashboard, John clicks "Submit Complaint." He fills in details about the issue, attaches relevant documents or images, provides contact information, and submits his complaint.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center md:text-right md:items-end p-4 rounded-lg bg-white shadow-md">
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-3xl md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:-top-8 md:z-10 border-4 border-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell-ring"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M2.2 21h19.6"/><path d="M12 2v2"/></svg>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-2">Tracking and Notifications</h3>
                <p className="text-gray-700 max-w-md">
                  Upon submission, John receives a confirmation. He can then track his complaint's real-time status in the "My Complaints" section and receives email/SMS notifications for updates.
                </p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center md:text-left md:items-start p-4 rounded-lg bg-white shadow-md">
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-3xl md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:-top-8 md:z-10 border-4 border-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-2">Interaction with Agent</h3>
                <p className="text-gray-700 max-w-md">
                  Sarah, a customer service agent, reviews John's complaint and initiates communication via the system's messaging feature. John receives a notification and communicates directly with Sarah to discuss further details.
                </p>
              </div>

              {/* Step 5 */}
              <div className="flex flex-col items-center text-center md:text-right md:items-end p-4 rounded-lg bg-white shadow-md">
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-3xl md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:-top-8 md:z-10 border-4 border-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-2">Resolution and Feedback</h3>
                <p className="text-gray-700 max-w-md">
                  The company resolves the complaint and notifies John of the solution (e.g., replacement/refund). John provides feedback on his positive experience with the prompt and courteous service.
                </p>
              </div>

              {/* Step 6 */}
              <div className="flex flex-col items-center text-center md:text-left md:items-start p-4 rounded-lg bg-white shadow-md">
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-3xl md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:-top-8 md:z-10 border-4 border-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v2a2 2 0 0 0-2 2H4a2 2 0 0 0-2 2v.44a2 2 0 0 0 2 2h2a2 2 0 0 0 2 2v2.44a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-2a2 2 0 0 0 2-2h2.44a2 2 0 0 0 2-2v-.44a2 2 0 0 0-2-2h-2a2 2 0 0 0-2-2V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-2">Admin Management</h3>
                <p className="text-gray-700 max-w-md">
                  The system administrator oversees all complaints, assigning them to agents based on workload and expertise, ensuring compliance with platform policies and regulations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
