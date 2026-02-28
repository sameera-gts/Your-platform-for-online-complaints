import React, { useState,useEffect } from 'react';
import { FaHome, FaClipboardList, FaUserCog,FaChartBar, FaTasks, FaChartLine, FaUsers, FaTicketAlt } from 'react-icons/fa';
import { DashboardHomeOutlet } from '../../Pages/DashboardHomeOutlet';
import axios from "axios"
export const AgentDashboardHome = () => {
    const [open, setOpen] = useState(false);
      const [profile,setProfile]=useState('');
      const url=`${import.meta.env.VITE_SERVER_URL}`;
      const token=localStorage.getItem('jwtToken');
      useEffect(()=>{
      axios.get(`${url}/api/das/profile`,{headers:{Authorization:`Bearer ${token}`},withCredentials:true})
      .then((response)=>{
        console.log(response.data);
        setProfile(response.data);
      })
      .catch((error)=>{
        console.log(error);
      })
      },[])

    const Links = [
        { name: "Dashboard", icon: <FaHome />, link: "/agent-dashboard" },
        { name: "Manage Complaints", icon: <FaTasks />, link: "/agent-dashboard/manage-complaints" },
        { name: "My Workload", icon: <FaChartLine />, link: "/agent-dashboard/performance" },
        { name: "Profile Settings", icon: <FaUserCog />, link: "/agent-dashboard/settings" }
    ];

    return (
        <div>
            <DashboardHomeOutlet
                userData={profile}
                open={open}
                setOpen={setOpen}
                Links={Links}
                name={"Agent Dashboard"}
                small={"AD"}
            />
        </div>
    );
};