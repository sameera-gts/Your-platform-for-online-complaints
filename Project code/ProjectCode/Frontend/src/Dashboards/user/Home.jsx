import React, { useState,useEffect } from 'react';
import axios from "axios"
import { FaHome, FaClipboardList, FaEdit, FaUserCog, FaBars, FaUserCircle } from 'react-icons/fa';
import { DashboardHomeOutlet } from '../../Pages/DashboardHomeOutlet';

export const UserDashboardHome = () => {
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
    { name: "Dashboard", icon: <FaHome />, link: "/user-dashboard" },
    { name: "My Complaints", icon: <FaClipboardList />, link: "/user-dashboard/my-complaints" },
    { name: "Submit Complaint", icon: <FaEdit />, link: "/user-dashboard/new-complaint" },
    { name: "Profile Settings", icon: <FaUserCog />, link: "/user-dashboard/settings" }
  ];
  return (
    <div>
      <DashboardHomeOutlet userData={profile} open={open} setOpen={setOpen} Links={Links} name={"User Dashboard"} small={"UD"}/>
    </div>
  );
};