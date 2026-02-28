import React from 'react'
import { Heading } from './Heading'
import { MdVerifiedUser } from "react-icons/md";
import { MdOutlineSupportAgent } from "react-icons/md";
import { TbPencilExclamation } from "react-icons/tb";
import { IoNotificationsSharp } from "react-icons/io5";
import { MdOutlineSecurity } from "react-icons/md";
import { CiRoute } from "react-icons/ci";
export const Features = () => {
    const content=[
        {name:"User Registration & Login",
         icon:<MdVerifiedUser/>,
         info:"Users can easily create secure accounts to submit and manage complaints.",
        },
        {name:"Complaint Submission",
            icon:<TbPencilExclamation />,
            info:"Detailed forms allow users to describe issues, attach evidence, and provide contact details."
        },
        {name:"Tracking & Notifications",
            icon:<IoNotificationsSharp />,
            info:"Real-time status updates and automated email/SMS notifications keep users informed."
        },
        {name:"Agent Interaction",
            icon:<MdOutlineSupportAgent/>,
            info:"Users can communicate directly with assigned agents via an in-system messaging feature."
        },
        {name:"Assigning & Routing",
            icon:<CiRoute />,
            info:"Intelligent algorithms ensure complaints are directed to the right department."
        },
        {name:"Security & Confidentiality",
            icon:<MdOutlineSecurity/>,
            info:"Robust measures like encryption and access controls protect sensitive data.",
        }
    ]
  return (
    <div className='max-w-6xl mx-auto px-4 py-6'>
        <Heading Heading={"Key Features"}/>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4'>
        {content.map((item, index) => (
              <div
                key={index}
                className='flex flex-col items-center justify-center bg-white rounded-xl shadow-md p-8
                           transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-xl
                           border border-gray-200  cursor-pointer'
              >
                <div className='text-5xl text-blue-600 mb-6 flex-shrink-0'>
                  {item.icon}
                </div>
                <h3 className='text-2xl font-semibold text-gray-900 mb-3 text-center'>
                  {item.name}
                </h3>
                <p className='text-gray-600 text-center leading-relaxed'>
                  {item.info}
                </p>
              </div>
            ))} 
        </div>
    </div>
  )
}
