import React, { useState,useEffect } from 'react';
import { FaHome, FaClipboardList, FaUsers, FaChartBar, FaCog, FaTasks, FaUserTie } from 'react-icons/fa';
import { DashboardHomeOutlet } from '../../Pages/DashboardHomeOutlet';
import axios from "axios"
export const AdminDashboardHome = () => {
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
        { name: "Dashboard", icon: <FaHome />, link: "/admin-dashboard" },
        { name: "My Workload", icon: <FaUserTie />, link: "/admin-dashboard/workload" },
        { name: "All Complaints", icon: <FaClipboardList />, link: "/admin-dashboard/all-complaints" },
        { name: "User Management", icon: <FaUsers />, link: "/admin-dashboard/management" },
        { name: "Profile Settings", icon: <FaCog />, link: "/admin-dashboard/settings" }
    ];

    return (
        <div>
            <DashboardHomeOutlet
                userData={profile}
                open={open}
                setOpen={setOpen}
                Links={Links}
                name={"Admin Dashboard"}
                small={"AD"}
            />
        </div>
    );
};