import React,{useState,useEffect} from 'react'
import SettingsPage from "../../Pages/Dashboard/settingsPage"
import axiosInstance from "../../api/AxiosInstance"
import { useSocket } from "../../context/ScoketContext"
import { useAuth } from "../../context/AuthContext";
export const AdminSettingPage = () => {
  const [user,setUser]=useState('');
  const token=localStorage.getItem('jwtToken');
  const fetch=async()=>{
    try{
    const response=await axiosInstance.get("/api/profile/info",{headers:{Authorization:`Bearer ${token}`}});
    if(response.status===200){
        setUser(response.data);
    }
    }
    catch(error){
        console.log(error);
    }
  }
  useEffect(()=>{
    fetch();
  },[])
  return (
    <div>
        <SettingsPage userId={user._id} initialUserData={user}/>
    </div>
  )
}
